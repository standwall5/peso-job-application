# Migration Quick Reference Card

## 🗂️ File Structure

```
proyecto/
├── prisma/
│   └── schema.prisma                          # Complete Prisma schema
│
├── src/
│   ├── lib/
│   │   ├── auth/
│   │   │   ├── auth-options.ts               # NextAuth configuration
│   │   │   ├── email-provider.ts             # Amazon SES email provider
│   │   │   ├── server-auth.ts                # Server-side auth helpers
│   │   │   └── client-auth.ts                # Client-side auth hooks
│   │   │
│   │   └── db/
│   │       └── prisma-client.ts              # Prisma client singleton
│   │
│   ├── app/
│   │   ├── api/
│   │   │   └── auth/
│   │   │       └── [...nextauth]/
│   │   │           └── route.ts              # NextAuth API handler
│   │   └── layout.tsx                         # Add SessionProvider here
│   │
│   ├── components/
│   │   └── providers/
│   │       └── SessionProvider.tsx            # Client session provider
│   │
│   └── types/
│       └── next-auth.d.ts                     # TypeScript definitions
│
├── scripts/
│   └── migrate-users.ts                       # Data migration script
│
├── .env.local                                 # Environment variables
├── ENV_VARIABLES_TEMPLATE.md                  # Template with explanations
├── MIGRATION_GUIDE_SUPABASE_TO_NEXTAUTH.md   # Complete guide
└── MIGRATION_DEPENDENCIES.md                  # Installation steps
```

---

## 🔧 Commands Cheat Sheet

### Installation
```bash
npm uninstall @supabase/supabase-js @supabase/auth-helpers-nextjs
npm install next-auth@latest @prisma/client@latest
npm install -D prisma@latest
npm install nodemailer @aws-sdk/client-ses
npm install -D @types/nodemailer
```

### Prisma
```bash
npx prisma init                    # Initialize (if needed)
npx prisma generate                # Generate client
npx prisma db push                 # Sync schema to DB
npx prisma migrate dev             # Create migration
npx prisma migrate deploy          # Deploy to production
npx prisma studio                  # Open database GUI
```

### NextAuth
```bash
openssl rand -base64 32            # Generate NEXTAUTH_SECRET
```

---

## 📝 Code Patterns

### Server Components (RSC)

```typescript
// Get session
import { getSession } from '@/lib/auth/server-auth'

const session = await getSession()
const user = session?.user

// Require authentication
import { requireAuth } from '@/lib/auth/server-auth'

const session = await requireAuth() // Redirects if not logged in

// Require specific role
import { requireAdmin } from '@/lib/auth/server-auth'

const session = await requireAdmin() // Only admins
```

### Client Components

```typescript
"use client"

import { useSession } from 'next-auth/react'
import { signIn, signOut } from 'next-auth/react'

export default function Component() {
  const { data: session, status } = useSession()
  
  if (status === "loading") return <div>Loading...</div>
  
  if (!session) {
    return <button onClick={() => signIn()}>Sign In</button>
  }
  
  return (
    <div>
      <p>Signed in as {session.user.email}</p>
      <p>Role: {session.user.role}</p>
      <button onClick={() => signOut()}>Sign Out</button>
    </div>
  )
}
```

### API Routes

```typescript
// src/app/api/example/route.ts
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth/auth-options"
import { NextResponse } from "next/server"

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  
  // Access user info
  const { role, userId } = session.user
  
  // Your logic here
  return NextResponse.json({ data: "..." })
}
```

### Prisma Queries

```typescript
import { prisma } from '@/lib/db/prisma-client'

// Find user by email
const user = await prisma.user.findUnique({
  where: { email: "user@example.com" }
})

// Find applicant with user relation
const applicant = await prisma.applicant.findUnique({
  where: { id: applicantId },
  include: { user: true }
})

// Find admin
const admin = await prisma.peso.findUnique({
  where: { authId: userId },
  select: { 
    id: true, 
    name: true, 
    isSuperadmin: true 
  }
})

// Create with relation
const newApplicant = await prisma.applicant.create({
  data: {
    name: "John Doe",
    email: "john@example.com",
    user: {
      connect: { id: userId }
    }
  }
})
```

---

## 🔐 Authentication Flows

### Magic Link Flow

1. User enters email at `/api/auth/signin`
2. NextAuth creates verification token
3. Amazon SES sends email with magic link
4. User clicks link with token
5. NextAuth verifies token
6. Creates session and redirects to callback URL

### Session Access

