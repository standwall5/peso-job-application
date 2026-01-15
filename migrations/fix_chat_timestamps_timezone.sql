-- Migration: Fix Chat Timestamps Timezone Issues
-- Description: Convert TIMESTAMP columns to TIMESTAMPTZ to properly handle UTC timestamps
-- Date: 2024
--
-- This migration fixes the timezone issue where chat messages and sessions were
-- storing timestamps in local server time instead of UTC, causing an 8-hour difference
-- when displayed in Philippine timezone.

-- ============================================================================
-- STEP 1: Backup existing data (optional but recommended)
-- ============================================================================
-- You can uncomment these lines to create backup tables before migration
-- CREATE TABLE chat_sessions_backup AS SELECT * FROM chat_sessions;
-- CREATE TABLE chat_messages_backup AS SELECT * FROM chat_messages;

-- ============================================================================
-- STEP 2: Update chat_sessions table
-- ============================================================================

-- Convert created_at to TIMESTAMPTZ
-- This assumes existing timestamps are in UTC. If they're in a different timezone,
-- adjust the AT TIME ZONE clause accordingly.
ALTER TABLE chat_sessions
  ALTER COLUMN created_at TYPE TIMESTAMPTZ
  USING created_at AT TIME ZONE 'UTC';

-- Set default to NOW() which returns TIMESTAMPTZ in UTC
ALTER TABLE chat_sessions
  ALTER COLUMN created_at SET DEFAULT NOW();

-- Convert closed_at to TIMESTAMPTZ (if it has a value)
ALTER TABLE chat_sessions
  ALTER COLUMN closed_at TYPE TIMESTAMPTZ
  USING CASE
    WHEN closed_at IS NULL THEN NULL
    ELSE closed_at AT TIME ZONE 'UTC'
  END;

-- Convert updated_at to TIMESTAMPTZ (if this column exists)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'chat_sessions'
    AND column_name = 'updated_at'
  ) THEN
    EXECUTE 'ALTER TABLE chat_sessions
             ALTER COLUMN updated_at TYPE TIMESTAMPTZ
             USING updated_at AT TIME ZONE ''UTC''';

    EXECUTE 'ALTER TABLE chat_sessions
             ALTER COLUMN updated_at SET DEFAULT NOW()';
  END IF;
END $$;

-- Convert last_user_message_at to TIMESTAMPTZ (if this column exists)
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
               ELSE last_user_message_at AT TIME ZONE ''UTC''
             END';
  END IF;
END $$;

-- ============================================================================
-- STEP 3: Update chat_messages table
-- ============================================================================

-- Convert created_at to TIMESTAMPTZ
ALTER TABLE chat_messages
  ALTER COLUMN created_at TYPE TIMESTAMPTZ
  USING created_at AT TIME ZONE 'UTC';

-- Set default to NOW() which returns TIMESTAMPTZ in UTC
ALTER TABLE chat_messages
  ALTER COLUMN created_at SET DEFAULT NOW();

-- Convert read_at to TIMESTAMPTZ (if this column exists)
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
               ELSE read_at AT TIME ZONE ''UTC''
             END';
  END IF;
END $$;

-- ============================================================================
-- STEP 4: Update any triggers that might use TIMESTAMP
-- ============================================================================

-- Drop and recreate updated_at trigger if it exists
DO $$
BEGIN
  -- Drop trigger if exists
  DROP TRIGGER IF EXISTS set_chat_sessions_updated_at ON chat_sessions;

  -- Create or replace the trigger function
  CREATE OR REPLACE FUNCTION update_updated_at_column()
  RETURNS TRIGGER AS $func$
  BEGIN
    NEW.updated_at = NOW(); -- NOW() returns TIMESTAMPTZ in UTC
    RETURN NEW;
  END;
  $func$ LANGUAGE plpgsql;

  -- Recreate trigger if updated_at column exists
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

-- Check chat_sessions column types
SELECT
  column_name,
  data_type,
  datetime_precision,
  column_default
FROM information_schema.columns
WHERE table_name = 'chat_sessions'
  AND column_name IN ('created_at', 'closed_at', 'updated_at', 'last_user_message_at')
ORDER BY ordinal_position;

-- Check chat_messages column types
SELECT
  column_name,
  data_type,
  datetime_precision,
  column_default
FROM information_schema.columns
WHERE table_name = 'chat_messages'
  AND column_name IN ('created_at', 'read_at')
ORDER BY ordinal_position;

-- ============================================================================
-- VERIFICATION QUERIES (Run these to confirm everything works)
-- ============================================================================

-- Test: Insert a new message and verify it uses UTC timezone
-- INSERT INTO chat_messages (chat_session_id, sender, message)
-- VALUES ('test-id', 'admin', 'Test message');
--
-- SELECT id, created_at, created_at AT TIME ZONE 'UTC' as utc_time,
--        created_at AT TIME ZONE 'Asia/Manila' as manila_time
-- FROM chat_messages
-- ORDER BY created_at DESC LIMIT 1;

-- ============================================================================
-- NOTES
-- ============================================================================
--
-- After running this migration:
-- 1. All timestamp columns will store data in UTC (TIMESTAMPTZ)
-- 2. PostgreSQL/Supabase will automatically handle timezone conversions
-- 3. Your application code should NOT manually add/subtract hours
-- 4. Use JavaScript's toLocaleTimeString() with timeZone option for display
--
-- Example in JavaScript:
--   timestamp.toLocaleTimeString("en-PH", {
--     timeZone: "Asia/Manila",
--     hour: "2-digit",
--     minute: "2-digit"
--   })
--
-- If you need to rollback this migration:
-- 1. Restore from backup tables created in STEP 1
-- 2. Or convert back to TIMESTAMP (not recommended):
--    ALTER TABLE chat_sessions ALTER COLUMN created_at TYPE TIMESTAMP;
--    ALTER TABLE chat_messages ALTER COLUMN created_at TYPE TIMESTAMP;
--
-- ============================================================================

COMMIT;
