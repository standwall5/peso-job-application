-- Migration: Add is_archived column to applicants table
-- Description: Adds a boolean column to track whether a jobseeker has been archived
-- Date: 2024

-- Add is_archived column to applicants table
ALTER TABLE applicants
ADD COLUMN IF NOT EXISTS is_archived BOOLEAN NOT NULL DEFAULT FALSE;

-- Create an index on is_archived for faster queries
CREATE INDEX IF NOT EXISTS idx_applicants_is_archived ON applicants(is_archived);

-- Add a comment to the column for documentation
COMMENT ON COLUMN applicants.is_archived IS 'Indicates whether the jobseeker has been archived by admin';
