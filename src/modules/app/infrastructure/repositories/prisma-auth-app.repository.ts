import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/database/prisma/prisma.service';
import { AuthApp } from '../../domain/entities/auth-app.entity';
import type { AuthAppRepository } from '../../domain/repositories/auth-app.repository';
import { AuthAppMapper } from '../mappers/auth-app.mapper';

@Injectable()
export class PrismaAuthAppRepository implements AuthAppRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(app: AuthApp): Promise<AuthApp> {
    const data = AuthAppMapper.toPersistence(app);
    const created = await this.prisma.authApp.create({ data });
    return AuthAppMapper.toDomain(created);
  }

  async getById(id: string): Promise<AuthApp | null> {
    const record = await this.prisma.authApp.findUnique({
      where: { app_id: id },
    });
    return record ? AuthAppMapper.toDomain(record) : null;
  }

  async getAll(): Promise<AuthApp[]> {
    const records = await this.prisma.authApp.findMany({
      orderBy: { app_created_at: 'asc' },
    });
    return records.map((r) => AuthAppMapper.toDomain(r));
  }

  async update(app: AuthApp): Promise<AuthApp> {
    const data = AuthAppMapper.toPersistence(app);
    const updated = await this.prisma.authApp.update({
      where: { app_id: app.app_id },
      data: {
        app_nama: data.app_nama,
        app_deskripsi: data.app_deskripsi,
        app_redirect_uri: data.app_redirect_uri,
        app_is_active: data.app_is_active,
        app_updated_at: new Date(),
      },
    });
    return AuthAppMapper.toDomain(updated);
  }

  async delete(id: string): Promise<boolean> {
    const deleted = await this.prisma.authApp.delete({
      where: { app_id: id },
    });
    return Boolean(deleted);
  }
}
