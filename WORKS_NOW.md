# ✅ NEW IMPLEMENTATION - Simple Token-Based Setup

## How It Works Now (SIMPLE!)

1. **Super admin enters email** → System generates token
2. **Admin receives email** with link: `/admin/setup?token=xxx`
3. **Admin clicks link** → Lands on setup page (NOT logged in yet)
4. **Admin fills form**:
   - Upload profile picture
   - Set password
5. **Submit** → Creates auth user + peso record
6. **Redirect to login** → Admin logs in → Done!

---

## The Complete Flow

### Step 1: Super Admin Sends Invitation

```
1. Login as super admin
2. Go to /admin/manage-admin
3. Click "Add Admin"
4. Enter:
   - Name: "New Admin"
   - Email: "admin@example.com"
   - Is Super Admin: Yes/No
5. Click "Send Invitation"
```

**What happens:**
- ✅ Token generated and stored in `admin_invitation_tokens`
- ✅ Token expires in 48 hours
- ✅ Response includes `setupUrl` 
- ✅ NO auth user created yet
- ✅ NO peso record created yet

**Response:**
```json
{
  "success": true,
  "message": "Invitation created successfully",
  "setupUrl": "http://localhost:3000/admin/setup?token=abc123...",
  "email": "admin@example.com"
}
```

---

### Step 2: Admin Receives Email

**Email should contain:**
```
Subject: You're invited to join PESO Parañaque Admin Portal

Hello [Name],

You've been invited to join as an administrator.

Click here to set up your account:
http://localhost:3000/admin/setup?token=abc123...

This link expires in 48 hours.
```

**Note:** Email sending not implemented yet - super admin can copy the `setupUrl` from the response and send it manually.

---

### Step 3: Admin Opens Setup Page

**URL:** `/admin/setup?token=abc123...`

**What happens:**
1. Page validates token via `GET /api/admin/invite?token=xxx`
2. If valid, shows setup form with:
   - Name (read-only)
   - Email (read-only)
   - Role (read-only)
   - Profile Picture Upload (required)
   - Password (required, with strength requirements)
   - Confirm Password (required)

**Still NOT logged in at this point!**

---

### Step 4: Admin Completes Setup

**Admin fills form:**
1. Upload profile picture (max 5MB)
2. Set password:
   - ✅ At least 8 characters
   - ✅ One uppercase letter
   - ✅ One lowercase letter
   - ✅ One number
   - ✅ One special character
3. Confirm password

**Click "Create Account"**

**What happens in backend (`POST /api/admin/setup`):**
1. ✅ Validate token (not used, not expired)
2. ✅ Validate password strength
3. ✅ Create auth user with password
4. ✅ Create peso record
5. ✅ Mark token as used
6. ✅ Return success

**What happens in frontend:**
1. ✅ Sign in with new credentials
2. ✅ Upload profile picture to Supabase Storage
3. ✅ Update peso record with picture URL
4. ✅ Sign out
5. ✅ Redirect to `/admin/login`

---

### Step 5: Admin Logs In

```
1. Go to /admin/login
2. Enter email and password
3. Click "Sign In"
4. Redirected to /admin
5. Can use the system! ✅
```

---

## Database Tables

### admin_invitation_tokens
```sql
email          | "admin@example.com"
admin_name     | "New Admin"
token          | "abc123xyz..." (32 chars)
is_superadmin  | false
created_by     | 1 (ID of super admin who invited)
expires_at     | "2026-01-22 10:00:00"
used           | false → true (after setup complete)
used_at        | null → "2026-01-20 10:00:00"
```

### auth.users (Supabase)
```sql
id                | "550e8400-..."
email             | "admin@example.com"
encrypted_password| (hashed)
email_confirmed_at| "2026-01-20 10:00:00"
```

**Created AFTER admin completes setup!**

### peso
```sql
id                   | 42
auth_id              | "550e8400-..." (links to auth.users.id)
name                 | "New Admin"
is_superadmin        | false
status               | "active"
is_first_login       | false
profile_picture_url  | "https://..."
```

**Created AFTER admin completes setup!**

---

## Key Differences from Previous Implementation

