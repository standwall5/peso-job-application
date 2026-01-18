# Email Setup Guide for Admin Invitations

This guide will help you configure email sending for admin invitation functionality.

---

## Quick Start

### Option 1: Use Supabase Default Email (Easiest)

Supabase provides a default email service that works out of the box for development and testing.

**No configuration needed!** Just ensure you have:
- `NEXT_PUBLIC_SUPABASE_URL` in your `.env.local`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` in your `.env.local`
- `SUPABASE_SERVICE_ROLE_KEY` in your `.env.local`

**Limitations:**
- Rate limited (few emails per hour)
- Emails may go to spam
- "noreply@mail.app.supabase.io" sender address
- Not suitable for production

---

## Option 2: Configure Custom SMTP (Recommended for Production)

### Step 1: Get SMTP Credentials

Choose an email service provider:

#### Gmail (Personal/Testing)
1. Enable 2-factor authentication on your Google account
2. Go to Google Account → Security → 2-Step Verification → App passwords
3. Generate an app password for "Mail"
4. Use these settings:
   - Host: `smtp.gmail.com`
   - Port: `587` (TLS) or `465` (SSL)
   - Username: Your Gmail address
   - Password: Generated app password

#### SendGrid (Recommended for Production)
1. Sign up at https://sendgrid.com
2. Create an API key: Settings → API Keys → Create API Key
3. Use these settings:
   - Host: `smtp.sendgrid.net`
   - Port: `587`
   - Username: `apikey`
   - Password: Your API key

#### AWS SES (Enterprise)
1. Set up AWS SES in your region
2. Verify your domain
3. Create SMTP credentials
4. Use the provided SMTP settings

#### Mailgun
1. Sign up at https://mailgun.com
2. Add and verify your domain
3. Get SMTP credentials from domain settings
4. Use provided settings

---

### Step 2: Configure Supabase SMTP

1. **Go to Supabase Dashboard**
   - Navigate to your project
   - Go to **Settings** → **Authentication**

2. **Scroll to "SMTP Settings"**

3. **Enable Custom SMTP**
   - Toggle "Enable Custom SMTP Provider"

4. **Enter SMTP Details**
   ```
   Sender email: noreply@yourdomain.com
   Sender name: PESO Parañaque
   Host: smtp.your-provider.com
   Port: 587
   Username: your-smtp-username
   Password: your-smtp-password
   ```

5. **Save Settings**

6. **Test Email**
   - Send a test invitation
   - Check if email is received
   - Check spam folder if not in inbox

---

### Step 3: Configure Email Templates

1. **Go to Authentication → Email Templates**

2. **Select "Invite user" template**

3. **Customize the template** (optional):
   ```html
   <h2>Welcome to PESO Parañaque!</h2>
   <p>You've been invited to join as an administrator.</p>
   <p><a href="{{ .ConfirmationURL }}">Set up your account</a></p>
   <p>This link expires in 48 hours.</p>
   ```

4. **Available Variables:**
   - `{{ .Email }}` - Recipient email
   - `{{ .Token }}` - Invitation token
   - `{{ .ConfirmationURL }}` - Setup link
   - `{{ .RedirectTo }}` - Redirect URL after setup
   - `{{ .SiteURL }}` - Your app URL

5. **Save Template**

---

## Environment Variables

### Required Variables

Add these to your `.env.local` (development) and deployment environment (production):

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Application URL
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

### Getting Service Role Key

1. Go to Supabase Dashboard
2. Navigate to **Settings** → **API**
3. Copy the `service_role` key (NOT the anon key!)
4. Add to environment variables

**⚠️ Important:** Keep the service role key secret! Never commit it to version control.

---

## Vercel Deployment Setup

### Add Environment Variables

1. Go to Vercel Dashboard → Your Project
2. Navigate to **Settings** → **Environment Variables**
3. Add each variable:
   - Name: `NEXT_PUBLIC_SUPABASE_URL`
   - Value: Your Supabase URL
   - Environments: Production, Preview, Development
4. Repeat for all variables
5. Redeploy your application

---

## Testing Email Delivery

### Test Checklist

- [ ] Send a test invitation
- [ ] Email received within 1 minute
- [ ] Email not in spam folder
- [ ] Links in email are clickable
- [ ] Setup page loads when clicking link
- [ ] Branding/styling looks correct
- [ ] Test on different email clients (Gmail, Outlook, Apple Mail)

### Test Command

```bash
# In browser console or API testing tool
fetch('/api/admin/invite', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'your-test@email.com',
    name: 'Test Admin',
    is_superadmin: false
  })
})
.then(r => r.json())
.then(console.log);
```

---

## Troubleshooting

### Email Not Received

**Check:**
1. ✅ Spam/junk folder
2. ✅ Email address is correct
3. ✅ SMTP settings are correct
4. ✅ Sender email is verified (for custom SMTP)
5. ✅ Service role key is set correctly
6. ✅ Supabase email logs (Dashboard → Logs → Auth)

### "Service role key required" Error

**Solution:**
1. Verify `SUPABASE_SERVICE_ROLE_KEY` is in environment variables
2. Restart your development server
3. Redeploy if in production
4. Check the key is the service_role, not anon key

### Emails Going to Spam

**Solutions:**
1. **Verify sender domain:**
   - Add SPF record to DNS
   - Add DKIM record to DNS
   - Add DMARC record to DNS

2. **Use a reputable SMTP provider:**
   - SendGrid, Mailgun, AWS SES have good deliverability

3. **Improve email content:**
   - Avoid spam trigger words
   - Include unsubscribe link
   - Use proper HTML formatting

### Rate Limit Exceeded

**Solution:**
- Wait a few minutes before sending more
- Upgrade Supabase plan for higher limits
- Use a custom SMTP provider with higher limits

---

## DNS Configuration for Better Deliverability

### SPF Record

Add this TXT record to your DNS:

```
Type: TXT
Name: @
Value: v=spf1 include:_spf.your-smtp-provider.com ~all
```

### DKIM Record

Get DKIM values from your SMTP provider and add as TXT records.

### DMARC Record

```
Type: TXT
Name: _dmarc
Value: v=DMARC1; p=none; rua=mailto:dmarc@yourdomain.com
```

---

## Production Best Practices

1. **Use Custom SMTP Provider**
   - More reliable than default Supabase email
   - Better deliverability
   - Higher sending limits

2. **Verify Your Domain**
   - Reduces spam likelihood
   - Professional appearance
   - Better trust signals

3. **Monitor Email Logs**
   - Check Supabase auth logs regularly
   - Monitor SMTP provider dashboard
   - Set up alerts for failures

4. **Have a Fallback**
   - Display invitation link in UI if email fails
   - Provide manual copy-paste option
   - Document manual invitation process

5. **Test Regularly**
   - Send test invitations monthly
   - Test different email providers
   - Verify links still work

---

## Alternative: Manual Invitation Process

If automatic emails are not working, you can manually send invitation links:

### Process

1. **Create Invitation** (generates token and link)
2. **Copy Setup Link** from success message or API response
3. **Send via Alternative Method:**
   - Direct message (Slack, Teams, etc.)
   - Manual email from your email client
   - SMS
   - In-person communication

4. **Admin Completes Setup** using the link

### Getting the Link

When invitation is created, the API returns:
```json
{
  "inviteUrl": "https://yourapp.com/admin/setup-password?token=abc123...",
  "expiresAt": "2026-01-20T10:30:00.000Z"
}
```

Copy the `inviteUrl` and send it to the new admin.

---

## Email Template Customization

### Using Variables

Supabase email templates support these variables:

```html
<p>Hello {{ .Email }},</p>
<p>Click here: <a href="{{ .ConfirmationURL }}">Setup Account</a></p>
<p>Expires: 48 hours from now</p>
```

### Custom Branding

Add your organization's:
- Logo (hosted image URL)
- Colors (hex codes)
- Footer text
- Contact information

Example:
```html
<div style="background: #10b981; padding: 20px;">
  <img src="https://yoursite.com/logo.png" alt="PESO Logo" width="150">
