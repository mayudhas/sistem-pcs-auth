import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { v7 as uuidv7 } from 'uuid';
import { AUTH_ACCOUNT_APP_REPOSITORY_TOKEN } from '../../domain/repositories/auth-account-app.repository';
import type { AuthAccountAppRepository } from '../../domain/repositories/auth-account-app.repository';
import { AUTH_APP_REPOSITORY_TOKEN } from '../../../app/domain/repositories/auth-app.repository';
import type { AuthAppRepository } from '../../../app/domain/repositories/auth-app.repository';
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
  ) {}

  async assign(dto: AssignAppAccessDto): Promise<AuthAccountApp> {
    const account = await this.accountRepo.getById(dto.auth_id);
    if (!account) {
      throw new NotFoundException('Akun tidak ditemukan');
    }

    const app = await this.appRepo.getById(dto.app_id);
    if (!app) {
      throw new NotFoundException(`Aplikasi '${dto.app_id}' tidak ditemukan`);
    }

    const existing = await this.accountAppRepo.findByAuthIdAndAppId(dto.auth_id, dto.app_id);
    if (existing) {
      existing.app_role = dto.app_role;
      existing.is_active = true;
      return this.accountAppRepo.update(existing);
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

  async getByUser(authId: string): Promise<AuthAccountApp[]> {
    return this.accountAppRepo.findByAuthId(authId);
  }

  async toggleActive(accountAppId: string, isActive: boolean): Promise<boolean> {
    const assignments = await this.accountAppRepo.findByAuthId(accountAppId);
    // fallback by ID
    return Boolean(assignments);
  }
}
