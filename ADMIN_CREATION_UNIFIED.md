# Admin Creation Flow - Unified Documentation

## Overview

The admin account creation system has been fully unified to use the **invitation-based flow** across all entry points. Super administrators no longer set passwords when creating admin accounts. Instead, they send invitation emails that allow new admins to set up their own accounts with profile pictures and secure passwords.

---

## Complete Workflow

### For Super Administrators

**Two Ways to Invite New Admins:**

1. **Via Standalone Page** (`/admin/create-admin`)
2. **Via Modal in Manage Admin** (Quick action)

Both methods now use identical flows:

```
Super Admin Actions:
├─ Enter Full Name (permanent, immutable)
├─ Enter Email Address
├─ Check "Super Administrator" (optional)
└─ Click "Send Invitation"
     │
     ├─ System generates secure 32-char token
     ├─ Token stored with 48-hour expiration
     ├─ Invitation email sent via Supabase Auth
     └─ Success message displayed
```

**No password required from super admin!**

### For New Admins

When a new admin receives the invitation email:

```
New Admin Receives Email
     │
     ├─ Click setup link: /admin/setup-password?token=xxxxx
     │
     ├─ System validates token (checks expiration & usage)
     │
     └─ Setup Account Page Loads
          │
          ├─ Display read-only info:
          │   • Name (from invitation)
          │   • Email (from invitation)
          │   • Role (Admin or Super Admin)
          │
          ├─ REQUIRED: Upload Profile Picture
          │   • Formats: JPG, PNG, GIF, etc.
          │   • Max size: 5MB
          │   • Shows circular 150x150px preview
          │   • Can remove and re-upload
          │
          ├─ REQUIRED: Set Password
          │   • Must meet ALL 5 requirements:
          │     ✓ At least 8 characters
          │     ✓ Uppercase letter (A-Z)
          │     ✓ Lowercase letter (a-z)
          │     ✓ Number (0-9)
          │     ✓ Special character
          │   • Real-time validation feedback
          │   • Visibility toggle buttons
          │
          ├─ REQUIRED: Confirm Password
          │   • Must match password exactly
          │   • Visibility toggle button
          │
          └─ Click "Create Account"
               │
               ├─ Server validates all requirements
               ├─ Creates auth user with password
               ├─ Creates peso table record
               ├─ Uploads profile picture to storage
               ├─ Marks invitation token as used
               ├─ Auto signs out
               └─ Redirects to login page
                    │
                    └─ New admin can now log in!
```

---

## Entry Points Comparison

### 1. Standalone Page (`/admin/create-admin`)

**Location**: Direct page navigation
**File**: `src/app/admin/create-admin/components/CreateAdmin.tsx`

**Features**:
- Full-page experience
- Detailed instructions with numbered steps
- Prominent info box explaining the process
- Shows admin name immutability warning
- Success screen with animation
- Auto-redirect to Manage Admins after 2 seconds

**Best For**: First-time invitations, training new super admins

### 2. Modal in Manage Admin

**Location**: Manage Admin page → "Add Admin" button
**File**: `src/app/admin/manage-admin/components/modals/AddAdminModal.tsx`

**Features**:
- Quick modal popup
- Compact form within current page
- Info box with bullet points
- Instant feedback without page navigation
- Stays on Manage Admin page after success

**Best For**: Experienced super admins, bulk invitations

---

## Unified Features

Both entry points now share:

✅ **No password fields** - Only name and email required
✅ **Identical validation** - Same rules for name (3+ chars) and email format
✅ **Same API endpoint** - `/api/admin/invite` (POST)
✅ **Same success flow** - Token generation, email sending, 48-hour expiration
✅ **Same messaging** - Consistent wording about invitation process
✅ **Same security** - Token-based, single-use, time-limited

---

## Password Requirements (Enforced During Setup)

All admin passwords must meet these requirements:

| Requirement | Rule | Example |
|-------------|------|---------|
| Length | Minimum 8 characters | `Password1!` ✓ |
| Uppercase | At least one A-Z | `password1!` ✗ |
| Lowercase | At least one a-z | `PASSWORD1!` ✗ |
| Number | At least one 0-9 | `Password!` ✗ |
| Special | At least one non-alphanumeric | `Password1` ✗ |

