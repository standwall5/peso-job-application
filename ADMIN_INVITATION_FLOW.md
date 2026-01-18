# Admin Invitation Flow - Magic Link with First Login Modal

## Overview

The PESO admin invitation system uses a **magic link + first login modal** flow. When a super administrator invites a new admin, the system:

1. **Creates the admin account** (auth user + peso record)
2. **Sends a magic link email** via Supabase
3. **Admin clicks link** → Authenticated and redirected to `/admin`
4. **Uncloseable modal appears** → Admin must set password and upload profile picture
5. **Setup complete** → Admin can access the system

---

## Complete Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        SUPER ADMIN SIDE                          │
└─────────────────────────────────────────────────────────────────┘

Super Admin navigates to:
  • /admin/create-admin (standalone page), OR
  • /admin/manage-admin → Click "Add Admin" (modal)

                          ↓

Super Admin enters:
  • Full Name (required, immutable)
  • Email Address (required)
  • Is Super Admin? (checkbox)

                          ↓

Click "Send Invitation"

                          ↓

API: POST /api/admin/invite
  ├─ Validates super admin permissions
  ├─ Validates email format
  ├─ Checks if email already exists
  ├─ Generates secure 32-char token (for tracking)
  ├─ Stores token in admin_invitation_tokens table
  │
  ├─ Creates auth user (WITHOUT password) ✅
  │    • email
  │    • email_confirm = true
  │    • user_metadata: { name, is_superadmin, role: "peso_admin" }
  │
  ├─ Creates peso table record ✅
  │    • auth_id
  │    • name
  │    • email
  │    • is_superadmin
  │    • status = "active"
  │    • is_first_login = TRUE  ← Key field!
  │
  ├─ Sends magic link email via Supabase
  │    auth.admin.inviteUserByEmail(email, {
  │      redirectTo: "/auth/callback?next=/admin"
  │    })
  │
  └─ Marks invitation token as used

Success! Admin account created and invitation sent.

┌─────────────────────────────────────────────────────────────────┐
│                         NEW ADMIN SIDE                           │
└─────────────────────────────────────────────────────────────────┘

New Admin receives email
  Subject: "You've been invited to join..."

                          ↓

Clicks "Accept Invitation" button in email

                          ↓

Supabase authenticates user via magic link

                          ↓

Redirects to: /auth/callback?next=/admin

                          ↓

Auth Callback Handler:
  GET /auth/callback/route.ts
  ├─ Exchanges code for session
  ├─ Gets authenticated user
  ├─ Checks if user exists in peso table
  │    • Found → Admin user
  │    • Not found → Regular applicant
  │
  └─ Redirects to /admin (or /admin/manage-admin if super admin)

                          ↓

Admin Layout Loads:
  /admin/layout.tsx
  ├─ Fetches admin profile
  ├─ Checks is_first_login flag
  │
  └─ If is_first_login === true:
       → Show AdminProfileModal (UNCLOSEABLE)

                          ↓

┌─────────────────────────────────────────────────────────────────┐
│                  FIRST LOGIN MODAL (Uncloseable)                 │
└─────────────────────────────────────────────────────────────────┘

Modal displays:
  • Title: "Complete Your Profile"
  • Warning: "Both password and profile picture are required"
  • Two tabs: Profile | Password
  • NO close button (X)

                          ↓

Admin can complete in ANY order:

Option A: Profile Picture First
  ├─ Go to "Profile" tab
  ├─ Click upload / drag & drop image
  ├─ Preview shows (circular, 150x150px)
  ├─ Upload succeeds
  ├─ Check: Is password also set?
  │    • Yes → Modal closes, page reloads
  │    • No → Switch to "Password" tab

Option B: Password First
  ├─ Go to "Password" tab
  ├─ Enter new password (no current password needed!)
  ├─ Confirm password
  ├─ Client validates:
  │    • Min 8 characters
  │    • 1 uppercase letter
  │    • 1 lowercase letter
  │    • 1 number
  │    • 1 special character
  ├─ Submit form
  │
  ├─ API: POST /api/admin/change-password
  │    {
  │      "newPassword": "SecureP@ss123",
  │      "isFirstLogin": true  ← No current password required
  │    }
  │
  ├─ Server updates password
  ├─ Server sets is_first_login = false
  ├─ Check: Is profile picture also uploaded?
  │    • Yes → Modal closes, page reloads
  │    • No → Switch to "Profile" tab

                          ↓

