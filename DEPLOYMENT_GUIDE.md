# PESO Job Application System - Deployment Guide

## 🚀 Complete Deployment Checklist

This guide walks you through deploying all the new features to production.

---

## Pre-Deployment Checklist

### 1. Environment Setup

**Required Environment Variables:**

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Optional: Email Service (if using Resend/SendGrid)
RESEND_API_KEY=your-resend-api-key
# OR
SENDGRID_API_KEY=your-sendgrid-api-key

# Application URL
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

**Verify in Vercel Dashboard:**
- Go to Project Settings → Environment Variables
- Ensure all variables are set for Production, Preview, and Development

### 2. Code Configuration

**✅ Already Completed:**
- `FORCE_ADMIN_MODE = false` in `/src/utils/chatbot.ts`
- Sharp graceful degradation in `/src/app/api/admin/view-id/route.ts`
- Philippine Time timezone in chatbot

**Double-Check:**
```javascript
// In src/utils/chatbot.ts
export const FORCE_BOT_MODE = false;
export const FORCE_ADMIN_MODE = false; // ← Should be false for production
```

---

## Database Migration

### Step 1: Backup Existing Database

**In Supabase Dashboard:**
1. Go to Database → Backups
2. Click "Create Backup"
3. Wait for backup to complete
4. Download backup for safety

### Step 2: Run Migration Script

**Option A: Using Supabase SQL Editor**

1. Open Supabase Dashboard → SQL Editor
2. Click "New Query"
3. Copy entire contents of `/migrations/001_add_id_verification_features.sql`
4. Paste into SQL editor
5. Click "Run" or press `Ctrl+Enter`
6. Verify success message appears

**Option B: Using Supabase CLI**

```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Run migration
supabase db push
```

### Step 3: Verify Migration Success

Run these queries to verify tables were created:

```sql
-- Check if new columns exist
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'applicant_ids' 
AND column_name IN ('is_verified', 'status', 'is_preferred');

-- Check if new tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_name IN ('id_verification_logs', 'admin_presence');

-- Verify indexes
SELECT indexname 
FROM pg_indexes 
WHERE tablename IN ('applicant_ids', 'id_verification_logs', 'admin_presence');

-- Check RLS policies
SELECT tablename, policyname 
FROM pg_policies 
WHERE tablename IN ('id_verification_logs', 'admin_presence');
```

### Step 4: Enable Realtime

**In Supabase Dashboard:**
1. Go to Database → Replication
2. Find these tables and enable replication:
   - `admin_presence`
   - `notifications`
   - `chat_sessions`
   - `chat_messages`
3. Click "Enable" for each table

**Or via SQL:**
```sql
ALTER PUBLICATION supabase_realtime ADD TABLE admin_presence;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE chat_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;
```

---

## Storage Configuration

### Verify Storage Buckets

**In Supabase Dashboard → Storage:**

1. **applicant-ids** bucket:
   - Should exist and be private
   - RLS policies should allow authenticated users to upload their own IDs
   - Admins should be able to read all IDs

2. **Verify Bucket Policies:**

```sql
-- Policy: Users can upload their own IDs
CREATE POLICY "Users can upload own IDs" ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'applicant-ids' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Admins can view all IDs
CREATE POLICY "Admins can view all IDs" ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'applicant-ids'
  AND auth.uid() IN (SELECT auth_id FROM peso)
);
```

---

## Build & Deploy

### Step 1: Local Build Test

```bash
# Install dependencies
npm install

# Run type checking
npm run lint

# Build the application
npm run build

# Test the build locally
npm run start
```

**Fix any errors before proceeding!**

### Step 2: Commit Changes

```bash
# Check status
git status

# Add all changes
git add .

# Commit with descriptive message
git commit -m "feat: Add ID verification, archived companies, and notification system

- Implement ID verification workflow with admin approval
- Add ID rejection with notification system
- Create archived companies feature
- Fix sharp error for Vercel production
- Update chatbot to Philippine Time
- Add user preferred ID selection
- Clean up jobseeker table UI
- Add comprehensive database migrations"

# Push to main branch
git push origin main
```

### Step 3: Deploy to Vercel

**Automatic Deployment:**
- Vercel will automatically detect the push
- Build will start automatically
- Monitor build logs in Vercel dashboard

**Manual Deployment (if needed):**
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

### Step 4: Monitor Build

**In Vercel Dashboard:**
1. Go to Deployments
2. Click on the latest deployment
3. Monitor build logs
4. Wait for "Build Complete" status

**Common Build Issues:**

| Error | Solution |
|-------|----------|
| TypeScript errors | Fix type issues locally first |
| Module not found | Run `npm install` and verify package.json |
| Sharp installation | Already handled with graceful degradation |
| Environment variables | Ensure all required vars are set |

---

