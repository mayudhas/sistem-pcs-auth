import { Controller, Post, Body, Get, Delete, Param, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ManageAccountAppUseCase } from '../../application/use-cases/manage-account-app.use-case';
import { AssignAppAccessDto } from '../../application/dtos/assign-app-access.dto';

@ApiTags('IAM - App Assignment (Role User per App)')
@Controller('account-apps')
export class AccountAppController {
  constructor(private readonly manageAccountAppUseCase: ManageAccountAppUseCase) {}

  @Post('assign')
  @ApiOperation({ summary: 'Tetapkan Hak Akses User ke Aplikasi Beserta Rolenya' })
  @ApiResponse({ status: 200, description: 'Hak akses berhasil ditetapkan' })
  async assign(@Body() dto: AssignAppAccessDto) {
    const result = await this.manageAccountAppUseCase.assign(dto);
    return {
      statusCode: HttpStatus.OK,
      message: 'Hak akses aplikasi berhasil ditetapkan',
      data: result,
    };
  }

  @Get('user/:authId')
  @ApiOperation({ summary: 'Daftar Semua Aplikasi yang Boleh Diakses oleh User Ini' })
  async getByUser(@Param('authId') authId: string) {
    const result = await this.manageAccountAppUseCase.getByUser(authId);
    return {
      statusCode: HttpStatus.OK,
      data: result,
    };
  }

  @Get('app/:appId')
  @ApiOperation({ summary: 'Daftar Semua User/Pegawai yang Di-mapping ke Suatu Aplikasi' })
  async getByApp(@Param('appId') appId: string) {
    const result = await this.manageAccountAppUseCase.getByApp(appId);
    return {
      statusCode: HttpStatus.OK,
      data: result,
    };
  }

  @Delete(':accountAppId')
  @ApiOperation({ summary: 'Cabut Hak Akses User dari Suatu Aplikasi' })
  async delete(@Param('accountAppId') accountAppId: string) {
    await this.manageAccountAppUseCase.delete(accountAppId);
    return {
      statusCode: HttpStatus.OK,
      message: 'Hak akses aplikasi berhasil dicabut',
    };
  }
}
