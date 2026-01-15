# Setting Up Cron-job.org for Chat Timeout Management

This guide walks you through integrating cron-job.org (a free external cron service) to automatically close inactive chat sessions every minute.

## Why Use Cron-job.org?

- **Free tier available**: Run jobs as frequently as every minute
- **No Vercel Pro required**: Works with Vercel's free tier
- **Reliable**: Dedicated service for running scheduled tasks
- **Easy monitoring**: Web dashboard to track executions
- **Email alerts**: Get notified if jobs fail

## Prerequisites

- Your application deployed to a public URL (e.g., Vercel)
- A cron-job.org account (free)

---

## Step 1: Set Up CRON_SECRET Environment Variable

First, create a secret token to secure your cron endpoint.

### 1.1 Generate a Secret Token

```bash
# Generate a random secret (on Mac/Linux)
openssl rand -hex 32

# Or use an online generator
# Visit: https://www.random.org/strings/
```

Copy the generated token (e.g., `a1b2c3d4e5f6...`)

### 1.2 Add to Local Environment

Create or edit `.env.local`:

```env
# Add this line
CRON_SECRET=your-generated-secret-token-here
```

### 1.3 Add to Vercel Environment Variables

1. Go to your Vercel project dashboard
2. Click **Settings** → **Environment Variables**
3. Add new variable:
   - **Name**: `CRON_SECRET`
   - **Value**: `your-generated-secret-token-here`
   - **Environments**: Select all (Production, Preview, Development)
4. Click **Save**
5. **Redeploy** your application for changes to take effect

---

## Step 2: Create Cron-job.org Account

### 2.1 Sign Up

1. Visit https://cron-job.org/
2. Click **Sign Up** (top right)
3. Fill in your details:
   - Email address
   - Password
   - Username
4. Verify your email address

### 2.2 Log In

After email verification, log in to your dashboard.

---

## Step 3: Create the Cron Job

### 3.1 Navigate to Cronjobs

1. In the cron-job.org dashboard, click **Cronjobs** in the left sidebar
2. Click **Create cronjob** button

### 3.2 Configure Basic Settings

Fill in the form:

#### **Title**
```
PESO Chat Timeout Checker
```

#### **Address (URL)**
```
https://your-domain.vercel.app/api/cron/check-chat-timeouts
```

**Replace** `your-domain.vercel.app` with your actual Vercel deployment URL.

**Examples**:
- `https://peso-job-application.vercel.app/api/cron/check-chat-timeouts`
- `https://peso-jobs.com/api/cron/check-chat-timeouts`

### 3.3 Configure Schedule

Scroll to **Schedule** section:

#### **Execution**
- Select: **Every minute**

Or use advanced mode:
```
* * * * *
```
This means: "Every minute of every hour of every day"

#### **Time zone**
- Select: **UTC** (recommended) or **Asia/Manila** (if you prefer)

### 3.4 Add Authentication Header

Scroll to **Request** section:

1. Click **Headers** tab
2. Click **Add custom request header**
3. Fill in:
   - **Header name**: `Authorization`
   - **Header value**: `Bearer your-generated-secret-token-here`

**Important**: Replace `your-generated-secret-token-here` with the SAME token you added to Vercel environment variables.

**Example**:
```
Authorization: Bearer a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
```

### 3.5 Configure Notifications (Optional but Recommended)

Scroll to **Notifications** section:

#### **Failure notifications**
- ✅ Enable "Send email on execution failures"
- Set: **Notify after 3 consecutive failures**

#### **Success notifications**
- ❌ Leave disabled (to avoid spam)

### 3.6 Save the Cron Job

1. Review all settings
2. Click **Create cronjob** button at the bottom
3. Confirm the job appears in your cronjobs list

---

## Step 4: Verify It's Working

### 4.1 Check Execution History

1. In cron-job.org dashboard, click on your cronjob
2. Navigate to **History** tab
3. Wait 1-2 minutes for first execution
4. You should see entries like:

```
Status: 200 OK
Duration: 150ms
Date: 2024-01-15 10:30:00
```

