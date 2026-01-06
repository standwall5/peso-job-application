# Email Change Flow Documentation

## Overview

This document describes the simplified email change flow that uses Supabase's built-in email confirmation system with an additional security layer of confirming via the **current email** first.

## Changes Made

### 1. Removed OTP System
- **Deleted**: OTP verification code (was complex and required email service setup)
- **Why**: Supabase already has robust email confirmation built-in, no need to duplicate

### 2. New Token-Based Flow

#### For Email Changes:
1. User clicks "Edit Email" button
2. User enters new email address
3. System sends confirmation link to **CURRENT email** (proves account ownership)
4. User clicks link in current email
5. System initiates email change via Supabase
6. Supabase sends final confirmation to **NEW email**
7. User clicks Supabase link to complete change

#### For Phone Changes:
- Simplified to direct update (no confirmation needed)
- Just updates the `phone` field in `applicants` table

#### For Name Changes:
- Direct update (no confirmation needed)
- Updates `name` field in `applicants` table

---

## Database Changes

### New Table: `email_change_tokens`

```sql
CREATE TABLE public.email_change_tokens (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  new_email TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  CONSTRAINT email_change_tokens_unique UNIQUE (user_id, new_email)
);
```

**Purpose**: Stores pending email change requests with secure tokens sent to current email.

**Expiry**: Tokens expire after 1 hour.

### Migration File
- **Location**: `sql/create_email_change_tokens_table.sql`
- **Run in Supabase**: Execute this SQL in your Supabase SQL editor

---

## Files Created/Modified

### New Files

#### 1. `sql/create_email_change_tokens_table.sql`
- Database migration for email change tokens table
- Includes RLS policies and cleanup function

#### 2. `src/app/(user)/profile/confirm-email-change/page.tsx`
- Confirmation page users land on when clicking link from current email
- Processes token and initiates Supabase email change
- Shows success/error states with clear instructions

#### 3. `src/app/(user)/profile/confirm-email-change/confirm-email-change.module.css`
- Styles for confirmation page
- Beautiful success/error animations

### Modified Files

#### 1. `src/lib/db/services/contact.service.ts`
**Changes**:
- Removed `sendOTP()` and `verifyOTP()` functions
- Added `requestEmailChange()` - generates token, sends link to current email
- Added `confirmEmailChange()` - validates token, calls Supabase updateUser
- Simplified `updatePhone()` - direct update, no verification

#### 2. `src/app/(user)/profile/actions/contact.actions.ts`
**Changes**:
- Removed `sendOTPAction()` and `verifyOTPAction()`
- Added `requestEmailChangeAction()` - requests email change
- Added `confirmEmailChangeAction()` - confirms via token
- Added `updatePhoneAction()` - direct phone update

#### 3. `src/app/(user)/profile/components/modals/EditContactModal.tsx`
**Changes**:
- Removed OTP input step
- Changed flow: `input` → `success` (for email) or direct update (for phone/name)
- Shows detailed instructions after requesting email change
- Explains the two-step confirmation process

#### 4. `src/app/(user)/profile/components/modals/EditContactModal.module.css`
**Changes**:
- Added styles for success message
- Added styles for instruction steps with numbered badges
- Added note box styling

---

## User Experience Flow

### Email Change

```
┌─────────────────────────────────────────────────────────────┐
│ 1. User clicks "Edit" on email                             │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. Modal opens - user enters new email                     │
│    • Shows current email                                    │
│    • Info: "We'll send link to CURRENT email"              │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. User clicks "Send Confirmation"                          │
│    • Server generates secure token                          │
│    • Stores in email_change_tokens table                    │
│    • Console logs link (dev) or sends email (prod)          │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. Success modal shows with instructions:                   │
│    ① Check CURRENT email inbox                              │
│    ② Click confirmation link                                │
│    ③ Check NEW email for Supabase confirmation             │
│    ④ Click Supabase link to complete                        │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. User checks CURRENT email, clicks link                   │
│    • Link format: /profile/confirm-email-change?token=xxx   │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│ 6. Confirmation page processes token                        │
│    • Validates token (not expired, not used)                │
│    • Marks token as used                                    │
│    • Calls Supabase auth.updateUser({ email: newEmail })    │
│    • Shows success with next steps                          │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│ 7. Supabase sends confirmation to NEW email                 │
│    • Supabase built-in confirmation system                  │
│    • User must click this link for email to fully update    │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│ 8. Email change complete! ✅                                │
└─────────────────────────────────────────────────────────────┘
```

---

## Setup Instructions

### 1. Run Database Migration

```sql
-- Execute in Supabase SQL Editor
-- File: sql/create_email_change_tokens_table.sql
```

### 2. Environment Variables

Ensure you have:
```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000  # or your production URL
```

### 3. Development Testing

In development, confirmation links are logged to console:

```
[EMAIL CHANGE] User: user@example.com, New Email: newemail@example.com, 
Confirmation URL: http://localhost:3000/profile/confirm-email-change?token=abc123...
```

**To test:**
1. Request email change in UI
2. Check server console for the confirmation URL
3. Copy and paste URL into browser
4. Observe success page
5. Check Supabase logs for the final confirmation email sent to new address

### 4. Production Setup

#### Option A: Use Supabase SMTP (Recommended)
Configure in Supabase Dashboard → Project Settings → Auth → Email Templates

#### Option B: Use Resend or SendGrid

Install package:
```bash
npm install resend
```

Add to `.env.local`:
```env
RESEND_API_KEY=re_xxxxxxxxxxxxx
```

