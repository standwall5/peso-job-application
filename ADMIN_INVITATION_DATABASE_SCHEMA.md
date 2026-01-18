# Admin Invitation - Database Schema Reference

## Overview

This document describes the database tables and relationships used in the admin invitation flow.

---

## Tables Involved

### 1. `auth.users` (Supabase Auth Table)

**Purpose**: Stores authentication credentials and user identity

**Managed by**: Supabase Auth (automatic)

**Key fields for admin invitation**:
```sql
id UUID PRIMARY KEY
email TEXT UNIQUE NOT NULL
email_confirmed_at TIMESTAMPTZ
encrypted_password TEXT
user_metadata JSONB
created_at TIMESTAMPTZ
last_sign_in_at TIMESTAMPTZ
```

**User metadata for admins**:
```json
{
  "name": "Juan Dela Cruz",
  "is_superadmin": false,
  "role": "peso_admin"
}
```

**Notes**:
- Email is stored HERE, not in peso table
- Password is hashed and stored HERE
- Created via `auth.admin.createUser()` during invitation
- Initially created WITHOUT password (password set during first login)

---

### 2. `public.peso` (Admin Profile Table)

**Purpose**: Stores admin-specific profile information and permissions

**Schema**:
```sql
CREATE TABLE public.peso (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  auth_id UUID REFERENCES auth.users(id),
  name TEXT,
  is_superadmin BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'active' 
    CHECK (status IN ('active', 'suspended', 'deactivated')),
  last_login TIMESTAMPTZ,
  account_locked BOOLEAN DEFAULT false,
  failed_login_attempts INTEGER DEFAULT 0,
  locked_until TIMESTAMPTZ,
  is_archived BOOLEAN DEFAULT false,
  archived_at TIMESTAMPTZ,
  profile_picture_url TEXT,
  is_first_login BOOLEAN DEFAULT true
);
```

**Key fields for admin invitation**:

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `id` | BIGINT | Auto-increment | Primary key |
| `auth_id` | UUID | NULL | Links to auth.users.id |
| `name` | TEXT | NULL | Admin's full name (immutable) |
| `is_superadmin` | BOOLEAN | false | Super admin permission flag |
| `status` | TEXT | 'active' | Account status |
| `is_first_login` | BOOLEAN | **true** | Triggers first login modal |
| `profile_picture_url` | TEXT | NULL | URL to profile picture in storage |

**Important Notes**:
- ✅ **Email is NOT stored here** - it's in `auth.users`
- ✅ `is_first_login = true` triggers the uncloseable modal
- ✅ After password + picture set, `is_first_login = false`
- ✅ Name is immutable (used for ID watermarks)

**Relationship**:
```sql
peso.auth_id → auth.users.id (Many-to-One)
```

**To get admin email**:
```sql
SELECT p.*, u.email
FROM peso p
JOIN auth.users u ON p.auth_id = u.id
WHERE p.id = 123;
```

---

### 3. `public.admin_invitation_tokens` (Invitation Audit Trail)

**Purpose**: Track invitation history and audit trail

**Schema**:
```sql
CREATE TABLE public.admin_invitation_tokens (
  id BIGINT PRIMARY KEY DEFAULT nextval('admin_invitation_tokens_id_seq'),
  email TEXT NOT NULL UNIQUE,
  admin_name TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  is_superadmin BOOLEAN DEFAULT false,
  created_by BIGINT REFERENCES public.peso(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN DEFAULT false,
  used_at TIMESTAMPTZ
);
```

**Field descriptions**:

| Field | Type | Description |
|-------|------|-------------|
| `id` | BIGINT | Primary key |
| `email` | TEXT | Email of invited admin |
| `admin_name` | TEXT | Name of invited admin |
| `token` | TEXT | Unique 32-char invitation token |
| `is_superadmin` | BOOLEAN | Role of invited admin |
| `created_by` | BIGINT | ID of super admin who sent invite |
| `created_at` | TIMESTAMPTZ | When invitation was created |
| `expires_at` | TIMESTAMPTZ | Token expiration (48 hours) |
| `used` | BOOLEAN | Whether invitation was used |
| `used_at` | TIMESTAMPTZ | When invitation was used |

**Lifecycle**:
```
1. Super admin sends invite
   → Token created, used = false
   
2. Email sent successfully
   → used = true, used_at = now()
   (Token marked as used immediately)
   
3. Token is for audit trail only
   (Not used for authentication - Supabase magic link handles that)
```

**Important Notes**:
- ✅ Token is marked `used = true` IMMEDIATELY after email sent
- ✅ Token is NOT used for authentication
- ✅ Supabase magic link handles authentication
- ✅ This table is for audit trail and tracking only

**Relationship**:
```sql
admin_invitation_tokens.created_by → peso.id (Many-to-One)
```

