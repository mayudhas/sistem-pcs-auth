import { Module } from '@nestjs/common';
import { AUTH_APP_REPOSITORY_TOKEN } from './domain/repositories/auth-app.repository';
import { PrismaAuthAppRepository } from './infrastructure/repositories/prisma-auth-app.repository';
import { AUTH_APP_ROLE_REPOSITORY_TOKEN } from './domain/repositories/auth-app-role.repository';
import { PrismaAuthAppRoleRepository } from './infrastructure/repositories/prisma-auth-app-role.repository';
import { ManageAppUseCase } from './application/use-cases/manage-app.use-case';
import { AppRegistryController } from './presentation/controllers/app-registry.controller';

@Module({
  controllers: [AppRegistryController],
  providers: [
    ManageAppUseCase,
    {
      provide: AUTH_APP_REPOSITORY_TOKEN,
      useClass: PrismaAuthAppRepository,
    },
    {
      provide: AUTH_APP_ROLE_REPOSITORY_TOKEN,
      useClass: PrismaAuthAppRoleRepository,
    },
  ],
  exports: [AUTH_APP_REPOSITORY_TOKEN, AUTH_APP_ROLE_REPOSITORY_TOKEN, ManageAppUseCase],
})
export class AppRegistryModule {}
