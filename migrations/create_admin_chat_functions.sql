-- Migration: Create Admin Chat Helper Functions
-- Description: Creates database functions to support admin chat functionality
-- Date: 2024

-- ============================================================================
-- FUNCTION: get_chat_sessions_for_admin
-- Description: Gets chat sessions with applicant information joined
-- ============================================================================

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS get_chat_sessions_for_admin(TEXT);

CREATE OR REPLACE FUNCTION get_chat_sessions_for_admin(session_status TEXT)
RETURNS TABLE (
  id UUID,
  user_id INTEGER,
  admin_id INTEGER,
  status TEXT,
  concern TEXT,
  created_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ,
  applicant_name TEXT,
  applicant_email TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    cs.id,
    cs.user_id,
    cs.admin_id,
    cs.status,
    cs.concern,
    cs.created_at,
    cs.closed_at,
    a.name AS applicant_name,
    a.phone AS applicant_email
  FROM chat_sessions cs
  INNER JOIN applicants a ON cs.user_id = a.id
  WHERE cs.status = session_status
  ORDER BY cs.created_at DESC;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_chat_sessions_for_admin(TEXT) TO authenticated;

-- ============================================================================
-- FUNCTION: get_unread_admin_chat_count
-- Description: Gets count of unread messages for admin
-- ============================================================================

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS get_unread_admin_chat_count();

CREATE OR REPLACE FUNCTION get_unread_admin_chat_count()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  unread_count INTEGER;
BEGIN
  SELECT COUNT(DISTINCT cm.chat_session_id)
  INTO unread_count
  FROM chat_messages cm
  INNER JOIN chat_sessions cs ON cm.chat_session_id = cs.id
  WHERE cs.status IN ('pending', 'active')
    AND cm.sender = 'user'
    AND cm.created_at > COALESCE(cs.last_admin_read_at, '1970-01-01'::TIMESTAMPTZ);

  RETURN COALESCE(unread_count, 0);
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_unread_admin_chat_count() TO authenticated;

-- ============================================================================
-- FUNCTION: get_chat_session_summary
-- Description: Gets summary of all chat sessions for admin dashboard
-- ============================================================================

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS get_chat_session_summary();

CREATE OR REPLACE FUNCTION get_chat_session_summary()
RETURNS TABLE (
  total_sessions BIGINT,
  pending_sessions BIGINT,
  active_sessions BIGINT,
  closed_sessions BIGINT,
  avg_response_time INTERVAL
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT AS total_sessions,
    COUNT(*) FILTER (WHERE status = 'pending')::BIGINT AS pending_sessions,
    COUNT(*) FILTER (WHERE status = 'active')::BIGINT AS active_sessions,
    COUNT(*) FILTER (WHERE status = 'closed')::BIGINT AS closed_sessions,
    AVG(closed_at - created_at) FILTER (WHERE closed_at IS NOT NULL) AS avg_response_time
  FROM chat_sessions;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_chat_session_summary() TO authenticated;

-- ============================================================================
-- Optional: Add last_admin_read_at column if it doesn't exist
-- ============================================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'chat_sessions'
    AND column_name = 'last_admin_read_at'
  ) THEN
    ALTER TABLE chat_sessions
    ADD COLUMN last_admin_read_at TIMESTAMPTZ;

    COMMENT ON COLUMN chat_sessions.last_admin_read_at IS 'Timestamp when admin last read messages in this session';
  END IF;
END $$;

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Test the function
-- SELECT * FROM get_chat_sessions_for_admin('pending');
-- SELECT * FROM get_chat_sessions_for_admin('active');
-- SELECT * FROM get_chat_sessions_for_admin('closed');
-- SELECT * FROM get_unread_admin_chat_count();
-- SELECT * FROM get_chat_session_summary();

-- ============================================================================
-- NOTES
-- ============================================================================
--
-- This migration creates helper functions for the admin chat system:
--
-- 1. get_chat_sessions_for_admin(status)
--    - Returns chat sessions filtered by status with applicant information
--    - Used by admin panel to display chat requests
--
-- 2. get_unread_admin_chat_count()
--    - Returns count of sessions with unread user messages
--    - Used for notification badges
--
-- 3. get_chat_session_summary()
--    - Returns overall statistics about chat sessions
--    - Used for admin dashboard/reports
--
-- All functions use SECURITY DEFINER to run with elevated privileges
-- but should still validate admin access in the application layer.
--
-- ============================================================================

COMMIT;
