-- Migration: Add ID Change Logs Table
-- Purpose: Track all changes to applicant ID documents for audit trail and admin oversight
-- Date: 2024

-- Create the id_change_logs table
CREATE TABLE IF NOT EXISTS id_change_logs (
  id SERIAL PRIMARY KEY,
  applicant_id INTEGER NOT NULL REFERENCES applicants(id) ON DELETE CASCADE,
  application_id INTEGER REFERENCES applications(id) ON DELETE SET NULL,
  id_type TEXT NOT NULL,
  change_type TEXT NOT NULL CHECK (change_type IN ('initial_upload', 'update', 'type_change')),
  old_id_front_url TEXT,
  old_id_back_url TEXT,
  old_selfie_url TEXT,
  new_id_front_url TEXT NOT NULL,
  new_id_back_url TEXT NOT NULL,
  new_selfie_url TEXT NOT NULL,
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address TEXT,
  user_agent TEXT
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_id_change_logs_applicant_id ON id_change_logs(applicant_id);
CREATE INDEX IF NOT EXISTS idx_id_change_logs_application_id ON id_change_logs(application_id);
CREATE INDEX IF NOT EXISTS idx_id_change_logs_changed_at ON id_change_logs(changed_at DESC);
CREATE INDEX IF NOT EXISTS idx_id_change_logs_change_type ON id_change_logs(change_type);

-- Add comments for documentation
COMMENT ON TABLE id_change_logs IS 'Audit trail for all applicant ID document changes';
COMMENT ON COLUMN id_change_logs.applicant_id IS 'Reference to the applicant who changed their ID';
COMMENT ON COLUMN id_change_logs.application_id IS 'Reference to the specific application (if changed after submission)';
COMMENT ON COLUMN id_change_logs.change_type IS 'Type of change: initial_upload, update, or type_change';
COMMENT ON COLUMN id_change_logs.old_id_front_url IS 'Previous front ID image path (null for initial uploads)';
COMMENT ON COLUMN id_change_logs.new_id_front_url IS 'New front ID image path';
COMMENT ON COLUMN id_change_logs.changed_at IS 'Timestamp of when the change occurred';
COMMENT ON COLUMN id_change_logs.ip_address IS 'IP address of the user making the change';
COMMENT ON COLUMN id_change_logs.user_agent IS 'Browser user agent string';

-- Create a function to get ID change count for an application
CREATE OR REPLACE FUNCTION get_id_change_count_for_application(app_id INTEGER)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)
    FROM id_change_logs
    WHERE application_id = app_id
    AND change_type IN ('update', 'type_change')
  );
END;
$$ LANGUAGE plpgsql;

-- Create a function to check if ID was changed after application submission
CREATE OR REPLACE FUNCTION was_id_changed_after_submission(app_id INTEGER)
RETURNS BOOLEAN AS $$
DECLARE
  app_date TIMESTAMP;
  change_exists BOOLEAN;
BEGIN
  -- Get application submission date
  SELECT applied_date INTO app_date
  FROM applications
  WHERE id = app_id;

  IF app_date IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Check if any ID changes occurred after submission
  SELECT EXISTS(
    SELECT 1
    FROM id_change_logs
    WHERE application_id = app_id
    AND changed_at > app_date
    AND change_type IN ('update', 'type_change')
  ) INTO change_exists;

  RETURN change_exists;
END;
$$ LANGUAGE plpgsql;

-- Rollback instructions (comment out for safety):
/*
-- To rollback this migration, run:
DROP FUNCTION IF EXISTS was_id_changed_after_submission(INTEGER);
DROP FUNCTION IF EXISTS get_id_change_count_for_application(INTEGER);
DROP INDEX IF EXISTS idx_id_change_logs_change_type;
DROP INDEX IF EXISTS idx_id_change_logs_changed_at;
DROP INDEX IF EXISTS idx_id_change_logs_application_id;
DROP INDEX IF EXISTS idx_id_change_logs_applicant_id;
DROP TABLE IF EXISTS id_change_logs;
*/
