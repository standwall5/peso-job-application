# Complete Migration Guide: Supabase → NextAuth + Neon + Amazon SES

This guide provides step-by-step instructions to migrate your PESO Job Application System from Supabase to NextAuth with Neon PostgreSQL and Amazon SES.

---

## ⚠️ PREREQUISITES

Before starting, ensure you have:

1. ✅ Access to your Supabase project dashboard
2. ✅ A Neon PostgreSQL account (https://neon.tech)
3. ✅ An AWS account with SES access
4. ✅ Backups of your current codebase
5. ✅ Database backup from Supabase

---

## 📋 MIGRATION CHECKLIST

- [ ] Step 1: Create backups
- [ ] Step 2: Set up Neon database
- [ ] Step 3: Export data from Supabase
- [ ] Step 4: Prepare database schema
- [ ] Step 5: Import data to Neon
- [ ] Step 6: Configure Amazon SES
- [ ] Step 7: Install dependencies
- [ ] Step 8: Configure NextAuth
- [ ] Step 9: Update existing code
- [ ] Step 10: Test authentication
- [ ] Step 11: Deploy changes

---

## STEP 1: Create Backups

### 1.1 Backup Supabase Database

```bash
# Using Supabase CLI
npx supabase db dump -f backup_$(date +%Y%m%d).sql

# Or use pg_dump directly
pg_dump -h db.xxxxx.supabase.co \
  -U postgres \
  -d postgres \
  --no-owner \
  --no-acl \
  -f supabase_backup_$(date +%Y%m%d).sql
```

### 1.2 Backup Critical Files

```bash
# Create backups directory
mkdir -p backups/pre-migration

# Backup auth-related files
cp -r src/lib/db backups/pre-migration/
cp -r src/middleware.ts backups/pre-migration/
cp -r src/app/api/auth backups/pre-migration/

# List all files using Supabase
grep -r "supabase" src --files-with-matches > backups/files-using-supabase.txt
```

---

## STEP 2: Set Up Neon Database

### 2.1 Create Neon Project

1. Go to https://console.neon.tech
2. Click "Create Project"
3. Choose region (closest to your users)
4. Name: `peso-job-application`
5. Click "Create Project"

### 2.2 Get Connection Strings

1. In Neon dashboard, go to "Connection Details"
2. Copy both connection strings:
   - **Pooled connection** (for DATABASE_URL)
   - **Direct connection** (for DIRECT_URL)
3. Save these for Step 7

### 2.3 Configure Database Settings

In Neon dashboard:
- **Max connections**: 100 (adjust based on needs)
- **Enable connection pooling**: Yes
- **Compute size**: Adjust based on usage

---

## STEP 3: Export Data from Supabase

### 3.1 Export Public Schema Data

```bash
# Export ONLY public schema data (not auth.users)
pg_dump -h db.xxxxx.supabase.co \
  -U postgres \
  -d postgres \
  --data-only \
  --schema=public \
  --no-owner \
  --no-acl \
  -f public_data_only.sql
```

### 3.2 Export auth.users Data

We need to extract user data to migrate to NextAuth:

```sql
-- Run this in Supabase SQL Editor
COPY (
  SELECT 
    id,
    email,
    email_confirmed_at as email_verified,
    created_at,
    updated_at
  FROM auth.users
  ORDER BY created_at
) TO STDOUT WITH CSV HEADER;
```

Save output as `auth_users_export.csv`

### 3.3 Export Foreign Key Mappings

```sql
-- Get applicants with auth mappings
COPY (
  SELECT 
    id as applicant_id,
    auth_id,
    name,
    created_at
  FROM public.applicants
  WHERE auth_id IS NOT NULL
  ORDER BY id
) TO STDOUT WITH CSV HEADER;

-- Get peso (admins) with auth mappings  
COPY (
  SELECT 
    id as peso_id,
    auth_id,
    name,
    is_superadmin,
    created_at
  FROM public.peso
  WHERE auth_id IS NOT NULL
  ORDER BY id
) TO STDOUT WITH CSV HEADER;
```

Save as `applicants_auth_mapping.csv` and `peso_auth_mapping.csv`

---

## STEP 4: Prepare Database Schema

### 4.1 Add Email Columns (Required)

Since NextAuth requires email in user tables, we need to add email columns:

```sql
-- Add email to applicants table
ALTER TABLE public.applicants 
ADD COLUMN IF NOT EXISTS email TEXT UNIQUE;

-- Add email to peso table
ALTER TABLE public.peso 
ADD COLUMN IF NOT EXISTS email TEXT UNIQUE;
```

### 4.2 Create Migration Script

Create `migrations/add_email_columns.sql`:

```sql
-- Add email columns for NextAuth compatibility
BEGIN;

-- Add email to applicants
ALTER TABLE public.applicants 
ADD COLUMN IF NOT EXISTS email TEXT;

-- Add email to peso (admins)
ALTER TABLE public.peso 
ADD COLUMN IF NOT EXISTS email TEXT;

-- Create unique indexes (after data is populated)
-- CREATE UNIQUE INDEX IF NOT EXISTS applicants_email_key ON applicants(email);
-- CREATE UNIQUE INDEX IF NOT EXISTS peso_email_key ON peso(email);

COMMIT;
```

---

## STEP 5: Import Data to Neon

### 5.1 Run Prisma Migration

```bash
# Generate Prisma client
npx prisma generate

# Create initial migration (creates NextAuth tables + existing tables)
npx prisma db push

# Or use migrations
npx prisma migrate dev --name init
```

This creates:
- NextAuth tables: `users`, `accounts`, `sessions`, `verification_tokens`
- All existing tables from Prisma schema

### 5.2 Import Public Schema Data

```bash
# Connect to Neon and import data
psql "postgresql://user:pass@ep-xxx.region.aws.neon.tech:5432/peso_db?sslmode=require" \
  -f public_data_only.sql
```

### 5.3 Populate Email Columns

Run this script in Neon SQL Editor:

```sql
-- Populate applicant emails from auth.users export
-- (You'll need to create a temp table and load CSV first)

BEGIN;

-- Update applicants.email from your export
-- This assumes you have auth mapping data
UPDATE public.applicants a
SET email = (
  SELECT email 
  FROM auth_users_temp au 
  WHERE au.id = a.auth_id
)
WHERE a.auth_id IS NOT NULL;

-- Update peso.email from your export
UPDATE public.peso p
SET email = (
  SELECT email 
  FROM auth_users_temp au 
  WHERE au.id = p.auth_id
)
WHERE p.auth_id IS NOT NULL;

COMMIT;
```

### 5.4 Migrate Users to NextAuth

Create a migration script `scripts/migrate-users.ts`:

```typescript
// scripts/migrate-users.ts
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import { parse } from 'csv-parse/sync';

const prisma = new PrismaClient();

async function migrateUsers() {
  // Read exported auth users
  const authUsers = parse(fs.readFileSync('auth_users_export.csv'), {
    columns: true,
    skip_empty_lines: true
  });

  console.log(`Migrating ${authUsers.length} users...`);

  for (const user of authUsers) {
    try {
      // Create user in NextAuth users table
      await prisma.user.create({
        data: {
          id: user.id,
          email: user.email,
          emailVerified: user.email_verified ? new Date(user.email_verified) : null,
          createdAt: new Date(user.created_at),
          updatedAt: new Date(user.updated_at),
        },
      });

      console.log(`✅ Migrated user: ${user.email}`);
    } catch (error) {
      console.error(`❌ Failed to migrate user ${user.email}:`, error);
    }
  }

  console.log('Migration complete!');
}

migrateUsers()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

Run the script:

```bash
npx ts-node scripts/migrate-users.ts
```

### 5.5 Create Unique Indexes

After data is populated:

```sql
-- Create unique indexes for email columns
CREATE UNIQUE INDEX IF NOT EXISTS applicants_email_key 
ON public.applicants(email) 
WHERE email IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS peso_email_key 
ON public.peso(email) 
WHERE email IS NOT NULL;
```

---

## STEP 6: Configure Amazon SES

### 6.1 Verify Domain or Email

1. Go to AWS Console → Amazon SES
2. Click "Verified identities"
3. Click "Create identity"
4. Choose "Domain" (recommended) or "Email address"
5. Follow verification process:
   - For domain: Add DNS records
   - For email: Click verification link

### 6.2 Move Out of Sandbox Mode

By default, SES is in sandbox mode (can only send to verified emails):

1. Go to "Account dashboard" in SES
2. Click "Request production access"
3. Fill out the form:
   - **Use case**: Transactional emails
   - **Website URL**: Your production URL
   - **Description**: Email authentication for job portal
4. Submit and wait for approval (usually 24 hours)

### 6.3 Create SMTP Credentials

1. Go to "SMTP settings" in SES
2. Click "Create SMTP credentials"
3. Enter IAM user name: `peso-ses-smtp`
4. Click "Create"
5. **IMPORTANT**: Download credentials (shown only once)
6. Save to password manager

### 6.4 Create IAM User for SDK (Alternative)

If using AWS SDK instead of SMTP:

1. Go to IAM → Users
2. Create user: `peso-ses-sdk`
3. Attach policy: `AmazonSESFullAccess`
4. Create access key
5. Save credentials

---

## STEP 7: Install Dependencies

```bash
# Remove Supabase
npm uninstall @supabase/supabase-js @supabase/auth-helpers-nextjs

# Install NextAuth + Prisma
npm install next-auth@latest @prisma/client@latest
npm install -D prisma@latest

# Install email dependencies
npm install nodemailer @aws-sdk/client-ses
npm install -D @types/nodemailer

# Install additional utilities
npm install csv-parse  # For data migration scripts
```

---

## STEP 8: Configure Environment Variables

Create `.env.local`:

```env
# NextAuth
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
NEXTAUTH_URL="http://localhost:3000"

# Neon Database
DATABASE_URL="postgresql://user:pass@ep-xxx.region.aws.neon.tech:5432/peso_db?sslmode=require"
DIRECT_URL="postgresql://user:pass@ep-xxx.region.aws.neon.tech:5432/peso_db?sslmode=require"

# Amazon SES
AWS_REGION="us-east-1"
AWS_ACCESS_KEY_ID="your-key"
AWS_SECRET_ACCESS_KEY="your-secret"
SMTP_HOST="email-smtp.us-east-1.amazonaws.com"
SMTP_PORT="587"
SMTP_USER="smtp-username"
SMTP_PASSWORD="smtp-password"
EMAIL_FROM="noreply@yourdomain.com"
```

Generate NextAuth secret:

```bash
openssl rand -base64 32
```

---

## STEP 9: Update Existing Code

### 9.1 Replace Supabase Client Imports

Find all files using Supabase:

```bash
grep -r "from '@supabase" src --files-with-matches
```

Replace with Prisma:

```typescript
// Before (Supabase)
import { createClient } from '@supabase/supabase-js'
const supabase = createClient(url, key)

// After (Prisma)
import { prisma } from '@/lib/db/prisma-client'
```

### 9.2 Update Auth Checks

Replace Supabase auth with NextAuth:

```typescript
// Before (Supabase)
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
const supabase = createServerComponentClient({ cookies })
const { data: { user } } = await supabase.auth.getUser()

// After (NextAuth - Server Components)
import { getSession } from '@/lib/auth/server-auth'
const session = await getSession()
const user = session?.user
```

```typescript
// Before (Supabase - Client Components)
import { useUser } from '@supabase/auth-helpers-react'
const { user } = useUser()

// After (NextAuth - Client Components)
import { useSession } from 'next-auth/react'
const { data: session } = useSession()
const user = session?.user
```

### 9.3 Update Middleware

Update `src/middleware.ts`:

```typescript
// Before (Supabase)
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'

export async function middleware(req: NextRequest) {
  const supabase = createMiddlewareClient({ req, res })
  const { data: { session } } = await supabase.auth.getSession()
  // ...
}

// After (NextAuth)
import { withAuth } from "next-auth/middleware"

export default withAuth(
  function middleware(req) {
    // Your middleware logic
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token
    },
  }
)

