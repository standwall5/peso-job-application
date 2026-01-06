# Profile Contact Information Setup Guide

This guide explains how to set up and use the email-based OTP verification system in the PESO Job Application.

## 🎯 Features

- **Name Editing**: Direct name update with edit icon
- **Email Change**: Email verification with OTP sent to new email
- **Phone Change**: Phone verification with OTP sent to current email (FREE!)
- **Modern UI**: Follows the DESIGN_SYSTEM.md guidelines
- **100% Free**: Uses email-only verification (no SMS costs!)

## 💡 Why Email-Only?

**Industry Standard**: Many major platforms (GitHub, LinkedIn, Facebook) use email verification for secondary contact changes. This is:
- ✅ **FREE** - No SMS costs
- ✅ **Secure** - Email is already verified
- ✅ **Standard** - Common practice in the industry
- ✅ **Simple** - No third-party SMS service needed

**How it works:**
- **Email Change**: OTP sent to NEW email address
- **Phone Change**: OTP sent to CURRENT email (verifies account ownership)
- **Name Change**: No verification needed

## 📋 Prerequisites

### 1. Database Setup

Create the `otp_verifications` table by running the SQL migration:

```sql
-- Run this in your Supabase SQL Editor
-- File: sql/create_otp_verifications_table.sql
```

Navigate to your Supabase project → SQL Editor → New Query, then paste and execute the contents of `sql/create_otp_verifications_table.sql`.

### 2. Email Service (Optional - For Production)

For **development**, OTP codes are logged to console (free).

For **production**, choose one option:

#### Option A: Supabase Built-in Email (Free)
- Already configured with your Supabase project
- Update `contact.service.ts` to use Supabase email templates
- Limited customization

