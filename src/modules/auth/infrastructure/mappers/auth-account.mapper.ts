import { AuthAccount as PrismaAuthAccount, Prisma } from '../../../../infrastructure/database/prisma/generated/client';
import { AuthAccount } from '../../domain/entities/auth-account.entity';

export class AuthAccountMapper {
  static toDomain(raw: PrismaAuthAccount): AuthAccount {
    return new AuthAccount({
      auth_id: raw.auth_id,
      auth_username: raw.auth_username,
      auth_password_hash: raw.auth_password_hash,
      auth_is_superadmin: raw.auth_is_superadmin,
      auth_is_active: raw.auth_is_active,
      auth_created_at: raw.auth_created_at,
      auth_updated_at: raw.auth_updated_at,
    });
  }

  static toPersistence(entity: AuthAccount): Prisma.AuthAccountUncheckedCreateInput {
    return {
      auth_id: entity.auth_id,
      auth_username: entity.auth_username,
      auth_password_hash: entity.auth_password_hash,
      auth_is_superadmin: Boolean(entity.auth_is_superadmin),
      auth_is_active: entity.auth_is_active,
      auth_created_at: entity.auth_created_at ? new Date(entity.auth_created_at) : new Date(),
      auth_updated_at: entity.auth_updated_at ? new Date(entity.auth_updated_at) : new Date(),
    };
  }
}
