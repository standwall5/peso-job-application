// NextAuth TypeScript Type Definitions
// Extends default session and JWT types with custom fields

import { DefaultSession, DefaultUser } from "next-auth";
import { JWT, DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "applicant" | "admin" | "pending";
      userId: number;
      userName: string;
      isSuperadmin?: boolean;
      status?: string;
      isArchived?: boolean;
      accountLocked?: boolean;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    role?: "applicant" | "admin" | "pending";
    userId?: number;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id?: string;
    role?: "applicant" | "admin" | "pending";
    userId?: number;
    userName?: string;
    isSuperadmin?: boolean;
    status?: string;
    isArchived?: boolean;
    accountLocked?: boolean;
  }
}
