import { Controller, Post, Get, Delete, Body, Param, Patch, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ManageAppUseCase } from '../../application/use-cases/manage-app.use-case';
import { CreateAppDto } from '../../application/dtos/create-app.dto';
import { CreateAppRoleDto } from '../../application/dtos/create-app-role.dto';

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

  @Delete(':appId')
  @ApiOperation({ summary: 'Hapus Aplikasi dari SSO Registry' })
  async delete(@Param('appId') appId: string) {
    await this.manageAppUseCase.delete(appId);
    return {
      statusCode: HttpStatus.OK,
      message: `Aplikasi '${appId}' berhasil dihapus dari SSO`,
    };
  }

  @Get(':appId/roles')
  @ApiOperation({ summary: 'Daftar Role yang Didukung oleh Suatu Aplikasi' })
  async getRoles(@Param('appId') appId: string) {
    const roles = await this.manageAppUseCase.getRoles(appId);
    return {
      statusCode: HttpStatus.OK,
      data: roles,
    };
  }

  @Post(':appId/roles')
  @ApiOperation({ summary: 'Tambah Role Baru untuk Suatu Aplikasi' })
  async addRole(@Param('appId') appId: string, @Body() dto: CreateAppRoleDto) {
    const role = await this.manageAppUseCase.addRole(appId, dto);
    return {
      statusCode: HttpStatus.CREATED,
      message: `Role '${role.role_code}' berhasil ditambahkan ke aplikasi '${appId}'`,
      data: role,
    };
  }

  @Delete(':appId/roles/:roleId')
  @ApiOperation({ summary: 'Hapus Role dari Suatu Aplikasi' })
  async deleteRole(@Param('appId') appId: string, @Param('roleId') roleId: string) {
    await this.manageAppUseCase.deleteRole(appId, roleId);
    return {
      statusCode: HttpStatus.OK,
      message: 'Role berhasil dihapus dari aplikasi',
    };
  }
}
