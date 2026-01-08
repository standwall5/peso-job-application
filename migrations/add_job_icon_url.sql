-- Migration: Add icon_url to jobs table
-- Purpose: Allow custom icons/images for individual job postings
-- Date: 2024

-- Add icon_url column to jobs table
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS icon_url TEXT;

-- Add comment for documentation
COMMENT ON COLUMN jobs.icon_url IS 'Optional custom icon/image URL for the job posting (stored in job-icons bucket)';

-- Create index for faster lookups (optional, but good for performance)
CREATE INDEX IF NOT EXISTS idx_jobs_icon_url ON jobs(icon_url) WHERE icon_url IS NOT NULL;

-- Rollback instructions (comment out for safety):
/*
-- To rollback this migration, run:
DROP INDEX IF EXISTS idx_jobs_icon_url;
ALTER TABLE jobs DROP COLUMN IF EXISTS icon_url;
*/