## Post-Deployment Testing

### Test Suite 1: ID Verification Flow

1. **As Admin:**
   - Login to admin panel
   - Navigate to Jobseekers
   - Click "View Details" on an applicant
   - Go to "Applied Jobs" tab
   - Click "View ID" on any application
   - ✅ Verify ID images load (with or without watermark)
   - Click "✓ Mark ID as Verified"
   - ✅ Verify success message appears
   - ✅ Check applicant receives notification

2. **As Applicant:**
   - Login as applicant
   - Check notifications (bell icon if implemented)
   - ✅ Verify "ID Verified Successfully" notification received

3. **ID Rejection Test:**
   - As Admin: Click "⚠️ Request ID Update"
   - Enter reason: "Photo is blurry, please reupload"
   - Click "Send Request"
   - ✅ Verify applicant receives notification
   - As Applicant: Click notification link
   - ✅ Verify redirected to profile ID section

### Test Suite 2: Archived Companies

1. **Archive a Company:**
   - Navigate to Company Profiles
   - Find a company
   - Click archive option
   - ✅ Verify company disappears from active list

2. **View Archived Companies:**
   - Navigate to `/admin/archived-companies`
   - ✅ Verify archived company appears
   - ✅ Test search functionality
   - Select company
   - Click "Unarchive Selected"
   - ✅ Verify company returns to active list

### Test Suite 3: Chatbot

1. **During Business Hours (8am-5pm PH Time):**
   - Login as applicant
   - Open chat widget
   - Send message: "Hello"
   - ✅ Verify admin receives chat request (not bot)

2. **Outside Business Hours:**
   - Access site outside 8am-5pm Philippine Time
   - Open chat widget
   - Send message: "Hello"
   - ✅ Verify bot responds automatically
   - ✅ Verify bot shows office hours message

3. **Bot Knowledge Test:**
   - Ask: "How do I apply for a job?"
   - ✅ Verify bot provides helpful response with buttons
   - Ask: "What are your office hours?"
   - ✅ Verify bot shows Monday-Friday, 8am-5pm

### Test Suite 4: Preferred ID Selection

**Note: Requires UI implementation**

1. As Applicant:
   - Navigate to Profile → View ID
   - ✅ See dropdown with ID types
   - Select preferred ID
   - Click "Save"
   - ✅ Verify success message

2. As Admin:
   - View applicant ID
   - ✅ Verify correct (preferred) ID is shown

### Test Suite 5: Database Verification

```sql
-- Test 1: Check verified IDs
SELECT COUNT(*) FROM applicant_ids WHERE is_verified = true;

-- Test 2: Check verification logs
SELECT * FROM id_verification_logs ORDER BY timestamp DESC LIMIT 10;

-- Test 3: Check admin presence (if implemented)
SELECT * FROM admin_presence;

-- Test 4: Check notifications
SELECT type, COUNT(*) FROM notifications GROUP BY type;

-- Test 5: Verify views work
SELECT * FROM verified_applicants LIMIT 5;
SELECT * FROM pending_id_verifications LIMIT 5;
SELECT * FROM online_admins;
```

---

## Performance Optimization

### 1. Database Indexes

Verify these indexes exist (created by migration):

```sql
-- Should return multiple rows
SELECT schemaname, tablename, indexname 
FROM pg_indexes 
WHERE tablename IN ('applicant_ids', 'id_verification_logs', 'admin_presence')
ORDER BY tablename, indexname;
```

### 2. Image Loading

**Monitor Sharp Performance:**
- Check Vercel function logs for sharp errors
- If watermarking fails frequently, verify build settings
- Images should load even without watermark (fallback)

### 3. Realtime Subscriptions

**Prevent Memory Leaks:**
- Ensure components unsubscribe from realtime on unmount
- Monitor active connection count in Supabase Dashboard

---

## Monitoring & Logging

### Vercel Logs

**Access Logs:**
1. Vercel Dashboard → Project → Logs
2. Filter by:
   - Runtime Logs (server errors)
   - Build Logs (deployment issues)
   - Edge Logs (API routes)

**Key Things to Monitor:**
- Sharp import errors (should fallback gracefully)
- API route errors
- Database connection issues
- Notification delivery failures

### Supabase Logs

**Access Logs:**
1. Supabase Dashboard → Logs
2. Monitor:
   - Database queries
   - Storage access
   - Auth events
   - Realtime connections

### Error Tracking

**Common Errors to Watch:**

| Error | Cause | Solution |
|-------|-------|----------|
| "Sharp not found" | Build issue | Already handled with fallback |
| "Unauthorized" | Missing auth | Check RLS policies |
| "Notification failed" | DB error | Check notification service logs |
| "Image load failed" | Storage issue | Verify bucket permissions |

---

## Rollback Procedure

### If Deployment Fails:

