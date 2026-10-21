import { Injectable, ConflictException, NotFoundException, Inject } from '@nestjs/common';
import { v7 as uuidv7 } from 'uuid';
import { AUTH_APP_REPOSITORY_TOKEN } from '../../domain/repositories/auth-app.repository';
import type { AuthAppRepository } from '../../domain/repositories/auth-app.repository';
import { AUTH_APP_ROLE_REPOSITORY_TOKEN } from '../../domain/repositories/auth-app-role.repository';
import type { AuthAppRoleRepository } from '../../domain/repositories/auth-app-role.repository';
import { AuthApp } from '../../domain/entities/auth-app.entity';
import { AuthAppRole } from '../../domain/entities/auth-app-role.entity';
import { CreateAppDto } from '../dtos/create-app.dto';
import { CreateAppRoleDto } from '../dtos/create-app-role.dto';

@Injectable()
export class ManageAppUseCase {
  constructor(
    @Inject(AUTH_APP_REPOSITORY_TOKEN)
    private readonly appRepo: AuthAppRepository,
    @Inject(AUTH_APP_ROLE_REPOSITORY_TOKEN)
    private readonly roleRepo: AuthAppRoleRepository,
  ) {}

  async create(dto: CreateAppDto): Promise<AuthApp> {
    const existing = await this.appRepo.getById(dto.app_id);
    if (existing) {
      throw new ConflictException(`Aplikasi '${dto.app_id}' sudah terdaftar`);
    }

    const newApp = new AuthApp({
      app_id: dto.app_id,
      app_nama: dto.app_nama,
      app_deskripsi: dto.app_deskripsi,
      app_redirect_uri: dto.app_redirect_uri,
      app_is_active: true,
      app_created_at: new Date(),
      app_updated_at: new Date(),
    });

    return this.appRepo.create(newApp);
  }

  async getAll(): Promise<AuthApp[]> {
    return this.appRepo.getAll();
  }

  async toggleActive(appId: string): Promise<AuthApp> {
    const app = await this.appRepo.getById(appId);
    if (!app) {
      throw new NotFoundException('Aplikasi tidak ditemukan');
    }

    app.app_is_active = !app.app_is_active;
    return this.appRepo.update(app);
  }

  async delete(appId: string): Promise<boolean> {
    const app = await this.appRepo.getById(appId);
    if (!app) {
      throw new NotFoundException('Aplikasi tidak ditemukan');
    }
    return this.appRepo.delete(appId);
  }

  async getRoles(appId: string): Promise<AuthAppRole[]> {
    const app = await this.appRepo.getById(appId);
    if (!app) {
      throw new NotFoundException(`Aplikasi '${appId}' tidak ditemukan`);
    }
    return this.roleRepo.getByAppId(appId);
  }

  async addRole(appId: string, dto: CreateAppRoleDto): Promise<AuthAppRole> {
    const app = await this.appRepo.getById(appId);
    if (!app) {
      throw new NotFoundException(`Aplikasi '${appId}' tidak ditemukan`);
    }

    const existingRole = await this.roleRepo.findByAppIdAndCode(appId, dto.role_code);
    if (existingRole) {
      throw new ConflictException(`Role code '${dto.role_code}' sudah terdaftar pada aplikasi ini`);
    }

    const newRole = new AuthAppRole({
      role_id: uuidv7(),
      app_id: appId,
      role_code: dto.role_code.toUpperCase(),
      role_nama: dto.role_nama,
      role_deskripsi: dto.role_deskripsi,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
    });

    return this.roleRepo.create(newRole);
  }

  async deleteRole(appId: string, roleId: string): Promise<boolean> {
    const app = await this.appRepo.getById(appId);
    if (!app) {
      throw new NotFoundException(`Aplikasi '${appId}' tidak ditemukan`);
    }

    return this.roleRepo.delete(roleId);
  }
}