</div>
```

---

## Security Considerations

1. **Keep Service Role Key Secret**
   - Never commit to Git
   - Use environment variables only
   - Rotate if compromised

2. **Verify Recipients**
   - Only send to valid email addresses
   - Implement email validation
   - Prevent spam/abuse

3. **Rate Limiting**
   - Implement invitation rate limits
   - Track who creates invitations
   - Monitor for abuse

4. **Link Expiration**
   - 48-hour expiration is enforced
   - Tokens are single-use
   - Old tokens cannot be reused

---

## Support Resources

- [Supabase Email Documentation](https://supabase.com/docs/guides/auth/auth-email)
- [Supabase SMTP Setup](https://supabase.com/docs/guides/auth/auth-smtp)
- [EMAIL_TEMPLATE_ADMIN_INVITE.md](./EMAIL_TEMPLATE_ADMIN_INVITE.md) - Email templates
- [TROUBLESHOOTING_500_ERROR.md](./TROUBLESHOOTING_500_ERROR.md) - API troubleshooting

---

## Quick Reference

### SMTP Providers Comparison

| Provider | Free Tier | Ease of Setup | Best For |
|----------|-----------|---------------|----------|
| Supabase Default | Limited | ⭐⭐⭐⭐⭐ Easy | Development |
| Gmail | Yes | ⭐⭐⭐⭐ Easy | Testing |
| SendGrid | 100/day | ⭐⭐⭐⭐ Easy | Production |
| Mailgun | 1000/mo | ⭐⭐⭐ Medium | Production |
| AWS SES | 62,000/mo | ⭐⭐ Complex | Enterprise |

### Common SMTP Ports

- **587** - TLS/STARTTLS (Recommended)
- **465** - SSL (Legacy but widely supported)
- **25** - Plain (Usually blocked by ISPs)
- **2525** - Alternative (Some providers use this)

---

## Summary

1. **Development:** Use Supabase default email (no setup required)
2. **Production:** Configure custom SMTP (SendGrid recommended)
3. **Always:** Set `SUPABASE_SERVICE_ROLE_KEY` environment variable
4. **Fallback:** Display invitation link if email fails
5. **Monitor:** Check email logs regularly

For most users, the default Supabase email is sufficient for testing. For production, invest time in setting up proper SMTP with a reliable provider.