export const config = {
  matcher: ["/admin/:path*", "/profile/:path*"]
}
```

### 9.4 Update Root Layout

Add NextAuth SessionProvider:

```typescript
// src/app/layout.tsx
import { SessionProvider } from "next-auth/react"

export default function RootLayout({ children }: { children: React.Node }) {
  return (
    <html>
      <body>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  )
}
```

### 9.5 Replace Auth API Routes

Delete Supabase auth routes and use NextAuth routes:

- ✅ Login: `/api/auth/signin`
- ✅ Logout: `/api/auth/signout`
- ✅ Session: `/api/auth/session`

### 9.6 Update Database Queries

Replace Supabase queries with Prisma:

```typescript
// Before (Supabase)
const { data, error } = await supabase
  .from('applicants')
  .select('*')
  .eq('id', userId)
  .single()

// After (Prisma)
const applicant = await prisma.applicant.findUnique({
  where: { id: userId }
})
```

---

## STEP 10: Test Authentication

### 10.1 Create Test Users

```bash
# Start development server
npm run dev
```

1. Go to `http://localhost:3000/api/auth/signin`
2. Enter test email
3. Check email for magic link
4. Click link to sign in

### 10.2 Test Both User Types

**Test Applicant Login:**
1. Use email from `applicants` table
2. Should redirect to user dashboard
3. Check `session.user.role === "applicant"`

