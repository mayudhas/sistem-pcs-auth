import { Module, forwardRef } from '@nestjs/common';
import { AUTH_ACCOUNT_APP_REPOSITORY_TOKEN } from './domain/repositories/auth-account-app.repository';
import { PrismaAuthAccountAppRepository } from './infrastructure/repositories/prisma-auth-account-app.repository';
import { ManageAccountAppUseCase } from './application/use-cases/manage-account-app.use-case';
import { AccountAppController } from './presentation/controllers/account-app.controller';
import { AuthModule } from '../auth/auth.module';
import { AppRegistryModule } from '../app/app-registry.module';

@Module({
  imports: [forwardRef(() => AuthModule), forwardRef(() => AppRegistryModule)],
  controllers: [AccountAppController],
  providers: [
    ManageAccountAppUseCase,
    {
      provide: AUTH_ACCOUNT_APP_REPOSITORY_TOKEN,
      useClass: PrismaAuthAccountAppRepository,
    },
  ],
  exports: [AUTH_ACCOUNT_APP_REPOSITORY_TOKEN, ManageAccountAppUseCase],
})
export class AccountAppModule {}
