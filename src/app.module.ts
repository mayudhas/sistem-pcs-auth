import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './infrastructure/database/prisma/prisma.module';
import { CryptoModule } from './infrastructure/crypto/crypto.module';
import { AuthModule } from './modules/auth/auth.module';
import { AppRegistryModule } from './modules/app/app-registry.module';
import { AccountAppModule } from './modules/account-app/account-app.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
    }),
    PrismaModule,
    CryptoModule,
    AuthModule,
    AppRegistryModule,
    AccountAppModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
