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
import { RefreshTokenDto } from '../dtos/refresh-token.dto';

@Injectable()
export class RefreshTokenUseCase {
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

  async execute(dto: RefreshTokenDto) {
    // 1. Cari active session yang belum expired & belum revoked
    const sessions = await this.prisma.authSession.findMany({
      where: {
        is_revoked: false,
        expires_at: { gt: new Date() },
      },
      include: {
        account: true,
      },
    });

    let matchedSession = null;
    for (const session of sessions) {
      const match = await argon2.verify(session.refresh_token_hash, dto.refresh_token);
      if (match) {
        matchedSession = session;
        break;
      }
    }

    if (!matchedSession) {
      throw new UnauthorizedException('Refresh token tidak valid atau sudah kadaluarsa');
    }

    const account = matchedSession.account;
    if (!account.auth_is_active) {
      throw new UnauthorizedException('Akun telah dinonaktifkan');
    }

    // 2. Validasi App & Access
    const app = await this.appRepo.getById(dto.app_id);
    if (!app || !app.app_is_active) {
      throw new ForbiddenException(`Aplikasi '${dto.app_id}' tidak aktif atau tidak ditemukan`);
    }

    const access = await this.accountAppRepo.findByAuthIdAndAppId(account.auth_id, dto.app_id);
    if (!access || !access.is_active) {
      throw new ForbiddenException(`Izin akses ke aplikasi '${app.app_nama}' telah dicabut`);
    }

    // 3. Rotasi Refresh Token (revoke session lama, buat session baru)
    await this.prisma.authSession.update({
      where: { session_id: matchedSession.session_id },
      data: { is_revoked: true },
    });

    const newRefreshToken = uuidv7();
    const newRefreshTokenHash = await argon2.hash(newRefreshToken);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.prisma.authSession.create({
      data: {
        session_id: uuidv7(),
        auth_id: account.auth_id,
        refresh_token_hash: newRefreshTokenHash,
        expires_at: expiresAt,
      },
    });

    // 4. Sign Access Token baru
    const newAccessToken = await this.cryptoTokenService.signAccessToken({
      sub: account.auth_id,
      username: account.auth_username,
      aud: app.app_id,
      app_role: access.app_role,
    });

    return {
      access_token: newAccessToken,
      refresh_token: newRefreshToken,
      token_type: 'Bearer',
      expires_in: 900,
    };
  }
}
