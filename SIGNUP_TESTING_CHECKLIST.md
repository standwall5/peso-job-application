# Signup Fixes - Quick Testing Checklist

Use this checklist to verify both signup fixes are working correctly.

---

## ✅ Pre-Testing Setup

- [ ] Code changes deployed to test environment
- [ ] Database accessible for verification
- [ ] Browser dev tools open (F12)
- [ ] Test email account ready

---

## Test 1: Extension Name "none" Fix

### Test 1A: Select "none" as Extension
- [ ] Navigate to signup page
- [ ] Fill in First Name: `Test`
- [ ] Fill in Middle Name: `Middle`
- [ ] Fill in Last Name: `User`
- [ ] Extension Name: Select or type `none`
- [ ] Complete rest of form
- [ ] Click Submit

**Verify in Database:**
```sql
SELECT name FROM applicants WHERE email = 'your-test-email@example.com';
```
- [ ] Name should be: `Test Middle User` (NO "none" at the end)

---

### Test 1B: Enter "NONE" (uppercase)
- [ ] Repeat Test 1A with extension: `NONE`
- [ ] Verify name doesn't include "NONE"

---

### Test 1C: Enter actual extension
- [ ] Fill signup form
- [ ] Extension Name: `Jr.`
- [ ] Submit form

**Verify in Database:**
- [ ] Name should be: `Test Middle User Jr.`
- [ ] Extension is properly included

---

### Test 1D: Leave extension empty
- [ ] Fill signup form
- [ ] Leave Extension Name blank
- [ ] Submit form

**Verify in Database:**
- [ ] Name should be: `Test Middle User`
- [ ] No extra spaces or "none"

---

## Test 2: Signup Redirect Fix

### Test 2A: Complete Signup Flow
- [ ] Go to `/signup`
- [ ] Fill out complete form with valid data
- [ ] Click "Submit"
- [ ] Wait for success modal

**Expected:**
- [ ] Modal appears with: "Signup successful! Please check your email..."
- [ ] Modal has "Back to login" button

---

### Test 2B: Click "Back to Login"
- [ ] Click "Back to login" button in success modal

**Expected:**
- [ ] Redirected to `/login` page ✅
- [ ] NOT redirected to `/job-opportunities` ❌
- [ ] See login form with email/password fields

---

### Test 2C: Verify User is Signed Out
- [ ] After clicking "Back to login", check browser console
- [ ] Try to manually navigate to `/job-opportunities`

**Expected:**
- [ ] Redirected back to `/login` or public page
- [ ] Cannot access private pages
- [ ] No active session cookie

**Verify in Dev Tools:**
```
Application → Cookies → Check for Supabase auth token
```
- [ ] No active auth token present

---

### Test 2D: Attempt Login Before Email Verification
- [ ] On login page, enter signup email and password
- [ ] Click "Login"

**Expected:**
- [ ] Login fails with message about email verification
- [ ] OR redirected to verify email page

---

### Test 2E: Verify Email and Login
- [ ] Check email inbox for verification email
- [ ] Click verification link
- [ ] Return to login page
- [ ] Enter credentials
- [ ] Click "Login"

**Expected:**
- [ ] Login successful ✅
- [ ] Redirected to `/job-opportunities`
- [ ] Can access private pages

---

## Database Verification

### Check Auth Table
```sql
-- Verify user was created but signed out
SELECT id, email, email_confirmed_at, created_at
FROM auth.users
WHERE email = 'your-test-email@example.com';
```

**Verify:**
- [ ] User exists
- [ ] `email_confirmed_at` is NULL (before verification)
- [ ] `created_at` timestamp is recent

---

### Check Applicants Table
```sql
-- Verify applicant data is correct
SELECT id, name, phone, email, auth_id
FROM applicants
WHERE email = 'your-test-email@example.com';
```

**Verify:**
- [ ] Record exists
- [ ] Name doesn't contain "none"
- [ ] All data matches signup form
- [ ] `auth_id` matches auth.users.id

---

## Edge Cases

### Test 3A: Multiple "none" Variations
Test these extension values:
- [ ] `none`
- [ ] `None`
- [ ] `NONE`
- [ ] `nOnE`

**All should result in:** No extension in database

---

### Test 3B: Rapid Form Submission
- [ ] Fill form
- [ ] Click Submit
- [ ] Immediately click Submit again

**Expected:**
- [ ] Only one account created
- [ ] No duplicate entries
- [ ] Appropriate error handling

---

### Test 3C: Browser Back Button After Signup
- [ ] Complete signup
- [ ] See success modal
- [ ] Click "Back to login"
- [ ] On login page, click browser back button

**Expected:**
- [ ] Don't return to authenticated state
- [ ] Signup form is reset or stays on login page

---

## Regression Testing

### Test Other Signup Fields
- [ ] Phone number validation works
- [ ] Password requirements enforced
- [ ] Required fields validated
- [ ] File uploads work (if applicable)
- [ ] Date picker works
- [ ] Gender selection works
- [ ] Applicant type selection works

---

## Sign-Off

### Issue 1: Extension Name ✅
- [ ] "none" is NOT saved to database
- [ ] Actual extensions (Jr., Sr.) ARE saved
- [ ] Empty extension handled correctly
- [ ] Case-insensitive handling works

### Issue 2: Signup Redirect ✅
- [ ] User signed out after signup
- [ ] "Back to login" redirects to `/login`
- [ ] Cannot access private pages after signup
- [ ] Must verify email to login
- [ ] Login works after verification

---

## Notes

**Test Date:** _______________

**Tested By:** _______________

**Environment:** _______________

**Issues Found:** 
- 
- 
- 

**All Tests Passed:** [ ] YES  [ ] NO

**Ready for Production:** [ ] YES  [ ] NO

---

## Rollback Instructions

If tests fail and you need to revert:

1. Git revert the changes:
   ```bash
   git log --oneline  # Find the commit hash
   git revert <commit-hash>
   ```

2. Or manually edit `src/lib/auth-actions.ts`:
   - Line 69: Change back to `const extName = extNameRaw === "" ? null : extNameRaw;`
   - Lines 159-160: Remove `await supabase.auth.signOut();`

3. Redeploy application

---

**Status:** 🟢 Ready for Testing