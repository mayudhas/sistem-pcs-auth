import { AuthAccountApp as PrismaAuthAccountApp, Prisma } from '../../../../infrastructure/database/prisma/generated/client';
import { AuthAccountApp } from '../../domain/entities/auth-account-app.entity';

export class AuthAccountAppMapper {
  static toDomain(raw: PrismaAuthAccountApp): AuthAccountApp {
    return new AuthAccountApp({
      account_app_id: raw.account_app_id,
      auth_id: raw.auth_id,
      app_id: raw.app_id,
      app_role: raw.app_role,
      is_active: raw.is_active,
      created_at: raw.created_at,
      updated_at: raw.updated_at,
    });
  }

  static toPersistence(entity: AuthAccountApp): Prisma.AuthAccountAppUncheckedCreateInput {
    return {
      account_app_id: entity.account_app_id,
      auth_id: entity.auth_id,
      app_id: entity.app_id,
      app_role: entity.app_role,
      is_active: entity.is_active,
      created_at: entity.created_at ? new Date(entity.created_at) : new Date(),
      updated_at: entity.updated_at ? new Date(entity.updated_at) : new Date(),
    };
  }
}
