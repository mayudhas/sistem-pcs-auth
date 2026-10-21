import { Injectable, UnauthorizedException, ForbiddenException, Inject } from '@nestjs/common';
import * as argon2 from 'argon2';
import { v7 as uuidv7 } from 'uuid';
import { CryptoTokenService } from '../../../../infrastructure/crypto/crypto-token.service';
import { PrismaService } from '../../../../infrastructure/database/prisma/prisma.service';
import { AUTH_ACCOUNT_REPOSITORY_TOKEN } from '../../domain/repositories/auth-account.repository';
import type { AuthAccountRepository } from '../../domain/repositories/auth-account.repository';
import { AUTH_APP_REPOSITORY_TOKEN } from '../../../app/domain/repositories/auth-app.repository';
import type { AuthAppRepository } from '../../../app/domain/repositories/auth-app.repository';
import { AUTH_ACCOUNT_APP_REPOSITORY_TOKEN } from '../../../account-app/domain/repositories/auth-account-app.repository';
import type { AuthAccountAppRepository } from '../../../account-app/domain/repositories/auth-account-app.repository';
import { LoginDto } from '../dtos/login.dto';

export interface LoginResult {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user: {
    auth_id: string;
    username: string;
    is_superadmin: boolean;
    app_id?: string;
    app_role?: string;
  };
  accessible_apps: Array<{
    app_id: string;
    app_nama: string;
    app_deskripsi: string | null;
    app_role: string;
  }>;
}

@Injectable()
export class LoginUseCase {
  constructor(
    @Inject(AUTH_ACCOUNT_REPOSITORY_TOKEN)
    private readonly accountRepo: AuthAccountRepository,
    @Inject(AUTH_APP_REPOSITORY_TOKEN)
    private readonly appRepo: AuthAppRepository,
    @Inject(AUTH_ACCOUNT_APP_REPOSITORY_TOKEN)
    private readonly accountAppRepo: AuthAccountAppRepository,
    private readonly cryptoTokenService: CryptoTokenService,
    private readonly prisma: PrismaService,
  ) {}

  async execute(dto: LoginDto): Promise<LoginResult> {
    // 1. Validasi Akun Kredensial
    const account = await this.accountRepo.getByUsername(dto.username);
    if (!account || !account.auth_is_active) {
      throw new UnauthorizedException('Kredensial tidak valid atau akun dinonaktifkan');
    }

    // 2. Verifikasi Password dengan Argon2
    const isPasswordValid = await argon2.verify(account.auth_password_hash, dto.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Kredensial tidak valid');
    }

    // 3. Ambil seluruh aplikasi yang berhak diakses oleh user ini
    const userAssignments = await this.prisma.authAccountApp.findMany({
      where: {
        auth_id: account.auth_id,
        is_active: true,
        app: {
          app_is_active: true,
        },
      },
      include: {
        app: true,
      },
    });

    const accessibleApps = userAssignments.map((ua) => ({
      app_id: ua.app_id,
      app_nama: ua.app.app_nama,
      app_deskripsi: ua.app.app_deskripsi,
      app_role: ua.app_role,
    }));

    // 4. Tentukan target app (jika dispesifikasi, validasi; jika tidak, default ke SSO portal)
    let targetAudience = 'sso-portal';
    let appRole = 'USER';

    if (dto.app_id) {
      const targetApp = await this.appRepo.getById(dto.app_id);
      if (!targetApp || !targetApp.app_is_active) {
        throw new ForbiddenException(`Aplikasi '${dto.app_id}' tidak ditemukan atau sedang tidak aktif`);
      }

      const match = userAssignments.find((ua) => ua.app_id === dto.app_id);
      if (!match) {
        throw new ForbiddenException(`Anda tidak memiliki izin akses ke aplikasi '${targetApp.app_nama}'`);
      }

      targetAudience = targetApp.app_id;
      appRole = match.app_role;
    } else {
      if (account.auth_is_superadmin) {
        appRole = 'SUPERADMIN';
      }
    }

    // 5. Generate Asymmetric RS256 JWT
    const accessToken = await this.cryptoTokenService.signAccessToken({
      sub: account.auth_id,
      username: account.auth_username,
      aud: targetAudience,
      app_role: appRole,
      is_superadmin: account.auth_is_superadmin,
    });

    // 6. Buat Refresh Token & Simpan Session
    const refreshTokenRaw = uuidv7();
    const refreshTokenHash = await argon2.hash(refreshTokenRaw);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.prisma.authSession.create({
      data: {
        session_id: uuidv7(),
        auth_id: account.auth_id,
        refresh_token_hash: refreshTokenHash,
        expires_at: expiresAt,
      },
    });

    return {
      access_token: accessToken,
      refresh_token: refreshTokenRaw,
      token_type: 'Bearer',
      expires_in: 900,
      user: {
        auth_id: account.auth_id,
        username: account.auth_username,
        is_superadmin: account.auth_is_superadmin,
        app_id: targetAudience,
        app_role: appRole,
      },
      accessible_apps: accessibleApps,
    };
  }
}
