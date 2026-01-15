-- Migration: Fix Chat Timestamps with Data Correction
-- Description: Convert TIMESTAMP to TIMESTAMPTZ AND correct existing wrong timezone data
-- Date: 2024
--
-- This migration is for when your existing data is stored 8 hours behind
-- (e.g., showing 5:44 AM when it should be 1:44 PM Philippine time / 5:44 AM UTC)
--
-- WARNING: This assumes your existing timestamps are 8 hours behind UTC.
-- If unsure, test on a backup first!

-- ============================================================================
-- STEP 1: Backup existing data (HIGHLY RECOMMENDED!)
-- ============================================================================
CREATE TABLE IF NOT EXISTS chat_sessions_backup AS SELECT * FROM chat_sessions;
CREATE TABLE IF NOT EXISTS chat_messages_backup AS SELECT * FROM chat_messages;

-- ============================================================================
-- STEP 2: Fix chat_sessions table timestamps
-- ============================================================================

-- Option A: If existing data is 8 hours BEHIND (subtract 8 hours to get UTC)
-- This is the case if Supabase shows 5:44 AM but it should be 1:44 PM Manila (5:44 AM UTC)

ALTER TABLE chat_sessions
  ALTER COLUMN created_at TYPE TIMESTAMPTZ
  USING (created_at - INTERVAL '8 hours') AT TIME ZONE 'UTC';

ALTER TABLE chat_sessions
  ALTER COLUMN created_at SET DEFAULT NOW();

ALTER TABLE chat_sessions
  ALTER COLUMN closed_at TYPE TIMESTAMPTZ
  USING CASE
    WHEN closed_at IS NULL THEN NULL
    ELSE (closed_at - INTERVAL '8 hours') AT TIME ZONE 'UTC'
  END;

-- Fix updated_at if exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'chat_sessions'
    AND column_name = 'updated_at'
  ) THEN
    EXECUTE 'ALTER TABLE chat_sessions
             ALTER COLUMN updated_at TYPE TIMESTAMPTZ
             USING (updated_at - INTERVAL ''8 hours'') AT TIME ZONE ''UTC''';

    EXECUTE 'ALTER TABLE chat_sessions
             ALTER COLUMN updated_at SET DEFAULT NOW()';
  END IF;
END $$;

-- Fix last_user_message_at if exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'chat_sessions'
    AND column_name = 'last_user_message_at'
  ) THEN
    EXECUTE 'ALTER TABLE chat_sessions
             ALTER COLUMN last_user_message_at TYPE TIMESTAMPTZ
             USING CASE
               WHEN last_user_message_at IS NULL THEN NULL
               ELSE (last_user_message_at - INTERVAL ''8 hours'') AT TIME ZONE ''UTC''
             END';
  END IF;
END $$;

-- ============================================================================
-- STEP 3: Fix chat_messages table timestamps
-- ============================================================================

ALTER TABLE chat_messages
  ALTER COLUMN created_at TYPE TIMESTAMPTZ
  USING (created_at - INTERVAL '8 hours') AT TIME ZONE 'UTC';

ALTER TABLE chat_messages
  ALTER COLUMN created_at SET DEFAULT NOW();

-- Fix read_at if exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'chat_messages'
    AND column_name = 'read_at'
  ) THEN
    EXECUTE 'ALTER TABLE chat_messages
             ALTER COLUMN read_at TYPE TIMESTAMPTZ
             USING CASE
               WHEN read_at IS NULL THEN NULL
               ELSE (read_at - INTERVAL ''8 hours'') AT TIME ZONE ''UTC''
             END';
  END IF;
END $$;

-- ============================================================================
-- STEP 4: Update triggers
-- ============================================================================

DO $$
BEGIN
  DROP TRIGGER IF EXISTS set_chat_sessions_updated_at ON chat_sessions;

  CREATE OR REPLACE FUNCTION update_updated_at_column()
  RETURNS TRIGGER AS $func$
  BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
  END;
  $func$ LANGUAGE plpgsql;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'chat_sessions'
    AND column_name = 'updated_at'
  ) THEN
    EXECUTE 'CREATE TRIGGER set_chat_sessions_updated_at
             BEFORE UPDATE ON chat_sessions
             FOR EACH ROW
             EXECUTE FUNCTION update_updated_at_column()';
  END IF;
END $$;

-- ============================================================================
-- STEP 5: Verify the changes
-- ============================================================================

-- Show recent messages with timezone info
SELECT
  id,
  message,
  sender,
  created_at as utc_timestamp,
  created_at AT TIME ZONE 'Asia/Manila' as manila_time,
  EXTRACT(TIMEZONE FROM created_at) / 3600 as timezone_offset_hours
FROM chat_messages
ORDER BY created_at DESC
LIMIT 5;

-- Check column definitions
SELECT
  table_name,
  column_name,
  data_type,
  datetime_precision,
  column_default
FROM information_schema.columns
WHERE table_name IN ('chat_sessions', 'chat_messages')
  AND column_name LIKE '%_at'
ORDER BY table_name, ordinal_position;

-- ============================================================================
-- ALTERNATIVE: If data is 8 hours AHEAD instead
-- ============================================================================
-- If your data is actually 8 hours ahead (showing 9:44 PM when it should be 1:44 PM),
-- use this version instead (uncomment and run separately):
--
-- ALTER TABLE chat_sessions
--   ALTER COLUMN created_at TYPE TIMESTAMPTZ
--   USING (created_at + INTERVAL '8 hours') AT TIME ZONE 'UTC';
--
-- ALTER TABLE chat_messages
--   ALTER COLUMN created_at TYPE TIMESTAMPTZ
--   USING (created_at + INTERVAL '8 hours') AT TIME ZONE 'UTC';

-- ============================================================================
-- ROLLBACK (if needed)
-- ============================================================================
-- To restore original data:
-- DROP TABLE IF EXISTS chat_sessions;
-- DROP TABLE IF EXISTS chat_messages;
-- ALTER TABLE chat_sessions_backup RENAME TO chat_sessions;
-- ALTER TABLE chat_messages_backup RENAME TO chat_messages;

-- ============================================================================
-- NOTES
-- ============================================================================
--
-- After migration, verify by:
-- 1. Send a test message
-- 2. Check in Supabase dashboard - should show current UTC time
-- 3. Check in your app - should display correct Manila time (UTC + 8)
--
-- Database now stores: UTC time (e.g., 5:44 AM UTC)
-- App will display: Manila time (e.g., 1:44 PM PHT)
--
-- ============================================================================

COMMIT;
