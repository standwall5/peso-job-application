// src/app/admin/manage-admin/types/admin.types.ts

export interface AdminWithEmail {
  id: number;
  name: string;
  email: string;
  is_superadmin: boolean;
  auth_id: string;
  created_at?: string;
  status?: string;
  last_login?: string;
  account_locked?: boolean;
  is_archived?: boolean;
  archived_at?: string;
}

export type AdminStatus = "active" | "suspended" | "deactivated";