**Example query - Who invited whom**:
```sql
SELECT 
  inviter.name AS invited_by,
  ait.admin_name AS invited_admin,
  ait.email AS invited_email,
  ait.is_superadmin AS is_super,
  ait.created_at AS invited_on,
  ait.used AS completed
FROM admin_invitation_tokens ait
JOIN peso inviter ON ait.created_by = inviter.id
ORDER BY ait.created_at DESC;
```

---

## Data Flow During Invitation

### Step 1: Super Admin Sends Invitation

**API**: `POST /api/admin/invite`

**Database operations**:
```sql
-- 1. Create auth user (no password)
INSERT INTO auth.users (email, email_confirmed_at, user_metadata)
VALUES (
  'newadmin@example.com',
  now(),
  '{"name": "New Admin", "is_superadmin": false, "role": "peso_admin"}'::jsonb
)
RETURNING id;
-- Returns: auth_id = '550e8400-e29b-41d4-a716-446655440000'

-- 2. Create peso record
INSERT INTO public.peso (auth_id, name, is_superadmin, status, is_first_login)
VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  'New Admin',
  false,
  'active',
  true  -- ← Triggers modal on first login
)
RETURNING id;
-- Returns: peso_id = 42

-- 3. Create invitation token
INSERT INTO public.admin_invitation_tokens 
  (email, admin_name, token, is_superadmin, created_by, expires_at, used, used_at)
VALUES (
  'newadmin@example.com',
  'New Admin',
  'abc123xyz...',  -- 32-char random token
  false,
  1,  -- ID of super admin who sent invite
  now() + interval '48 hours',
  true,  -- Marked as used immediately
  now()
);
```

**Result**:
- ✅ Auth user exists (can authenticate)
- ✅ Peso record exists (is_first_login = true)
- ✅ Invitation tracked in database
- ✅ Magic link email sent

---

### Step 2: Admin Clicks Magic Link

**What happens**:
1. Supabase validates magic link
2. Creates authenticated session
3. Redirects to `/auth/callback`
4. Callback checks if user is in `peso` table
5. Redirects to `/admin`

**No database writes** - just session creation

---

### Step 3: First Login Modal Appears

**Database check**:
```sql
-- Admin layout checks this
SELECT is_first_login 
FROM peso 
WHERE auth_id = '550e8400-e29b-41d4-a716-446655440000';
-- Returns: true

-- If true, show modal
```

---

### Step 4: Admin Sets Password

**API**: `POST /api/admin/change-password`

**Database operations**:
```sql
-- 1. Update password in auth.users (via Supabase API)
-- (Handled by Supabase - password is hashed)

-- 2. Set is_first_login to false
UPDATE public.peso
SET is_first_login = false
WHERE auth_id = '550e8400-e29b-41d4-a716-446655440000';
```

**Result**:
- ✅ Admin now has a password
- ✅ `is_first_login = false`
- ✅ Modal will not appear on next login

---

### Step 5: Admin Uploads Profile Picture

**Database operation**:
```sql
-- Update profile picture URL
UPDATE public.peso
SET profile_picture_url = 'https://supabase.co/storage/.../profile.jpg'
WHERE auth_id = '550e8400-e29b-41d4-a716-446655440000';
```

**Storage**:
- File stored in Supabase Storage bucket: `admin-profiles`
- Path: `{auth_id}.{extension}`
- Public URL returned and saved to database

---

## Common Queries

### Get admin with email
```sql
SELECT 
  p.id,
  p.name,
  u.email,
  p.is_superadmin,
  p.is_first_login,
  p.profile_picture_url,
  p.status
FROM peso p
JOIN auth.users u ON p.auth_id = u.id
WHERE u.email = 'admin@example.com';
```

### Check if admin needs to complete first login
```sql
SELECT 
  p.name,
  u.email,
  p.is_first_login,
  CASE 
    WHEN p.profile_picture_url IS NULL THEN 'Missing profile picture'
    ELSE 'Has profile picture'
  END AS picture_status
FROM peso p
JOIN auth.users u ON p.auth_id = u.id
WHERE p.is_first_login = true;
```

### Get all pending invitations (not used)
```sql
-- NOTE: In new flow, invitations are marked as used immediately
-- This query will return empty results in normal operation
SELECT 
  email,
  admin_name,
  is_superadmin,
  created_at,
  expires_at
FROM admin_invitation_tokens
WHERE used = false
  AND expires_at > now()
ORDER BY created_at DESC;
```

### Audit trail - Who invited whom
```sql
SELECT 
  inviter.name AS invited_by,
  ait.admin_name AS invited_admin,
  ait.email AS invited_email,
  ait.is_superadmin AS granted_super_admin,
  ait.created_at AS invited_on,
  ait.used_at AS email_sent_at,
  invitee.is_first_login AS setup_pending
FROM admin_invitation_tokens ait
JOIN peso inviter ON ait.created_by = inviter.id
LEFT JOIN auth.users u ON u.email = ait.email
LEFT JOIN peso invitee ON invitee.auth_id = u.id
ORDER BY ait.created_at DESC;
```

