import { Controller, Post, Get, Body, Param, Patch, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ManageAppUseCase } from '../../application/use-cases/manage-app.use-case';
import { CreateAppDto } from '../../application/dtos/create-app.dto';

@ApiTags('Client Apps (Registry)')
@Controller('apps')
export class AppRegistryController {
  constructor(private readonly manageAppUseCase: ManageAppUseCase) {}

  @Post()
  @ApiOperation({ summary: 'Daftarkan Client Aplikasi Baru ke SSO' })
  @ApiResponse({ status: 201, description: 'Aplikasi Berhasil Didaftarkan' })
  async create(@Body() dto: CreateAppDto) {
    const app = await this.manageAppUseCase.create(dto);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Aplikasi berhasil didaftarkan ke SSO',
      data: app,
    };
  }

  @Get()
  @ApiOperation({ summary: 'Daftar Semua Aplikasi yang Terhubung ke SSO' })
  async getAll() {
    const apps = await this.manageAppUseCase.getAll();
    return {
      statusCode: HttpStatus.OK,
      data: apps,
    };
  }

  @Patch(':appId/toggle-active')
  @ApiOperation({ summary: 'Aktifkan / Nonaktifkan Aplikasi (Kill Switch App)' })
  async toggleActive(@Param('appId') appId: string) {
    const app = await this.manageAppUseCase.toggleActive(appId);
    return {
      statusCode: HttpStatus.OK,
      message: `Aplikasi berhasil di-${app.app_is_active ? 'aktifkan' : 'nonaktifkan'}`,
      data: app,
    };
  }
}
