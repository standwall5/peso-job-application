-- Migration: Add Admin Email Features (Invitations and IP Tracking)
-- Description: Tables for admin invitation tokens and IP address tracking
-- Date: 2024

-- Table: admin_invitation_tokens
-- Stores invitation tokens for new admin accounts
CREATE TABLE IF NOT EXISTS admin_invitation_tokens (
  id BIGSERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  admin_name TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  is_superadmin BOOLEAN DEFAULT false,
  created_by BIGINT REFERENCES peso(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN DEFAULT false,
  used_at TIMESTAMPTZ,
  CONSTRAINT valid_expiration CHECK (expires_at > created_at)
);

-- Index for faster token lookups
CREATE INDEX IF NOT EXISTS idx_admin_invitation_tokens_token
ON admin_invitation_tokens(token)
WHERE used = false;

-- Index for email lookups
CREATE INDEX IF NOT EXISTS idx_admin_invitation_tokens_email
ON admin_invitation_tokens(email)
WHERE used = false;

-- Table: admin_known_ips
-- Tracks known IP addresses for admin logins
CREATE TABLE IF NOT EXISTS admin_known_ips (
  id BIGSERIAL PRIMARY KEY,
  admin_id BIGINT NOT NULL REFERENCES peso(id) ON DELETE CASCADE,
  ip_address TEXT NOT NULL,
  user_agent TEXT,
  location TEXT,
  first_seen TIMESTAMPTZ DEFAULT NOW(),
  last_seen TIMESTAMPTZ DEFAULT NOW(),
  is_verified BOOLEAN DEFAULT true,
  CONSTRAINT unique_admin_ip UNIQUE(admin_id, ip_address)
);

-- Index for IP lookups
CREATE INDEX IF NOT EXISTS idx_admin_known_ips_admin_id
ON admin_known_ips(admin_id);

-- Index for IP address lookups
CREATE INDEX IF NOT EXISTS idx_admin_known_ips_ip
ON admin_known_ips(ip_address);

-- Table: admin_ip_verification_tokens
-- Stores tokens for verifying logins from new IPs
CREATE TABLE IF NOT EXISTS admin_ip_verification_tokens (
  id BIGSERIAL PRIMARY KEY,
  admin_id BIGINT NOT NULL REFERENCES peso(id) ON DELETE CASCADE,
  ip_address TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  verified BOOLEAN DEFAULT false,
  verified_at TIMESTAMPTZ,
  CONSTRAINT valid_ip_verification_expiration CHECK (expires_at > created_at)
);

-- Index for token lookups
CREATE INDEX IF NOT EXISTS idx_admin_ip_verification_tokens_token
ON admin_ip_verification_tokens(token)
WHERE verified = false;

-- Index for admin lookups
CREATE INDEX IF NOT EXISTS idx_admin_ip_verification_tokens_admin
ON admin_ip_verification_tokens(admin_id);

-- Table: admin_login_attempts
-- Log all admin login attempts for security monitoring
CREATE TABLE IF NOT EXISTS admin_login_attempts (
  id BIGSERIAL PRIMARY KEY,
  admin_id BIGINT REFERENCES peso(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  ip_address TEXT NOT NULL,
  user_agent TEXT,
  success BOOLEAN NOT NULL,
  failure_reason TEXT,
  requires_ip_verification BOOLEAN DEFAULT false,
  attempted_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for security monitoring
CREATE INDEX IF NOT EXISTS idx_admin_login_attempts_email
ON admin_login_attempts(email, attempted_at DESC);

-- Index for failed attempts
CREATE INDEX IF NOT EXISTS idx_admin_login_attempts_failed
ON admin_login_attempts(email, attempted_at DESC)
WHERE success = false;

-- Function: Clean up expired tokens
CREATE OR REPLACE FUNCTION cleanup_expired_admin_tokens()
RETURNS void AS $$
BEGIN
  -- Delete expired invitation tokens (older than 7 days)
  DELETE FROM admin_invitation_tokens
  WHERE expires_at < NOW() AND used = false;

  -- Delete expired IP verification tokens (older than 24 hours)
  DELETE FROM admin_ip_verification_tokens
  WHERE expires_at < NOW() AND verified = false;

  -- Delete old login attempts (older than 90 days)
  DELETE FROM admin_login_attempts
  WHERE attempted_at < NOW() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql;

-- Function: Check if IP is known for admin
CREATE OR REPLACE FUNCTION is_known_admin_ip(
  p_admin_id BIGINT,
  p_ip_address TEXT
)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM admin_known_ips
    WHERE admin_id = p_admin_id
      AND ip_address = p_ip_address
      AND is_verified = true
  );
END;
$$ LANGUAGE plpgsql;

-- Function: Add or update known IP
CREATE OR REPLACE FUNCTION add_admin_known_ip(
  p_admin_id BIGINT,
  p_ip_address TEXT,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  INSERT INTO admin_known_ips (admin_id, ip_address, user_agent, first_seen, last_seen)
  VALUES (p_admin_id, p_ip_address, p_user_agent, NOW(), NOW())
  ON CONFLICT (admin_id, ip_address)
  DO UPDATE SET
    last_seen = NOW(),
    user_agent = COALESCE(EXCLUDED.user_agent, admin_known_ips.user_agent);
END;
$$ LANGUAGE plpgsql;

-- Function: Generate secure random token
CREATE OR REPLACE FUNCTION generate_secure_token(length INT DEFAULT 32)
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  result TEXT := '';
  i INT;
BEGIN
  FOR i IN 1..length LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Add comments for documentation
COMMENT ON TABLE admin_invitation_tokens IS 'Stores invitation tokens for new admin accounts created by superadmin';
COMMENT ON TABLE admin_known_ips IS 'Tracks verified IP addresses for each admin user';
COMMENT ON TABLE admin_ip_verification_tokens IS 'Temporary tokens for verifying logins from new IP addresses';
COMMENT ON TABLE admin_login_attempts IS 'Security log of all admin login attempts';

COMMENT ON FUNCTION cleanup_expired_admin_tokens() IS 'Removes expired tokens and old login attempts';
COMMENT ON FUNCTION is_known_admin_ip(BIGINT, TEXT) IS 'Checks if an IP address is verified for an admin';
COMMENT ON FUNCTION add_admin_known_ip(BIGINT, TEXT, TEXT) IS 'Adds or updates a known IP address for an admin';
COMMENT ON FUNCTION generate_secure_token(INT) IS 'Generates a random secure token string';

-- Grant permissions (adjust as needed)
-- GRANT SELECT, INSERT, UPDATE ON admin_invitation_tokens TO authenticated;
-- GRANT SELECT, INSERT, UPDATE ON admin_known_ips TO authenticated;
-- GRANT SELECT, INSERT, UPDATE ON admin_ip_verification_tokens TO authenticated;
-- GRANT SELECT, INSERT ON admin_login_attempts TO authenticated;

-- Create initial cleanup schedule (manual execution or use pg_cron if available)
-- SELECT cleanup_expired_admin_tokens();

-- Migration complete
-- Verify tables created:
-- SELECT table_name FROM information_schema.tables WHERE table_name LIKE 'admin_%';
