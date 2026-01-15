-- Create OTP verifications table for email and phone verification
-- This table stores temporary OTP codes for verifying contact information changes

CREATE TABLE IF NOT EXISTS public.otp_verifications (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('email', 'phone')),
  value TEXT NOT NULL,
  otp_code TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  verified BOOLEAN DEFAULT FALSE,
  CONSTRAINT otp_verifications_unique UNIQUE (user_id, type, value)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_otp_verifications_user_id ON public.otp_verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_otp_verifications_expires_at ON public.otp_verifications(expires_at);
CREATE INDEX IF NOT EXISTS idx_otp_verifications_lookup ON public.otp_verifications(user_id, type, value, verified);

-- Enable Row Level Security
ALTER TABLE public.otp_verifications ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access their own OTP records
CREATE POLICY "Users can view their own OTP verifications"
  ON public.otp_verifications
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own OTP verifications"
  ON public.otp_verifications
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own OTP verifications"
  ON public.otp_verifications
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own OTP verifications"
  ON public.otp_verifications
  FOR DELETE
  USING (auth.uid() = user_id);

-- Function to automatically clean up expired OTP records (run periodically)
CREATE OR REPLACE FUNCTION cleanup_expired_otps()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.otp_verifications
  WHERE expires_at < NOW();
END;
$$;

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.otp_verifications TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE otp_verifications_id_seq TO authenticated;

-- Comment on table
COMMENT ON TABLE public.otp_verifications IS 'Stores OTP codes for email and phone verification. Records expire after 10 minutes.';
COMMENT ON COLUMN public.otp_verifications.type IS 'Type of verification: email or phone';
COMMENT ON COLUMN public.otp_verifications.value IS 'The email address or phone number being verified';
COMMENT ON COLUMN public.otp_verifications.otp_code IS 'The 6-digit OTP code sent to the user';
COMMENT ON COLUMN public.otp_verifications.expires_at IS 'Expiration timestamp (typically 10 minutes from creation)';
COMMENT ON COLUMN public.otp_verifications.verified IS 'Whether the OTP has been successfully verified';
