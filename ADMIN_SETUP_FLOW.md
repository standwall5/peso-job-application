# Admin Setup Flow Diagram

## Complete Flow Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         ADMIN ACCOUNT CREATION FLOW                      │
└─────────────────────────────────────────────────────────────────────────┘

┌──────────────────────┐
│   SUPER ADMIN        │
│   (Logged In)        │
└──────────┬───────────┘
           │
           │ Navigates to "Invite New Admin"
           ▼
┌──────────────────────────────────────────────────────────┐
│  CREATE ADMIN FORM                                       │
│  /admin/create-admin                                     │
│                                                          │
│  Required Fields:                                        │
│  • Full Name (permanent, cannot change later)           │
│  • Email Address                                         │
│  • Super Admin? (checkbox)                              │
│                                                          │
│  NO PASSWORD REQUIRED AT THIS STEP                       │
└──────────┬───────────────────────────────────────────────┘
           │
           │ Clicks "Send Invitation"
           ▼
┌──────────────────────────────────────────────────────────┐
│  API: POST /api/admin/invite                             │
│                                                          │
│  1. Validates super admin permissions                    │
│  2. Validates email format                               │
│  3. Generates 32-char random token                       │
│  4. Stores in admin_invitation_tokens table              │
│     - Token expires in 48 hours                          │
│     - Single use only                                    │
│  5. Sends invitation email via Supabase Auth             │
└──────────┬───────────────────────────────────────────────┘
           │
           │ Email sent successfully
           ▼
┌──────────────────────────────────────────────────────────┐
│  INVITATION EMAIL                                        │
│                                                          │
│  Subject: "You're invited to join PESO Admin"           │
│  Contains:                                               │
│  • Welcome message                                       │
│  • Setup link with token                                 │
│    Format: /admin/setup-password?token=xxxxx            │
│  • Expiration notice (48 hours)                          │
└──────────┬───────────────────────────────────────────────┘
           │
           │ New admin clicks link
           ▼
┌──────────────────────────────────────────────────────────┐
│  SETUP PAGE LOADS                                        │
│  /admin/setup-password?token=xxxxx                       │
│                                                          │
│  1. Extracts token from URL                              │
│  2. Calls GET /api/admin/invite?token=xxxxx              │
│  3. Validates token (not expired, not used)              │
└──────────┬───────────────────────────────────────────────┘
           │
           │ Token valid
           ▼
┌──────────────────────────────────────────────────────────┐
│  ACCOUNT SETUP FORM                                      │
│  /admin/setup-password                                   │
│                                                          │
│  Display (Read-Only):                                    │
│  • Name: [from invitation]                               │
│  • Email: [from invitation]                              │
│  • Role: Admin / Super Administrator                     │
│                                                          │
│  Required Input:                                         │
│  ┌──────────────────────────────────────────────┐       │
│  │ 1. PROFILE PICTURE (Required)                │       │
│  │    • Click or drag & drop to upload          │       │
│  │    • Accepts: JPG, PNG, GIF, etc.            │       │
│  │    • Max size: 5MB                            │       │
│  │    • Preview: Circular 150x150px             │       │
│  │    • Can remove & re-upload                  │       │
│  └──────────────────────────────────────────────┘       │
│                                                          │
│  ┌──────────────────────────────────────────────┐       │
│  │ 2. PASSWORD (Required)                       │       │
│  │    Requirements (Real-time validation):      │       │
│  │    ✓ At least 8 characters                   │       │
│  │    ✓ At least one uppercase letter (A-Z)     │       │
│  │    ✓ At least one lowercase letter (a-z)     │       │
│  │    ✓ At least one number (0-9)               │       │
│  │    ✓ At least one special character          │       │
│  │    • Shows green ✓ or red ✗ for each         │       │
│  │    • Toggle visibility button (eye icon)     │       │
│  └──────────────────────────────────────────────┘       │
│                                                          │
│  ┌──────────────────────────────────────────────┐       │
│  │ 3. CONFIRM PASSWORD (Required)               │       │
│  │    • Must match password exactly             │       │
│  │    • Toggle visibility button (eye icon)     │       │
│  └──────────────────────────────────────────────┘       │
│                                                          │
│  [Create Account Button]                                │
└──────────┬───────────────────────────────────────────────┘
           │
           │ Clicks "Create Account"
           │ (Client-side validation passes)
           ▼