**Test Admin Login:**
1. Use email from `peso` table
2. Should redirect to admin dashboard
3. Check `session.user.role === "admin"`

### 10.3 Verify Database Records

Check that sessions are created:

```sql
SELECT * FROM sessions ORDER BY expires DESC LIMIT 10;
SELECT * FROM users ORDER BY created_at DESC LIMIT 10;
SELECT * FROM verification_tokens ORDER BY expires DESC LIMIT 10;
```

---

## STEP 11: Deploy Changes

### 11.1 Pre-deployment Checklist

- [ ] All Supabase references removed
- [ ] Environment variables set in production
- [ ] Database migrations run on Neon
- [ ] SES out of sandbox mode
- [ ] SES domain/email verified
- [ ] Test authentication works locally
- [ ] All tests pass

### 11.2 Deploy to Production

```bash
# Build production
npm run build

# Check for errors
npm run lint

# Deploy (adjust for your platform)
# Vercel
vercel --prod

# Or other platforms
# Push to main branch for CI/CD
```

### 11.3 Run Production Migrations

```bash
# Set DATABASE_URL to production Neon
export DATABASE_URL="your-production-neon-url"

# Run migrations
npx prisma migrate deploy

# Verify
npx prisma db pull
```

### 11.4 Configure Production Environment

