import { Global, Module } from '@nestjs/common';
import { CryptoTokenService } from './crypto-token.service';

@Global()
@Module({
  providers: [CryptoTokenService],
  exports: [CryptoTokenService],
})
export class CryptoModule {}
