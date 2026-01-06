# Quick Start: Email Change Flow

## ⚡ Setup (2 minutes)

### 1. Run Database Migration

Open Supabase SQL Editor and run:
```sql
-- File: sql/create_email_change_tokens_table.sql
```

Or copy and paste the SQL file content directly into Supabase.

### 2. Verify Environment Variable

Check `.env.local` has:
```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 3. Start Dev Server

```bash
npm run dev
```

---

## 🧪 Testing (5 minutes)

### Test Email Change

1. **Navigate to Profile**
   - Go to `http://localhost:3000/profile`
   - Log in if needed

2. **Click Edit Email**
   - Click the pencil icon next to EMAIL
   - Enter a new email address (e.g., `newemail@example.com`)
   - Click "Send Confirmation"

3. **Check Server Console**
   - Look for output like:
   ```
   [EMAIL CHANGE] User: current@example.com, New Email: newemail@example.com, 
   Confirmation URL: http://localhost:3000/profile/confirm-email-change?token=abc123...
   ```

4. **Copy and Visit URL**
   - Copy the entire URL from console
   - Paste into browser
   - You should see success page with instructions

5. **Check Supabase Logs**
   - Go to Supabase Dashboard → Authentication → Logs
   - You should see Supabase attempting to send confirmation to new email
   - In production, user would click that link to complete

### Test Phone Change

1. Click edit icon next to PHONE
2. Enter new phone number
3. Click "Update Phone"
4. Should update immediately (no confirmation)

### Test Name Change

1. Click edit icon next to name
2. Enter new name
3. Click "Save"
4. Should update immediately (no confirmation)

---

## 🎯 What Happens

### Email Change Flow:

```
User enters new email
    ↓
System sends link to CURRENT email (proves ownership)
    ↓
User clicks link in current email
    ↓
System calls Supabase auth.updateUser()
    ↓
Supabase sends confirmation to NEW email
    ↓
User clicks Supabase link
    ↓
✅ Email changed!
```

### Why Two Confirmations?

1. **First (Current Email)**: Security - proves YOU requested this
2. **Second (New Email)**: Verification - proves new email is valid and accessible

---

## 📧 Production Setup

### Option 1: Supabase SMTP (Easiest)

1. Go to Supabase Dashboard
2. Project Settings → Authentication
3. Configure SMTP settings
4. Done! Emails will be sent automatically

### Option 2: Resend (Recommended)

1. Install Resend:
   ```bash
   npm install resend
   ```

2. Add to `.env.local`:
   ```env
   RESEND_API_KEY=re_xxxxxxxxxxxxx
   ```

3. Edit `src/lib/db/services/contact.service.ts` around line 62
4. Uncomment the Resend code block
5. Update `from` email to your verified domain

---

## 🐛 Troubleshooting

### "Can't find confirmation link"
- **Dev**: It's in your server console (terminal), not sent via email
- **Prod**: Check email spam folder or email service logs

### "Email didn't change"
- Did you click BOTH links?
  1. Link in current email (from your system)
  2. Link in new email (from Supabase)
- Email won't change until both are clicked

### "Token expired"
- Tokens last 1 hour
- Request new email change if expired

### "Invalid token"
- Token was already used (one-time use)
- Request new email change

---

## ✅ Success Checklist

- [ ] Database migration ran successfully
- [ ] Can request email change
- [ ] Confirmation link appears in console
- [ ] Can visit confirmation page
- [ ] Success page shows instructions
- [ ] Phone updates directly
- [ ] Name updates directly

---

## 📚 More Info

See `EMAIL_CHANGE_FLOW.md` for:
- Complete architecture details
- Security features
- API reference
- Production deployment guide

---

**Need Help?** Check the server console for detailed error messages!