┌──────────────────────────────────────────────────────────┐
│  API: POST /api/admin/setup-password                     │
│                                                          │
│  Server-Side Validation:                                 │
│  1. Verify token is valid & not expired                  │
│  2. Validate password requirements:                      │
│     • Length >= 8 characters ✓                           │
│     • Contains uppercase letter ✓                        │
│     • Contains lowercase letter ✓                        │
│     • Contains number ✓                                  │
│     • Contains special character ✓                       │
│  3. Create auth user with Supabase Auth                  │
│  4. Create peso table record                             │
│  5. Mark token as used                                   │
└──────────┬───────────────────────────────────────────────┘
           │
           │ Account created successfully
           ▼
┌──────────────────────────────────────────────────────────┐
│  PROFILE PICTURE UPLOAD                                  │
│  (Client-side, after account creation)                   │
│                                                          │
│  1. Sign in temporarily with new credentials             │
│  2. Upload to Supabase Storage:                          │
│     • Bucket: admin-profiles                             │
│     • Path: {auth_id}.{extension}                        │
│     • RLS policies enforce access control                │
│  3. Get public URL from storage                          │
│  4. Update peso.profile_picture_url                      │
│  5. Sign out automatically                               │
└──────────┬───────────────────────────────────────────────┘
           │
           │ Setup complete
           ▼
┌──────────────────────────────────────────────────────────┐
│  SUCCESS & REDIRECT                                      │
│                                                          │
│  • Show success message                                  │
│  • "Account created successfully!"                       │
│  • Auto-redirect to /admin/login in 1.5 seconds         │
└──────────┬───────────────────────────────────────────────┘
           │
           │ Redirected to login
           ▼
┌──────────────────────────────────────────────────────────┐
│  ADMIN LOGIN PAGE                                        │
│  /admin/login                                            │
│                                                          │
│  New admin can now login with:                           │
│  • Email: [their email]                                  │
│  • Password: [password they just set]                    │
└──────────┬───────────────────────────────────────────────┘
           │
           │ Login successful
           ▼
┌──────────────────────────────────────────────────────────┐
│  ADMIN DASHBOARD                                         │
│  • Full access granted                                   │
│  • Profile picture visible                               │
│  • Name used for ID watermarks                           │
└──────────────────────────────────────────────────────────┘
```

## Password Validation Flow

```
┌─────────────────────────────────────────────────────────┐
│           PASSWORD VALIDATION (REAL-TIME)               │
└─────────────────────────────────────────────────────────┘

User types: "pass"
           │
           ▼
┌──────────────────────┐
│  Check Requirements  │
└──────────┬───────────┘
           │
           ├─► Length (8+)         ✗ Only 4 chars
           ├─► Uppercase (A-Z)     ✗ None present
           ├─► Lowercase (a-z)     ✓ Has lowercase
           ├─► Number (0-9)        ✗ None present
           └─► Special char        ✗ None present
                                   
User types: "Password"
           │
           ▼
┌──────────────────────┐
│  Check Requirements  │
└──────────┬───────────┘
           │
           ├─► Length (8+)         ✓ 8 characters
           ├─► Uppercase (A-Z)     ✓ Has 'P'
           ├─► Lowercase (a-z)     ✓ Has letters
           ├─► Number (0-9)        ✗ None present
           └─► Special char        ✗ None present

User types: "Password123"
           │
           ▼
