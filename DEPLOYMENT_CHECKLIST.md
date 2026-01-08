# ID Change Tracking System - Deployment Checklist

## Pre-Deployment

### 1. Review Changes
- [ ] Read `IMPLEMENTATION_SUMMARY.md`
- [ ] Read `docs/ID_CHANGE_TRACKING.md`
- [ ] Review code changes in modified files
- [ ] Understand the system architecture

### 2. Backup Database
- [ ] Create database backup in Supabase
- [ ] Document current state
- [ ] Have rollback plan ready

## Deployment Steps

### Step 1: Database Migration

#### Via Supabase Dashboard (Recommended)
- [ ] Open Supabase project dashboard
- [ ] Navigate to SQL Editor
- [ ] Open `migrations/add_id_change_logs_table.sql`
- [ ] Copy entire contents
- [ ] Paste into SQL Editor
- [ ] Review the SQL before executing
- [ ] Click "Run" to execute
- [ ] Verify success message

#### Via Supabase CLI (Alternative)
```bash
# Navigate to project root
cd peso-job-application

# Push migration
supabase db push
```

### Step 2: Verify Database Changes

Run these queries in Supabase SQL Editor:

```sql
-- 1. Check table exists and structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'id_change_logs';

-- 2. Check indexes created
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'id_change_logs';

-- 3. Test helper function 1
SELECT get_id_change_count_for_application(1);
-- Should return: 0 (or error if application doesn't exist - that's ok)

-- 4. Test helper function 2
SELECT was_id_changed_after_submission(1);
-- Should return: false (or error if application doesn't exist - that's ok)

-- 5. Check table is empty (fresh migration)
SELECT COUNT(*) FROM id_change_logs;
-- Should return: 0
```

Expected Results:
- [ ] Table `id_change_logs` exists with all columns
- [ ] 4 indexes created (applicant_id, application_id, changed_at, change_type)
- [ ] Both helper functions execute without syntax errors
- [ ] Table is empty (0 rows)

### Step 3: Deploy Code Changes

#### Option A: Git Deployment (Vercel/Netlify)
```bash
# Commit changes
git add .
git commit -m "feat: Add ID change tracking system with audit trails"
git push origin main
```

#### Option B: Manual Deployment
- [ ] Build the application
- [ ] Deploy to production server
- [ ] Verify deployment successful

### Step 4: Verify Code Deployment

- [ ] Application starts without errors
- [ ] No console errors on page load
- [ ] TypeScript compilation successful
- [ ] No breaking changes in existing features

## Post-Deployment Testing

### Test Case 1: New Application (No Changes)
- [ ] Login as test applicant
- [ ] Browse to job opportunities
- [ ] Start new application
- [ ] Upload ID documents
- [ ] Complete exam (if required)
- [ ] Submit application
- [ ] Verify: `id_change_logs` shows 1 entry with `change_type = 'initial_upload'`

### Test Case 2: Update ID After Submission
- [ ] Login as applicant with existing application
- [ ] Go to Profile → Applications tab
- [ ] Click on submitted application
- [ ] Click "Verified ID" tab
- [ ] Verify warning banner displays:
  - "Application Already Submitted"
  - "You can still view and update your ID if needed"
  - "Changes will be logged and admins will be notified"
- [ ] Click on ID type dropdown (should work)
- [ ] Upload new ID images (Front, Back, Selfie)
- [ ] Click "Upload ID" button
- [ ] Verify success message: "ID updated successfully. Admins have been notified to review your changes."
- [ ] Check `id_change_logs` table:
  ```sql
  SELECT * FROM id_change_logs 
  WHERE change_type IN ('update', 'type_change')
  ORDER BY changed_at DESC LIMIT 1;
  ```
- [ ] Verify: New entry exists with correct `application_id`

### Test Case 3: Admin Notification
- [ ] After updating ID in Test Case 2
- [ ] Login as PESO admin
- [ ] Check notifications
- [ ] Verify: Notification received with message:
  - Title: "Applicant Updated ID"
  - Message includes applicant name, ID type, and application number
  - Has link to application
- [ ] Verify in database:
  ```sql
  SELECT * FROM notifications 
  WHERE type = 'id_changed'
  ORDER BY created_at DESC LIMIT 1;
  ```

