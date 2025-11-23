-- Add admin_id column to chat_sessions table if it doesn't exist
-- This column tracks which admin is handling each chat session

-- Add the column
ALTER TABLE chat_sessions
ADD COLUMN IF NOT EXISTS admin_id INTEGER;

-- Add foreign key constraint to peso table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'chat_sessions_admin_id_fkey'
  ) THEN
    ALTER TABLE chat_sessions
    ADD CONSTRAINT chat_sessions_admin_id_fkey
    FOREIGN KEY (admin_id) REFERENCES peso(id)
    ON DELETE SET NULL;
  END IF;
END $$;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_chat_sessions_admin_id ON chat_sessions(admin_id);

-- Add comment
COMMENT ON COLUMN chat_sessions.admin_id IS 'ID of the PESO admin handling this chat session';

-- Verify the column exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'chat_sessions'
    AND column_name = 'admin_id'
  ) THEN
    RAISE EXCEPTION 'Failed to add admin_id column to chat_sessions table';
  END IF;
END $$;
