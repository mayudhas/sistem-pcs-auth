import { AuthApp } from '../entities/auth-app.entity';

export const AUTH_APP_REPOSITORY_TOKEN = 'AuthAppRepository';

export interface AuthAppRepository {
  create(app: AuthApp): Promise<AuthApp>;
  getById(id: string): Promise<AuthApp | null>;
  getAll(): Promise<AuthApp[]>;
  update(app: AuthApp): Promise<AuthApp>;
  delete(id: string): Promise<boolean>;
}
