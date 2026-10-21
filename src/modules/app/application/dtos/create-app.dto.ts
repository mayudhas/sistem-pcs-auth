import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateAppDto {
  @ApiProperty({ example: 'app-absensi', description: 'ID unik aplikasi (kebab-case)' })
  @IsString()
  @IsNotEmpty()
  app_id: string;

  @ApiProperty({ example: 'Aplikasi Absensi Karyawan', description: 'Nama tampilan aplikasi' })
  @IsString()
  @IsNotEmpty()
  app_nama: string;

  @ApiPropertyOptional({ example: 'Sistem presensi online berbasis geolocation' })
  @IsString()
  @IsOptional()
  app_deskripsi?: string;

  @ApiPropertyOptional({ example: 'https://absensi.kantor.com/callback' })
  @IsString()
  @IsOptional()
  app_redirect_uri?: string;
}
