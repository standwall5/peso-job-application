# Resume Upload Feature - Quick Start Guide

**Last Updated:** 2024  
**Time to Deploy:** ~15 minutes

---

## Overview

This guide will get the Resume Upload & OCR feature up and running in production quickly.

---

## Prerequisites

✅ Supabase project access  
✅ Database admin access  
✅ Node.js environment running  
✅ Code already deployed to your server

---

## 5-Step Quick Setup

### Step 1: Database Migration (3 minutes)

1. Open Supabase Dashboard
2. Go to **SQL Editor**
3. Copy and paste from `sql/add_resume_columns.sql`
4. Click **Run**

**Verify:**
```sql
SELECT resume_url, resume_uploaded_at FROM applicants LIMIT 1;
```
Should return columns (with NULL values).

---

### Step 2: Create Storage Bucket (2 minutes)

1. Go to **Storage** in Supabase Dashboard
2. Click **Create bucket**
3. Enter:
   - Name: `resumes`
   - Public: ❌ **OFF**
   - File size limit: `10485760` (10MB)
4. Click **Create**

**Allowed MIME types:**
- `application/pdf`
- `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
- `image/jpeg`
- `image/png`

---

### Step 3: Storage Policies (5 minutes)

Go to **Storage → Policies** and create these 5 policies:

#### Policy 1: Upload (INSERT)
```sql
CREATE POLICY "Users can upload their own resumes"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'resumes' AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM applicants WHERE auth_id = auth.uid()
  )
);
```

#### Policy 2: Read (SELECT)
```sql
CREATE POLICY "Users can read their own resumes"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'resumes' AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM applicants WHERE auth_id = auth.uid()
  )
);
```

#### Policy 3: Update (UPDATE)
```sql
CREATE POLICY "Users can update their own resumes"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'resumes' AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM applicants WHERE auth_id = auth.uid()
  )
);
```

#### Policy 4: Delete (DELETE)
```sql
CREATE POLICY "Users can delete their own resumes"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'resumes' AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM applicants WHERE auth_id = auth.uid()
  )
);
```

#### Policy 5: Admin Read
```sql
CREATE POLICY "Admins can read all resumes"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'resumes' AND
  EXISTS (
    SELECT 1 FROM peso
    WHERE peso.auth_id = auth.uid()
  )
);
```

---

### Step 4: Verify Environment Variables (1 minute)

Check your `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://[YOUR_PROJECT].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

✅ All three must be present and correct.

---

### Step 5: Test the Feature (4 minutes)

1. **Login as test user**
2. Go to **Profile → Edit Resume**
3. Click **Upload Resume** (purple banner)
4. Upload a test PDF resume
5. Verify:
   - ✅ Text extraction works
   - ✅ Data preview shows
   - ✅ "Confirm & Apply Data" populates fields
   - ✅ File appears in Storage bucket
   - ✅ `resume_url` saved in database

**Test Query:**
```sql
SELECT id, name, resume_url, resume_uploaded_at 
FROM applicants 
WHERE resume_url IS NOT NULL;
```

---

## Verification Checklist

Before announcing to users:

- [ ] Database columns exist
- [ ] Storage bucket created (private)
- [ ] All 5 policies active
- [ ] Test upload successful
- [ ] Auto-fill works correctly
- [ ] Old resume deleted on new upload
- [ ] Mobile view works
- [ ] Error handling tested

---

## Common Issues & Quick Fixes

### "Bucket not found"
**Fix:** Verify bucket name is exactly `resumes` (lowercase)

### "Permission denied"
**Fix:** Check all 5 storage policies are created and enabled

### "No text extracted"
**Fix:** Normal for scanned PDFs - user can enter manually

### "File too large"
**Fix:** File exceeds 10MB - user needs to compress

---

## User Announcement Template

```
📢 NEW FEATURE: Resume Upload

Save time creating your profile! You can now upload your resume 
and we'll automatically fill in your information.

How to use:
1. Go to Profile → Edit Resume
2. Click "Upload Resume"
3. Drag & drop your PDF/Word resume
4. Review extracted data
5. Click "Confirm & Apply Data"

Supported: PDF, DOCX, images (max 10MB)

Questions? Contact PESO support.
```

---

## Monitoring

### First Week
- Check error logs daily
- Monitor upload success rate
- Collect user feedback
- Review parsing accuracy

### Query: Recent Uploads
```sql
SELECT 
  COUNT(*) as total_uploads,
  COUNT(DISTINCT applicant_id) as unique_users
FROM storage.objects 
WHERE bucket_id = 'resumes' 
  AND created_at >= NOW() - INTERVAL '7 days';
```

---

## Support Resources

- **Full Documentation:** `docs/RESUME_UPLOAD_FEATURE.md`
- **Setup Guide:** `docs/RESUME_UPLOAD_SETUP.md`
- **User Guide:** `docs/RESUME_UPLOAD_USER_GUIDE.md`
- **Implementation:** `docs/RESUME_UPLOAD_IMPLEMENTATION.md`

---

## Rollback (Emergency)

If critical issues arise:

```sql
-- Hide feature (temporary)
-- Comment out upload banner in ResumeEditSection.tsx

-- Full rollback (if needed)
ALTER TABLE applicants DROP COLUMN resume_url;
ALTER TABLE applicants DROP COLUMN resume_uploaded_at;
DELETE FROM storage.objects WHERE bucket_id = 'resumes';
DELETE FROM storage.buckets WHERE id = 'resumes';
```

---

## Success Metrics

Track these in first 30 days:

- **Adoption Rate:** % of users who upload
- **Success Rate:** % of successful uploads
- **Time Savings:** Average time to fill profile
- **User Satisfaction:** Feedback score

**Target:** 60%+ adoption, 90%+ success rate

---

## Next Steps After Deployment

1. ✅ Feature is live
2. Monitor for 1 week
3. Collect user feedback
4. Iterate on parsing accuracy
5. Consider Phase 2 enhancements (advanced OCR, AI parsing)

---

## Need Help?

- **Technical Issues:** Check `docs/RESUME_UPLOAD_SETUP.md` troubleshooting
- **User Questions:** Share `docs/RESUME_UPLOAD_USER_GUIDE.md`
- **Code Questions:** Review `docs/RESUME_UPLOAD_IMPLEMENTATION.md`

---

**🎉 You're Ready to Launch!**

The Resume Upload feature is now configured and ready for users.

Good luck! 🚀