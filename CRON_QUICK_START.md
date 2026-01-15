# Cron-job.org Quick Start Guide

**Time Required**: 5 minutes

Follow these exact steps to set up automatic chat timeout management.

---

## Step 1: Generate Secret Token (2 minutes)

### Option A: Using Command Line (Mac/Linux/WSL)
```bash
openssl rand -hex 32
```

### Option B: Using PowerShell (Windows)
```powershell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```

### Option C: Online Generator
Visit: https://www.uuidgenerator.net/api/guid

**Copy the generated token** - you'll need it twice!

---

## Step 2: Add Secret to Vercel (1 minute)

1. Go to https://vercel.com/dashboard
2. Select your project
3. Click **Settings** → **Environment Variables**
4. Click **Add New**
5. Enter:
   - **Name**: `CRON_SECRET`
   - **Value**: [Paste your token from Step 1]
   - **Environments**: ✅ All (Production, Preview, Development)
6. Click **Save**
7. Go to **Deployments** tab → Click **...** menu → **Redeploy**
8. Wait for deployment to complete

---

## Step 3: Create Cron-job.org Account (1 minute)

1. Visit: https://cron-job.org/en/signup/
2. Fill in:
   - Email
   - Password
   - Username
3. Click **Sign Up**
4. Check your email and click verification link
5. Log in to https://cron-job.org/

---

## Step 4: Create the Cron Job (1 minute)

1. Click **Cronjobs** in left sidebar
2. Click **Create cronjob** button
3. Fill in the form:

### Title
```
PESO Chat Timeout
```

### URL
```
https://YOUR-DOMAIN.vercel.app/api/cron/check-chat-timeouts
```
⚠️ **Replace `YOUR-DOMAIN`** with your actual Vercel URL!

**Examples**:
- `https://peso-jobs.vercel.app/api/cron/check-chat-timeouts`
- `https://my-app-abc123.vercel.app/api/cron/check-chat-timeouts`

### Schedule
- Click **Every minute** radio button
- Or enter: `* * * * *`

### Authentication
1. Scroll to **Request** section
2. Click **Headers** tab
3. Click **+ Add custom request header**
4. Enter:
   - **Header name**: `Authorization`
   - **Header value**: `Bearer YOUR_TOKEN_FROM_STEP_1`

⚠️ **Replace `YOUR_TOKEN_FROM_STEP_1`** with the token you generated!

**Example**:
```
Authorization: Bearer a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6
```

### Notifications (Recommended)
Scroll to **Notifications** section:
- ✅ Enable "Send email on execution failures"
- Set to: **3 consecutive failures**

### Save
Click **Create cronjob** at the bottom

---

## Step 5: Verify (30 seconds)

### Check Execution
1. Wait 1-2 minutes
2. In cron-job.org, click your cronjob name
3. Click **History** tab
4. You should see:
   - ✅ Status: **200 OK**
   - ✅ Duration: ~100-500ms
   - ✅ Green checkmark

### Check Vercel Logs (Optional)
1. Vercel Dashboard → Your project
2. Click **Deployments** → Select production
3. Click **Functions** tab
4. Look for logs showing:
```
[Cron] Starting chat timeout check...
[Cron] No expired chat sessions found
```

---

## ✅ Done!

Your chat timeout system is now running automatically every minute.

---

## Testing

### Test Chat Timeout
1. Log in as a user
2. Start a chat
3. Send one message
4. Wait 2+ minutes
5. Check that:
   - ✅ Session auto-closes
   - ✅ Timeout message appears
   - ✅ Admin sees session move to "Closed" tab

### Test Manually
```bash
# Replace with your actual values
curl -X POST \
  -H "Authorization: Bearer YOUR_SECRET_TOKEN" \
  https://your-domain.vercel.app/api/cron/check-chat-timeouts
```

Expected response:
```json
{
  "success": true,
  "closedCount": 0,
  "message": "No expired sessions",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

## Troubleshooting

### Error: 401 Unauthorized
❌ **Problem**: Authorization header doesn't match secret

✅ **Fix**:
1. Check `Authorization` header in cron-job.org
2. Check `CRON_SECRET` in Vercel environment variables
3. Make sure they match exactly
4. Format: `Bearer YOUR_TOKEN` (with space after "Bearer")
5. Redeploy Vercel after changing environment variable

### Error: 500 Internal Server Error
❌ **Problem**: Application error

✅ **Fix**:
1. Check Vercel function logs for detailed error
2. Verify Supabase connection is working
3. Test endpoint manually with curl

### No Executions Showing
❌ **Problem**: Cron job not running

✅ **Fix**:
1. Verify cron job status is "Active" (not paused)
2. Check schedule is `* * * * *`
3. Check your email for suspension notices
4. Try creating a new cron job

---

## Important Notes

⚠️ **Security**: Never commit `CRON_SECRET` to Git
⚠️ **Token**: Use the SAME token in both Vercel and cron-job.org
⚠️ **URL**: Make sure to use your actual Vercel domain
⚠️ **Deploy**: Always redeploy after changing environment variables

---

## Quick Reference

| Setting | Value |
|---------|-------|
| URL | `https://YOUR-DOMAIN.vercel.app/api/cron/check-chat-timeouts` |
| Schedule | `* * * * *` (every minute) |
| Header Name | `Authorization` |
| Header Value | `Bearer YOUR_SECRET_TOKEN` |
| Expected Response | `200 OK` |
| Frequency | 60 times per hour |

---

## Need More Help?

- 📖 **Detailed Guide**: See `CRON_JOB_ORG_SETUP.md`
- 🔧 **Timeout Details**: See `CHAT_TIMEOUT_GUIDE.md`
- 🧪 **Testing**: See `test-chat-closing.md`

---

**All set! Your chats will now automatically close after 2 minutes of inactivity.** 🎉