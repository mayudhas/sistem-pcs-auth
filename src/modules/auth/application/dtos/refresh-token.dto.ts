import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RefreshTokenDto {
  @ApiProperty({ example: '01a15c31-d0b3-7ebd-a40a-aa9c89d5c028', description: 'Raw Refresh Token UUID' })
  @IsString()
  @IsNotEmpty()
  refresh_token: string;

  @ApiProperty({ example: 'sistem-pcs', description: 'ID Aplikasi tujuan' })
  @IsString()
  @IsNotEmpty()
  app_id: string;
}
