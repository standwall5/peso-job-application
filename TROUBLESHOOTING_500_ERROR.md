# Troubleshooting: 500 Error on /api/admin/invite

## Error Message
```
Failed to load resource: the server responded with a status of 500 ()
Error sending invitation: Error: Failed to create invitation
```

## Quick Diagnosis

Run the diagnostic endpoint to identify the issue:

```
GET /api/admin/invite/check
```

This will check:
- ✅ Authentication status
- ✅ Super admin permissions
- ✅ Database table existence
- ✅ Storage bucket configuration
- ✅ Environment variables

---

## Common Causes & Solutions

### 1. Missing `admin_invitation_tokens` Table

**Error Code**: `42P01` (relation does not exist)

**Cause**: The database table hasn't been created yet.

**Solution**:
1. Open Supabase SQL Editor
2. Run the setup script: `sql/admin-profiles-setup.sql`
3. Verify table exists:
```sql
SELECT * FROM admin_invitation_tokens LIMIT 1;
```

**Quick Create**:
```sql
CREATE TABLE IF NOT EXISTS admin_invitation_tokens (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  admin_name VARCHAR(255) NOT NULL,
  token VARCHAR(255) UNIQUE NOT NULL,
  is_superadmin BOOLEAN DEFAULT false,
  created_by INTEGER REFERENCES peso(id),
  used BOOLEAN DEFAULT false,
  used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_invitation_token ON admin_invitation_tokens(token);
CREATE INDEX idx_invitation_email ON admin_invitation_tokens(email);
```

---

### 2. Missing Service Role Key

**Cause**: `supabase.auth.admin.inviteUserByEmail()` requires service role permissions

**Solution**:
1. Check `.env.local` or deployment environment variables
2. Ensure `SUPABASE_SERVICE_ROLE_KEY` is set
3. Get it from Supabase Dashboard → Settings → API → service_role key

```env
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Note**: The service role key is different from the anon key!

---

### 3. User Not Super Admin

**Error**: "Only superadmins can invite new admins" (403, but checking anyway)

**Solution**:
1. Verify your account has super admin privileges:
```sql
SELECT id, name, is_superadmin 
FROM peso 
WHERE auth_id = 'your-auth-id-here';
```

2. Grant super admin if needed:
```sql
UPDATE peso 
SET is_superadmin = true 
WHERE auth_id = 'your-auth-id-here';
```

---

### 4. Email Already Exists

**Error**: "An admin with this email already exists"

**Cause**: Email is already registered in the system

**Solution**:
Check existing users:
```sql
-- Check if email exists in peso table
SELECT p.id, p.name, p.email, a.email as auth_email
FROM peso p
LEFT JOIN auth.users a ON p.auth_id = a.id;
```

---

### 5. Pending Invitation Exists

**Error**: "An invitation for this email is already pending"

**Cause**: A non-expired, unused invitation already exists for this email

**Solution**:
1. Check pending invitations:
```sql
SELECT email, admin_name, created_at, expires_at, used
FROM admin_invitation_tokens
WHERE used = false 
  AND expires_at > NOW()
ORDER BY created_at DESC;
```

2. Delete the pending invitation if you want to send a new one:
```sql
DELETE FROM admin_invitation_tokens
WHERE email = 'email@example.com' AND used = false;
```

Or wait for it to expire (48 hours).

---

### 6. Supabase Client Configuration

**Cause**: Incorrect Supabase client setup

**Solution**:
Check `src/utils/supabase/server.ts`:
- Ensure it's using `createServerClient` from `@supabase/ssr`
- Service role key should be available for admin operations
- Client should have proper auth context

---

### 7. Missing `peso` Table Record

**Error**: "Failed to verify admin account"

**Cause**: Current user doesn't have a record in the `peso` table

**Solution**:
```sql
-- Check if your account exists in peso table
SELECT * FROM peso WHERE auth_id = 'your-auth-id';

-- Create if missing (replace with actual values)
INSERT INTO peso (auth_id, name, is_superadmin, status)
VALUES ('your-auth-id', 'Your Name', true, 'active');
```

---

### 8. Email Service Configuration

**Cause**: Supabase email service not configured

**Solution**:
1. Go to Supabase Dashboard → Authentication → Email Templates
2. Verify "Invite user" template exists
3. Check SMTP settings if using custom email provider
4. Test with default Supabase email first

**Check logs**:
Supabase Dashboard → Logs → Auth Logs (look for failed email attempts)

---

## Step-by-Step Debugging

### 1. Check Server Logs

Look at your server console/logs for detailed error messages:
- Token creation errors
- Database errors
- Email sending errors

### 2. Use the Diagnostic Endpoint

```bash
curl -X GET https://your-app-url.com/api/admin/invite/check \
  -H "Cookie: your-session-cookie"
