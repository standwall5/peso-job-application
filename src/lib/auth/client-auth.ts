// Client-side authentication helpers
// Use these in Client Components

"use client";

import { useSession } from "next-auth/react";

export function useCurrentUser() {
  const { data: session } = useSession();
  return session?.user;
}

export function useAuth() {
  const { data: session, status } = useSession();
  
  return {
    user: session?.user,
    isLoading: status === "loading",
    isAuthenticated: status === "authenticated",
    isApplicant: session?.user?.role === "applicant",
    isAdmin: session?.user?.role === "admin",
    isSuperadmin: session?.user?.isSuperadmin === true,
  };
}