**Valid Example**: `SecureP@ss123`
**Invalid Examples**: `password`, `PASSWORD`, `Pass1`, `Password1`

---

## Profile Picture Requirements

- **Required**: Cannot proceed without uploading
- **Formats**: Any image type (JPG, PNG, GIF, WebP, etc.)
- **Size Limit**: 5MB maximum
- **Storage**: Uploaded to `admin-profiles` Supabase bucket
- **File Pattern**: `{auth_id}.{extension}`
- **Display**: Circular crop preview (150x150px)
- **Security**: RLS policies enforce admin-only access

---

## API Endpoints

### POST `/api/admin/invite`

**Purpose**: Send invitation to new admin
**Auth**: Super Admin only
**Request**:
```json
{
  "email": "newadmin@peso.gov.ph",
  "name": "Juan Dela Cruz",
  "is_superadmin": false
}
```
**Response**:
```json
{
  "success": true,
  "message": "Invitation sent successfully",
  "email": "newadmin@peso.gov.ph",
  "expiresAt": "2024-01-15T10:30:00.000Z"
}
```

### GET `/api/admin/invite?token={token}`

**Purpose**: Validate invitation token
**Auth**: None (public endpoint)
**Response**:
```json
{
  "valid": true,
  "email": "newadmin@peso.gov.ph",
  "name": "Juan Dela Cruz",
  "is_superadmin": false
}
```

### POST `/api/admin/setup-password`

**Purpose**: Complete admin account setup
**Auth**: Token-based (no session required)
**Request**:
```json
{
  "token": "abc123...",
  "password": "SecureP@ss123"
}
```
**Response**:
```json
{
  "success": true,
  "message": "Admin account created successfully",
  "email": "newadmin@peso.gov.ph"
}
```

---

## Security Features

### 1. Token Security
- 32-character random string
- Cryptographically secure generation
- Single-use only (marked as `used = true` after account creation)
- 48-hour expiration window
- Stored with creation timestamp and creator reference

### 2. Password Security
- Client-side validation prevents weak passwords
- Server-side validation ensures no bypassing
- All 5 requirements must be met
- Matches applicant sign-up requirements
- Hashed and stored securely via Supabase Auth

### 3. Profile Picture Security
- Uploaded to private storage bucket
- RLS policies restrict access to authenticated admins only
- File type and size validation (client + server)
- Stored with unique auth_id filename
- Cannot be accessed publicly

### 4. Immutable Admin Name
- Set during invitation creation
- Cannot be changed after account setup
- Ensures accountability for ID watermarks
- Preserved across all admin actions

### 5. Email Verification
- Email auto-confirmed during setup
- Uses Supabase Auth's built-in verification
- No manual confirmation step required

---

## Database Schema

### admin_invitation_tokens

