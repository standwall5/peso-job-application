// NextAuth API Route Handler for App Router
// Handles all authentication endpoints

import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
