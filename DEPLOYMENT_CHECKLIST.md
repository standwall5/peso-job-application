# Deployment Checklist - Admin Setup & Password Requirements

## Pre-Deployment Tasks

### 1. Code Review
- [ ] Review all modified files for syntax errors
- [ ] Verify password validation logic is consistent across all forms
- [ ] Check that profile picture upload flow is complete
- [ ] Ensure error handling is in place for all API routes
- [ ] Verify TypeScript types are correct

### 2. Local Testing
- [ ] Test sign-up form birth date restrictions (< 15 years old blocked)
- [ ] Test reset password with all 5 password requirements
- [ ] Test admin invitation email sending
- [ ] Test admin setup page with profile picture upload
- [ ] Test password requirements validation (both client and server)
- [ ] Test password visibility toggle buttons
- [ ] Test profile picture preview and remove functionality
- [ ] Verify new admin can log in after setup

---

## Supabase Configuration

### 3. Storage Bucket Setup
- [ ] Navigate to Supabase Dashboard → Storage
- [ ] Create new bucket named `admin-profiles`
- [ ] Set bucket to **private** (public = false)
- [ ] Set file size limit to **5MB** (5242880 bytes)
- [ ] Set allowed MIME types to `image/*`
- [ ] Verify bucket appears in storage list

### 4. Database Schema Updates
- [ ] Open Supabase SQL Editor
- [ ] Run the SQL script: `sql/admin-profiles-setup.sql`
- [ ] Verify `peso` table has `profile_picture_url` column
- [ ] Verify `admin_invitation_tokens` table exists
- [ ] Check all indexes are created
- [ ] Confirm no SQL errors in execution log

### 5. Storage RLS Policies
- [ ] Navigate to Storage → admin-profiles → Policies
- [ ] Verify all 5 policies are active:
  - ✓ "Admins can upload own profile"
  - ✓ "Admins can update own profile"
  - ✓ "Admins can read own profile"
  - ✓ "Admins can view all profiles"
  - ✓ "Admins can delete own profile"
- [ ] Test policy by uploading a test image (if possible)

### 6. Environment Variables
- [ ] Verify `.env.local` has `NEXT_PUBLIC_APP_URL`
- [ ] Verify `NEXT_PUBLIC_SUPABASE_URL` is set
- [ ] Verify `NEXT_PUBLIC_SUPABASE_ANON_KEY` is set
- [ ] Verify `SUPABASE_SERVICE_ROLE_KEY` is set (for admin.createUser)
- [ ] Check production environment variables are configured

---

## Build & Deploy

### 7. Build Verification
- [ ] Run `npm install` to ensure dependencies are up to date
- [ ] Run `npm run build` locally
- [ ] Check for any build errors or warnings
- [ ] Verify build completes successfully
- [ ] Test built version with `npm run start`

### 8. Deployment
- [ ] Push changes to version control
- [ ] Deploy to staging environment (if available)
- [ ] Verify deployment completes without errors
- [ ] Check deployment logs for issues

---

## Post-Deployment Testing

### 9. Sign-Up Form Testing
- [ ] Navigate to sign-up page
- [ ] Verify birth date label reads "Select Birth Date"
- [ ] Attempt to select a date < 15 years ago (should be disabled)
- [ ] Select a valid date (15+ years ago)
- [ ] Verify age calculates correctly
- [ ] Complete sign-up and verify account creation

### 10. Reset Password Testing
- [ ] Initiate password reset for test account
- [ ] Open reset password link from email
- [ ] Enter password missing uppercase → verify error shows
- [ ] Enter password missing lowercase → verify error shows
- [ ] Enter password missing number → verify error shows
- [ ] Enter password missing special char → verify error shows
- [ ] Enter password < 8 chars → verify error shows
- [ ] Enter valid password meeting all requirements
- [ ] Verify visual feedback shows all green checkmarks
- [ ] Test password visibility toggle buttons
- [ ] Complete reset and verify can log in with new password

### 11. Admin Invitation Testing
- [ ] Log in as super admin
- [ ] Navigate to Create Admin page
- [ ] Enter new admin name and email
- [ ] Send invitation
- [ ] Verify success message appears
- [ ] Check invitation email is received
- [ ] Verify invitation link format is correct