Both requirements met:
  ✅ Password set
  ✅ Profile picture uploaded

                          ↓

Modal shows: "Setup complete! Your account is now ready."

                          ↓

Modal closes → Page reloads

                          ↓

Admin Layout re-checks:
  • is_first_login = false
  • Modal does NOT appear
  • Admin can now use the system! ✅

                          ↓

Regular admin access granted
```

---

## Key Features

### 1. Uncloseable Modal on First Login

**Implementation**:
- Modal has no close button (X) when `isFirstLogin={true}`
- Clicking outside the modal shows alert: "Please set your password and upload a profile picture to continue."
- User MUST complete both requirements to proceed

**Benefits**:
- Ensures all admins have profile pictures
- Forces secure password setup
- No incomplete admin accounts
- Clear guided experience

### 2. Flexible Completion Order

Admins can complete setup in any order:
- Profile picture → Password
- Password → Profile picture
- Partial completion is allowed (saved independently)

**Smart Detection**:
```typescript
// Modal tracks both requirements
const [hasUploadedPicture, setHasUploadedPicture] = useState(false);
const [hasSetPassword, setHasSetPassword] = useState(false);

// Only closes when BOTH are complete
if (hasUploadedPicture && hasSetPassword) {
  // Close modal, reload page
  window.location.reload();
}
```

### 3. No Password Required During Invitation

**Super admin only needs**:
- Admin's full name
- Admin's email address
- Admin's role (regular or super admin)

**Admin sets their own password**:
- More secure (no password transmission)
- Better user experience
- Follows security best practices

### 4. Magic Link Authentication

**Supabase handles**:
- Email delivery
- Secure token generation
- One-time use links
- Automatic authentication

**Email template** (Supabase default):
- Professional appearance
- Clear call-to-action
- Mobile-friendly
- Automatic expiration (default: 24 hours)

---

## Database Schema

### admin_invitation_tokens

```sql
CREATE TABLE public.admin_invitation_tokens (
  id bigint PRIMARY KEY,
  email text NOT NULL UNIQUE,
  admin_name text NOT NULL,
  token text NOT NULL UNIQUE,
  is_superadmin boolean DEFAULT false,
  created_by bigint REFERENCES public.peso(id),
  created_at timestamp with time zone DEFAULT now(),
  expires_at timestamp with time zone NOT NULL,
  used boolean DEFAULT false,
  used_at timestamp with time zone
);
```

**Purpose**: Tracks invitation history (audit trail)

**Note**: The token is marked as `used = true` after email is sent. It's not used for authentication (Supabase magic link handles that).

### peso (admin table)

**Key columns for invitation flow**:
```sql
- auth_id (uuid) → Links to Supabase auth.users (email stored there)
- name (text) → Set during invitation
- is_superadmin (boolean) → Set during invitation
- is_first_login (boolean DEFAULT true) → TRUE until password/picture set
- profile_picture_url (text) → Set during first login modal
- status (text) → Set to 'active' during invitation
```

**Note**: Email is NOT stored in peso table - it's stored in `auth.users` table and linked via `auth_id`.

**is_first_login lifecycle**:
```
Created by super admin → is_first_login = TRUE
Admin lands on /admin → Modal appears
Admin sets password   → is_first_login = FALSE (via API)
Page reloads          → Modal does NOT appear
```

---

## API Endpoints

### POST `/api/admin/invite`

**Purpose**: Create admin account and send magic link invitation

**Auth**: Super Admin only

**Request**:
```json
{
  "email": "newadmin@peso.gov.ph",
  "name": "Juan Dela Cruz",
  "is_superadmin": false
}
```

**What it does**:
1. Validates permissions and input
2. Creates auth user (no password)
3. Creates peso record (`is_first_login = true`)
4. Sends magic link via `auth.admin.inviteUserByEmail()`
5. Marks invitation token as used

**Success Response**:
```json
{
  "success": true,
  "message": "Invitation email sent successfully. The new admin will set their password on first login.",
  "email": "newadmin@peso.gov.ph",
  "name": "Juan Dela Cruz",
  "is_superadmin": false,
  "emailSent": true,
  "instructions": "The admin will receive an email with a magic link..."
}
```

**Error Responses**:
- `401`: Not authenticated
- `403`: Not a super admin
- `400`: Invalid email, email already exists
- `500`: Server error, SUPABASE_SERVICE_ROLE_KEY not configured

---

### POST `/api/admin/change-password`

**Purpose**: Set or change admin password

**Auth**: Authenticated admin

**Request (First Login)**:
```json
{
  "newPassword": "SecureP@ss123",
  "isFirstLogin": true
}
```

**Request (Regular Password Change)**:
```json
{
  "currentPassword": "OldP@ss123",
  "newPassword": "NewP@ss123",
  "isFirstLogin": false
}
```

**What it does**:
1. Validates password strength (5 requirements)
2. If NOT first login: Verifies current password
3. Updates password via Supabase Auth
4. If first login: Sets `is_first_login = false`

**Success Response**:
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

**Password Requirements**:
- ✅ At least 8 characters
- ✅ At least one uppercase letter (A-Z)
- ✅ At least one lowercase letter (a-z)
- ✅ At least one number (0-9)
- ✅ At least one special character (!@#$%^&*, etc.)

---

## Files Modified/Created

### Backend (API Routes)

**`/src/app/api/admin/invite/route.ts`**
- Creates auth user without password
- Creates peso record with `is_first_login = true`
- Sends magic link via Supabase
- Tracks invitation in database

**`/src/app/api/admin/change-password/route.ts`**
- Already existed (no changes needed)
- Handles first login (no current password required)
- Sets `is_first_login = false` after password set

**`/src/app/auth/callback/route.ts`**
- Handles OAuth callback
- Checks if user is admin (peso table)
- Redirects to `/admin` or `/job-opportunities`

### Frontend (Components)

**`/src/app/admin/layout.tsx`**
- Already existed (no changes needed)
- Checks `is_first_login` flag
- Shows `AdminProfileModal` if first login

**`/src/app/admin/components/AdminProfileModal.tsx`**
- Updated to track both requirements
- Makes modal uncloseable on first login
- Shows completion status
- Only closes when both password and picture are set

**`/src/app/admin/components/AdminProfileModal.module.css`**
- Added styles for required note
- Added styles for completion status

---

## Environment Variables

Required in `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Critical**: `SUPABASE_SERVICE_ROLE_KEY` is required to:
- Create auth users via admin API
- Send invitation emails
- Check if emails already exist

