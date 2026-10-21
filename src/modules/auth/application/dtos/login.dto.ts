import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'superadmin', description: 'Username akun' })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ example: '123123123', description: 'Password akun' })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiPropertyOptional({ example: 'sistem-pcs', description: 'ID Aplikasi tujuan (opsional jika login langsung ke aplikasi satelit)' })
  @IsString()
  @IsOptional()
  app_id?: string;
}