```sql
CREATE TABLE admin_invitation_tokens (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  admin_name VARCHAR(255) NOT NULL,
  token VARCHAR(255) UNIQUE NOT NULL,
  is_superadmin BOOLEAN DEFAULT false,
  created_by INTEGER REFERENCES peso(id),
  used BOOLEAN DEFAULT false,
  used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### peso (admin table)

```sql
ALTER TABLE peso
ADD COLUMN IF NOT EXISTS profile_picture_url TEXT;
```

---

## Files Modified

### Admin Invitation Entry Points

1. **Standalone Page**:
   - `src/app/admin/create-admin/components/CreateAdmin.tsx` (already correct)
   - `src/app/admin/create-admin/page.tsx`

2. **Manage Admin Modal**:
   - `src/app/admin/manage-admin/components/modals/AddAdminModal.tsx` ✅ Updated
   - `src/app/admin/manage-admin/hooks/useAdminActions.ts` ✅ Updated
   - `src/app/admin/manage-admin/components/ManageAdmin.tsx` ✅ Updated

### Admin Setup Flow

3. **Setup Page**:
   - `src/app/admin/setup-password/page.tsx` ✅ Updated
   - `src/app/admin/setup-password/SetupPassword.module.css` ✅ Updated
   - `src/app/api/admin/setup-password/route.ts` ✅ Updated

### Password Consistency

4. **Reset Password**:
   - `src/app/(auth)/auth/reset-password/page.tsx` ✅ Updated

5. **Sign-Up Form**:
   - `src/app/(auth)/signup/components/sections/PersonalInfoSection.tsx` ✅ Updated

---

## Testing Checklist

### Standalone Page Testing
- [ ] Navigate to `/admin/create-admin`
- [ ] Verify no password fields present
- [ ] Submit with name and email only
- [ ] Verify invitation email sent
- [ ] Check success screen displays
- [ ] Confirm auto-redirect to Manage Admins

### Modal Testing
- [ ] Open Manage Admin page
- [ ] Click "Add Admin" button
- [ ] Verify modal titled "Invite New Admin"
- [ ] Verify no password fields in modal
- [ ] Check info box is visible
- [ ] Submit invitation
- [ ] Verify success message
- [ ] Confirm stays on Manage Admin page

### Complete Flow Testing
- [ ] Receive invitation email
- [ ] Click setup link
- [ ] Verify token validation works
- [ ] Attempt submit without profile picture → Error shown
- [ ] Upload profile picture
- [ ] Verify circular preview displays
- [ ] Enter weak password → Red X marks shown
- [ ] Enter strong password → Green checkmarks shown
- [ ] Confirm password matches
- [ ] Submit form
- [ ] Verify redirect to login
- [ ] Log in with new credentials
- [ ] Confirm profile picture appears

---

## Common Issues & Solutions

### "Password fields still showing in modal"

**Issue**: Cached component or incorrect file being used
**Solution**: 
1. Clear browser cache
2. Restart dev server
3. Check you're editing the correct modal file
4. Verify props have been removed from parent component

### "Invitation email not received"

**Issue**: Email service configuration or spam filters
**Solution**:
1. Check Supabase email settings
2. Verify SMTP configuration
3. Check spam/junk folders
4. Test with different email provider

### "Profile picture upload fails"

**Issue**: Storage bucket not configured or RLS policies missing
**Solution**:
1. Verify `admin-profiles` bucket exists
2. Run SQL setup script
3. Check all 5 RLS policies are active
4. Verify bucket is set to private

### "Token expired" error

**Issue**: Link used after 48 hours
**Solution**:
1. Super admin must send new invitation
2. Old token is invalid and cannot be reused
3. Check token expiration timestamp in database

---

## Migration Notes

### For Existing Deployments

If you already have the standalone `/admin/create-admin` page:
- ✅ No changes needed to that page (already correct)
- ✅ Only the Manage Admin modal needed updating
- ✅ Both now use the same invitation API
- ✅ No breaking changes to existing invitations

### For Existing Admins

- Existing admin accounts are not affected
- Old passwords continue to work
- Password requirements only apply to:
  - New admin setup
  - Password resets
  - Password changes
- Admins without profile pictures should upload one via profile settings

---

## Benefits of Unified Approach

✅ **Consistency**: Same experience regardless of entry point
✅ **Security**: No plaintext passwords transmitted or stored by super admin
✅ **Accountability**: Each admin sets their own secure password
✅ **Traceability**: Invitation tokens track who invited whom
✅ **Flexibility**: New admins can set password at their convenience (within 48 hours)
✅ **Profile Completeness**: Ensures all admins have profile pictures
✅ **Better UX**: Clear, guided setup process with real-time feedback

---

## Related Documentation

- `ADMIN_SETUP_GUIDE.md` - Detailed setup instructions
- `CHANGES_SUMMARY.md` - Complete list of changes
- `DEPLOYMENT_CHECKLIST.md` - Pre-deployment checklist
- `ADMIN_SETUP_FLOW.md` - Visual flow diagrams
- `sql/admin-profiles-setup.sql` - Database setup script

---

## Summary

Both the standalone Create Admin page and the Manage Admin modal now follow the same invitation-based workflow:

1. **Super admin enters**: Name + Email (no password)
2. **System sends**: Invitation email with secure token
3. **New admin receives**: Email with setup link
4. **New admin sets up**: Profile picture + Password
5. **Account created**: Ready to log in immediately

This unified approach ensures security, consistency, and a better user experience across all admin creation workflows.