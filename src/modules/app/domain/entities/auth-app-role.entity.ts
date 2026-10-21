export class AuthAppRole {
  role_id: string;
  app_id: string;
  role_code: string;
  role_nama: string;
  role_deskripsi?: string | null;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;

  constructor(partial: Partial<AuthAppRole>) {
    Object.assign(this, partial);
  }
}
