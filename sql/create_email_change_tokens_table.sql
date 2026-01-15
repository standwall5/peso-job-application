-- Create email change tokens table for email change confirmation
-- This table stores pending email change requests that require confirmation via current email

CREATE TABLE IF NOT EXISTS public.email_change_tokens (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  new_email TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  CONSTRAINT email_change_tokens_unique UNIQUE (user_id, new_email)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_email_change_tokens_user_id ON public.email_change_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_email_change_tokens_token ON public.email_change_tokens(token);
CREATE INDEX IF NOT EXISTS idx_email_change_tokens_expires_at ON public.email_change_tokens(expires_at);

-- Enable Row Level Security
ALTER TABLE public.email_change_tokens ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access their own email change tokens
CREATE POLICY "Users can view their own email change tokens"
  ON public.email_change_tokens
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own email change tokens"
  ON public.email_change_tokens
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own email change tokens"
  ON public.email_change_tokens
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own email change tokens"
  ON public.email_change_tokens
  FOR DELETE
  USING (auth.uid() = user_id);

-- Function to automatically clean up expired tokens (run periodically)
CREATE OR REPLACE FUNCTION cleanup_expired_email_tokens()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.email_change_tokens
  WHERE expires_at < NOW() OR used = TRUE;
END;
$$;

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.email_change_tokens TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE email_change_tokens_id_seq TO authenticated;

-- Comment on table
COMMENT ON TABLE public.email_change_tokens IS 'Stores email change tokens sent to current email for confirmation. Tokens expire after 1 hour.';
COMMENT ON COLUMN public.email_change_tokens.new_email IS 'The new email address the user wants to change to';
COMMENT ON COLUMN public.email_change_tokens.token IS 'Unique token sent to current email for confirmation';
COMMENT ON COLUMN public.email_change_tokens.expires_at IS 'Expiration timestamp (typically 1 hour from creation)';
COMMENT ON COLUMN public.email_change_tokens.used IS 'Whether the token has been used to complete the email change';
