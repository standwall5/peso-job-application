// Server-side authentication helpers
// Use these in Server Components and API Routes

import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth-options";
import { redirect } from "next/navigation";

export async function getSession() {
  return await getServerSession(authOptions);
}

export async function getCurrentUser() {
  const session = await getSession();
  return session?.user;
}

export async function requireAuth() {
  const session = await getSession();
  if (!session) {
    redirect("/auth/signin");
  }
  return session;
}

export async function requireApplicant() {
  const session = await requireAuth();
  if (session.user.role !== "applicant") {
    redirect("/unauthorized");
  }
  return session;
}

export async function requireAdmin() {
  const session = await requireAuth();
  if (session.user.role !== "admin") {
    redirect("/unauthorized");
  }
  
  // Check if account is locked or archived
  if (session.user.accountLocked || session.user.isArchived) {
    redirect("/auth/account-locked");
  }
  
  return session;
}

export async function requireSuperadmin() {
  const session = await requireAdmin();
  if (!session.user.isSuperadmin) {
    redirect("/unauthorized");
  }
  return session;
}
