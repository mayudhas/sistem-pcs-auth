import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/database/prisma/prisma.service';
import { AuthAppRole } from '../../domain/entities/auth-app-role.entity';
import type { AuthAppRoleRepository } from '../../domain/repositories/auth-app-role.repository';

@Injectable()
export class PrismaAuthAppRoleRepository implements AuthAppRoleRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(role: AuthAppRole): Promise<AuthAppRole> {
    const record = await this.prisma.authAppRole.create({
      data: {
        role_id: role.role_id,
        app_id: role.app_id,
        role_code: role.role_code,
        role_nama: role.role_nama,
        role_deskripsi: role.role_deskripsi,
        is_active: role.is_active,
        created_at: role.created_at,
        updated_at: role.updated_at,
      },
    });
    return new AuthAppRole(record);
  }

  async getByAppId(appId: string): Promise<AuthAppRole[]> {
    const records = await this.prisma.authAppRole.findMany({
      where: { app_id: appId },
      orderBy: { created_at: 'asc' },
    });
    return records.map((r) => new AuthAppRole(r));
  }

  async findByAppIdAndCode(appId: string, roleCode: string): Promise<AuthAppRole | null> {
    const record = await this.prisma.authAppRole.findUnique({
      where: {
        app_id_role_code: {
          app_id: appId,
          role_code: roleCode,
        },
      },
    });
    return record ? new AuthAppRole(record) : null;
  }

  async delete(roleId: string): Promise<boolean> {
    const deleted = await this.prisma.authAppRole.delete({
      where: { role_id: roleId },
    });
    return Boolean(deleted);
  }
}
