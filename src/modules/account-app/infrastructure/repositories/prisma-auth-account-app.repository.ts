import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/database/prisma/prisma.service';
import { AuthAccountApp } from '../../domain/entities/auth-account-app.entity';
import type { AuthAccountAppRepository } from '../../domain/repositories/auth-account-app.repository';
import { AuthAccountAppMapper } from '../mappers/auth-account-app.mapper';

@Injectable()
export class PrismaAuthAccountAppRepository implements AuthAccountAppRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(accountApp: AuthAccountApp): Promise<AuthAccountApp> {
    const data = AuthAccountAppMapper.toPersistence(accountApp);
    const created = await this.prisma.authAccountApp.create({ data });
    return AuthAccountAppMapper.toDomain(created);
  }

  async findByAuthIdAndAppId(authId: string, appId: string): Promise<AuthAccountApp | null> {
    const record = await this.prisma.authAccountApp.findUnique({
      where: {
        auth_id_app_id: {
          auth_id: authId,
          app_id: appId,
        },
      },
    });
    return record ? AuthAccountAppMapper.toDomain(record) : null;
  }

  async findByAuthId(authId: string): Promise<AuthAccountApp[]> {
    const records = await this.prisma.authAccountApp.findMany({
      where: { auth_id: authId },
    });
    return records.map((r) => AuthAccountAppMapper.toDomain(r));
  }

  async findByAppId(appId: string): Promise<any[]> {
    const records = await this.prisma.authAccountApp.findMany({
      where: { app_id: appId },
      include: {
        account: {
          select: {
            auth_id: true,
            auth_username: true,
            auth_is_active: true,
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });
    return records.map((r) => ({
      ...AuthAccountAppMapper.toDomain(r),
      account: r.account,
    }));
  }

  async update(accountApp: AuthAccountApp): Promise<AuthAccountApp> {
    const data = AuthAccountAppMapper.toPersistence(accountApp);
    const updated = await this.prisma.authAccountApp.update({
      where: { account_app_id: accountApp.account_app_id },
      data: {
        app_role: data.app_role,
        is_active: data.is_active,
        updated_at: new Date(),
      },
    });
    return AuthAccountAppMapper.toDomain(updated);
  }

  async findById(accountAppId: string): Promise<AuthAccountApp | null> {
    const record = await this.prisma.authAccountApp.findUnique({
      where: { account_app_id: accountAppId },
    });
    return record ? AuthAccountAppMapper.toDomain(record) : null;
  }

  async delete(id: string): Promise<boolean> {
    const deleted = await this.prisma.authAccountApp.delete({
      where: { account_app_id: id },
    });
    return Boolean(deleted);
  }
}
