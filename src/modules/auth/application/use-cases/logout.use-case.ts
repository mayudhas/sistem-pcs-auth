import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as argon2 from 'argon2';
import { PrismaService } from '../../../../infrastructure/database/prisma/prisma.service';
import { LogoutDto } from '../dtos/logout.dto';

@Injectable()
export class LogoutUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(dto: LogoutDto) {
    const sessions = await this.prisma.authSession.findMany({
      where: { is_revoked: false },
    });

    for (const session of sessions) {
      const match = await argon2.verify(session.refresh_token_hash, dto.refresh_token);
      if (match) {
        await this.prisma.authSession.update({
          where: { session_id: session.session_id },
          data: { is_revoked: true },
        });
        return { success: true, message: 'Logout berhasil, sesi telah dicabut' };
      }
    }

    throw new UnauthorizedException('Sesi tidak ditemukan atau sudah dicabut');
  }
}
