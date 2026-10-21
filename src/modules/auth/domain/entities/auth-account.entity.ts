export class AuthAccount {
  public auth_id: string;
  public auth_username: string;
  public auth_password_hash: string;
  public auth_is_superadmin: boolean;
  public auth_is_active: boolean;
  public auth_created_at: Date | string;
  public auth_updated_at: Date | string;

  constructor(props?: Partial<AuthAccount>) {
    if (props) {
      Object.assign(this, props);
    }
  }
}
