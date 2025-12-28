// src/app/admin/create-admin/types/create-admin.types.ts

export interface CreateAdminFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  is_superadmin: boolean;
}