```

Expected response:
```json
{
  "status": "healthy",
  "checks": {
    "authentication": { "status": "passed", "message": "..." },
    "admin_record": { "status": "passed", "message": "..." },
    "admin_permissions": { "status": "passed", "message": "..." },
    "invitation_table": { "status": "passed", "message": "..." },
    "storage_bucket": { "status": "passed", "message": "..." },
    "environment_variables": { "status": "passed", "message": "..." }
  }
}
```

### 3. Test in Stages

Test each component separately:

**A. Test Database Insert**:
```sql
INSERT INTO admin_invitation_tokens (email, admin_name, token, expires_at)
VALUES ('test@test.com', 'Test User', 'test123', NOW() + INTERVAL '48 hours');
```

**B. Test Email Sending** (via Supabase Dashboard):
Settings → Auth → Email Templates → Send test email

**C. Test API Endpoint** (via curl or Postman):
```bash
curl -X POST https://your-app-url.com/api/admin/invite \
  -H "Content-Type: application/json" \
  -H "Cookie: your-session-cookie" \
  -d '{
    "email": "newadmin@test.com",
    "name": "New Admin",
    "is_superadmin": false
  }'
```

---

## Verification Checklist

After applying fixes, verify:

- [ ] `admin_invitation_tokens` table exists
- [ ] Current user has `is_superadmin = true`
- [ ] `SUPABASE_SERVICE_ROLE_KEY` environment variable is set
- [ ] Supabase email service is configured
- [ ] No pending invitations for the email you're trying to invite
- [ ] Diagnostic endpoint returns "healthy" status
- [ ] Test invitation succeeds
- [ ] Invitation email is received
- [ ] Setup link works when clicked

---

## Production Deployment Notes

When deploying to production:

1. **Environment Variables**: Ensure all required env vars are set in your hosting platform
2. **Database Migrations**: Run the SQL setup script in production database
3. **Storage Bucket**: Create `admin-profiles` bucket in production Supabase project
4. **RLS Policies**: Apply all 5 storage policies for `admin-profiles`
5. **Email Domain**: Configure custom email domain if needed
6. **SSL/HTTPS**: Ensure redirect URLs use HTTPS in production

---

## Getting Help

If none of these solutions work:

1. **Check Supabase Status**: https://status.supabase.com
2. **Review Recent Changes**: Check if any recent code or config changes broke the flow
3. **Database Logs**: Supabase Dashboard → Logs → Database
4. **Auth Logs**: Supabase Dashboard → Logs → Auth
5. **API Logs**: Your hosting platform's logs (Vercel, Railway, etc.)

---

## Related Files

- `/src/app/api/admin/invite/route.ts` - Main API endpoint
- `/src/app/api/admin/invite/check/route.ts` - Diagnostic endpoint
- `/sql/admin-profiles-setup.sql` - Database setup script
- `ADMIN_SETUP_GUIDE.md` - Complete setup guide
- `DEPLOYMENT_CHECKLIST.md` - Pre-deployment checklist

---

## Quick Fix Script

If you need to reset everything:

```sql
-- 1. Drop and recreate table
DROP TABLE IF EXISTS admin_invitation_tokens;

CREATE TABLE admin_invitation_tokens (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  admin_name VARCHAR(255) NOT NULL,
  token VARCHAR(255) UNIQUE NOT NULL,
  is_superadmin BOOLEAN DEFAULT false,
  created_by INTEGER REFERENCES peso(id),
  used BOOLEAN DEFAULT false,
  used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_invitation_token ON admin_invitation_tokens(token);
CREATE INDEX idx_invitation_email ON admin_invitation_tokens(email);

-- 2. Verify you're a super admin
UPDATE peso SET is_superadmin = true WHERE auth_id = 'your-auth-id';

-- 3. Check it worked
SELECT * FROM admin_invitation_tokens;
SELECT id, name, is_superadmin FROM peso WHERE is_superadmin = true;
```

---

## Still Getting 500 Error?

Enable detailed error logging by checking the API response:

```javascript
// In browser console or your API call
fetch('/api/admin/invite', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'test@test.com',
    name: 'Test User',
    is_superadmin: false
  })
})
.then(r => r.json())
.then(data => console.log('Response:', data))
.catch(err => console.error('Error:', err));
```

The API now returns detailed error information in the response body, including:
- Error type
- Error message
- Error details
- Hints for resolution (for database errors)

Check your browser's Network tab → Response for the full error details.