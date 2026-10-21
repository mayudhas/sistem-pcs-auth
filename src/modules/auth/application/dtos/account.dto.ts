import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

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
}

export class ResetPasswordDto {
  @ApiProperty({ example: 'newpassword123', description: 'Password baru (minimal 6 karakter)' })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  new_password: string;
}
