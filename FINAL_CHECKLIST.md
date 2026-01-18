# ✅ FINAL PRE-FLIGHT CHECKLIST - Admin Invitation Flow

## Overview
This checklist ensures the admin invitation flow is 100% functional before deployment.

---

## ✅ VERIFIED COMPONENTS

### 1. Invite API Route (`/src/app/api/admin/invite/route.ts`)

**What it does:**
- ✅ Checks if user is super admin
- ✅ Validates email and name inputs
- ✅ Uses `inviteUserByEmail()` ONLY (creates user + sends email in one call)
- ✅ Creates peso record with `is_first_login = true`
- ✅ Creates audit trail in `admin_invitation_tokens`
- ✅ Returns success message

**Critical fix applied:**
- ✅ FIXED: Now uses ONLY `inviteUserByEmail()` - no duplicate user creation
- ✅ FIXED: Invitation happens FIRST, then peso record created
- ✅ FIXED: No more "user already exists" error

**Rollback logic:**
- ✅ If peso record fails, deletes auth user

---

### 2. Change Password API (`/src/app/api/admin/change-password/route.ts`)

**What it does:**
- ✅ Validates password strength (8+ chars, uppercase, lowercase, number, special)
- ✅ On first login: No current password required
- ✅ On first login: Sets `is_first_login = false` after password change
- ✅ On regular change: Requires current password

**Status:** ✅ No changes needed - already perfect

---

### 3. Auth Callback (`/src/app/auth/callback/route.ts`)

**What it does:**
- ✅ Exchanges code for session
- ✅ Checks if user exists in peso table
- ✅ Redirects admins to `/admin` (or `/admin/manage-admin` for super admins)
- ✅ Redirects applicants to `/job-opportunities`

**Status:** ✅ No changes needed - already perfect

---

### 4. Admin Layout (`/src/app/admin/layout.tsx`)

**What it does:**
- ✅ Checks `is_first_login` flag on mount
- ✅ Shows modal if `is_first_login = true`
- ✅ Passes `isFirstLogin={true}` to modal

**Status:** ✅ No changes needed - already perfect

---

### 5. Admin Profile Modal (`/src/app/admin/components/AdminProfileModal.tsx`)

**What it does:**
- ✅ Shows "Complete Your Profile" title when first login
- ✅ NO close button (X) when first login
- ✅ Prevents closing by clicking outside when first login
- ✅ Tracks `hasSetPassword` and `hasUploadedPicture` states
- ✅ Only closes when BOTH requirements met
- ✅ Shows completion status (✅/❌)
- ✅ Auto-switches tabs after completing one requirement
- ✅ Reloads page after completion

**Status:** ✅ No changes needed - already perfect

---

## 🔄 THE COMPLETE FLOW

### Step 1: Super Admin Sends Invitation
```
1. Super admin logs in
2. Goes to /admin/manage-admin
3. Clicks "Add Admin"
4. Enters:
   - Name: "New Admin"
   - Email: "admin@example.com"
   - Super Admin: No/Yes
5. Clicks "Send Invitation"
```

**What happens in backend:**
```
1. Validate super admin permissions ✅
2. Validate inputs ✅
3. Call inviteUserByEmail() ✅
   → Creates auth user (no password)
   → Sends magic link email
4. Create peso record ✅
   → is_first_login = TRUE
5. Create invitation token ✅
   → For audit trail
6. Return success ✅
```

---

### Step 2: Admin Receives Email
```
1. Admin checks email inbox
2. Sees "You've been invited to join..." (Supabase default template)
3. Clicks "Accept Invitation" or magic link
```

**What happens in backend:**
```
1. Supabase validates magic link ✅
2. Creates authenticated session ✅
3. Redirects to /auth/callback?next=/admin ✅
4. Callback checks peso table ✅
5. Redirects to /admin ✅
```

---

### Step 3: Modal Appears
```
1. /admin page loads
2. Layout checks is_first_login
3. is_first_login = TRUE → Modal shows
4. Modal is UNCLOSEABLE
```

**Modal behavior:**
- ✅ No X button
- ✅ Clicking outside shows alert
- ✅ Must complete BOTH requirements
- ✅ Can do in any order (password first OR picture first)

---

### Step 4: Admin Sets Password
```
1. Go to "Password" tab
2. Enter new password (strong requirements enforced)
3. Confirm password
4. Click "Change Password"
```

**What happens in backend:**
```
1. Validate password strength ✅
2. Update password via Supabase ✅
3. Set is_first_login = FALSE ✅
4. Return success ✅
```

**Modal behavior:**
- ✅ If picture already uploaded → Close modal, reload page
- ✅ If picture NOT uploaded → Show alert, switch to Profile tab

---

### Step 5: Admin Uploads Picture
```
1. Go to "Profile" tab
2. Upload image (drag & drop or click)
3. See circular preview
4. Upload to Supabase Storage
```

**Modal behavior:**
- ✅ If password already set → Close modal, reload page
- ✅ If password NOT set → Show alert, switch to Password tab

---

### Step 6: Setup Complete
```
1. Modal closes automatically
2. Page reloads
3. is_first_login = FALSE
4. Modal never appears again
5. Admin can use the system ✅
```

---

## 🗄️ DATABASE VERIFICATION

### Key Tables

**1. auth.users (Supabase managed)**
```sql
-- Check if user exists
SELECT id, email, email_confirmed_at
FROM auth.users
WHERE email = 'test@example.com';

-- Should exist after invitation sent
```

