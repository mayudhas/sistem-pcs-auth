import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class LogoutDto {
  @ApiProperty({ example: '01a15c31-d0b3-7ebd-a40a-aa9c89d5c028', description: 'Raw Refresh Token UUID untuk direvoke' })
  @IsString()
  @IsNotEmpty()
  refresh_token: string;
}
