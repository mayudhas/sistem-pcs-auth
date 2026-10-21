export class AuthApp {
  public app_id: string;
  public app_nama: string;
  public app_deskripsi?: string | null;
  public app_redirect_uri?: string | null;
  public app_is_active: boolean;
  public app_created_at: Date | string;
  public app_updated_at: Date | string;

  constructor(props?: Partial<AuthApp>) {
    if (props) {
      Object.assign(this, props);
    }
  }
}
