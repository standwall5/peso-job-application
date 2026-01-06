export interface AdminProfile {
  id: number;
  name: string;
  is_superadmin: boolean;
  auth_id: string;
  email?: string;
}