Update `src/lib/db/services/contact.service.ts` line ~62:
```typescript
// Uncomment and configure the Resend code block
const { Resend } = await import('resend');
const resend = new Resend(process.env.RESEND_API_KEY);

await resend.emails.send({
  from: 'PESO Job Application <noreply@yourdomain.com>',
  to: user.email, // Current email
  subject: 'Confirm Your Email Change - PESO Job Application',
  html: `<!-- email template -->`
});
```

---

## Security Features

### ✅ Current Email Verification First
- Prevents unauthorized email changes
- Only the current email owner can approve

### ✅ Secure Random Tokens
- 32-byte cryptographically secure tokens
- Unique per request

### ✅ Time-Limited Tokens
- Tokens expire after 1 hour
- Automatic cleanup of expired tokens

### ✅ One-Time Use
- Tokens marked as `used` after confirmation
- Cannot be reused

### ✅ Supabase Final Confirmation
- Additional verification on new email
- Ensures new email address is accessible

### ✅ RLS Policies
- Users can only access their own tokens
- Row-level security enabled

---

## Error Handling

### Token Validation Errors
- **Expired token**: "Invalid or expired confirmation link"
- **Already used**: "Invalid or expired confirmation link"
- **Invalid token**: "Invalid or expired confirmation link"
- **Missing token**: "Invalid confirmation link. No token provided."

### Supabase Errors
- Failed to update: Shows Supabase error message
- Network issues: Generic error message

### User-Facing Messages
All errors shown in confirmation page with:
- Clear error icon (red)
- Error message
- Common reasons list
- "Return to Profile" and "Try Again" buttons

---

## Testing Checklist

### Email Change Flow
- [ ] Request email change with valid email
- [ ] Verify token created in database
- [ ] Check console for confirmation URL (dev)
- [ ] Click confirmation link
- [ ] Verify token marked as used
- [ ] Verify Supabase sends final confirmation
- [ ] Try reusing same token (should fail)
- [ ] Try expired token (wait 1 hour or manually expire)
- [ ] Try with invalid email format

### Phone Change Flow
- [ ] Update phone number
- [ ] Verify immediate update in database
- [ ] Verify UI refreshes

### Name Change Flow
- [ ] Update name
- [ ] Verify immediate update in database
- [ ] Verify UI refreshes

---

## Cleanup

### Old Files You Can Delete (Optional)

If OTP system is no longer needed:
- `src/lib/db/services/otp.service.ts`
- `sql/create_otp_verifications_table.sql`

**Note**: Only delete if you're sure you won't need OTP for other features.

### Database Cleanup

If you created the OTP table, you can drop it:
```sql
DROP TABLE IF EXISTS public.otp_verifications CASCADE;
```

---

## Troubleshooting

### "Email didn't change"
**Cause**: Supabase requires final confirmation on new email

**Solution**: Check new email inbox for Supabase confirmation link. Email won't change until that link is clicked.

### "Can't find confirmation email"
**Development**: Link is in server console, not sent via email

**Production**: 
1. Check spam folder
2. Verify email service is configured (Resend/SendGrid/Supabase SMTP)
3. Check email service logs

### "Token expired"
**Cause**: Waited more than 1 hour

**Solution**: Request new email change

### "Invalid token"
**Cause**: Token already used or doesn't exist

**Solution**: Request new email change

---

## API Reference

### Server Actions

#### `requestEmailChangeAction(newEmail: string)`
**Purpose**: Initiates email change request

**Returns**: `{ success: boolean; error?: string }`

**Flow**:
1. Validates email format
2. Generates secure token
3. Stores in database
4. Sends/logs confirmation link to current email

#### `confirmEmailChangeAction(token: string)`
**Purpose**: Confirms email change via token

**Returns**: `{ success: boolean; error?: string; newEmail?: string }`

**Flow**:
1. Validates token (exists, not expired, not used)
2. Marks token as used
3. Calls Supabase `auth.updateUser({ email: newEmail })`
4. Returns new email for display

#### `updatePhoneAction(newPhone: string)`
**Purpose**: Directly updates phone number

**Returns**: `{ success: boolean; error?: string }`

#### `updateNameAction(name: string)`
**Purpose**: Directly updates name

**Returns**: `{ success: boolean; error?: string }`

---

## Benefits Over OTP System

| Feature | OTP System | Token System |
|---------|-----------|--------------|
| **Setup Complexity** | High (SMS provider or email service required) | Low (uses Supabase built-in) |
| **Cost** | Can be expensive (SMS) | Free (email) |
| **User Experience** | Multiple steps, typing codes | Click links (easier) |
| **Security** | Good | Better (current email + new email) |
| **Development** | Console logs codes | Console logs links |
| **Production** | Requires paid services | Works with free tier |
| **Maintenance** | Cleanup jobs needed | Built-in cleanup |

---

## Future Enhancements

### Potential Improvements
1. **Email Templates**: Design beautiful HTML email templates
2. **Rate Limiting**: Limit email change requests (e.g., 3 per hour)
3. **Audit Log**: Record all email change attempts
4. **Notification**: Alert old email when change is completed
5. **Cooldown Period**: Prevent frequent email changes
6. **2FA Integration**: Require 2FA before email change
7. **SMS Backup**: Optional SMS verification for phone changes

---

## Support

If you encounter issues:

1. **Check server console** - Most errors are logged there
2. **Verify database** - Check if token was created in `email_change_tokens`
3. **Check Supabase logs** - Auth logs show email confirmation attempts
4. **Test token expiry** - Ensure tokens haven't expired

For questions or issues, refer to:
- Supabase Auth documentation
- This file
- Project README

---

**Last Updated**: Today

**Version**: 1.0

**Status**: ✅ Ready for Testing