# Admin Invitation Setup Checklist - January 19, 2026

## ✅ Quick Setup Guide

Follow these steps to fix the admin invitation flow and ensure new admins land on the correct page.

---

## Step 1: Configure Supabase Redirect URLs

This is **CRITICAL** - without this, admins will land on the wrong page!

### In Supabase Dashboard:

1. Go to your Supabase project: https://supabase.com/dashboard
2. Navigate to **Authentication** → **URL Configuration**
3. Add these redirect URLs:

#### Development:
```
http://localhost:3000/auth/callback
```

#### Production (replace with your actual domain):
```
https://your-production-domain.com/auth/callback
```

4. Set **Site URL**:
   - Development: `http://localhost:3000`
   - Production: `https://your-production-domain.com`

5. Click **Save**

---

## Step 2: Verify Environment Variables

### In `.env.local` (Development):
```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### In Vercel (Production):
Add the same variables in Vercel project settings with production values:
```env
NEXT_PUBLIC_APP_URL=https://your-production-domain.com
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

---

## Step 3: Test the Flow

### Create Test Invitation:

1. Login as super admin
2. Go to **Manage Admin**
3. Click **"Add Admin"**
4. Enter:
   - Name: "Test Admin"
   - Email: your-test-email@example.com
   - Role: Admin
5. Click **"Send Invitation"**
6. Should see success message

### Check Email:

1. Open the email inbox for the test email
2. Should receive email from Supabase
3. Subject: "You have been invited" (or similar)

### Complete Setup:

1. Click link in email
2. Should see Supabase password setup page
3. Enter password (must meet requirements):
   - At least 8 characters
   - Uppercase letter
   - Lowercase letter
   - Number
   - Special character
4. Click "Update password"

### Verify Redirect:

✅ **Should redirect to:** `/admin` (or `/admin/manage-admin` for super admin)
❌ **Should NOT go to:** `/job-opportunities` or homepage

### Verify First Login Modal:

✅ **Should appear:** Profile setup modal
✅ **Should show:** "Complete Your Profile"
✅ **Should require:** Profile picture upload

### Complete Profile Setup:

1. Upload profile picture (max 5MB)
2. Optionally change password
3. Click "Complete Setup"
4. Page reloads

### Verify Profile:

✅ **Correct name** displays in header (not "Admin")
✅ **Profile picture** shows in header
✅ **Correct permissions** based on role

---

## Step 4: Verify Database

Run these queries in Supabase SQL Editor to verify:

```sql
-- Check if peso record was created
SELECT id, auth_id, name, is_superadmin, is_first_login, profile_picture_url
FROM peso
WHERE email = 'your-test-email@example.com';
```

**Expected:**
- `name` = "Test Admin" (or whatever name you entered)
- `is_first_login` = `false` (after completing setup)
- `profile_picture_url` = URL to uploaded image
- `is_superadmin` = `true` or `false` based on role

```sql
-- Check invitation token
SELECT email, admin_name, is_superadmin, used, created_at, used_at
FROM admin_invitation_tokens
WHERE email = 'your-test-email@example.com'
ORDER BY created_at DESC
LIMIT 1;
```

**Expected:**
- `used` = `true`
- `used_at` = timestamp when password was set

---

## Common Issues & Fixes

### Issue: Redirects to homepage instead of admin dashboard

**Cause:** Callback URL not whitelisted in Supabase

**Fix:**
1. Go to Supabase → Authentication → URL Configuration
2. Add `http://localhost:3000/auth/callback` (dev) and production URL
3. Save and wait 10 seconds
4. Try again with new invitation

---

### Issue: "Invalid redirect URL" error

**Cause:** Typo or URL not whitelisted

**Fix:**
1. Check for typos in Supabase redirect URLs
2. Ensure exact match with code (no trailing slashes)
3. Correct protocol (http vs https)

---

### Issue: First login modal doesn't appear

**Cause:** `is_first_login` field not set correctly

**Fix:**
```sql
UPDATE peso 
SET is_first_login = true 
WHERE email = 'your-test-email@example.com';
```
Then reload the page.

---

### Issue: Wrong name displays ("Admin" instead of actual name)

**Cause:** Name not stored in database

**Fix:**
```sql
UPDATE peso 
SET name = 'Correct Admin Name' 
WHERE email = 'your-test-email@example.com';
```
Then clear browser cache and reload.

---

### Issue: Email not received

**Cause:** Email delivery issue

**Fix:**
1. Check spam/junk folder
2. Verify email address is correct
3. Check Supabase Auth logs for errors
4. Configure custom SMTP in Supabase (recommended for production)

---

## Files Changed

✅ **New Files:**
- `src/app/auth/callback/route.ts` - Handles Supabase email confirmations
- `docs/SUPABASE_REDIRECT_SETUP.md` - Detailed configuration guide
- `ADMIN_INVITATION_SETUP_CHECKLIST.md` - This file

✅ **Modified Files:**
- `src/app/api/admin/invite/route.ts` - Creates peso record immediately, uses callback URL
- `src/app/admin/layout.tsx` - First-login modal for all admins
- `src/app/admin/manage-admin/hooks/useAdminActions.ts` - Updated success messages

---

## Summary

### What We Fixed:
1. ❌ **Before:** Admins landed on job seeker homepage
   ✅ **After:** Admins land on admin dashboard

2. ❌ **Before:** Profile setup was skipped
   ✅ **After:** First-login modal appears automatically

3. ❌ **Before:** Wrong name displayed
   ✅ **After:** Correct name stored and displayed

### How It Works Now:
1. Super admin sends invitation → Email sent automatically
2. New admin receives email → Sets password via Supabase
3. After password → Redirects to `/auth/callback`
4. Callback checks if admin → Redirects to admin dashboard
5. First login → Modal appears for profile setup
6. Upload picture → Complete setup → Done!

---

## Next Steps

- [ ] Complete Step 1: Configure Supabase redirect URLs
- [ ] Complete Step 2: Verify environment variables
- [ ] Complete Step 3: Test with real email
- [ ] Complete Step 4: Verify database records
- [ ] Deploy to production
- [ ] Test in production
- [ ] Update team documentation

---

## Support

**Documentation:**
- `docs/SUPABASE_REDIRECT_SETUP.md` - Detailed configuration
- `docs/ADMIN_INVITATION_FIXES_2026-01-19.md` - Technical details
- `CHANGELOG_2026-01-19.md` - All changes made

**Need Help?**
1. Check the troubleshooting section above
2. Review Supabase Auth logs
3. Check browser console for errors
4. Verify database queries
5. Review middleware logs

---

**Status:** ✅ Code Complete - Ready for Configuration
**Priority:** 🔴 HIGH - Required for admin invitations
**Last Updated:** January 19, 2026