export interface AdminProfile {
  id: number;
  name: string;
  is_superadmin: boolean;
  auth_id: string;
  email?: string;
  status?: string;
  created_at?: string;
  last_login?: string;
  account_locked?: boolean;
  profile_picture_url?: string;
}