### Test Case 4: Multiple ID Types
- [ ] Login as applicant
- [ ] Go to Profile → View ID section
- [ ] Upload "NATIONAL ID"
- [ ] Change dropdown to "DRIVER'S LICENSE"
- [ ] Upload different ID
- [ ] Change back to "NATIONAL ID"
- [ ] Verify: Original NATIONAL ID still shows
- [ ] Verify: Both IDs stored separately in system

### Test Case 5: Change History
Query change history in database:
```sql
-- Replace 123 with actual applicant_id
SELECT 
  id_type,
  change_type,
  changed_at,
  application_id
FROM id_change_logs 
WHERE applicant_id = 123
ORDER BY changed_at DESC;
```

- [ ] Verify: All changes logged chronologically
- [ ] Verify: `application_id` populated for post-submission changes
- [ ] Verify: `application_id` is NULL for profile-page uploads

## Monitoring (First 24-48 Hours)

### Database Monitoring
```sql
-- Check log growth rate
SELECT 
  DATE(changed_at) as date,
  COUNT(*) as changes,
  COUNT(DISTINCT applicant_id) as unique_applicants
FROM id_change_logs
GROUP BY DATE(changed_at)
ORDER BY date DESC;

-- Check change type distribution
SELECT 
  change_type,
  COUNT(*) as count
FROM id_change_logs
GROUP BY change_type;

-- Find applications with multiple changes
SELECT 
  application_id,
  COUNT(*) as change_count
FROM id_change_logs
WHERE application_id IS NOT NULL
GROUP BY application_id
HAVING COUNT(*) > 1
ORDER BY change_count DESC;
```

### Application Monitoring
- [ ] Monitor error logs for ID-related errors
- [ ] Check user support tickets/complaints
- [ ] Monitor notification delivery
- [ ] Check admin feedback

### Performance Check
- [ ] ID upload speed (should be unchanged)
- [ ] Application modal loading time
- [ ] Database query performance
- [ ] Storage bucket operations

## Rollback Plan (If Needed)

### If Issues Detected:

#### 1. Code Rollback
```bash
# Revert to previous commit
git revert HEAD
git push origin main
```

#### 2. Database Rollback (Use with Caution)
```sql
-- Run these in order:
DROP FUNCTION IF EXISTS was_id_changed_after_submission(INTEGER);
DROP FUNCTION IF EXISTS get_id_change_count_for_application(INTEGER);
DROP INDEX IF EXISTS idx_id_change_logs_change_type;
DROP INDEX IF EXISTS idx_id_change_logs_changed_at;
DROP INDEX IF EXISTS idx_id_change_logs_application_id;
DROP INDEX IF EXISTS idx_id_change_logs_applicant_id;
DROP TABLE IF EXISTS id_change_logs;
```

**⚠️ WARNING:** Only drop the table if absolutely necessary. You will lose all change history!

#### 3. Verify Rollback
- [ ] Application works without errors
- [ ] Existing applications unaffected
- [ ] Users can still upload IDs normally

## Success Criteria

✅ System is considered successfully deployed when:

- [ ] Database migration completed without errors
- [ ] All test cases pass
- [ ] Warning banner displays correctly
- [ ] ID changes are logged in database
- [ ] Admins receive notifications
- [ ] No errors in production logs
- [ ] No user complaints about ID upload
- [ ] Existing functionality unchanged
- [ ] Performance metrics stable

## Documentation Updates

- [ ] Update team wiki (if applicable)
- [ ] Brief admins on new notification type
- [ ] Create admin guide for reviewing ID changes
- [ ] Update user help documentation (if public-facing)

## Future Enhancements Tracking

Consider implementing later:
- [ ] Rate limiting (max 2-3 changes per application)
- [ ] Admin dashboard for ID change review
- [ ] Email notifications in addition to in-app
- [ ] Image comparison tool for admins
- [ ] Automated suspicious pattern detection
- [ ] Required reason field for changes
- [ ] Application status reset on ID change

## Sign-Off

Deployment completed by: _________________
Date: _________________
Verified by: _________________
Date: _________________

---

**Notes:**
- Keep this checklist with deployment records
- Document any issues encountered
- Update checklist if additional steps needed
- Share learnings with team