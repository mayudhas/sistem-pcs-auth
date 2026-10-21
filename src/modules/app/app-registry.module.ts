import { Module } from '@nestjs/common';
import { AUTH_APP_REPOSITORY_TOKEN } from './domain/repositories/auth-app.repository';
import { PrismaAuthAppRepository } from './infrastructure/repositories/prisma-auth-app.repository';

@Module({
  providers: [
    {
      provide: AUTH_APP_REPOSITORY_TOKEN,
      useClass: PrismaAuthAppRepository,
    },
  ],
  exports: [AUTH_APP_REPOSITORY_TOKEN],
})
export class AppRegistryModule {}
