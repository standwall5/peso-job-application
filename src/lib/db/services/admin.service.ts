// Admin service for PESO staff management
"use server";

import { getSupabaseClient, getCurrentUser } from "../client";
import { getSupabaseAdminClient } from "../admin-client";

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
  is_first_login?: boolean;
}

export interface AdminWithEmail extends AdminProfile {
  email: string;
}

export async function getAdminProfile(): Promise<AdminProfile> {
  const supabase = await getSupabaseClient();
  const user = await getCurrentUser();

  const { data, error } = await supabase
    .from("peso")
    .select(
      "id, name, is_superadmin, auth_id, status, created_at, last_login, account_locked, profile_picture_url, is_first_login",
    )
    .eq("auth_id", user.id)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error("Not an admin user");
  }

  return {
    ...data,
    email: user.email,
  };
}

export async function checkIsSuperAdmin(): Promise<boolean> {
  try {
    const profile = await getAdminProfile();
    return profile.is_superadmin;
  } catch (error) {
    return false;
  }
}

export async function getAllAdmins(): Promise<AdminWithEmail[]> {
  const supabase = await getSupabaseClient();
  const adminClient = getSupabaseAdminClient();

  // Only super admins should call this
  const isSuperAdmin = await checkIsSuperAdmin();
  if (!isSuperAdmin) {
    throw new Error("Unauthorized: Super admin access required");
  }

  const { data: pesoData, error } = await supabase
    .from("peso")
    .select(
      `
      id,
      name,
      is_superadmin,
      auth_id,
      created_at,
      status,
      last_login,
      account_locked
    `,
    )
    .eq("is_archived", false)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  // Fetch emails from auth.users using admin client
  const adminsWithEmails: AdminWithEmail[] = [];

  for (const admin of pesoData || []) {
    const { data: userData } = await adminClient.auth.admin.getUserById(
      admin.auth_id,
    );
    adminsWithEmails.push({
      ...admin,
      email: userData?.user?.email || "N/A",
    });
  }

  return adminsWithEmails;
}

export async function updateAdminStatus(
  adminId: number,
  status: "active" | "suspended" | "deactivated",
) {
  const supabase = await getSupabaseClient();

  // Only super admins can modify admin status
  const currentUserIsSuperAdmin = await checkIsSuperAdmin();
  if (!currentUserIsSuperAdmin) {
    throw new Error("Unauthorized: Super admin access required");
  }

  const { data, error } = await supabase
    .from("peso")
    .update({ status })
    .eq("id", adminId)
    .select();

  if (error) {
    throw new Error(error.message);
  }

  if (!data || data.length === 0) {
    throw new Error("Admin not found");
  }

  return data[0];
}

export async function updateAdminInfo(
  adminId: number,
  updates: { name?: string; is_superadmin?: boolean },
) {
  const supabase = await getSupabaseClient();

  // Only super admins can modify admin info
  const currentUserIsSuperAdmin = await checkIsSuperAdmin();
  if (!currentUserIsSuperAdmin) {
    throw new Error("Unauthorized: Super admin access required");
  }

  const { data, error } = await supabase
    .from("peso")
    .update(updates)
    .eq("id", adminId)
    .select();

  if (error) {
    throw new Error(error.message);
  }

  if (!data || data.length === 0) {
    throw new Error(`Admin not found with ID: ${adminId}`);
  }

  return data[0];
}

export async function unlockAdminAccount(adminId: number) {
  const supabase = await getSupabaseClient();

  // Only super admins can unlock accounts
  const currentUserIsSuperAdmin = await checkIsSuperAdmin();
  if (!currentUserIsSuperAdmin) {
    throw new Error("Unauthorized: Super admin access required");
  }

  const { data, error } = await supabase
    .from("peso")
    .update({
      account_locked: false,
      locked_until: null,
      failed_login_attempts: 0,
    })
    .eq("id", adminId)
    .select();

  if (error) {
    throw new Error(error.message);
  }

  if (!data || data.length === 0) {
    throw new Error("Admin not found");
  }

  return data[0];
}