┌──────────────────────┐
│  Check Requirements  │
└──────────┬───────────┘
           │
           ├─► Length (8+)         ✓ 11 characters
           ├─► Uppercase (A-Z)     ✓ Has 'P'
           ├─► Lowercase (a-z)     ✓ Has letters
           ├─► Number (0-9)        ✓ Has '1', '2', '3'
           └─► Special char        ✗ None present

User types: "Password123!"
           │
           ▼
┌──────────────────────┐
│  Check Requirements  │
└──────────┬───────────┘
           │
           ├─► Length (8+)         ✓ 12 characters
           ├─► Uppercase (A-Z)     ✓ Has 'P'
           ├─► Lowercase (a-z)     ✓ Has letters
           ├─► Number (0-9)        ✓ Has '1', '2', '3'
           └─► Special char        ✓ Has '!'
                                   
                ALL REQUIREMENTS MET ✓
                Button enabled
```

## Profile Picture Upload Flow

```
┌─────────────────────────────────────────────────────────┐
│         PROFILE PICTURE UPLOAD PROCESS                  │
└─────────────────────────────────────────────────────────┘

┌──────────────────┐
│  User clicks or  │
│  drags image     │
└────────┬─────────┘
         │
         ▼
┌────────────────────────────┐
│  File Validation           │
│                            │
│  1. Check file type        │
│     → Must be image/*      │
│                            │
│  2. Check file size        │
│     → Max 5MB              │
└────────┬───────────────────┘
         │
         ├──✗ Invalid → Show error message
         │
         ✓ Valid
         │
         ▼
┌────────────────────────────┐
│  Create Preview            │
│                            │
│  • FileReader reads file   │
│  • Convert to data URL     │
│  • Display in circular     │
│    150x150px preview       │
└────────┬───────────────────┘
         │
         ▼
┌────────────────────────────┐
│  Store in State            │
│                            │
│  • profilePicture: File    │
│  • profilePicturePreview:  │
│    string (data URL)       │
└────────┬───────────────────┘
         │
         ▼
┌────────────────────────────┐
│  User can:                 │
│  • View preview            │
│  • Click Remove to delete  │
│  • Upload different image  │
└────────┬───────────────────┘
         │
         │ Form submitted
         ▼
┌────────────────────────────┐
│  Upload to Supabase        │
│                            │
│  1. Create account first   │
│  2. Sign in with new creds │
│  3. Upload to storage:     │
│     Bucket: admin-profiles │
│     Path: {auth_id}.ext    │
│  4. Get public URL         │
│  5. Update peso table      │
│  6. Sign out               │
└────────────────────────────┘
```

## Error Handling Flow

```
┌─────────────────────────────────────────────────────────┐
│               ERROR SCENARIOS & HANDLING                │
└─────────────────────────────────────────────────────────┘

ERROR: Invalid Token
├─► Cause: Token expired, used, or doesn't exist
└─► Action: Show error page with "Back to Login" button

ERROR: No Profile Picture
├─► Cause: User tries to submit without uploading
└─► Action: Display error "Profile picture is required"

ERROR: Invalid Image File
├─► Cause: Wrong file type or too large
└─► Action: Show error below upload area

ERROR: Password Requirements Not Met
├─► Cause: Missing uppercase, lowercase, number, or special
└─► Action: Show red ✗ marks, disable submit button

ERROR: Passwords Don't Match
├─► Cause: Confirm password ≠ password
└─► Action: Show error "Passwords do not match"

ERROR: Profile Upload Failed
├─► Cause: Storage bucket error or RLS policy issue
└─► Action: Account created but show error message
           User can upload later via profile settings

ERROR: Token Already Used
├─► Cause: Attempting to reuse a setup link
└─► Action: Show "Invalid invitation" error
           Super admin must send new invitation

ERROR: Token Expired (>48 hours)
├─► Cause: Link older than 48 hours
└─► Action: Show "Invitation has expired" error
           Super admin must send new invitation
```

## Security Checkpoints

```
┌─────────────────────────────────────────────────────────┐
│                   SECURITY LAYERS                       │
└─────────────────────────────────────────────────────────┘

Layer 1: Super Admin Permission Check
         │
         ├─► Only super admins can send invitations
         └─► Verified via auth.uid() → peso.is_superadmin

Layer 2: Token Generation & Storage
         │
         ├─► 32-character random token
         ├─► Stored with expiration timestamp
         └─► Single-use flag (used = false)

Layer 3: Token Validation
         │
         ├─► Check token exists in database
         ├─► Verify not expired (< 48 hours)
         └─► Verify not already used

Layer 4: Client-Side Password Validation
         │
         ├─► Real-time feedback as user types
         ├─► Prevents submission if requirements not met
         └─► Visual indicators (✓/✗)

Layer 5: Server-Side Password Validation
         │
         ├─► Re-validates all requirements
         ├─► Cannot be bypassed by client manipulation
         └─► Returns detailed error if validation fails

Layer 6: Profile Picture Validation
         │
         ├─► File type checking (image/* only)
         ├─► Size limit enforcement (5MB max)
         └─► Client-side + storage-side validation

Layer 7: Storage RLS Policies
         │
         ├─► Only authenticated admins can upload
         ├─► Can only upload to own auth_id folder
         ├─► All admins can view each other's profiles
         └─► Can only delete own profile picture

Layer 8: Immutable Admin Name
         │
         ├─► Set during invitation creation
         ├─► No API endpoint to change after creation
         └─► Ensures accountability for watermarked IDs
```

## Database State Changes

```
┌─────────────────────────────────────────────────────────┐
│            DATABASE OPERATIONS TIMELINE                 │
└─────────────────────────────────────────────────────────┘

Step 1: Invitation Created
┌────────────────────────────┐
│ admin_invitation_tokens    │
├────────────────────────────┤
│ email: admin@peso.gov.ph   │
│ admin_name: Juan Dela Cruz │
│ token: abc123...           │
│ is_superadmin: false       │
│ used: false                │
│ expires_at: +48 hours      │
│ created_by: 1              │
└────────────────────────────┘

Step 2: Account Created
┌────────────────────────────┐
│ auth.users                 │
├────────────────────────────┤
│ id: uuid-xxx               │
│ email: admin@peso.gov.ph   │
│ encrypted_password: ***    │
│ email_confirmed_at: now    │
│ user_metadata: {name, ...} │
└────────────────────────────┘
         +
┌────────────────────────────┐
│ peso                       │
├────────────────────────────┤
│ id: 42                     │
│ auth_id: uuid-xxx          │
│ name: Juan Dela Cruz       │
│ is_superadmin: false       │
│ status: active             │
│ profile_picture_url: null  │
└────────────────────────────┘

Step 3: Profile Picture Uploaded
┌────────────────────────────┐
│ storage.objects            │
├────────────────────────────┤
│ bucket_id: admin-profiles  │
│ name: uuid-xxx.jpg         │
│ owner: uuid-xxx            │
└────────────────────────────┘
         +
┌────────────────────────────┐
│ peso                       │
├────────────────────────────┤
│ id: 42                     │
│ profile_picture_url:       │
│   https://...uuid-xxx.jpg  │
└────────────────────────────┘

Step 4: Token Marked as Used
┌────────────────────────────┐
│ admin_invitation_tokens    │
├────────────────────────────┤
│ token: abc123...           │
│ used: true                 │
│ used_at: now               │
└────────────────────────────┘
```

## Summary

**Key Points:**
- No password required when super admin creates invitation
- Token-based secure setup link (48-hour expiration)
- Profile picture is **required** during setup
- Password must meet all 5 requirements (same as sign-up)
- Real-time validation with visual feedback
- Account created → Profile uploaded → Auto sign-out → Redirect to login
- Admin name is immutable after creation
- All operations are secured with validation at multiple layers