import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import { importPKCS8, importSPKI, exportJWK, SignJWT, jwtVerify, JWK } from 'jose';

export interface TokenPayload {
  sub: string;
  username: string;
  aud: string;
  app_role: string;
  is_superadmin?: boolean;
}

@Injectable()
export class CryptoTokenService implements OnModuleInit {
  private privateKey: any;
  private publicKey: any;
  private publicJwk: JWK;
  private issuer: string;

  constructor(private readonly configService: ConfigService) {
    this.issuer = this.configService.get<string>('JWT_ISSUER', 'https://sso.perusahaan.com');
  }

  async onModuleInit() {
    const keysDir = path.resolve(process.cwd(), 'keys');
    const privateKeyPem = fs.readFileSync(path.join(keysDir, 'private_key.pem'), 'utf8');
    const publicKeyPem = fs.readFileSync(path.join(keysDir, 'public_key.pem'), 'utf8');

    this.privateKey = await importPKCS8(privateKeyPem, 'RS256');
    this.publicKey = await importSPKI(publicKeyPem, 'RS256');

    const jwk = await exportJWK(this.publicKey);
    this.publicJwk = {
      ...jwk,
      kid: 'pcs-sso-key-1',
      alg: 'RS256',
      use: 'sig',
    };
  }

  async signAccessToken(payload: TokenPayload, expiresIn = '15m'): Promise<string> {
    return new SignJWT({
      username: payload.username,
      app_role: payload.app_role,
      is_superadmin: Boolean(payload.is_superadmin),
    })
      .setProtectedHeader({ alg: 'RS256', kid: 'pcs-sso-key-1' })
      .setIssuer(this.issuer)
      .setSubject(payload.sub)
      .setAudience(payload.aud)
      .setIssuedAt()
      .setExpirationTime(expiresIn)
      .sign(this.privateKey);
  }

  async verifyToken(token: string, audience?: string) {
    const options: { issuer: string; audience?: string } = {
      issuer: this.issuer,
    };
    if (audience) {
      options.audience = audience;
    }
    const { payload } = await jwtVerify(token, this.publicKey, options);
    return payload;
  }

  getJwks(): { keys: JWK[] } {
    return {
      keys: [this.publicJwk],
    };
  }
}