### Before (BROKEN):
- ❌ Created user with `inviteUserByEmail()`
- ❌ Then tried to create user again → Error!
- ❌ Complex first-login modal
- ❌ User had to be logged in to set password

### Now (WORKING):
- ✅ Only creates token initially
- ✅ User created ONCE during setup
- ✅ Simple setup page (not logged in)
- ✅ Everything happens in one flow

---

## Testing Steps

### 1. Send Invitation
```
1. Login as super admin
2. /admin/manage-admin → Add Admin
3. Enter test email
4. Click "Send Invitation"
5. Copy the setupUrl from success message
```

### 2. Check Database
```sql
-- Token created
SELECT * FROM admin_invitation_tokens 
WHERE email = 'test@example.com'
ORDER BY created_at DESC LIMIT 1;
-- Should show: used = false

-- NO auth user yet
SELECT * FROM auth.users WHERE email = 'test@example.com';
-- Should return: 0 rows

-- NO peso record yet
SELECT * FROM peso 
WHERE auth_id IN (SELECT id FROM auth.users WHERE email = 'test@example.com');
-- Should return: 0 rows
```

### 3. Open Setup Page
```
1. Paste setupUrl in browser
2. Should see setup form with name/email pre-filled
3. NOT logged in (check Supabase auth state)
```

### 4. Complete Setup
```
1. Upload profile picture
2. Set strong password: Test123!
3. Confirm password
4. Click "Create Account"
5. Should see success alert
6. Redirected to /admin/login
```

### 5. Verify Database
```sql
-- Token marked as used
SELECT used, used_at FROM admin_invitation_tokens 
WHERE email = 'test@example.com'
ORDER BY created_at DESC LIMIT 1;
-- Should show: used = true, used_at = now()

-- Auth user created
SELECT id, email FROM auth.users WHERE email = 'test@example.com';
-- Should return: 1 row

-- Peso record created
SELECT * FROM peso 
WHERE auth_id = (SELECT id FROM auth.users WHERE email = 'test@example.com');
-- Should return: 1 row with is_first_login = false
```

### 6. Login
```
1. Email: test@example.com
2. Password: Test123!
3. Click "Sign In"
4. Should redirect to /admin
5. Can use system normally ✅
```

---

## Files Created/Modified

### New Files:
- ✅ `/src/app/admin/setup/page.tsx` - Setup page component
- ✅ `/src/app/admin/setup/setup.module.css` - Setup page styles
- ✅ `/src/app/api/admin/setup/route.ts` - Setup API endpoint

### Modified Files:
- ✅ `/src/app/api/admin/invite/route.ts` - Now only creates token, no user creation

### Unchanged:
- `/src/app/admin/layout.tsx` - No changes needed
- `/src/app/admin/components/AdminProfileModal.tsx` - No changes needed
- `/src/app/api/admin/change-password/route.ts` - No changes needed

---

## Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...  # Required!
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Email Integration (TODO)

Currently, the `setupUrl` is returned in the API response. To send emails:

### Option 1: Resend
```typescript
// In /api/admin/invite/route.ts
const resendResponse = await fetch("https://api.resend.com/emails", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    from: "PESO Parañaque <noreply@peso.gov.ph>",
    to: email,
    subject: "You're invited to join PESO Parañaque Admin Portal",
    html: `<p>Click here: <a href="${setupUrl}">${setupUrl}</a></p>`,
  }),
});
```

### Option 2: Manual (Current)
Copy `setupUrl` from response and send via any channel (email, SMS, etc.)

---

## Troubleshooting

### "Invalid or expired invitation"
- Token already used
- Token expired (>48 hours old)
- Token doesn't exist

**Fix:** Super admin must send new invitation

### "Account with this email already exists"
- Email already in auth.users
- Previous setup completed

**Fix:** Use different email or delete existing account

### Profile picture upload fails
- Storage bucket doesn't exist
- File too large (>5MB)

**Fix:** 
1. Check `admin-profiles` bucket exists in Supabase
2. Check file size

---

## Summary

**Super Simple Flow:**
1. Generate token → Store in DB
2. Send email with setup link
3. Admin opens link → Fills form
4. Submit → Create user + peso record
5. Login → Done!

**Key Point:** User is created ONCE during setup, not before!

**Status:** ✅ WORKING