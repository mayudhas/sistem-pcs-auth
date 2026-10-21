import { Module } from '@nestjs/common';
import { AUTH_APP_REPOSITORY_TOKEN } from './domain/repositories/auth-app.repository';
import { PrismaAuthAppRepository } from './infrastructure/repositories/prisma-auth-app.repository';
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
  ],
  exports: [AUTH_APP_REPOSITORY_TOKEN, ManageAppUseCase],
})
export class AppRegistryModule {}