#### Option B: Resend (Recommended - Free Tier Available)
1. Sign up at [https://resend.com](https://resend.com)
2. Get your API key
3. Add to `.env.local`:
   ```env
   RESEND_API_KEY=re_xxxxxxxxxxxxx
   ```
4. Install: `npm install resend`
5. Uncomment Resend code in `contact.service.ts`

#### Option C: Other Services (Free Tiers)
- **SendGrid**: 100 emails/day free
- **Mailgun**: 5,000 emails/month free (first 3 months)
- **AWS SES**: 62,000 emails/month free (if on AWS)

## 🚀 How It Works

### Phone Number Verification Flow

1. User clicks "Edit" in profile details
2. User clicks edit icon next to phone number
3. Modal opens asking for new phone number
4. User enters new phone number
5. System sends 6-digit OTP to **user's current email**
6. User checks email and enters OTP code
7. System verifies OTP and updates phone number
8. Profile refreshes with new phone number

**Why email?** This verifies the user owns the account before changing the phone number.

### Email Verification Flow

1. User clicks "Edit" in profile details
2. User clicks edit icon next to email
3. Modal opens asking for new email address
4. User enters new email address
5. System sends 6-digit OTP to **new email address**
6. User checks new email and enters OTP code
7. System verifies OTP and updates email in auth.users
8. Supabase sends confirmation link to new email
9. User must click confirmation link for full activation

### Name Update Flow

1. User clicks edit icon next to name
2. Modal opens with current name
3. User enters new name
4. System updates name directly (no OTP required)
5. Profile refreshes with new name

## 🔒 Security Features

### OTP Security
- OTP codes are 6 digits (100,000 - 999,999)
- Valid for 10 minutes only
- Stored securely in database
- Deleted after verification or expiration
- Each user can have only one active OTP per type/value

### Database Security
- Row Level Security (RLS) enabled
- Users can only access their own OTP records
- Expired OTPs are automatically cleaned up
- OTP codes are not exposed in logs (production)

### Phone/Email Security
- Email change requires confirmation link from Supabase
- Phone change requires email verification (proves account ownership)
- All changes are logged in audit trail (future feature)

## 🎨 UI Components

### EditContactModal
Modern modal component with:
- Smooth animations (fadeIn, slideUp)
- Loading states
- Error handling
- Countdown timer for resend
- Responsive design (mobile-friendly)
- Follows DESIGN_SYSTEM.md patterns

### ProfileHeader
Updated profile header with:
- Edit icon next to name
- Edit buttons for phone and email
- Modern info cards with icons
- Gradient accents on hover
- Clean, organized layout

## 🧪 Testing

### Development Testing

OTP codes are logged to server console:

```
[OTP] Type: email, Email: newemail@example.com, Code: 123456
[OTP] Type: phone, Email: current@example.com, Code: 654321
```

**To test:**
1. Start dev server: `npm run dev`
2. Go to profile page
3. Click edit icon for phone/email
4. Enter new value
5. Check server console for OTP code
6. Enter code in modal
7. Verify success

### Production Testing

With Resend (or other service):
1. Configure email service in `contact.service.ts`
2. Test with real email addresses
3. Verify email delivery
4. Check spam folders if needed
5. Monitor email service dashboard

## 📊 Database Maintenance

### Cleanup Expired OTPs

The system includes a cleanup function. Run it periodically:

```sql
-- Run in Supabase SQL Editor or via cron job
SELECT cleanup_expired_otps();
```

**Recommended**: Set up a Supabase Edge Function or PostgreSQL cron job to run this daily.

### Monitor OTP Table

```sql
-- Check active OTPs
SELECT * FROM otp_verifications WHERE verified = false;

-- Check expired OTPs
SELECT * FROM otp_verifications WHERE expires_at < NOW();

-- Count OTPs by type
SELECT type, COUNT(*) FROM otp_verifications GROUP BY type;
```

## 🐛 Troubleshooting

### Email Not Received?

**Development:**
- Check server console for OTP code
- Verify user has an email in auth.users

**Production:**
- Check spam folder
- Verify email service configuration
- Check email service logs/dashboard
- Verify API key is correct
- Check rate limits

### OTP Invalid/Expired

1. **Check system time** is correct
2. **Verify OTP entered correctly** (6 digits)
3. **Check if OTP expired** (10 minute limit)
4. **Request new OTP** using resend button

### Modal Not Opening?

1. **Check browser console** for errors
2. **Verify all files** are created correctly
3. **Check import paths** are correct
4. **Clear browser cache** and reload

### Phone Change Confusion?

Users might be confused that OTP goes to email, not phone. Add clear messaging:
- "We'll send a verification code to your email"
- "Check your email for the verification code"
- UI already shows this in the modal

## 🔄 Implementing Email Service (Production)

### Option 1: Resend (Recommended)

1. Install Resend:
```bash
npm install resend
```

2. Add to `.env.local`:
```env
RESEND_API_KEY=re_xxxxxxxxxxxxx
```

3. Update `src/lib/db/services/contact.service.ts`:

Uncomment the Resend code block (lines ~38-62) and customize the email template.

### Option 2: SendGrid

1. Install SendGrid:
```bash
npm install @sendgrid/mail
```

2. Add to `.env.local`:
```env
SENDGRID_API_KEY=SG.xxxxxxxxxxxxx
```

3. Add to `contact.service.ts`:
```typescript
const sgMail = await import('@sendgrid/mail');
sgMail.default.setApiKey(process.env.SENDGRID_API_KEY!);

await sgMail.default.send({
  to: targetEmail,
  from: 'noreply@yourdomain.com',
  subject: 'Verification Code - PESO',
  html: `Your code is: <strong>${otp}</strong>`,
});
```

### Option 3: Supabase Email

Configure custom SMTP in Supabase Dashboard:
1. Go to Settings → Auth → Email Templates
2. Create custom template for OTP
3. Use Supabase's `auth.admin` functions to send

## 💰 Cost Comparison

| Service | Free Tier | Cost After |
|---------|-----------|------------|
| **Email (Resend)** | 3,000/month | $20/100k emails |
| **Email (SendGrid)** | 100/day | $20/month |
| **SMS (Twilio)** | Trial only | $0.0075/SMS |
| **Supabase Email** | Included | Included |

**For 1,000 verifications/month:**
- Email: **FREE** (within all free tiers)
- SMS: **$7.50/month** minimum

## 🎯 Best Practices

### For Users
- Keep email address up to date
- Check spam folder for OTP emails
- Don't share OTP codes
- Use strong, unique passwords

### For Developers
- Rate limit OTP requests (5 per hour per user)
- Clear messaging about email verification
- Monitor OTP success rates
- Set up email delivery alerts
- Use templates for consistent branding
- Add CAPTCHA for abuse prevention

## 🚀 Production Checklist

Before deploying:
- [ ] Run database migration
- [ ] Configure email service (Resend/SendGrid)
- [ ] Test OTP flow end-to-end
- [ ] Set up OTP cleanup cron job
- [ ] Add rate limiting
- [ ] Configure email templates
- [ ] Test on staging environment
- [ ] Monitor email delivery rates
- [ ] Set up error alerts

## 📝 Changelog

### v1.0.0 (January 2025)
- Initial implementation
- Email-only OTP verification (FREE!)
- Phone verification via email
- Email verification via email
- Name update functionality
- Modern UI following design system
- OTP expiration and cleanup
- Row Level Security implementation

---

**Last Updated**: January 2025  
**Maintained By**: Development Team  
**Cost**: 100% FREE with email-only verification! 🎉