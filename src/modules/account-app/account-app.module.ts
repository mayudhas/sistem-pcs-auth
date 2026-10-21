import { Module } from '@nestjs/common';
import { AUTH_ACCOUNT_APP_REPOSITORY_TOKEN } from './domain/repositories/auth-account-app.repository';
import { PrismaAuthAccountAppRepository } from './infrastructure/repositories/prisma-auth-account-app.repository';

@Module({
  providers: [
    {
      provide: AUTH_ACCOUNT_APP_REPOSITORY_TOKEN,
      useClass: PrismaAuthAccountAppRepository,
    },
  ],
  exports: [AUTH_ACCOUNT_APP_REPOSITORY_TOKEN],
})
export class AccountAppModule {}
