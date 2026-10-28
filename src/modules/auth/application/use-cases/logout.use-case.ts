import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as argon2 from 'argon2';
import * as crypto from 'crypto';
import { PrismaService } from '../../../../infrastructure/database/prisma/prisma.service';
import { LogoutDto } from '../dtos/logout.dto';

@Injectable()
export class LogoutUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(dto: LogoutDto) {
    const tokenHash = crypto.createHash('sha256').update(dto.refresh_token).digest('hex');

    const matched = await this.prisma.authSession.findFirst({
      where: {
        refresh_token_hash: tokenHash,
        is_revoked: false,
      },
    });

    if (matched) {
      await this.prisma.authSession.update({
        where: { session_id: matched.session_id },
        data: { is_revoked: true },
      });
      return { success: true, message: 'Logout berhasil, sesi telah dicabut' };
    }

    // Fallback argon2 untuk backward-compatibility
    const legacySessions = await this.prisma.authSession.findMany({
      where: {
        is_revoked: false,
        refresh_token_hash: { startsWith: '$argon2' },
      },
    });

    for (const session of legacySessions) {
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
