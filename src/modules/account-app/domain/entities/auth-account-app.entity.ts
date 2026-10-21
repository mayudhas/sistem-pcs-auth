export class AuthAccountApp {
  public account_app_id: string;
  public auth_id: string;
  public app_id: string;
  public app_role: string;
  public is_active: boolean;
  public created_at: Date | string;
  public updated_at: Date | string;

  constructor(props?: Partial<AuthAccountApp>) {
    if (props) {
      Object.assign(this, props);
    }
  }
}
