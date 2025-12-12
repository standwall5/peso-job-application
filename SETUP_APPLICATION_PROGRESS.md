# Application Progress Tracking Setup

## Overview

This document describes the new job application flow with online progress tracking.

## New Application Flow

### Step 1: Preview Resume
- User views their resume (no API call, just preview)
- User can edit their profile
- Click "Continue to Exam" to proceed
- Progress saved: `resume_viewed: true`
- Toast notification: "Resume Reviewed ✓"

### Step 2: Take Exam
- User must complete the exam
- Exam results are saved and displayed
- Progress saved: `exam_completed: true`
- Toast notification: "Exam Submitted! 🎉 Score: X%"
- User can review their exam results

### Step 3: Upload Verified ID
- Requires exam completion first
- User uploads government ID (front & back) + selfie
- Progress saved: `verified_id_uploaded: true`
- Toast notification: "Verified ID Uploaded! ✓"

### Step 4: Final Application Submission
- Only available after ALL 3 steps are complete
- This is the ONLY step that calls `/api/submitResume`
- Creates the actual application record in the database
- Toast notification: "Application Submitted! 🎉"
- Progress is cleared after successful submission

## Database Setup

### 1. Create the `application_progress` table

Run the SQL migration located at `sql/create_application_progress_table.sql`:

```sql
-- Run this in your Supabase SQL Editor
-- File: sql/create_application_progress_table.sql

CREATE TABLE IF NOT EXISTS application_progress (
  id BIGSERIAL PRIMARY KEY,
  job_id BIGINT NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  applicant_id NUMERIC NOT NULL REFERENCES applicants(id) ON DELETE CASCADE,
  resume_viewed BOOLEAN DEFAULT FALSE,
  exam_completed BOOLEAN DEFAULT FALSE,
  verified_id_uploaded BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(job_id, applicant_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_application_progress_applicant ON application_progress(applicant_id);
CREATE INDEX IF NOT EXISTS idx_application_progress_job ON application_progress(job_id);

-- RLS Policies (if enabled)
ALTER TABLE application_progress ENABLE ROW LEVEL SECURITY;

-- ... (see full file for all policies)
```

### 2. Verify the table was created

```sql
SELECT * FROM application_progress LIMIT 1;
```

## API Endpoints

### GET `/api/application-progress`
- Fetch all progress for the current user
- Query param: `?jobId=123` (optional) to get specific job progress

**Response:**
```json
{
  "progress": [
    {
      "job_id": 123,
      "applicant_id": 456,
      "resume_viewed": true,
      "exam_completed": true,
      "verified_id_uploaded": false,
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T01:00:00Z"
    }
  ]
}
```

### POST `/api/application-progress`
- Save/update progress for a job

**Request:**
```json
{
  "jobId": 123,
  "resumeViewed": true,
  "examCompleted": false,
  "verifiedIdUploaded": false
}
```

**Response:**
```json
{
  "success": true,
  "data": { /* progress record */ }
}
```

### DELETE `/api/application-progress?jobId=123`
- Clear progress for a specific job
- Called automatically after final application submission

## Key Features

### 1. Online Progress Tracking
- Progress is saved to the database (not localStorage)
- Persists across devices and sessions
- Automatically synced when user opens a job modal

### 2. Toast Notifications
- Replaced all `alert()` calls with Toast component
- Clean, professional notifications
- Auto-dismisses after 3 seconds

### 3. Smart Validation
- Can't access exam without viewing resume first
- Can't access verified ID without completing exam
- Can't submit application without all 3 steps complete

### 4. Already Submitted Jobs
- Shows "Application Submitted" status
- All tabs are view-only
- No duplicate submissions allowed

## Component Structure

### PrivateJobList.tsx
Main component that orchestrates the flow:
- Manages application progress state
- Handles Toast notifications
- Controls navigation between tabs
- Validates step completion

### Key State Variables
```typescript
const [applicationProgress, setApplicationProgress] = useState<
  Record<number, ApplicationProgress>
>({});

const [toast, setToast] = useState({
  show: false,
  title: "",
  message: "",
});
```

### Key Functions
- `fetchProgress()` - Loads all progress from API
- `updateProgress()` - Saves progress to API (optimistic update)
- `submitFinalApplication()` - Final submission after all steps
- `showToast()` - Display toast notifications

## Testing Checklist

- [ ] Run SQL migration to create `application_progress` table
- [ ] Verify RLS policies are working
- [ ] Test resume preview (should auto-mark as viewed)
- [ ] Test exam submission (should save progress)
- [ ] Test verified ID upload (should save progress)
- [ ] Test final application submission
- [ ] Test progress persistence across page refreshes
- [ ] Test that already-submitted jobs show correct status
- [ ] Test all Toast notifications appear correctly
- [ ] Test validation (can't skip steps)

## Migration Notes

### Breaking Changes
- `/api/submitResume` is now called ONLY after all steps are complete
- Previous flow allowed resume submission immediately - this no longer happens
- User applications are now created at the END of the process, not the beginning

### Data Migration (if needed)
If you have existing applications that need progress records:

```sql
-- Create progress records for existing applications
INSERT INTO application_progress (job_id, applicant_id, resume_viewed, exam_completed, verified_id_uploaded)
SELECT 
  a.job_id,
  a.applicant_id,
  true, -- resume_viewed (they already applied)
  CASE WHEN ea.id IS NOT NULL THEN true ELSE false END, -- exam_completed
  CASE WHEN vi.id IS NOT NULL THEN true ELSE false END  -- verified_id_uploaded
FROM applications a
LEFT JOIN exam_attempts ea ON ea.job_id = a.job_id AND ea.applicant_id = a.applicant_id
LEFT JOIN verified_ids vi ON vi.job_id = a.job_id AND vi.applicant_id = a.applicant_id
ON CONFLICT (job_id, applicant_id) DO NOTHING;
```

## Troubleshooting

### Progress not saving
- Check browser console for API errors
- Verify `application_progress` table exists
- Check RLS policies allow current user to insert/update

### Toast not showing
- Verify `Toast.tsx` component exists at `src/components/toast/Toast.tsx`
- Check `Toast.module.css` is present
- Ensure Toast state is being updated correctly

### Can't submit application
- Verify all 3 steps are complete in `application_progress` table
- Check exam attempt exists in `exam_attempts` table
- Verify verified ID was uploaded successfully

## Future Enhancements

- [ ] Add progress bar showing % completion (0%, 33%, 66%, 100%)
- [ ] Email notifications for each step completion
- [ ] Admin dashboard to view applicant progress
- [ ] Ability to save exam answers as draft before submission
- [ ] Resume upload history/versioning

---

## 👊 Brofist

You made it to the end! This new application flow is now fully documented and ready to go. Remember to:
1. Run the SQL migration
2. Test all the steps thoroughly
3. Verify Toast notifications work properly
4. Check progress persistence across sessions

Good luck with your PESO Job Application system! 🚀