export async function resetAdminPassword(authId: string, newPassword: string) {
  const adminClient = getSupabaseAdminClient();

  // Only super admins can reset passwords
  const currentUserIsSuperAdmin = await checkIsSuperAdmin();
  if (!currentUserIsSuperAdmin) {
    throw new Error("Unauthorized: Super admin access required");
  }

  const { data, error } = await adminClient.auth.admin.updateUserById(authId, {
    password: newPassword,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function deleteAdmin(adminId: number, authId: string) {
  const supabase = await getSupabaseClient();
  const adminClient = getSupabaseAdminClient();

  // Only super admins can delete admins
  const currentUserIsSuperAdmin = await checkIsSuperAdmin();
  if (!currentUserIsSuperAdmin) {
    throw new Error("Unauthorized: Super admin access required");
  }

  // Delete from peso table
  const { error: pesoError } = await supabase
    .from("peso")
    .delete()
    .eq("id", adminId);

  if (pesoError) {
    throw new Error(pesoError.message);
  }

  // Delete from auth using admin client
  const { error: authError } = await adminClient.auth.admin.deleteUser(authId);

  if (authError) {
    throw new Error(authError.message);
  }

  return { success: true };
}

export async function createAdmin(
  email: string,
  password: string,
  name: string,
  isSuperAdmin: boolean = false,
) {
  const supabase = await getSupabaseClient();
  const adminClient = getSupabaseAdminClient();

  // Only super admins can create admins
  const currentUserIsSuperAdmin = await checkIsSuperAdmin();
  if (!currentUserIsSuperAdmin) {
    throw new Error("Unauthorized: Super admin access required");
  }

  // Create auth user using admin client
  const { data: authData, error: authError } =
    await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        name,
      },
    });

  if (authError) {
    throw new Error(authError.message);
  }

  if (!authData.user) {
    throw new Error("Failed to create user");
  }

  // Create peso record
  const { data: pesoData, error: pesoError } = await supabase
    .from("peso")
    .insert({
      auth_id: authData.user.id,
      name,
      is_superadmin: isSuperAdmin,
      status: "active",
    })
    .select()
    .single();

  if (pesoError) {
    // Rollback: delete auth user if peso insert fails
    await adminClient.auth.admin.deleteUser(authData.user.id);
    throw new Error(pesoError.message);
  }

  return {
    ...pesoData,
    email: authData.user.email,
  };
}

export async function archiveAdmin(adminId: number) {
  const supabase = await getSupabaseClient();

  // Only super admins can archive admins
  const currentUserIsSuperAdmin = await checkIsSuperAdmin();
  if (!currentUserIsSuperAdmin) {
    throw new Error("Unauthorized: Super admin access required");
  }

  const { data, error } = await supabase
    .from("peso")
    .update({
      is_archived: true,
      archived_at: new Date().toISOString(),
    })
    .eq("id", adminId)
    .select();

  if (error) {
    throw new Error(error.message);
  }

  if (!data || data.length === 0) {
    throw new Error("Admin not found");
  }

  return data[0];
}

export async function unarchiveAdmin(adminId: number) {
  const supabase = await getSupabaseClient();

  // Only super admins can unarchive admins
  const currentUserIsSuperAdmin = await checkIsSuperAdmin();
  if (!currentUserIsSuperAdmin) {
    throw new Error("Unauthorized: Super admin access required");
  }

  const { data, error } = await supabase
    .from("peso")
    .update({
      is_archived: false,
      archived_at: null,
    })
    .eq("id", adminId)
    .select();

  if (error) {
    throw new Error(error.message);
  }

  if (!data || data.length === 0) {
    throw new Error("Admin not found");
  }

  return data[0];
}

export async function getArchivedAdmins(): Promise<AdminWithEmail[]> {
  const supabase = await getSupabaseClient();
  const adminClient = getSupabaseAdminClient();

  // Only super admins should call this
  const isSuperAdmin = await checkIsSuperAdmin();
  if (!isSuperAdmin) {
    throw new Error("Unauthorized: Super admin access required");
  }

  const { data: pesoData, error } = await supabase
    .from("peso")
    .select(
      `
      id,
      name,
      is_superadmin,
      auth_id,
      created_at,
      status,
      last_login,
      account_locked,
      archived_at
    `,
    )
    .eq("is_archived", true)
    .order("archived_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  // Fetch emails from auth.users using admin client
  const adminsWithEmails: AdminWithEmail[] = [];

  for (const admin of pesoData || []) {
    const { data: userData } = await adminClient.auth.admin.getUserById(
      admin.auth_id,
    );
    adminsWithEmails.push({
      ...admin,
      email: userData?.user?.email || "N/A",
    });
  }

  return adminsWithEmails;
}
