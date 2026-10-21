import { Module } from '@nestjs/common';
import { AUTH_ACCOUNT_REPOSITORY_TOKEN } from './domain/repositories/auth-account.repository';
import { PrismaAuthAccountRepository } from './infrastructure/repositories/prisma-auth-account.repository';
import { LoginUseCase } from './application/use-cases/login.use-case';
import { RefreshTokenUseCase } from './application/use-cases/refresh-token.use-case';
import { LogoutUseCase } from './application/use-cases/logout.use-case';
import { ManageAccountUseCase } from './application/use-cases/manage-account.use-case';
import { AuthController } from './presentation/controllers/auth.controller';
import { AppRegistryModule } from '../app/app-registry.module';
import { AccountAppModule } from '../account-app/account-app.module';

@Module({
  imports: [AppRegistryModule, AccountAppModule],
  controllers: [AuthController],
  providers: [
    LoginUseCase,
    RefreshTokenUseCase,
    LogoutUseCase,
    ManageAccountUseCase,
    {
      provide: AUTH_ACCOUNT_REPOSITORY_TOKEN,
      useClass: PrismaAuthAccountRepository,
    },
  ],
  exports: [
    AUTH_ACCOUNT_REPOSITORY_TOKEN,
    LoginUseCase,
    RefreshTokenUseCase,
    LogoutUseCase,
    ManageAccountUseCase,
  ],
})
export class AuthModule {}
