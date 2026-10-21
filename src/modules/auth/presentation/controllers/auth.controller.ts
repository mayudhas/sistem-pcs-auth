import { Controller, Post, Body, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { LoginUseCase } from '../../application/use-cases/login.use-case';
import { LoginDto } from '../../application/dtos/login.dto';
import { CryptoTokenService } from '../../../../infrastructure/crypto/crypto-token.service';

@ApiTags('Auth & SSO')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly loginUseCase: LoginUseCase,
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

  @Get('.well-known/jwks.json')
  @ApiOperation({ summary: 'Dapatkan Public Key JWKS untuk Verifikasi Token Asimetris (RS256)' })
  getJwks() {
    return this.cryptoTokenService.getJwks();
  }
}
