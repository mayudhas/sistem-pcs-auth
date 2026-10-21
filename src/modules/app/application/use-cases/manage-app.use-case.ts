import { Injectable, ConflictException, NotFoundException, Inject } from '@nestjs/common';
import { AUTH_APP_REPOSITORY_TOKEN } from '../../domain/repositories/auth-app.repository';
import type { AuthAppRepository } from '../../domain/repositories/auth-app.repository';
import { AuthApp } from '../../domain/entities/auth-app.entity';
import { CreateAppDto } from '../dtos/create-app.dto';

@Injectable()
export class ManageAppUseCase {
  constructor(
    @Inject(AUTH_APP_REPOSITORY_TOKEN)
    private readonly appRepo: AuthAppRepository,
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
}
