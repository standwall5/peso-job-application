# Admin Invitation Email Template

This document contains the email template for admin invitations. Use this if automatic emails are not working or if you need to manually send invitation links.

---

## Automatic Email Template

This is the template Supabase uses when sending invitation emails via `auth.admin.inviteUserByEmail()`:

### Subject Line
```
You're invited to join PESO Parañaque Admin Portal
```

### Email Body (HTML)
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Admin Invitation</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  
  <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; border-radius: 8px 8px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 24px;">PESO Parañaque</h1>
    <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Admin Portal</p>
  </div>
  
  <div style="background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
    
    <h2 style="color: #1f2937; margin-top: 0;">You've been invited!</h2>
    
    <p>Hello <strong>{{ .Name }}</strong>,</p>
    
    <p>You have been invited to join the PESO Parañaque Admin Portal as {{ .Role }}.</p>
    
    <p>To complete your account setup, please click the button below:</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="{{ .InviteURL }}" 
         style="background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">
        Set Up Your Account
      </a>
    </div>
    
    <p style="color: #6b7280; font-size: 14px;">
      Or copy and paste this link into your browser:<br>
      <a href="{{ .InviteURL }}" style="color: #10b981; word-break: break-all;">{{ .InviteURL }}</a>
    </p>
    
    <div style="background: #fef3c7; border: 1px solid #fbbf24; border-radius: 6px; padding: 15px; margin: 20px 0;">
      <p style="margin: 0; color: #92400e; font-size: 14px;">
        <strong>⏰ Important:</strong> This invitation link will expire in 48 hours.
      </p>
    </div>
    
    <h3 style="color: #1f2937; margin-top: 30px;">What's Next?</h3>
    
    <ol style="color: #4b5563; padding-left: 20px;">
      <li>Click the setup link above</li>
      <li>Upload a profile picture (required)</li>
      <li>Create a secure password (required)</li>
      <li>Start managing the PESO system!</li>
    </ol>
    
    <div style="background: white; border: 1px solid #e5e7eb; border-radius: 6px; padding: 15px; margin: 20px 0;">
      <h4 style="margin-top: 0; color: #1f2937; font-size: 14px;">Password Requirements:</h4>
      <ul style="color: #6b7280; font-size: 13px; margin: 0; padding-left: 20px;">
        <li>At least 8 characters long</li>
        <li>At least one uppercase letter (A-Z)</li>
        <li>At least one lowercase letter (a-z)</li>
        <li>At least one number (0-9)</li>
        <li>At least one special character (!@#$%^&*)</li>
      </ul>
    </div>
    
    <p style="color: #6b7280; font-size: 13px; margin-top: 30px;">
      If you did not expect this invitation or believe it was sent in error, please ignore this email or contact your system administrator.
    </p>
    
  </div>
  
  <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
    <p style="margin: 0;">
      © 2026 PESO Parañaque. All rights reserved.
    </p>
    <p style="margin: 5px 0 0 0;">
      This is an automated message, please do not reply to this email.
    </p>
  </div>
  
</body>
</html>
```

### Email Body (Plain Text)
```
PESO Parañaque - Admin Portal
==============================

You've been invited!

Hello {{ .Name }},

You have been invited to join the PESO Parañaque Admin Portal as {{ .Role }}.

To complete your account setup, please visit the following link:

{{ .InviteURL }}

⏰ IMPORTANT: This invitation link will expire in 48 hours.

What's Next?
------------
1. Click the setup link above
2. Upload a profile picture (required)
3. Create a secure password (required)
4. Start managing the PESO system!

Password Requirements:
- At least 8 characters long
- At least one uppercase letter (A-Z)
- At least one lowercase letter (a-z)
- At least one number (0-9)
- At least one special character (!@#$%^&*)

If you did not expect this invitation or believe it was sent in error, please ignore this email or contact your system administrator.

© 2026 PESO Parañaque. All rights reserved.
This is an automated message, please do not reply to this email.
```

---

## Manual Email Instructions

If you need to manually send an invitation email (when automatic sending fails):

### 1. Copy the Template

Use this simplified version:

```
Subject: You're invited to join PESO Parañaque Admin Portal

Hello [ADMIN_NAME],

You have been invited to join the PESO Parañaque Admin Portal as [Administrator/Super Administrator].

To complete your account setup, please click this link:
[SETUP_LINK]

⏰ This invitation link will expire in 48 hours.

What you'll need to do:
1. Click the setup link above
2. Upload a profile picture (required)
3. Create a secure password meeting these requirements:
   • At least 8 characters long
   • At least one uppercase letter (A-Z)
   • At least one lowercase letter (a-z)
   • At least one number (0-9)
   • At least one special character (!@#$%^&*)

If you have any questions, please contact your system administrator.

Best regards,
PESO Parañaque Team
```

### 2. Replace Placeholders

- `[ADMIN_NAME]` → New admin's full name
- `[Administrator/Super Administrator]` → Choose appropriate role
- `[SETUP_LINK]` → The setup link (format: `https://yourapp.com/admin/setup-password?token=xxxxx`)

### 3. Send via Your Email Client

- Gmail, Outlook, or any email service
- Send to the new admin's email address
- Ensure the link is clickable (not broken across lines)

---

## Configuring Supabase Email Templates

To customize the automatic email template in Supabase:

### Step 1: Access Email Templates
1. Go to Supabase Dashboard
2. Navigate to **Authentication** → **Email Templates**
3. Find "Invite user" template

### Step 2: Customize Template

You can use these variables in your template:

- `{{ .Email }}` - New admin's email address
- `{{ .Token }}` - Invitation token
- `{{ .TokenHash }}` - Token hash
- `{{ .SiteURL }}` - Your application URL
- `{{ .ConfirmationURL }}` - Auto-generated confirmation URL
- `{{ .RedirectTo }}` - Redirect URL (your setup page)

### Step 3: Sample Custom Template

```html
<h2>Welcome to PESO Parañaque Admin Portal!</h2>
<p>You've been invited to join as an administrator.</p>
<p>Click here to set up your account:</p>
<p><a href="{{ .ConfirmationURL }}">Set Up Account</a></p>
<p>This link expires in 48 hours.</p>
```

### Step 4: Test Template
1. Save the template
2. Send a test invitation
3. Check your inbox
4. Verify the link works

---

## Troubleshooting Email Delivery

### Email Not Received?

**Check these:**
1. ✅ Spam/Junk folder
2. ✅ Email address is correct
3. ✅ Supabase email service is configured
4. ✅ SMTP settings are correct (if using custom SMTP)
5. ✅ Email rate limits not exceeded
6. ✅ Domain verification (if using custom domain)

### Supabase Email Logs

To check if email was sent:
1. Go to Supabase Dashboard
2. Navigate to **Logs** → **Auth Logs**
3. Look for "invite" events
4. Check for any error messages

### Common Issues

#### Issue 1: "Service role key required"
**Solution**: Add `SUPABASE_SERVICE_ROLE_KEY` to environment variables
```env
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Issue 2: "Email sending rate limit exceeded"
**Solution**: Wait a few minutes, or upgrade your Supabase plan

#### Issue 3: "SMTP not configured"
**Solution**: 
- Use default Supabase email service, OR
- Configure custom SMTP in Supabase Dashboard → Settings → Auth → SMTP

#### Issue 4: "Invalid redirect URL"
**Solution**: 
- Add your setup URL to allowed redirect URLs
- Supabase Dashboard → Authentication → URL Configuration
- Add: `https://yourapp.com/admin/setup-password*`

---

## Alternative: Manual Invitation Process

If automatic emails consistently fail:

### 1. Create Invitation Token
Admin clicks "Send Invitation" → Token is created

### 2. Copy Setup Link
System shows the setup link in the success message

### 3. Send via Alternative Method
- Direct message (Slack, Teams, etc.)
- SMS
- Manual email
- In-person communication

### 4. Admin Completes Setup
Admin clicks link and completes profile setup

---

## Email Variables Reference

When the API creates an invitation, these values are available:

| Variable | Example | Description |
|----------|---------|-------------|
| `name` | "Juan Dela Cruz" | New admin's full name |
| `email` | "juan@peso.gov.ph" | New admin's email |
| `is_superadmin` | `true` or `false` | Admin role level |
| `token` | "abc123xyz..." | 32-character invitation token |
| `inviteUrl` | "https://app.com/admin/setup-password?token=..." | Complete setup URL |
| `expiresAt` | "2026-01-20T10:30:00.000Z" | Token expiration time (48 hours) |

---

## Production Checklist

Before going to production:

- [ ] Test automatic email sending
- [ ] Verify emails don't go to spam
- [ ] Check links in emails are clickable
- [ ] Confirm redirect URLs are whitelisted
- [ ] Test on different email clients (Gmail, Outlook, Yahoo)
- [ ] Verify mobile email display
- [ ] Set up custom email domain (optional)
- [ ] Configure SPF/DKIM records (optional, for better deliverability)
- [ ] Monitor email delivery logs
- [ ] Prepare manual email template as backup

---

## Support

If you need help with email configuration:

1. Check Supabase email documentation
2. Review server logs for detailed error messages
3. Test with `/api/admin/invite/check` diagnostic endpoint
4. Contact your Supabase support (if on paid plan)

---

## Related Files

- `/src/app/api/admin/invite/route.ts` - Invitation API endpoint
- `/src/app/admin/setup-password/page.tsx` - Setup page
- `TROUBLESHOOTING_500_ERROR.md` - Troubleshooting guide
- `ADMIN_SETUP_GUIDE.md` - Complete admin setup guide