---

## Testing Guide

### Test 1: Super Admin Sends Invitation

1. Log in as super admin
2. Navigate to `/admin/create-admin` or `/admin/manage-admin`
3. Click "Add Admin" (if using modal)
4. Enter:
   - Name: "Test Admin"
   - Email: "testadmin@example.com"
   - Check "Super Administrator": No
5. Click "Send Invitation"
6. **Expected**:
   - ✅ Success message appears
   - ✅ Email sent to testadmin@example.com
   - ✅ Check database:
     ```sql
     -- Auth user created
     SELECT * FROM auth.users WHERE email = 'testadmin@example.com';
     
     -- Peso record created (join with auth.users for email)
     SELECT p.*, u.email 
     FROM peso p 
     JOIN auth.users u ON p.auth_id = u.id
     WHERE u.email = 'testadmin@example.com';
     -- Should show: is_first_login = TRUE
     
     -- Invitation tracked
     SELECT * FROM admin_invitation_tokens 
     WHERE email = 'testadmin@example.com'
     ORDER BY created_at DESC LIMIT 1;
     -- Should show: used = TRUE
     ```

### Test 2: New Admin Receives and Clicks Link

1. Check email inbox for testadmin@example.com
2. **Expected email**:
   - Subject: "You've been invited to join..."
   - Body: Supabase default magic link template
   - Button: "Accept Invitation" or similar
3. Click the magic link
4. **Expected**:
   - ✅ Browser redirects to your app
   - ✅ URL: `/auth/callback?...` then `/admin`
   - ✅ User is authenticated
   - ✅ Modal appears immediately

### Test 3: First Login Modal (Uncloseable)

1. After clicking magic link, modal should appear
2. **Expected modal state**:
   - ✅ Title: "Complete Your Profile"
   - ✅ Warning: "Both password and profile picture are required"
   - ✅ NO close button (X)
   - ✅ Two tabs: Profile | Password
   - ✅ Status indicators:
     - "✓ Profile Picture: ❌ Required"
     - "✓ Password: ❌ Required"
3. Try clicking outside modal
4. **Expected**:
   - ✅ Alert: "Please set your password and upload a profile picture to continue."
   - ✅ Modal stays open

