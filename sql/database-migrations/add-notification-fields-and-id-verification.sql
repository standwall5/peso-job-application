-- Migration: Add notification fields and ID verification
-- Description: Updates notifications table and adds id_verified to applicants
-- Date: 2024
-- IMPORTANT: This migration works with the existing database structure

-- ============================================
-- PART 1: Update Notifications Table
-- ============================================

-- Add new columns to notifications table
ALTER TABLE notifications
ADD COLUMN IF NOT EXISTS job_id BIGINT REFERENCES jobs(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS job_title TEXT,
ADD COLUMN IF NOT EXISTS company_name TEXT,
ADD COLUMN IF NOT EXISTS company_logo TEXT;

-- Update the type constraint to include new notification types
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

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_notifications_job_id ON notifications(job_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_applicant_read ON notifications(applicant_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);


-- ============================================
-- PART 2: Add ID Verification to Applicants
-- ============================================

-- Add id_verified column to applicants table
ALTER TABLE applicants
ADD COLUMN IF NOT EXISTS id_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS id_verified_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS id_verified_by BIGINT REFERENCES peso(id) ON DELETE SET NULL;

-- Add index for quick filtering of verified applicants
CREATE INDEX IF NOT EXISTS idx_applicants_id_verified ON applicants(id_verified);


-- ============================================
-- PART 3: Add Comments for Documentation
-- ============================================

COMMENT ON COLUMN notifications.job_id IS 'Foreign key to jobs table, used for application-related notifications';
COMMENT ON COLUMN notifications.job_title IS 'Cached job title for display in notifications';
COMMENT ON COLUMN notifications.company_name IS 'Cached company name for display in notifications';
COMMENT ON COLUMN notifications.company_logo IS 'Cached company logo URL for display in notifications';

COMMENT ON COLUMN applicants.id_verified IS 'Whether the applicant ID has been verified by admin';
COMMENT ON COLUMN applicants.id_verified_at IS 'Timestamp when ID was verified';
COMMENT ON COLUMN applicants.id_verified_by IS 'Admin (PESO) who verified the ID';


-- ============================================
-- PART 4: Update existing notifications (Optional)
-- ============================================

-- Mark any existing 'application_update' notifications as 'referred' if status is positive
-- This is optional and can be commented out if not needed
-- UPDATE notifications
-- SET type = 'referred'
-- WHERE type = 'application_update'
-- AND title ILIKE '%accepted%' OR title ILIKE '%approved%' OR title ILIKE '%referred%';


-- ============================================
-- PART 5: Create helper function for notification cleanup
-- ============================================

-- Function to automatically delete old read notifications (older than 90 days)
CREATE OR REPLACE FUNCTION cleanup_old_notifications()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM notifications
  WHERE is_read = TRUE
  AND created_at < NOW() - INTERVAL '90 days';

  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION cleanup_old_notifications() IS 'Deletes read notifications older than 90 days. Returns count of deleted rows.';


-- ============================================
-- PART 6: Verification and Testing
-- ============================================

-- Verify the changes were applied correctly
DO $$
BEGIN
  -- Check if new columns exist in notifications
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'notifications'
    AND column_name = 'job_id'
  ) THEN
    RAISE NOTICE '✓ notifications.job_id column added successfully';
  END IF;

  -- Check if new columns exist in applicants
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'applicants'
    AND column_name = 'id_verified'
  ) THEN
    RAISE NOTICE '✓ applicants.id_verified column added successfully';
  END IF;

  -- Check if indexes were created
  IF EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE indexname = 'idx_notifications_job_id'
  ) THEN
    RAISE NOTICE '✓ Indexes created successfully';
  END IF;

  RAISE NOTICE '✓ Migration completed successfully!';
END $$;


-- ============================================
-- ROLLBACK INSTRUCTIONS (if needed)
-- ============================================

-- To rollback this migration, run the following:
/*
-- Drop new columns from notifications
ALTER TABLE notifications
DROP COLUMN IF EXISTS job_id,
DROP COLUMN IF EXISTS job_title,
DROP COLUMN IF EXISTS company_name,
DROP COLUMN IF EXISTS company_logo;

-- Restore original type constraint
ALTER TABLE notifications
DROP CONSTRAINT IF EXISTS notifications_type_check;

ALTER TABLE notifications
ADD CONSTRAINT notifications_type_check
CHECK (type = ANY (ARRAY[
  'application_update'::text,
  'new_job'::text,
  'exam_result'::text,
  'admin_message'::text
]));

-- Drop indexes
DROP INDEX IF EXISTS idx_notifications_job_id;
DROP INDEX IF EXISTS idx_notifications_type;
DROP INDEX IF EXISTS idx_notifications_applicant_read;
DROP INDEX IF EXISTS idx_notifications_created_at;

-- Drop new columns from applicants
ALTER TABLE applicants
DROP COLUMN IF EXISTS id_verified,
DROP COLUMN IF EXISTS id_verified_at,
DROP COLUMN IF EXISTS id_verified_by;

DROP INDEX IF EXISTS idx_applicants_id_verified;

-- Drop helper function
DROP FUNCTION IF EXISTS cleanup_old_notifications();
*/
