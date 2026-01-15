-- QUICK FIX: Add is_archived column to notifications
-- Run this in Supabase SQL Editor NOW to fix the 500 error

-- Add the column
ALTER TABLE notifications
ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT FALSE;

-- Update existing notifications to not be archived
UPDATE notifications
SET is_archived = FALSE
WHERE is_archived IS NULL;

-- Verify it worked
SELECT
    column_name,
    data_type,
    column_default
FROM information_schema.columns
WHERE table_name = 'notifications'
AND column_name = 'is_archived';

-- Show a count
SELECT
    COUNT(*) as total,
    COUNT(*) FILTER (WHERE is_archived = false) as active,
    COUNT(*) FILTER (WHERE is_archived = true) as archived
FROM notifications;
