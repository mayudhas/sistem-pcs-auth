import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'superadmin', description: 'Username atau NIP akun' })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ example: '123123123', description: 'Password akun' })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({ example: 'sistem-pcs', description: 'ID Aplikasi tujuan yang ingin diakses' })
  @IsString()
  @IsNotEmpty()
  app_id: string;
}