**Server Side:**
```typescript
const session = await getSession()
if (session) {
  console.log(session.user.role)      // "applicant" | "admin"
  console.log(session.user.userId)    // Database ID
  console.log(session.user.isSuperadmin) // boolean
}
```

**Client Side:**
```typescript
const { data: session } = useSession()
if (session) {
  console.log(session.user.email)
  console.log(session.user.role)
}
```

---

## 🌐 API Endpoints

### NextAuth Endpoints (Auto-generated)

- `GET /api/auth/signin` - Sign in page
- `POST /api/auth/signin/email` - Send magic link
- `GET /api/auth/callback/email` - Verify magic link
- `GET /api/auth/signout` - Sign out page
- `POST /api/auth/signout` - Sign out action
- `GET /api/auth/session` - Get current session (JSON)
- `GET /api/auth/csrf` - CSRF token
- `GET /api/auth/providers` - List providers

### Custom Usage

```typescript
// Send magic link
await signIn("email", { email: "user@example.com" })

// Sign out
await signOut({ callbackUrl: "/" })

// Get session client-side
const { data: session } = useSession()

// Get session server-side
const session = await getServerSession(authOptions)
```

---

## 📊 Database Tables

### NextAuth Tables

- **users**: Main user table (email, name, etc.)
- **accounts**: OAuth accounts (not used for email auth)
- **sessions**: Active sessions (if using database strategy)
- **verification_tokens**: Magic link tokens

### Your Business Tables

- **applicants**: Job seekers (links to users via auth_id)
- **peso**: Admins (links to users via auth_id)
- **applications**, **jobs**, **companies**, etc. (unchanged)

### Key Relationships

```
users (NextAuth)
  ├── applicants (1:1 via auth_id)
  └── peso (1:1 via auth_id)
```

---

## ⚠️ Common Gotchas

### 1. Environment Variables

❌ **Wrong:**
```env
DATABASE_URL=postgresql://...  # Missing sslmode for Neon
```

✅ **Correct:**
```env
DATABASE_URL=postgresql://...?sslmode=require
```

### 2. Session Provider

❌ **Wrong:** Using SessionProvider in Server Component
```typescript
// app/layout.tsx (Server Component)
import { SessionProvider } from "next-auth/react" // ❌ Won't work
```

✅ **Correct:** Create client wrapper
```typescript
// components/providers/SessionProvider.tsx
"use client"
import { SessionProvider as NextAuthSessionProvider } from "next-auth/react"
export default function SessionProvider({ children }) {
  return <NextAuthSessionProvider>{children}</NextAuthSessionProvider>
}
```

### 3. Middleware

❌ **Wrong:** Trying to use getSession in middleware
```typescript
import { getSession } from 'next-auth/react' // ❌ Won't work in middleware
```

✅ **Correct:** Use withAuth or getToken
```typescript
import { withAuth } from "next-auth/middleware"
export default withAuth({...})
```

### 4. Role Checking

❌ **Wrong:** Checking role before session loads
```typescript
const { data: session } = useSession()
if (session.user.role === "admin") {...} // ❌ Might be undefined
```

✅ **Correct:** Check session exists first
```typescript
const { data: session, status } = useSession()
if (status === "loading") return <Loading />
if (session?.user.role === "admin") {...}
```

---

## 🧪 Testing Checklist

- [ ] Magic link email received
- [ ] Magic link sign-in works
- [ ] Applicant role assigned correctly
- [ ] Admin role assigned correctly
- [ ] Session persists across pages
- [ ] Sign out works
- [ ] Protected routes redirect
- [ ] Database queries work with Prisma
- [ ] Email fields populated in applicants/peso tables
- [ ] All foreign key relationships intact

---

## 📞 Support Resources

- **NextAuth Docs**: https://next-auth.js.org
- **Prisma Docs**: https://www.prisma.io/docs
- **Neon Docs**: https://neon.tech/docs
- **AWS SES Docs**: https://docs.aws.amazon.com/ses
- **This Project**: See `MIGRATION_GUIDE_SUPABASE_TO_NEXTAUTH.md`

---

## 🎯 Quick Troubleshooting

| Issue | Solution |
|-------|----------|
| "Module not found: @prisma/client" | Run `npx prisma generate` |
| "Invalid `prisma.user.create()`" | Check Prisma schema, run `prisma generate` |
| Email not sending | Check SES sandbox mode, verify sender email |
| "Invalid session" | Clear cookies, check NEXTAUTH_SECRET |
| Role is "pending" | User not in applicants or peso table |
| Database connection error | Check DATABASE_URL has `?sslmode=require` |

---

**Last Updated:** January 2026
**Version:** 1.0
