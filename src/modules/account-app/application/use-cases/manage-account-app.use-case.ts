import { Injectable, NotFoundException, BadRequestException, Inject } from '@nestjs/common';
import { v7 as uuidv7 } from 'uuid';
import { AUTH_ACCOUNT_APP_REPOSITORY_TOKEN } from '../../domain/repositories/auth-account-app.repository';
import type { AuthAccountAppRepository } from '../../domain/repositories/auth-account-app.repository';
import { AUTH_APP_REPOSITORY_TOKEN } from '../../../app/domain/repositories/auth-app.repository';
import type { AuthAppRepository } from '../../../app/domain/repositories/auth-app.repository';
import { AUTH_APP_ROLE_REPOSITORY_TOKEN } from '../../../app/domain/repositories/auth-app-role.repository';
import type { AuthAppRoleRepository } from '../../../app/domain/repositories/auth-app-role.repository';
import { AUTH_ACCOUNT_REPOSITORY_TOKEN } from '../../../auth/domain/repositories/auth-account.repository';
import type { AuthAccountRepository } from '../../../auth/domain/repositories/auth-account.repository';
import { AuthAccountApp } from '../../domain/entities/auth-account-app.entity';
import { AssignAppAccessDto } from '../dtos/assign-app-access.dto';

@Injectable()
export class ManageAccountAppUseCase {
  constructor(
    @Inject(AUTH_ACCOUNT_APP_REPOSITORY_TOKEN)
    private readonly accountAppRepo: AuthAccountAppRepository,
    @Inject(AUTH_ACCOUNT_REPOSITORY_TOKEN)
    private readonly accountRepo: AuthAccountRepository,
    @Inject(AUTH_APP_REPOSITORY_TOKEN)
    private readonly appRepo: AuthAppRepository,
    @Inject(AUTH_APP_ROLE_REPOSITORY_TOKEN)
    private readonly roleRepo: AuthAppRoleRepository,
  ) {}

  async assign(dto: AssignAppAccessDto): Promise<AuthAccountApp> {
    const account = await this.accountRepo.getById(dto.auth_id);
    if (!account) {
      throw new NotFoundException('Akun tidak ditemukan');
    }

    if (account.auth_username === 'superadmin') {
      throw new BadRequestException(
        'Akun superadmin utama SSO tidak dapat di-mapping langsung ke aplikasi satelit. Gunakan akun khusus pegawai atau admin aplikasi.',
      );
    }

    const app = await this.appRepo.getById(dto.app_id);
    if (!app) {
      throw new NotFoundException(`Aplikasi '${dto.app_id}' tidak ditemukan`);
    }

    // Validasi apakah role terdaftar di aplikasi (jika aplikasi sudah mendefinisikan roles)
    const appRoles = await this.roleRepo.getByAppId(dto.app_id);
    if (appRoles.length > 0) {
      const isValidRole = appRoles.some((r) => r.role_code === dto.app_role);
      if (!isValidRole) {
        throw new BadRequestException(
          `Role '${dto.app_role}' tidak valid untuk aplikasi '${dto.app_id}'. Pilihan yang tersedia: ${appRoles.map((r) => r.role_code).join(', ')}`,
        );
      }
    }

    const existing = await this.accountAppRepo.findByAuthIdAndAppId(dto.auth_id, dto.app_id);
    if (existing) {
      throw new BadRequestException(
        `User '${account.auth_username}' sudah di-mapping ke aplikasi '${app.app_nama}' dengan role '${existing.app_role}'.`,
      );
    }

    const newAssignment = new AuthAccountApp({
      account_app_id: uuidv7(),
      auth_id: dto.auth_id,
      app_id: dto.app_id,
      app_role: dto.app_role,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
    });

    return this.accountAppRepo.create(newAssignment);
  }

  async getByApp(appId: string): Promise<any[]> {
    return this.accountAppRepo.findByAppId(appId);
  }

  async updateRole(accountAppId: string, newRole: string): Promise<AuthAccountApp> {
    const existing = await this.accountAppRepo.findById(accountAppId);
    if (!existing) {
      throw new NotFoundException('Mapping akun aplikasi tidak ditemukan');
    }

    // Validasi apakah role terdaftar di aplikasi (jika aplikasi sudah mendefinisikan roles)
    const appRoles = await this.roleRepo.getByAppId(existing.app_id);
    if (appRoles.length > 0) {
      const isValidRole = appRoles.some((r) => r.role_code === newRole);
      if (!isValidRole) {
        throw new BadRequestException(
          `Role '${newRole}' tidak valid untuk aplikasi '${existing.app_id}'. Pilihan yang tersedia: ${appRoles.map((r) => r.role_code).join(', ')}`,
        );
      }
    }

    existing.app_role = newRole;
    return this.accountAppRepo.update(existing);
  }

  async delete(accountAppId: string): Promise<boolean> {
    return this.accountAppRepo.delete(accountAppId);
  }

  async getByUser(authId: string): Promise<any[]> {
    return this.accountAppRepo.findByAuthId(authId);
  }

  async toggleActive(accountAppId: string): Promise<AuthAccountApp> {
    const existing = await this.accountAppRepo.findById(accountAppId);
    if (!existing) {
      throw new NotFoundException('Mapping akun aplikasi tidak ditemukan');
    }
    existing.is_active = !existing.is_active;
    return this.accountAppRepo.update(existing);
  }
}
