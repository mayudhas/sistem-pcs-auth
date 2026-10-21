import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateAppRoleDto {
  @ApiProperty({ example: 'ADMIN_HR', description: 'Role baru yang ingin ditetapkan' })
  @IsString()
  @IsNotEmpty()
  app_role: string;
}