### 12. Admin Setup Testing
- [ ] Click invitation link from email
- [ ] Verify token validation works
- [ ] Verify admin info displays correctly (name, email, role)
- [ ] Attempt to submit without profile picture → verify error
- [ ] Upload invalid file type → verify error
- [ ] Upload file > 5MB → verify error
- [ ] Upload valid profile picture
- [ ] Verify circular preview displays correctly
- [ ] Test remove and re-upload functionality
- [ ] Enter password missing requirements → verify errors
- [ ] Verify real-time validation feedback works
- [ ] Test password visibility toggles
- [ ] Enter valid password meeting all requirements
- [ ] Enter non-matching confirm password → verify error
- [ ] Enter matching passwords
- [ ] Submit form
- [ ] Verify success message and redirect to login
- [ ] Log in with new admin credentials
- [ ] Verify profile picture appears in admin panel

### 13. Security Testing
- [ ] Attempt to access setup page with invalid token → verify rejection
- [ ] Attempt to access setup page with expired token → verify rejection
- [ ] Attempt to reuse a used token → verify rejection
- [ ] Attempt to bypass password validation with API call → verify rejection
- [ ] Verify profile pictures are not publicly accessible
- [ ] Verify only admins can view admin profile pictures
- [ ] Test that admin names cannot be changed after creation

---

## Regression Testing

### 14. Existing Functionality
- [ ] Verify existing admin login still works
- [ ] Verify existing applicant sign-up still works
- [ ] Verify applicant login still works
- [ ] Verify admin dashboard loads correctly
- [ ] Verify company profiles load correctly
- [ ] Verify job postings display correctly
- [ ] Check that no existing features are broken

---

## Documentation Updates

### 15. Update Documentation
- [ ] Add link to `ADMIN_SETUP_GUIDE.md` in main README
- [ ] Update any onboarding documentation for super admins
- [ ] Document password requirements in user-facing help docs
- [ ] Update API documentation if publicly available
- [ ] Create internal notes for support team

---

## Monitoring & Support

### 16. Post-Launch Monitoring
- [ ] Monitor error logs for password validation issues
- [ ] Monitor storage bucket usage
- [ ] Watch for failed profile picture uploads
- [ ] Check invitation email delivery rates
- [ ] Monitor account creation success rates
- [ ] Review any user-reported issues

### 17. Support Preparation
- [ ] Brief support team on new admin setup process
- [ ] Prepare FAQ for password requirements
- [ ] Document common troubleshooting steps
- [ ] Create escalation path for storage/upload issues

---

## Rollback Plan

### 18. Rollback Preparation (If Needed)
- [ ] Document previous code version/commit hash
- [ ] Keep backup of old admin setup flow
- [ ] Note Supabase configuration changes for reversal
- [ ] Have rollback instructions ready
- [ ] Test rollback procedure in staging (if available)

---

## Success Criteria

### 19. Deployment Successful When:
- [ ] All new admins can complete setup successfully
- [ ] Profile pictures upload without errors
- [ ] Password requirements are enforced consistently
- [ ] No regression in existing functionality
- [ ] Error rates remain normal or improved
- [ ] User feedback is positive
- [ ] No critical bugs reported in first 48 hours

---

## Sign-Off

**Deployed By**: ___________________________  
**Date**: ___________________________  
**Version**: ___________________________  
**Environment**: [ ] Staging  [ ] Production  

**Notes**:
_____________________________________________
_____________________________________________
_____________________________________________

---

## Quick Reference

### Files Modified
1. `src/app/(auth)/signup/components/sections/PersonalInfoSection.tsx`
2. `src/app/(auth)/auth/reset-password/page.tsx`
3. `src/app/admin/setup-password/page.tsx`
4. `src/app/api/admin/setup-password/route.ts`
5. `src/app/admin/setup-password/SetupPassword.module.css`

### Files Created
1. `ADMIN_SETUP_GUIDE.md`
2. `CHANGES_SUMMARY.md`
3. `sql/admin-profiles-setup.sql`
4. `DEPLOYMENT_CHECKLIST.md`

### Supabase Requirements
- Bucket: `admin-profiles` (private, 5MB limit)
- Policies: 5 RLS policies on storage.objects
- Table: `admin_invitation_tokens` with indexes
- Column: `peso.profile_picture_url`

### Password Requirements
- ✓ 8+ characters
- ✓ Uppercase letter
- ✓ Lowercase letter
- ✓ Number
- ✓ Special character