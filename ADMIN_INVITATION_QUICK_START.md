# Admin Invitation - Quick Start Guide

## TL;DR

Super admin invites → Email sent → Admin clicks link → Modal appears → Admin sets password & uploads picture → Done! ✅

---

## For Super Admins

### How to Invite a New Admin

1. **Navigate to**:
   - `/admin/create-admin` (standalone page), OR
   - `/admin/manage-admin` → Click "Add Admin" (modal)

2. **Enter**:
   - Admin's full name
   - Admin's email address
   - Check "Super Administrator" (if needed)

3. **Click "Send Invitation"**

4. **Done!** 
   - Admin account created immediately
   - Invitation email sent via Supabase
   - Admin will set their own password on first login

**Note**: You do NOT set a password for them. They set it themselves.

---

## For New Admins

### How to Complete Your Setup

1. **Check your email** for invitation from PESO Parañaque

2. **Click the "Accept Invitation" button** in the email

3. **You'll be redirected to `/admin`** and automatically signed in

4. **A modal will appear (YOU CANNOT CLOSE IT)** with two requirements:
   - ✅ Upload a profile picture
   - ✅ Set a secure password

5. **Complete both** (in any order):
   
   **Option A: Profile Picture First**
   - Go to "Profile" tab
   - Upload/drag image
   - Auto-switches to "Password" tab
   
   **Option B: Password First**
   - Go to "Password" tab
   - Enter new password (min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special)
   - Confirm password
   - Click "Change Password"
   - Auto-switches to "Profile" tab

6. **After both are complete**:
   - Modal shows: "Setup complete! Your account is now ready."
   - Modal closes automatically
   - Page reloads
   - You can now use the system!

---

## Password Requirements

Your password must have:
- ✅ At least 8 characters
- ✅ At least 1 uppercase letter (A-Z)
- ✅ At least 1 lowercase letter (a-z)
- ✅ At least 1 number (0-9)
- ✅ At least 1 special character (!@#$%^&*, etc.)

**Example**: `SecureP@ss123` ✅

---

## Technical Flow

```
Super Admin
    ↓
Send Invitation
    ↓
✅ Auth user created (no password)
✅ Peso record created (is_first_login = TRUE)
✅ Magic link email sent
    ↓
New Admin
    ↓
Clicks magic link
    ↓
Auto-authenticated
    ↓
Redirects to /admin
    ↓
Modal appears (UNCLOSEABLE)
    ↓
Admin sets password + uploads picture
    ↓
is_first_login = FALSE
    ↓
Modal closes, page reloads
    ↓
Admin can use system ✅
```

---

## What Changed from Previous System

### Before
- Super admin created password
- Custom setup page (`/admin/setup-password`)
- Custom email service (Resend)
- Token-based validation
- Separate login step

### Now
- Admin creates their own password
- Modal on first login (built into `/admin` layout)
- Supabase magic link (built-in)
- Supabase authentication
- Auto-login via magic link

**Benefits**: Simpler, more secure, faster onboarding!

---

## Database Changes

### Key Field: `is_first_login`

**When created by super admin**:
```sql
is_first_login = TRUE
```

**After admin sets password**:
```sql
is_first_login = FALSE
```

**Why it matters**:
- Modal only appears when `is_first_login = TRUE`
- After completion, modal never appears again
- Ensures all admins complete setup

---

## API Endpoints Used

### POST `/api/admin/invite`
- Creates auth user (no password)
- Creates peso record (`is_first_login = true`)
- Sends magic link email
- Auth: Super Admin only

### POST `/api/admin/change-password`
- Sets admin password
- If first login: Sets `is_first_login = false`
- Auth: Authenticated admin

---

## Troubleshooting

### "Email not received"
1. Check spam/junk folder
2. Check Supabase Dashboard → Auth → Logs
3. Verify email address is correct
4. Resend via Supabase Dashboard → Users → Send magic link

### "Modal doesn't appear"
1. Check database:
   ```sql
   -- Email is stored in auth.users, not peso
   SELECT p.is_first_login, u.email
   FROM peso p
   JOIN auth.users u ON p.auth_id = u.id
   WHERE u.email = 'your@email.com';
   ```
2. If `FALSE`, manually set to `TRUE`:
   ```sql
   UPDATE peso SET is_first_login = true 
   WHERE auth_id = (
     SELECT id FROM auth.users WHERE email = 'your@email.com'
   );
   ```
3. Reload `/admin` page

### "Can close modal before completing setup"
- **This is a bug!** Modal should be uncloseable when `isFirstLogin={true}`
- Check: `/admin/layout.tsx` passes `isFirstLogin={true}` to modal
- Check: `AdminProfileModal.tsx` has uncloseable logic

### "Password change fails"
- Ensure password meets all 5 requirements
- If first login, `currentPassword` should NOT be required
- Check API receives `isFirstLogin: true` in request body

---

## Environment Variables Required

```env
# Supabase (required for magic link)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# App URL (for email redirects)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Critical**: `SUPABASE_SERVICE_ROLE_KEY` must be set!

---

## Quick Test

1. Log in as super admin
2. Go to `/admin/manage-admin`
3. Click "Add Admin"
4. Enter test email
5. Click "Send Invitation"
6. Check test email inbox
7. Click magic link
8. Verify modal appears and is uncloseable
9. Set password and upload picture
10. Verify modal closes after both complete

---

## Files Involved

**Backend**:
- `/src/app/api/admin/invite/route.ts` - Creates admin and sends email
- `/src/app/api/admin/change-password/route.ts` - Sets password
- `/src/app/auth/callback/route.ts` - Handles magic link redirect

**Frontend**:
- `/src/app/admin/layout.tsx` - Shows modal if `is_first_login = true`
- `/src/app/admin/components/AdminProfileModal.tsx` - The uncloseable modal
- `/src/app/admin/components/ProfilePictureUpload.tsx` - Picture upload

---

## Support

For more details, see: `ADMIN_INVITATION_FLOW.md`

For troubleshooting: Check server logs and Supabase Dashboard → Authentication → Logs