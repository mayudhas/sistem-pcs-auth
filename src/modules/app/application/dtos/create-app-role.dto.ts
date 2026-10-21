import { IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAppRoleDto {
  @ApiProperty({ example: 'SUPERADMIN', description: 'Kode role (uppercase/underscore)' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[A-Z0-9_]+$/, { message: 'Role code harus berupa huruf kapital, angka, atau underscore' })
  role_code: string;

  @ApiProperty({ example: 'Super Administrator', description: 'Nama role display' })
  @IsString()
  @IsNotEmpty()
  role_nama: string;

  @ApiProperty({ example: 'Hak akses penuh aplikasi', description: 'Deskripsi role', required: false })
  @IsString()
  @IsOptional()
  role_deskripsi?: string;
}
