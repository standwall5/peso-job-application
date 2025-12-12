-- Create a view that joins chat_sessions with applicant details including email from auth.users
-- This avoids needing the service role key in the API route

CREATE OR REPLACE VIEW chat_sessions_with_applicant AS
SELECT
  cs.id,
  cs.user_id,
  cs.admin_id,
  cs.status,
  cs.concern,
  cs.created_at,
  cs.updated_at,
  cs.closed_at,
  a.id as applicant_id,
  a.name as applicant_name,
  a.auth_id,
  au.email as applicant_email
FROM chat_sessions cs
LEFT JOIN applicants a ON cs.user_id = a.id
LEFT JOIN auth.users au ON a.auth_id = au.id;

-- Grant access to authenticated users
GRANT SELECT ON chat_sessions_with_applicant TO authenticated;

-- Add comment explaining the view
COMMENT ON VIEW chat_sessions_with_applicant IS
'View that combines chat sessions with applicant details including email from auth.users.
This allows admins to fetch user email without needing service role access.';

-- Alternative: Create a function that admins can call to get chat sessions with details
-- This provides more control over who can access the data

CREATE OR REPLACE FUNCTION get_chat_sessions_for_admin(session_status TEXT DEFAULT 'pending')
RETURNS TABLE (
  id UUID,
  user_id BIGINT,
  admin_id BIGINT,
  status VARCHAR,
  concern TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  closed_at TIMESTAMP WITH TIME ZONE,
  applicant_name TEXT,
  applicant_email TEXT,
  applicant_auth_id UUID
)
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Verify caller is an admin
  IF NOT EXISTS (
    SELECT 1 FROM peso WHERE auth_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Unauthorized: Admin access required';
  END IF;

  -- Return chat sessions with applicant details
  RETURN QUERY
  SELECT
    cs.id,
    cs.user_id,
    cs.admin_id,
    cs.status,
    cs.concern,
    cs.created_at,
    cs.closed_at,
    a.name as applicant_name,
    au.email as applicant_email,
    a.auth_id as applicant_auth_id
  FROM chat_sessions cs
  LEFT JOIN applicants a ON cs.user_id = a.id
  LEFT JOIN auth.users au ON a.auth_id = au.id
  WHERE cs.status = session_status
  ORDER BY cs.created_at DESC;
END;
$$;

-- Grant execute permission to authenticated users (function checks if they're admin)
GRANT EXECUTE ON FUNCTION get_chat_sessions_for_admin(TEXT) TO authenticated;

-- Add comment
COMMENT ON FUNCTION get_chat_sessions_for_admin IS
'Returns chat sessions with applicant email details. Only callable by admins (verified via peso table).
The SECURITY DEFINER ensures the function runs with elevated privileges to access auth.users.';
