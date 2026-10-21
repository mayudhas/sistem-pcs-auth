import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateAccountDto {
  @ApiProperty({ example: 'budi_santoso', description: 'Username akun' })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ example: 'password123', description: 'Password akun (minimal 6 karakter)' })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: false, description: 'Apakah akun ini Superadmin SSO?', required: false, default: false })
  @IsBoolean()
  @IsOptional()
  is_superadmin?: boolean;
}

export class ResetPasswordDto {
  @ApiProperty({ example: 'newpassword123', description: 'Password baru (minimal 6 karakter)' })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  new_password: string;
}
