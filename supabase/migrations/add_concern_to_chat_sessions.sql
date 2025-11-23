-- Add concern column to chat_sessions table to store the user's initial message/concern
ALTER TABLE chat_sessions
ADD COLUMN IF NOT EXISTS concern TEXT;

-- Add comment to the column
COMMENT ON COLUMN chat_sessions.concern IS 'The initial concern or question from the user that prompted the chat request';

-- Create an index on concern for searching (optional but useful for admin search features)
CREATE INDEX IF NOT EXISTS idx_chat_sessions_concern ON chat_sessions USING gin(to_tsvector('english', concern));