### 4.2 Check Vercel Logs

1. Go to Vercel dashboard
2. Click **Deployments** → select your production deployment
3. Click **Functions** tab
4. Look for logs from `/api/cron/check-chat-timeouts`

Expected logs:
```
[Cron] Starting chat timeout check...
[Cron] No expired chat sessions found
```

Or if sessions were closed:
```
[Cron] Starting chat timeout check...
[Cron] Found 2 expired session(s)
[Cron] Successfully closed 2 expired session(s)
```

### 4.3 Test Manually

You can trigger the endpoint manually to test:

```bash
# Replace with your actual values
curl -X POST \
  -H "Authorization: Bearer your-secret-token" \
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

## Step 5: Remove Vercel Cron Configuration (Optional)

Since you're now using cron-job.org, you can remove the Vercel cron configuration to avoid conflicts.

### Edit `vercel.json`

Change from:
```json
{
  "buildCommand": "npm install --include=optional && next build",
  "installCommand": "npm install --include=optional",
  "crons": [
    {
      "path": "/api/cron/check-chat-timeouts",
      "schedule": "* * * * *"
    }
  ]
}
```

To:
```json
{
  "buildCommand": "npm install --include=optional && next build",
  "installCommand": "npm install --include=optional"
}
```

Then redeploy your application.

---

## Monitoring & Maintenance

### Check Status Regularly

Visit your cron-job.org dashboard weekly to:
- ✅ Verify executions are successful (green checkmarks)
- ✅ Check response times are reasonable (<1 second)
- ✅ Review any failure notifications

### Success Indicators

Your cron job is working correctly if:
- ✅ Executions run every minute (60 executions per hour)
- ✅ Status code is `200 OK`
- ✅ Duration is under 1000ms
- ✅ No error notifications received

### What to Do If It Fails

#### Common Issues & Solutions

**Issue 1: Status 401 Unauthorized**
- **Cause**: Authorization header is incorrect or missing
- **Fix**: 
  1. Check the `Authorization` header in cron-job.org matches your `CRON_SECRET`
  2. Ensure `CRON_SECRET` is set in Vercel environment variables
  3. Redeploy after changing environment variables

**Issue 2: Status 500 Internal Server Error**
- **Cause**: Application error or database connection issue
- **Fix**:
  1. Check Vercel function logs for detailed error
  2. Verify Supabase connection is working
  3. Test endpoint manually with curl

**Issue 3: Timeouts (no response)**
- **Cause**: Function taking too long or not responding
- **Fix**:
  1. Check Vercel function timeout settings (default: 10s)
  2. Optimize database queries
  3. Check for infinite loops in code

**Issue 4: Executions not running**
- **Cause**: Cron job is paused or misconfigured
- **Fix**:
  1. Check cron job status in dashboard (should be "Active")
  2. Verify schedule is correct (`* * * * *`)
  3. Check email for suspension notices

---

## Advanced Configuration

### Adjust Frequency (If Needed)

If you want to run less frequently to reduce load:

**Every 2 minutes**:
```
*/2 * * * *
```

**Every 5 minutes**:
```
*/5 * * * *
```

**Note**: For chat timeouts, running every minute is recommended for best user experience.

### Add Monitoring Webhook (Optional)

You can set up a webhook to get notified of executions:

1. In cron-job.org, go to **Settings** → **Notifications**
2. Add a webhook URL (e.g., Slack, Discord)
3. Configure when to trigger (failures only recommended)

### Set Up Backup Cron Job

For redundancy, create a second cron job:

1. Use a different service (e.g., EasyCron.com)
2. Point to the same endpoint
3. Run at offset time (e.g., 30 seconds after the minute)

This ensures timeouts are handled even if one service fails.

---

## Troubleshooting Guide

### How to Debug

1. **Check cron-job.org execution logs**:
   - Go to your cronjob → History tab
   - Click on a failed execution to see details

2. **Check Vercel function logs**:
   - Vercel Dashboard → Deployment → Functions
   - Look for `/api/cron/check-chat-timeouts` logs

3. **Test the endpoint directly**:
   ```bash
   curl -X POST \
     -H "Authorization: Bearer YOUR_SECRET" \
     -v \
     https://your-domain.vercel.app/api/cron/check-chat-timeouts
   ```

4. **Check database**:
   ```sql
   -- See if any sessions should be timed out
   SELECT id, status, last_user_message_at,
          NOW() - last_user_message_at as inactive_for
   FROM chat_sessions
   WHERE status IN ('pending', 'active')
     AND last_user_message_at < NOW() - INTERVAL '2 minutes';
   ```

### Getting Help

If issues persist:
1. Check cron-job.org documentation: https://cron-job.org/en/documentation/
2. Review Vercel function logs for errors
3. Test locally: `npm run dev` and call endpoint with curl
4. Check Supabase logs for database connection issues

---

## Security Best Practices

✅ **DO**:
- Use a strong, random `CRON_SECRET`
- Keep the secret in environment variables only (never in code)
- Use HTTPS for all requests
- Enable failure notifications
- Regularly review execution logs

❌ **DON'T**:
- Commit `CRON_SECRET` to Git
- Share your secret publicly
- Use weak/predictable secrets
- Disable authentication (remove the header)
- Ignore failure notifications

---

## Cost & Limits

### Cron-job.org Free Tier
- ✅ Up to 50 cronjobs
- ✅ 1-minute minimum interval
- ✅ Email notifications
- ✅ Execution history (30 days)
- ✅ No credit card required

**Perfect for chat timeout management!**

### Vercel Free Tier Impact
- Function invocations: ~43,200 per month (1 per minute)
- Function duration: ~0.1-0.5 seconds per execution
- Well within Vercel's free tier limits (100GB-hours)

---

## Summary Checklist

Before going live, ensure:

- [ ] `CRON_SECRET` set in `.env.local`
- [ ] `CRON_SECRET` set in Vercel environment variables
- [ ] Application redeployed after adding environment variable
- [ ] Cron-job.org account created and verified
- [ ] Cron job created with correct URL
- [ ] Authorization header added with correct secret
- [ ] Schedule set to `* * * * *` (every minute)
- [ ] Test execution successful (200 OK)
- [ ] Vercel logs show cron job running
- [ ] Failure notifications enabled
- [ ] Tested chat timeout manually (wait 2+ minutes)

---

## Next Steps

After setup is complete:

1. **Test the full flow**:
   - Start a chat as a user
   - Wait 2+ minutes without activity
   - Verify session closes automatically
   - Check admin panel updates

2. **Monitor for 24 hours**:
   - Check execution success rate (should be 100%)
   - Review any error emails
   - Verify chat sessions are closing as expected

3. **Document for your team**:
   - Share cron-job.org login credentials with team
   - Document the `CRON_SECRET` in password manager
   - Add monitoring to team's regular checks

---

## Support Resources

- **Cron-job.org Support**: https://cron-job.org/en/support/
- **Vercel Docs**: https://vercel.com/docs
- **Project Documentation**: See `CHAT_TIMEOUT_GUIDE.md`

## Questions?

Common questions:

**Q: What if I already have Vercel Pro?**
A: You can use Vercel's built-in cron instead. Keep the `vercel.json` configuration and skip cron-job.org setup.

**Q: Can I use a different cron service?**
A: Yes! EasyCron, crontab.guru, or any service that can make HTTP requests will work.

**Q: How do I stop the cron job?**
A: In cron-job.org dashboard, click your cronjob → Click "Disable" button.

**Q: What happens if cron-job.org goes down?**
A: Chat sessions will eventually timeout client-side (user's browser checks every second). Consider setting up a backup cron service for redundancy.

**Q: Can I test this locally?**
A: Yes! Run `npm run dev` and use curl to call `http://localhost:3000/api/cron/check-chat-timeouts` with the Authorization header.

---

**You're all set!** Your chat timeout system will now automatically close inactive sessions every minute. 🎉