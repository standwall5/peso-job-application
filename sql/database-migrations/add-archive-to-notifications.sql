-- Migration: Add archive functionality to notifications
-- Description: Adds is_archived column and indexes for better notification management
-- Date: 2024

-- ============================================
-- Add archive column to notifications
-- ============================================

-- Add is_archived column
ALTER TABLE notifications
ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT FALSE;

-- Add comment
COMMENT ON COLUMN notifications.is_archived IS 'Indicates if the notification has been archived by the user';

-- ============================================
-- Create indexes for better performance
-- ============================================

-- Index for archived notifications queries
CREATE INDEX IF NOT EXISTS idx_notifications_archived
ON notifications(applicant_id, is_archived, created_at DESC)
WHERE is_archived = false;

-- Index for unread and non-archived notifications
CREATE INDEX IF NOT EXISTS idx_notifications_active_unread
ON notifications(applicant_id, is_read, is_archived)
WHERE is_read = false AND is_archived = false;

-- ============================================
-- Verification queries
-- ============================================

-- Verify column was added
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'notifications'
        AND column_name = 'is_archived'
    ) THEN
        RAISE NOTICE 'SUCCESS: is_archived column exists in notifications table';
    ELSE
        RAISE EXCEPTION 'FAILED: is_archived column not found in notifications table';
    END IF;
END $$;

-- Verify indexes were created
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM pg_indexes
        WHERE tablename = 'notifications'
        AND indexname = 'idx_notifications_archived'
    ) THEN
        RAISE NOTICE 'SUCCESS: idx_notifications_archived index created';
    ELSE
        RAISE WARNING 'WARNING: idx_notifications_archived index not found';
    END IF;

    IF EXISTS (
        SELECT 1
        FROM pg_indexes
        WHERE tablename = 'notifications'
        AND indexname = 'idx_notifications_active_unread'
    ) THEN
        RAISE NOTICE 'SUCCESS: idx_notifications_active_unread index created';
    ELSE
        RAISE WARNING 'WARNING: idx_notifications_active_unread index not found';
    END IF;
END $$;

-- ============================================
-- Display final status
-- ============================================

SELECT
    COUNT(*) as total_notifications,
    COUNT(*) FILTER (WHERE is_archived = false) as active_notifications,
    COUNT(*) FILTER (WHERE is_archived = true) as archived_notifications,
    COUNT(*) FILTER (WHERE is_read = false AND is_archived = false) as unread_active
FROM notifications;

RAISE NOTICE 'Migration completed successfully!';
