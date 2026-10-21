import { Controller, Post, Body, Get, Param, Patch, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { LoginUseCase } from '../../application/use-cases/login.use-case';
import { RefreshTokenUseCase } from '../../application/use-cases/refresh-token.use-case';
import { LogoutUseCase } from '../../application/use-cases/logout.use-case';
import { ManageAccountUseCase } from '../../application/use-cases/manage-account.use-case';
import { LoginDto } from '../../application/dtos/login.dto';
import { RefreshTokenDto } from '../../application/dtos/refresh-token.dto';
import { LogoutDto } from '../../application/dtos/logout.dto';
import { CreateAccountDto, ResetPasswordDto } from '../../application/dtos/account.dto';
import { CryptoTokenService } from '../../../../infrastructure/crypto/crypto-token.service';

@ApiTags('Auth & SSO')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
    private readonly logoutUseCase: LogoutUseCase,
    private readonly manageAccountUseCase: ManageAccountUseCase,
    private readonly cryptoTokenService: CryptoTokenService,
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login SSO & Dapatkan RS256 JWT Token untuk Aplikasi Target' })
  @ApiResponse({ status: 200, description: 'Login Berhasil' })
  @ApiResponse({ status: 401, description: 'Kredensial Tidak Valid' })
  @ApiResponse({ status: 403, description: 'Tidak Memiliki Akses ke Aplikasi' })
  async login(@Body() dto: LoginDto) {
    const result = await this.loginUseCase.execute(dto);
    return {
      statusCode: HttpStatus.OK,
      message: 'Login berhasil',
      data: result,
    };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh Token & Rotasi Session' })
  async refresh(@Body() dto: RefreshTokenDto) {
    const result = await this.refreshTokenUseCase.execute(dto);
    return {
      statusCode: HttpStatus.OK,
      message: 'Token berhasil diperbarui',
      data: result,
    };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Logout & Revoke Session' })
  async logout(@Body() dto: LogoutDto) {
    const result = await this.logoutUseCase.execute(dto);
    return {
      statusCode: HttpStatus.OK,
      message: result.message,
    };
  }

  @Get('.well-known/jwks.json')
  @ApiOperation({ summary: 'Dapatkan Public Key JWKS untuk Verifikasi Token Asimetris (RS256)' })
  getJwks() {
    return this.cryptoTokenService.getJwks();
  }

  @Post('accounts')
  @ApiOperation({ summary: 'Daftarkan Akun Kredensial Baru' })
  async createAccount(@Body() dto: CreateAccountDto) {
    const account = await this.manageAccountUseCase.create(dto);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Akun berhasil dibuat',
      data: {
        auth_id: account.auth_id,
        auth_username: account.auth_username,
        auth_is_active: account.auth_is_active,
      },
    };
  }

  @Patch('accounts/:authId/reset-password')
  @ApiOperation({ summary: 'Reset Password Akun' })
  async resetPassword(@Param('authId') authId: string, @Body() dto: ResetPasswordDto) {
    await this.manageAccountUseCase.resetPassword(authId, dto);
    return {
      statusCode: HttpStatus.OK,
      message: 'Password berhasil direset',
    };
  }

  @Patch('accounts/:authId/toggle-active')
  @ApiOperation({ summary: 'Aktifkan / Nonaktifkan Akun (Kill Switch Akun)' })
  async toggleActive(@Param('authId') authId: string) {
    const account = await this.manageAccountUseCase.toggleActive(authId);
    return {
      statusCode: HttpStatus.OK,
      message: `Akun berhasil di-${account.auth_is_active ? 'aktifkan' : 'nonaktifkan'}`,
      data: {
        auth_id: account.auth_id,
        auth_username: account.auth_username,
        auth_is_active: account.auth_is_active,
      },
    };
  }
}
