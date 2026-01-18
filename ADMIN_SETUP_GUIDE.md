# Admin Setup Guide

This guide covers the admin account creation flow and required configuration.

## Overview

When a super admin invites a new admin/staff member:

1. Super admin enters only **name** and **email** (no password)
2. System sends an invitation email with a secure link
3. New admin clicks the link and is authenticated
4. New admin must complete their profile:
   - Upload a **profile picture** (required)
   - Set a **strong password** (required)
5. Account is created and they can log in

---

## Required Supabase Configuration

### 1. Storage Bucket Setup

Create the `admin-profiles` bucket in Supabase Dashboard → Storage:

**Bucket Settings:**
- Name: `admin-profiles`
- Public: `false` (private bucket)
- File size limit: `5MB`
- Allowed MIME types: `image/*`

### 2. Storage Policies

Add these RLS policies to the `admin-profiles` bucket:

```sql
-- Policy 1: Admins can upload their own profile picture
CREATE POLICY "Admins can upload own profile" 
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'admin-profiles' 
  AND auth.uid()::text = (storage.foldername(name))[1]
  AND auth.uid() IN (SELECT auth_id FROM peso WHERE auth_id IS NOT NULL)
);

-- Policy 2: Admins can update their own profile picture
CREATE POLICY "Admins can update own profile" 
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'admin-profiles'
  AND auth.uid()::text = (storage.foldername(name))[1]
  AND auth.uid() IN (SELECT auth_id FROM peso WHERE auth_id IS NOT NULL)
);

-- Policy 3: Admins can read their own profile picture
CREATE POLICY "Admins can read own profile" 
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'admin-profiles'
  AND auth.uid()::text = (storage.foldername(name))[1]
  AND auth.uid() IN (SELECT auth_id FROM peso WHERE auth_id IS NOT NULL)
);

-- Policy 4: All admins can view other admin profiles
CREATE POLICY "Admins can view all profiles" 
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'admin-profiles'
  AND auth.uid() IN (SELECT auth_id FROM peso WHERE auth_id IS NOT NULL)
);

-- Policy 5: Admins can delete their own profile picture
CREATE POLICY "Admins can delete own profile" 
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'admin-profiles'
  AND auth.uid()::text = (storage.foldername(name))[1]
  AND auth.uid() IN (SELECT auth_id FROM peso WHERE auth_id IS NOT NULL)
);
```

### 3. Database Schema

Ensure the `peso` table has the profile picture column:

```sql
-- Add profile_picture_url column if it doesn't exist
ALTER TABLE peso 
ADD COLUMN IF NOT EXISTS profile_picture_url TEXT;
```

### 4. Invitation Tokens Table

Ensure the `admin_invitation_tokens` table exists:

```sql
CREATE TABLE IF NOT EXISTS admin_invitation_tokens (
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

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_invitation_token ON admin_invitation_tokens(token);
CREATE INDEX IF NOT EXISTS idx_invitation_email ON admin_invitation_tokens(email);
```

---

## Password Requirements

The admin setup process enforces the same strict password requirements as applicant signup:

