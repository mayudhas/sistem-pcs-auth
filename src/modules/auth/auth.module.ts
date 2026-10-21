import { Module } from '@nestjs/common';
import { AUTH_ACCOUNT_REPOSITORY_TOKEN } from './domain/repositories/auth-account.repository';
import { PrismaAuthAccountRepository } from './infrastructure/repositories/prisma-auth-account.repository';
import { LoginUseCase } from './application/use-cases/login.use-case';
import { AuthController } from './presentation/controllers/auth.controller';
import { AppRegistryModule } from '../app/app-registry.module';
import { AccountAppModule } from '../account-app/account-app.module';

@Module({
  imports: [AppRegistryModule, AccountAppModule],
  controllers: [AuthController],
  providers: [
    LoginUseCase,
    {
      provide: AUTH_ACCOUNT_REPOSITORY_TOKEN,
      useClass: PrismaAuthAccountRepository,
    },
  ],
  exports: [AUTH_ACCOUNT_REPOSITORY_TOKEN, LoginUseCase],
})
export class AuthModule {}
