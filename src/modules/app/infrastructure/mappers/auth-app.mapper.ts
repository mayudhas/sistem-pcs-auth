import { AuthApp as PrismaAuthApp, Prisma } from '../../../../infrastructure/database/prisma/generated/client';
import { AuthApp } from '../../domain/entities/auth-app.entity';

export class AuthAppMapper {
  static toDomain(raw: PrismaAuthApp): AuthApp {
    return new AuthApp({
      app_id: raw.app_id,
      app_nama: raw.app_nama,
      app_deskripsi: raw.app_deskripsi,
      app_redirect_uri: raw.app_redirect_uri,
      app_is_active: raw.app_is_active,
      app_created_at: raw.app_created_at,
      app_updated_at: raw.app_updated_at,
    });
  }

  static toPersistence(entity: AuthApp): Prisma.AuthAppUncheckedCreateInput {
    return {
      app_id: entity.app_id,
      app_nama: entity.app_nama,
      app_deskripsi: entity.app_deskripsi ?? null,
      app_redirect_uri: entity.app_redirect_uri ?? null,
      app_is_active: entity.app_is_active,
      app_created_at: entity.app_created_at ? new Date(entity.app_created_at) : new Date(),
      app_updated_at: entity.app_updated_at ? new Date(entity.app_updated_at) : new Date(),
    };
  }
}
