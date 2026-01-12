// NextAuth Configuration for PESO Job Application System
// Replaces Supabase Auth

import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import EmailProvider from "next-auth/providers/email";
import { prisma } from "@/lib/db/prisma-client";
import { sendVerificationRequest } from "./email-provider";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  
  providers: [
    EmailProvider({
      server: {
        host: process.env.SMTP_HOST!,
        port: Number(process.env.SMTP_PORT!),
        auth: {
          user: process.env.SMTP_USER!,
          pass: process.env.SMTP_PASSWORD!,
        },
      },
      from: process.env.EMAIL_FROM!,
      // Custom email sending function using Amazon SES
      sendVerificationRequest,
    }),
  ],

  pages: {
    signIn: "/auth/signin",
    verifyRequest: "/auth/verify-request",
    error: "/auth/error",
  },

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      // Allow all email sign-ins
      return true;
    },

    async jwt({ token, user, account, trigger }) {
      // Initial sign in
      if (user) {
        token.id = user.id;
        token.email = user.email;

        // Determine user role by checking which table has this user
        const applicant = await prisma.applicant.findUnique({
          where: { authId: user.id },
          select: { id: true, name: true, isArchived: true },
        });

        const admin = await prisma.peso.findUnique({
          where: { authId: user.id },
          select: { 
            id: true, 
            name: true, 
            isSuperadmin: true, 
            status: true,
            isArchived: true,
            accountLocked: true,
          },
        });

        if (applicant) {
          token.role = "applicant";
          token.userId = applicant.id;
          token.userName = applicant.name;
          token.isArchived = applicant.isArchived;
        } else if (admin) {
          token.role = "admin";
          token.userId = admin.id;
          token.userName = admin.name;
          token.isSuperadmin = admin.isSuperadmin;
          token.status = admin.status;
          token.isArchived = admin.isArchived;
          token.accountLocked = admin.accountLocked;
        } else {
          // New user without role assignment yet
          token.role = "pending";
        }
      }

      return token;
    },

    async session({ session, token }) {
      // Add custom fields to session
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.userId = token.userId as number;
        session.user.userName = token.userName as string;
        session.user.isSuperadmin = token.isSuperadmin as boolean;
        session.user.status = token.status as string;
        session.user.isArchived = token.isArchived as boolean;
        session.user.accountLocked = token.accountLocked as boolean;
      }

      return session;
    },

    async redirect({ url, baseUrl }) {
      // Redirect to appropriate dashboard based on role
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },

  events: {
    async signIn({ user, account, profile, isNewUser }) {
      // Update last_login timestamp
      const applicant = await prisma.applicant.findUnique({
        where: { authId: user.id },
      });

      if (applicant) {
        await prisma.applicant.update({
          where: { id: applicant.id },
          data: { lastLogin: new Date() },
        });
      }

      const admin = await prisma.peso.findUnique({
        where: { authId: user.id },
      });

      if (admin) {
        await prisma.peso.update({
          where: { id: admin.id },
          data: { lastLogin: new Date() },
        });
      }
    },
  },

  debug: process.env.NODE_ENV === "development",
};