✓ **At least 8 characters long**
✓ **At least one uppercase letter** (A-Z)
✓ **At least one lowercase letter** (a-z)
✓ **At least one number** (0-9)
✓ **At least one special character** (!@#$%^&*()_+-=[]{}|;:',.<>?/)

### Password Validation

The password validation occurs in two places:

1. **Frontend** (`/admin/setup-password/page.tsx`):
   - Real-time visual feedback as user types
   - Prevents form submission if requirements not met

2. **Backend** (`/api/admin/setup-password/route.ts`):
   - Server-side validation for security
   - Returns detailed error messages if validation fails

---

## Profile Picture Requirements

- **Format**: JPG, PNG, GIF, or any image format
- **Size**: Maximum 5MB
- **Required**: Yes - cannot proceed without uploading
- **Display**: Circular crop (150x150px preview)
- **Storage**: Uploaded to `admin-profiles` bucket with filename pattern: `{auth_id}.{extension}`

---

## User Flow

### For Super Admin (Creating Invitation)

1. Navigate to **Manage Admins** → **Invite New Admin**
2. Enter the new admin's:
   - Full name (permanent, cannot be changed later)
   - Email address
   - Check "Super Administrator" if applicable
3. Click **Send Invitation**
4. System generates a secure token (valid for 48 hours)
5. Email is sent to the new admin with setup link

### For New Admin (Setting Up Account)

1. Receive invitation email
2. Click the setup link (format: `/admin/setup-password?token=...`)
3. System validates the token and displays account info:
   - Name (read-only)
   - Email (read-only)
   - Role (Administrator or Super Administrator)
4. Upload a profile picture:
   - Click the upload area or drag & drop
   - Preview appears immediately
   - Can remove and re-upload if needed
5. Create a password:
   - Enter password that meets all requirements
   - See real-time validation feedback
   - Confirm password must match
6. Click **Create Account**
7. System processes:
   - Creates auth user with password
   - Signs in temporarily to upload profile picture
   - Creates `peso` record with profile URL
   - Marks invitation token as used
   - Signs out automatically
8. Redirect to login page
9. Admin can now log in with email + password

---

## API Endpoints

### POST `/api/admin/invite`

Creates an invitation and sends email.

**Auth Required**: Yes (Super Admin only)

**Request Body**:
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

Validates an invitation token.

**Auth Required**: No

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

Creates the admin account with password and completes setup.

**Auth Required**: No (uses invitation token)

**Request Body**:
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

1. **Token-based invitations**:
   - 32-character random tokens
   - Expire after 48 hours
   - Single-use only (marked as used after account creation)

2. **Password strength enforcement**:
   - Frontend validation with visual feedback
   - Backend validation as final check
   - Matches applicant signup requirements

3. **Profile picture validation**:
   - File type checking
   - Size limit enforcement (5MB)
   - Stored in private bucket with RLS policies

4. **Immutable admin name**:
   - Set during invitation
   - Cannot be changed after account creation
   - Ensures accountability for watermarked IDs

5. **Email verification**:
   - Email auto-confirmed during account creation
   - Uses Supabase Auth's email confirmation system

---

## Troubleshooting

### "Invalid or expired invitation"

**Cause**: Token is invalid, already used, or past 48-hour expiration

**Solution**: Super admin must send a new invitation

### "Failed to upload profile picture"

**Cause**: Storage bucket not configured or RLS policies missing

**Solution**: 
1. Verify `admin-profiles` bucket exists
2. Check RLS policies are in place
3. Ensure bucket is accessible to authenticated users

### "Password does not meet requirements"

**Cause**: Password missing one or more required elements

**Solution**: Ensure password has:
- 8+ characters
- Uppercase letter
- Lowercase letter
- Number
- Special character

### "Account created but failed to upload profile picture"

**Cause**: Account was created but storage upload failed

**Solution**:
1. Admin should log in with their new credentials
2. Navigate to profile settings
3. Upload profile picture there
4. Contact super admin if profile upload continues to fail

---

## Testing Checklist

- [ ] Super admin can send invitations
- [ ] Invitation email is received
- [ ] Token validation works correctly
- [ ] Expired tokens are rejected
- [ ] Used tokens cannot be reused
- [ ] Profile picture upload works
- [ ] Image preview displays correctly
- [ ] Password requirements are enforced
- [ ] Password toggle buttons work
- [ ] Account creation succeeds
- [ ] Profile picture appears in admin panel
- [ ] New admin can log in successfully

---

## Environment Variables

Required in `.env.local`:

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000  # or production URL
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key  # For admin.createUser()
```

---

## Related Files

- `/src/app/admin/create-admin/components/CreateAdmin.tsx` - Invitation form
- `/src/app/admin/setup-password/page.tsx` - Account setup page
- `/src/app/api/admin/invite/route.ts` - Invitation API
- `/src/app/api/admin/setup-password/route.ts` - Setup API
- `/src/app/admin/setup-password/SetupPassword.module.css` - Styling

---

## Future Enhancements

- [ ] Email template customization
- [ ] Resend invitation functionality
- [ ] Bulk admin invitations
- [ ] Admin role customization (beyond super admin)
- [ ] Profile picture cropping tool
- [ ] Two-factor authentication