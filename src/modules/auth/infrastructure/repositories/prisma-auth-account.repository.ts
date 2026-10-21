import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/database/prisma/prisma.service';
import { AuthAccount } from '../../domain/entities/auth-account.entity';
import type { AuthAccountRepository } from '../../domain/repositories/auth-account.repository';
import { AuthAccountMapper } from '../mappers/auth-account.mapper';

@Injectable()
export class PrismaAuthAccountRepository implements AuthAccountRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(account: AuthAccount): Promise<AuthAccount> {
    const data = AuthAccountMapper.toPersistence(account);
    const created = await this.prisma.authAccount.create({ data });
    return AuthAccountMapper.toDomain(created);
  }

  async getById(id: string): Promise<AuthAccount | null> {
    const record = await this.prisma.authAccount.findUnique({
      where: { auth_id: id },
    });
    return record ? AuthAccountMapper.toDomain(record) : null;
  }

  async getByUsername(username: string): Promise<AuthAccount | null> {
    const record = await this.prisma.authAccount.findUnique({
      where: { auth_username: username },
    });
    return record ? AuthAccountMapper.toDomain(record) : null;
  }

  async update(account: AuthAccount): Promise<AuthAccount> {
    const data = AuthAccountMapper.toPersistence(account);
    const updated = await this.prisma.authAccount.update({
      where: { auth_id: account.auth_id },
      data: {
        auth_username: data.auth_username,
        auth_password_hash: data.auth_password_hash,
        auth_is_active: data.auth_is_active,
        auth_updated_at: new Date(),
      },
    });
    return AuthAccountMapper.toDomain(updated);
  }

  async delete(id: string): Promise<boolean> {
    const deleted = await this.prisma.authAccount.delete({
      where: { auth_id: id },
    });
    return Boolean(deleted);
  }
}
