import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class AssignAppAccessDto {
  @ApiProperty({ example: '01a15c31-d0b3-7ebd-a40a-aa9c89d5c028', description: 'auth_id akun' })
  @IsUUID()
  @IsNotEmpty()
  auth_id: string;

  @ApiProperty({ example: 'app-absensi', description: 'ID aplikasi tujuan' })
  @IsString()
  @IsNotEmpty()
  app_id: string;

  @ApiProperty({ example: 'ADMIN', description: 'Role spesifik di aplikasi ini (contoh: SUPERADMIN, ADMIN, VIEWER)' })
  @IsString()
  @IsNotEmpty()
  app_role: string;
}