### Find admins who haven't completed setup
```sql
SELECT 
  p.name,
  u.email,
  p.created_at AS account_created,
  age(now(), p.created_at) AS pending_duration,
  CASE 
    WHEN p.profile_picture_url IS NULL THEN 'Missing picture'
    ELSE 'Has picture'
  END AS picture_status
FROM peso p
JOIN auth.users u ON p.auth_id = u.id
WHERE p.is_first_login = true
ORDER BY p.created_at DESC;
```

### Reset admin to first login (for testing)
```sql
-- Force admin to see first login modal again
UPDATE peso
SET is_first_login = true
WHERE auth_id = (
  SELECT id FROM auth.users WHERE email = 'test@example.com'
);
```

---

## Indexes (Recommended)

```sql
-- Speed up email lookups
CREATE INDEX idx_peso_auth_id ON peso(auth_id);

-- Speed up first login checks
CREATE INDEX idx_peso_first_login ON peso(is_first_login) 
WHERE is_first_login = true;

-- Speed up invitation lookups
CREATE INDEX idx_invitation_email ON admin_invitation_tokens(email);
CREATE INDEX idx_invitation_created_by ON admin_invitation_tokens(created_by);
```

---

## Constraints Summary

### Foreign Keys
```sql
peso.auth_id → auth.users.id
admin_invitation_tokens.created_by → peso.id
```

### Unique Constraints
```sql
auth.users.email (UNIQUE)
admin_invitation_tokens.email (UNIQUE)
admin_invitation_tokens.token (UNIQUE)
```

### Check Constraints
```sql
peso.status IN ('active', 'suspended', 'deactivated')
```

---

## Important Notes

### ⚠️ Email Storage
- **Email is ONLY in `auth.users` table**
- **Email is NOT in `peso` table**
- Always JOIN with `auth.users` to get email

### ⚠️ Password Storage
- **Password is ONLY in `auth.users` table**
- **Password is hashed by Supabase**
- Never stored in plaintext anywhere

### ⚠️ First Login Flag
- **Critical field**: `peso.is_first_login`
- Default: `true`
- Set to `false` after password set
- Triggers uncloseable modal when `true`

### ⚠️ Invitation Tokens
- **Marked as used immediately** after email sent
- **NOT used for authentication** (Supabase magic link handles that)
- **Purpose**: Audit trail and tracking only

---

## Migration Notes

If migrating from old token-based system:

### Old System
- Created invitation token first
- Sent custom email with `/admin/setup-password?token=xxx`
- Admin submitted form to create account
- Token validated during account creation

### New System
- Creates account immediately
- Sends Supabase magic link
- Admin auto-authenticated
- Token is for audit trail only

### Migration Steps
1. No schema changes needed (tables already exist)
2. Update API routes to new flow
3. Existing `admin_invitation_tokens` can remain
4. New invitations will follow new flow

---

## Troubleshooting Queries

### Admin can't see modal
```sql
-- Check is_first_login flag
SELECT p.name, u.email, p.is_first_login
FROM peso p
JOIN auth.users u ON p.auth_id = u.id
WHERE u.email = 'problem-admin@example.com';

-- If false, set to true
UPDATE peso SET is_first_login = true
WHERE auth_id = (SELECT id FROM auth.users WHERE email = 'problem-admin@example.com');
```

### Admin created but can't login
```sql
-- Check if auth user exists
SELECT id, email, email_confirmed_at, encrypted_password
FROM auth.users
WHERE email = 'problem-admin@example.com';

-- Check if peso record exists
SELECT p.*, u.email
FROM peso p
JOIN auth.users u ON p.auth_id = u.id
WHERE u.email = 'problem-admin@example.com';

-- Check for orphaned records
-- Auth user exists but no peso record:
SELECT u.id, u.email
FROM auth.users u
LEFT JOIN peso p ON p.auth_id = u.id
WHERE u.email LIKE '%@example.com'
  AND p.id IS NULL;
```

### Check invitation history
```sql
-- All invitations for an email
SELECT *
FROM admin_invitation_tokens
WHERE email = 'admin@example.com'
ORDER BY created_at DESC;
```

---

## Summary

**Key Tables**:
1. `auth.users` - Authentication (email, password)
2. `peso` - Admin profile (name, permissions, `is_first_login`)
3. `admin_invitation_tokens` - Audit trail

**Key Field**: `peso.is_first_login`
- `true` → Modal appears (uncloseable)
- `false` → Modal doesn't appear

**Email Location**: `auth.users.email` (NOT in peso table)

**Token Purpose**: Audit trail only (NOT for authentication)