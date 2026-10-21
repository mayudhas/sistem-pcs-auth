import { AuthAccount } from '../entities/auth-account.entity';

export const AUTH_ACCOUNT_REPOSITORY_TOKEN = 'AuthAccountRepository';

export interface AuthAccountRepository {
  create(account: AuthAccount): Promise<AuthAccount>;
  getById(id: string): Promise<AuthAccount | null>;
  getByUsername(username: string): Promise<AuthAccount | null>;
  update(account: AuthAccount): Promise<AuthAccount>;
  delete(id: string): Promise<boolean>;
}
