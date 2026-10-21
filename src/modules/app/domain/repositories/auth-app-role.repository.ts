import { AuthAppRole } from '../entities/auth-app-role.entity';

export const AUTH_APP_ROLE_REPOSITORY_TOKEN = 'AuthAppRoleRepository';

export interface AuthAppRoleRepository {
  create(role: AuthAppRole): Promise<AuthAppRole>;
  getByAppId(appId: string): Promise<AuthAppRole[]>;
  findByAppIdAndCode(appId: string, roleCode: string): Promise<AuthAppRole | null>;
  delete(roleId: string): Promise<boolean>;
}
