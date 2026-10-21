import { AuthAccountApp } from '../entities/auth-account-app.entity';

export const AUTH_ACCOUNT_APP_REPOSITORY_TOKEN = 'AuthAccountAppRepository';

export interface AuthAccountAppRepository {
  create(accountApp: AuthAccountApp): Promise<AuthAccountApp>;
  findByAuthIdAndAppId(authId: string, appId: string): Promise<AuthAccountApp | null>;
  findByAuthId(authId: string): Promise<AuthAccountApp[]>;
  findByAppId(appId: string): Promise<any[]>;
  findById(accountAppId: string): Promise<AuthAccountApp | null>;
  update(accountApp: AuthAccountApp): Promise<AuthAccountApp>;
  delete(id: string): Promise<boolean>;
}