### Test 4: Upload Profile Picture First

1. Stay on "Profile" tab
2. Upload an image (drag & drop or click)
3. **Expected**:
   - ✅ Circular preview appears
   - ✅ Alert: "Profile picture uploaded! Please set your password to complete setup."
   - ✅ Auto-switches to "Password" tab
   - ✅ Status updates:
     - "✓ Profile Picture: ✅ Uploaded"
     - "✓ Password: ❌ Required"

### Test 5: Set Password

1. On "Password" tab
2. Enter:
   - New Password: "SecureP@ss123"
   - Confirm Password: "SecureP@ss123"
3. Click "Change Password"
4. **Expected**:
   - ✅ Password validation passes
   - ✅ Alert: "Setup complete! Your account is now ready."
   - ✅ Modal closes
   - ✅ Page reloads
   - ✅ Modal does NOT appear again
   - ✅ Check database:
     ```sql
     SELECT p.is_first_login, u.email
     FROM peso p
     JOIN auth.users u ON p.auth_id = u.id
     WHERE u.email = 'testadmin@example.com';
     -- Should show: is_first_login = FALSE
     ```

### Test 6: Set Password First (Alternative Order)

1. Click magic link (fresh invitation)
2. Go to "Password" tab first
3. Set password
4. **Expected**:
   - ✅ Alert: "Password set successfully! Please upload a profile picture to complete setup."
   - ✅ Auto-switches to "Profile" tab
   - ✅ Status shows password ✅, picture ❌
5. Upload profile picture
6. **Expected**:
   - ✅ Alert: "Setup complete! Your account is now ready."
   - ✅ Modal closes, page reloads

### Test 7: Weak Password Validation

1. On "Password" tab
2. Try weak passwords:
   - "password" → ❌ No uppercase, no number, no special
   - "Password" → ❌ No number, no special
   - "Password1" → ❌ No special character
   - "Pass1!" → ❌ Too short (< 8 chars)
3. **Expected**:
   - ✅ Error message shows specific requirements missing
   - ✅ Form does not submit
4. Enter strong password: "SecureP@ss123"
5. **Expected**:
   - ✅ Form submits successfully

### Test 8: Subsequent Logins

1. Sign out the admin
2. Go to `/admin/login`
3. Log in with:
   - Email: testadmin@example.com
   - Password: SecureP@ss123
4. **Expected**:
   - ✅ Login succeeds
   - ✅ Redirects to `/admin`
   - ✅ Modal does NOT appear
   - ✅ Admin can use the system normally

---

## Troubleshooting

### Modal Doesn't Appear After Clicking Magic Link

**Possible causes**:
1. `is_first_login` not set to `true`
2. Admin layout not loading
3. JavaScript error preventing modal

**Debug**:
```sql
-- Check the flag (join with auth.users for email)
SELECT p.name, u.email, p.is_first_login 
FROM peso p
JOIN auth.users u ON p.auth_id = u.id
WHERE u.email = 'your-email@example.com';
```

**Fix:**
```sql
-- Manually set to true to test
UPDATE peso 
SET is_first_login = true 
WHERE auth_id = (
  SELECT id FROM auth.users WHERE email = 'your-email@example.com'
);
```

Then reload `/admin` page.

---

### Invitation Email Not Received

**Possible causes**:
1. Supabase email service not configured
2. Email in spam folder
3. Wrong email address

**Debug**:
1. Check server logs for email errors
2. Check Supabase Dashboard → Authentication → Logs
3. Look for "invite" events

**Workaround**:
1. Use Supabase Dashboard
2. Go to Authentication → Users
3. Find the user
4. Click "..." → "Send magic link"
5. User will receive email

---

### Password Change Fails on First Login

**Error**: "Current password is incorrect"

**Cause**: Modal is sending `currentPassword` even though it's first login

**Fix**: Ensure modal sends `isFirstLogin: true`:
```typescript
body: JSON.stringify({
  newPassword,
  isFirstLogin: true  // ← Must be true
})
```

---

### Admin Can Close Modal Before Completing Setup

**Cause**: `isFirstLogin` prop not being passed correctly

**Fix**: Verify in `/admin/layout.tsx`:
```typescript
<AdminProfileModal
  isOpen={showFirstLoginModal}
  onClose={() => setShowFirstLoginModal(false)}
  isFirstLogin={true}  // ← Must be true
/>
```