**2. peso**
```sql
-- Check peso record
SELECT id, auth_id, name, is_superadmin, is_first_login, profile_picture_url
FROM peso
WHERE auth_id = (SELECT id FROM auth.users WHERE email = 'test@example.com');

-- Should show:
-- is_first_login = TRUE (before setup)
-- is_first_login = FALSE (after setup)
-- profile_picture_url = URL (after upload)
```

**3. admin_invitation_tokens**
```sql
-- Check invitation token
SELECT email, admin_name, is_superadmin, used, created_at, used_at
FROM admin_invitation_tokens
WHERE email = 'test@example.com'
ORDER BY created_at DESC LIMIT 1;

-- Should show:
-- used = TRUE (immediately after sending)
-- Just for audit trail
```

---

## ⚠️ CRITICAL POINTS

### 1. Email Storage
- ❌ Email is NOT in peso table
- ✅ Email is in auth.users table
- ✅ Must JOIN to get email

```sql
-- ✅ CORRECT
SELECT p.*, u.email
FROM peso p
JOIN auth.users u ON p.auth_id = u.id
WHERE u.email = 'admin@example.com';

-- ❌ WRONG (won't work)
SELECT * FROM peso WHERE email = 'admin@example.com';
```

### 2. User Creation
- ✅ Uses ONLY `inviteUserByEmail()` 
- ❌ Does NOT use `createUser()` separately
- ✅ One call creates user + sends email

### 3. Modal Control
- ✅ Controlled by `is_first_login` field
- ✅ TRUE = Modal appears (uncloseable)
- ✅ FALSE = Modal doesn't appear

### 4. Password Setting
- ✅ First login: No current password required
- ✅ `isFirstLogin` flag sent to API
- ✅ Sets `is_first_login = false` after success

---

## 🧪 TESTING STEPS

### Test 1: Send Invitation
```
1. Login as super admin
2. Go to /admin/manage-admin
3. Click "Add Admin"
4. Enter test email
5. Click "Send Invitation"
✅ Should see: "Invitation sent successfully"
```

### Test 2: Check Database
```sql
-- Auth user created
SELECT id FROM auth.users WHERE email = 'test@example.com';

-- Peso record created
SELECT is_first_login FROM peso 
WHERE auth_id = (SELECT id FROM auth.users WHERE email = 'test@example.com');

-- Should return: is_first_login = true
```

### Test 3: Check Email
```
1. Open test email inbox
2. Should see: "You've been invited to join..."
3. Click the magic link
✅ Should redirect to /admin
✅ Modal should appear immediately
```

### Test 4: Test Modal Uncloseable
```
1. Try clicking X button → No X button ✅
2. Try clicking outside modal → Shows alert ✅
3. Try pressing Escape → Still open ✅
```

### Test 5: Set Password Only
```
1. Go to "Password" tab
2. Enter strong password
3. Confirm password
4. Click "Change Password"
✅ Should see: "Password set successfully! Please upload a profile picture..."
✅ Should auto-switch to Profile tab
✅ Modal should NOT close yet
```

### Test 6: Upload Picture
```
1. Upload image
2. See preview
✅ Should see: "Setup complete! Your account is now ready."
✅ Modal should close
✅ Page should reload
✅ Modal should NOT appear again
```

### Test 7: Verify is_first_login
```sql
SELECT is_first_login FROM peso 
WHERE auth_id = (SELECT id FROM auth.users WHERE email = 'test@example.com');

-- Should return: is_first_login = false
```

### Test 8: Test Subsequent Login
```
1. Sign out
2. Go to /admin/login
3. Login with email + password
✅ Should login successfully
✅ Modal should NOT appear
✅ Can use system normally
```

---

## 🔧 TROUBLESHOOTING

### Modal doesn't appear
```sql
-- Check flag
SELECT p.is_first_login, u.email
FROM peso p
JOIN auth.users u ON p.auth_id = u.id
WHERE u.email = 'test@example.com';

-- If FALSE, set to TRUE for testing
UPDATE peso SET is_first_login = true
WHERE auth_id = (SELECT id FROM auth.users WHERE email = 'test@example.com');
```

### Email not received
1. Check spam folder
2. Supabase Dashboard → Authentication → Logs → Look for "invite" events
3. Resend via Dashboard → Users → "..." → "Send magic link"

### "User already exists" error
- ✅ FIXED: This should NOT happen anymore
- ✅ Now uses only `inviteUserByEmail()` - no duplicate creation

### Can close modal before completing
- Check `/admin/layout.tsx` passes `isFirstLogin={true}`
- Check modal receives the prop correctly

---

## 📋 ENVIRONMENT VARIABLES

Required in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Critical:** `SUPABASE_SERVICE_ROLE_KEY` must be set!

---

## ✅ FINAL VERIFICATION

Before marking complete, verify:

- [ ] Super admin can send invitation
- [ ] Email is received
- [ ] Magic link works
- [ ] Admin lands on /admin
- [ ] Modal appears and is uncloseable
- [ ] Can set password without current password
- [ ] Can upload profile picture
- [ ] Modal closes only after BOTH complete
- [ ] `is_first_login` becomes FALSE
- [ ] Modal doesn't appear on subsequent login
- [ ] No errors in console
- [ ] No database errors

---

## 🎯 STATUS

**Implementation:** ✅ COMPLETE

**Key Fix Applied:** ✅ Removed duplicate user creation

**Testing:** Ready for testing

**Deployment:** Ready after successful test

---

## 📖 DOCUMENTATION

- `SIMPLE_ADMIN_INVITE_GUIDE.md` - Simple testing guide
- `DONE_SIMPLE_IMPLEMENTATION.md` - Implementation summary
- `ADMIN_INVITATION_DATABASE_SCHEMA.md` - Database reference

---

**READY TO TEST!** 🚀