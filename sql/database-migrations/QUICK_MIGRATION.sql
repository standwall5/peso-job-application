-- ============================================
-- QUICK MIGRATION: Notification System Enhancement
-- ============================================
-- Run this in Supabase SQL Editor
-- Estimated time: < 1 minute

-- Step 1: Add new columns to notifications table
ALTER TABLE notifications
ADD COLUMN IF NOT EXISTS job_id BIGINT,
ADD COLUMN IF NOT EXISTS job_title TEXT,
ADD COLUMN IF NOT EXISTS company_name TEXT,
ADD COLUMN IF NOT EXISTS company_logo TEXT;

-- Step 2: Add foreign key constraint
ALTER TABLE notifications
ADD CONSTRAINT notifications_job_id_fkey
FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE SET NULL;

-- Step 3: Update type constraint to include new notification types
ALTER TABLE notifications
DROP CONSTRAINT IF EXISTS notifications_type_check;

ALTER TABLE notifications
ADD CONSTRAINT notifications_type_check
CHECK (type = ANY (ARRAY[
  'application_update'::text,
  'new_job'::text,
  'exam_result'::text,
  'admin_message'::text,
  'referred'::text,
  'rejected'::text,
  'id_verified'::text,
  'application_completed'::text
]));

-- Step 4: Add ID verification columns to applicants
ALTER TABLE applicants
ADD COLUMN IF NOT EXISTS id_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS id_verified_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS id_verified_by BIGINT;

-- Step 5: Add foreign key for id_verified_by
ALTER TABLE applicants
ADD CONSTRAINT applicants_id_verified_by_fkey
FOREIGN KEY (id_verified_by) REFERENCES peso(id) ON DELETE SET NULL;

-- Step 6: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_notifications_job_id ON notifications(job_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_applicant_read ON notifications(applicant_id, is_read);
CREATE INDEX IF NOT EXISTS idx_applicants_id_verified ON applicants(id_verified);

-- Done! ✓
SELECT 'Migration completed successfully!' as status;