---

### Profile Picture Upload Succeeds But URL Not Saved

**Cause**: Database update failed silently

**Debug**:
```sql
SELECT p.profile_picture_url, u.email
FROM peso p
JOIN auth.users u ON p.auth_id = u.id
WHERE u.email = 'your-email@example.com';
```

**Fix**: Check `ProfilePictureUpload` component updates peso table after upload.

---

## Security Considerations

### 1. Magic Link Expiration

**Default**: Supabase magic links expire in 24 hours

**To change**:
- Supabase Dashboard
- Authentication → Email Templates
- Adjust "Magic Link" template settings

### 2. Password Strength

**Enforced at two levels**:
1. Client-side (React form validation)
2. Server-side (API validation)

**Cannot be bypassed**: API rejects weak passwords even if client validation is disabled.

### 3. First Login Flag

**Critical for security**:
- Ensures no admin can access system without setting password
- Cannot be bypassed by direct URL access
- Modal is uncloseable until requirements met

### 4. Profile Picture Requirement

**Why it's required**:
- Admins need profile pictures for ID watermarks
- Ensures complete admin profiles
- Better user experience (personalization)

### 5. Email Confirmation

**Auto-confirmed**: 
- Magic link authentication confirms email ownership
- No separate verification step needed
- Email is validated by successful link click

---

## Benefits of This Approach

### ✅ Better Security
- Admin sets their own password (not transmitted to super admin)
- Strong password enforcement
- Magic link is one-time use
- Email ownership verified automatically

### ✅ Better UX
- Clear guided process (modal with tabs)
- Flexible completion order
- Real-time validation feedback
- Can't skip required steps

### ✅ Simpler for Super Admins
- Only need name and email
- No password creation burden
- Immediate feedback (success/failure)
- Audit trail (invitation tokens table)

### ✅ Complete Admin Profiles
- All admins have passwords
- All admins have profile pictures
- No incomplete accounts
- Consistent data quality

### ✅ Reliable Email Delivery
- Uses Supabase's built-in email service
- Professional default templates
- Automatic retry logic
- Delivery tracking in Supabase dashboard

---

## Comparison to Previous Approach

### Old Approach (Token-based setup page)

```
Super admin sends invite
  → Custom email with setup link
  → Admin clicks link
  → Lands on /admin/setup-password page
  → Fills form (password + profile picture)
  → Submits form
  → Auth user created
  → Peso record created
  → Redirects to login
```

**Problems**:
- ❌ Custom email service needed (Resend, SendGrid)
- ❌ Separate setup page required
- ❌ Admin not authenticated until form submission
- ❌ More complex token validation
- ❌ Extra redirect (setup → login → admin)

### New Approach (Magic link + modal)

```
Super admin sends invite
  → Supabase magic link email
  → Admin clicks link
  → Auto-authenticated
  → Redirects to /admin
  → Modal appears (uncloseable)
  → Sets password + uploads picture
  → Modal closes, page reloads
```

**Benefits**:
- ✅ No custom email service needed
- ✅ Uses existing modal component
- ✅ Admin authenticated immediately
- ✅ Simpler token management (Supabase handles it)
- ✅ Fewer redirects, faster onboarding

---

## Future Enhancements

### Optional Improvements

1. **Email Customization**
   - Custom Supabase email template
   - Add PESO branding
   - Include admin name and role in email

2. **Password Strength Indicator**
   - Visual progress bar
   - Color-coded strength (weak/medium/strong)
   - Real-time feedback as user types

3. **Profile Picture Cropping**
   - Allow admin to crop uploaded image
   - Ensure proper aspect ratio
   - Preview before upload

4. **Welcome Tour**
   - After setup completes, show quick tour
   - Highlight key features
   - "Skip" option available

5. **Invitation Reminders**
   - Email reminder if admin hasn't completed setup
   - Send after 24 hours
   - Include new magic link

---

## Summary

The admin invitation flow now uses:

1. **Magic link authentication** (via Supabase)
2. **Immediate account creation** (on invitation)
3. **First login modal** (uncloseable, requires password + picture)
4. **Flexible completion order** (password first OR picture first)
5. **Auto-reload after completion** (modal won't appear again)

**Result**: Fast, secure, user-friendly admin onboarding with complete profiles guaranteed.

For additional help, check server logs or Supabase Dashboard → Authentication → Logs.