"use server";

import {
  getAdminProfile,
  checkIsSuperAdmin,
  getAllAdmins,
  updateAdminStatus,
  updateAdminInfo,
  unlockAdminAccount,
  resetAdminPassword,
  deleteAdmin,
  createAdmin,
  archiveAdmin,
  unarchiveAdmin,
  getArchivedAdmins,
} from "@/lib/db/services/admin.service";

export async function getAdminProfileAction() {
  try {
    return await getAdminProfile();
  } catch (error) {
    console.error("Failed to get admin profile:", error);
    throw error;
  }
}

export async function checkIsSuperAdminAction() {
  try {
    return await checkIsSuperAdmin();
  } catch (error) {
    console.error("Failed to check super admin status:", error);
    return false;
  }
}

export async function getAllAdminsAction() {
  try {
    return await getAllAdmins();
  } catch (error) {
    console.error("Failed to get all admins:", error);
    throw error;
  }
}

export async function updateAdminStatusAction(
  adminId: number,
  status: "active" | "suspended" | "deactivated",
) {
  try {
    return await updateAdminStatus(adminId, status);
  } catch (error) {
    console.error("Failed to update admin status:", error);
    throw error;
  }
}

export async function updateAdminInfoAction(
  adminId: number,
  updates: { name?: string; is_superadmin?: boolean },
) {
  try {
    return await updateAdminInfo(adminId, updates);
  } catch (error) {
    console.error("Failed to update admin info:", error);
    throw error;
  }
}

export async function unlockAdminAccountAction(adminId: number) {
  try {
    return await unlockAdminAccount(adminId);
  } catch (error) {
    console.error("Failed to unlock admin account:", error);
    throw error;
  }
}

export async function resetAdminPasswordAction(
  authId: string,
  newPassword: string,
) {
  try {
    return await resetAdminPassword(authId, newPassword);
  } catch (error) {
    console.error("Failed to reset admin password:", error);
    throw error;
  }
}

export async function deleteAdminAction(adminId: number, authId: string) {
  try {
    return await deleteAdmin(adminId, authId);
  } catch (error) {
    console.error("Failed to delete admin:", error);
    throw error;
  }
}

export async function createAdminAction(
  email: string,
  password: string,
  name: string,
  isSuperAdmin: boolean,
) {
  try {
    return await createAdmin(email, password, name, isSuperAdmin);
  } catch (error) {
    console.error("Failed to create admin:", error);
    throw error;
  }
}

export async function archiveAdminAction(adminId: number) {
  try {
    return await archiveAdmin(adminId);
  } catch (error) {
    console.error("Failed to archive admin:", error);
    throw error;
  }
}

export async function unarchiveAdminAction(adminId: number) {
  try {
    return await unarchiveAdmin(adminId);
  } catch (error) {
    console.error("Failed to unarchive admin:", error);
    throw error;
  }
}

export async function getArchivedAdminsAction() {
  try {
    return await getArchivedAdmins();
  } catch (error) {
    console.error("Failed to get archived admins:", error);
    throw error;
  }
}