Set environment variables in your hosting platform:

**Vercel:**
```bash
vercel env add NEXTAUTH_SECRET production
vercel env add DATABASE_URL production
# ... etc
```

**Other platforms:** Use dashboard or CLI to set variables

---

## 🚨 TROUBLESHOOTING

### Issue: "Invalid database URL"

**Solution:** Ensure connection string has `?sslmode=require`:
```
postgresql://user:pass@host:5432/db?sslmode=require
```

### Issue: "Email not sent"

**Solution:** 
1. Check SES sandbox mode
2. Verify sender email in SES
3. Check AWS credentials
4. Check CloudWatch logs

### Issue: "Cannot find module '@prisma/client'"

**Solution:**
```bash
npx prisma generate
npm install
```

### Issue: "JWT signing error"

**Solution:** Ensure NEXTAUTH_SECRET is set and matches between environments

### Issue: "User role is 'pending'"

**Solution:** User exists in `users` table but not in `applicants` or `peso`. Check data migration.

---

## 📊 POST-MIGRATION VALIDATION

Run these queries to validate migration:

```sql
-- Check all users migrated
SELECT COUNT(*) FROM users;

-- Check applicants have emails
SELECT COUNT(*) FROM applicants WHERE email IS NOT NULL;

-- Check peso admins have emails
SELECT COUNT(*) FROM peso WHERE email IS NOT NULL;

-- Check orphaned records
SELECT COUNT(*) FROM applicants WHERE auth_id NOT IN (SELECT id FROM users);
SELECT COUNT(*) FROM peso WHERE auth_id NOT IN (SELECT id FROM users);

-- Check NextAuth tables
SELECT COUNT(*) FROM accounts;
SELECT COUNT(*) FROM sessions;
SELECT COUNT(*) FROM verification_tokens;
```

---

## 🔄 ROLLBACK PLAN

If migration fails:

1. **Restore database:**
```bash
psql $DATABASE_URL -f supabase_backup_YYYYMMDD.sql
```

2. **Restore code:**
```bash
git checkout backups/pre-migration
npm install
```

3. **Restore environment:**
```bash
cp .env.backup .env.local
```

4. **Restart services:**
```bash
npm run dev
```

---

## ✅ MIGRATION COMPLETE

Congratulations! Your PESO application is now running on:
- ✅ NextAuth for authentication
- ✅ Neon PostgreSQL for database
- ✅ Amazon SES for emails
- ✅ Prisma as ORM

**Next steps:**
1. Monitor error logs for 24-48 hours
2. Test all critical user flows
3. Update documentation
4. Train team on new auth system

---

## 📞 SUPPORT

If you encounter issues:
1. Check troubleshooting section above
2. Review NextAuth docs: https://next-auth.js.org
3. Review Prisma docs: https://www.prisma.io/docs
4. Check Neon docs: https://neon.tech/docs
5. Check AWS SES docs: https://docs.aws.amazon.com/ses