1. **Immediate Rollback (Vercel):**
   ```bash
   vercel rollback
   ```
   Or in Vercel Dashboard → Deployments → Click previous deployment → "Promote to Production"

2. **Database Rollback:**
   ```sql
   -- Restore from backup created earlier
   -- In Supabase Dashboard → Database → Backups → Restore
   ```

3. **Code Rollback:**
   ```bash
   git revert HEAD
   git push origin main
   ```

---

## Production Checklist

### Final Verification

- [ ] All environment variables set in Vercel
- [ ] Database migration completed successfully
- [ ] Storage buckets configured correctly
- [ ] Realtime enabled for required tables
- [ ] Build completed without errors
- [ ] Production URL accessible
- [ ] Admin can login
- [ ] Applicant can login
- [ ] ID verification flow works
- [ ] Notifications are sent
- [ ] Chatbot responds correctly
- [ ] Images load (with or without watermark)
- [ ] Archived companies feature works
- [ ] No console errors in browser
- [ ] Mobile responsive (test on phone)

### Performance Checks

- [ ] Page load time < 3 seconds
- [ ] API response time < 1 second
- [ ] Images load quickly
- [ ] No memory leaks
- [ ] Realtime updates work instantly

### Security Checks

- [ ] RLS policies active on all tables
- [ ] API routes require authentication
- [ ] Admin routes require admin role
- [ ] Storage buckets are private
- [ ] ID images are watermarked (when possible)
- [ ] No sensitive data in logs
- [ ] HTTPS enabled

---

## Support & Troubleshooting

### Common Issues

**Issue: Sharp watermark not working**
- **Expected:** Images should still load without watermark
- **Check:** Vercel function logs for sharp errors
- **Solution:** This is expected behavior, fallback is working correctly

**Issue: Chatbot always shows bot (not connecting to admin)**
- **Check:** Philippine Time calculation in `chatbot.ts`
- **Verify:** `FORCE_ADMIN_MODE = false`
- **Test:** Access during business hours (8am-5pm PH Time)

**Issue: Notifications not appearing**
- **Check:** Database `notifications` table has new entries
- **Verify:** Realtime is enabled for `notifications` table
- **Test:** API route `/api/notifications` returns data

**Issue: ID verification not saving**
- **Check:** Database migration completed
- **Verify:** `applicant_ids` table has new columns
- **Test:** API route `/api/admin/verify-id` returns success

### Getting Help

**Logs to Collect:**
1. Browser console errors (F12 → Console)
2. Network tab errors (F12 → Network)
3. Vercel function logs
4. Supabase database logs

**Support Resources:**
- Next.js Documentation: https://nextjs.org/docs
- Supabase Documentation: https://supabase.com/docs
- Vercel Documentation: https://vercel.com/docs

---

## Maintenance

### Regular Tasks

**Daily:**
- Monitor error logs
- Check notification delivery
- Verify realtime connections

**Weekly:**
- Review database performance
- Check storage usage
- Verify backup completion
- Review ID verification logs

**Monthly:**
- Update dependencies
- Review security policies
- Performance optimization
- User feedback review

### Backup Strategy

**Automated Backups (Supabase):**
- Daily automated backups (if enabled on paid plan)
- Keep 7 days of backups

**Manual Backups:**
- Before major deployments
- Before database migrations
- Monthly full backup

---

## Next Steps

### Future Enhancements

1. **Notification Bell UI**
   - Create bell component in navbar
   - Show unread count
   - Dropdown with notifications

2. **Admin Presence UI**
   - Implement useAdminPresence hook
   - Show online indicators
   - Real-time status updates

3. **Email Integration**
   - Configure email service (Resend/SendGrid)
   - Create email templates
   - Test email delivery

4. **Analytics**
   - Track ID verification rate
   - Monitor notification engagement
   - Measure chatbot effectiveness

### Optimization Opportunities

1. **Caching:**
   - Cache company logos
   - Cache user profiles
   - Reduce database queries

2. **Performance:**
   - Lazy load components
   - Optimize images
   - Reduce bundle size

3. **User Experience:**
   - Add loading skeletons
   - Improve error messages
   - Add success animations

---

## Conclusion

Your PESO Job Application System is now deployed with:
- ✅ ID Verification with admin approval
- ✅ ID Rejection with notifications
- ✅ Archived Companies management
- ✅ Production-ready chatbot (Philippine Time)
- ✅ Robust error handling (Sharp fallback)
- ✅ Comprehensive database structure
- ✅ Audit logging and security

**Production Status:** Ready for use! 🎉

Monitor the system for the first 24-48 hours and address any issues that arise. Most features are backend-complete, with some UI integration still pending.

---

**Document Version:** 1.0
**Last Updated:** 2024
**Deployment Target:** Vercel + Supabase