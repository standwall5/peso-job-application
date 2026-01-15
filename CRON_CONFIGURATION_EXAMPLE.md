# Cron-job.org Configuration - Visual Reference

This document shows exactly what your cron-job.org configuration should look like.

---

## 📋 Complete Configuration Template

Copy these exact values into cron-job.org:

```
┌─────────────────────────────────────────────────────────────┐
│ CREATE CRONJOB                                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ BASIC SETTINGS                                              │
│ ─────────────────────────────────────────────────────────── │
│                                                             │
│ Title *                                                     │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ PESO Chat Timeout Checker                               │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ Address (URL) *                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ https://your-app.vercel.app/api/cron/check-chat-timeouts│ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ⚠️ REPLACE "your-app.vercel.app" WITH YOUR ACTUAL DOMAIN   │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ SCHEDULE                                                    │
│ ─────────────────────────────────────────────────────────── │
│                                                             │
│ Execution                                                   │
│ ○ Once                                                      │
│ ● Every minute                    ← SELECT THIS             │
│ ○ Every 5 minutes                                           │
│ ○ Every 15 minutes                                          │
│ ○ Every 30 minutes                                          │
│ ○ Every hour                                                │
│                                                             │
│ Time zone                                                   │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ UTC (Coordinated Universal Time)         ▼              │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ Advanced schedule (optional)                                │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ * * * * *                                               │ │
│ └─────────────────────────────────────────────────────────┘ │
│   Minute  Hour  Day  Month  Weekday                         │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ REQUEST                                                     │
│ ─────────────────────────────────────────────────────────── │
│                                                             │
│ Request method                                              │
│ ● GET        ○ POST                                         │
│                                                             │
│ Tabs:  [ General ]  [ Headers ]  [ Advanced ]              │
│                                                             │
│        ─────────────────────────────────                    │
│             Click "Headers" tab                             │
│        ─────────────────────────────────                    │
│                                                             │
│ Custom request headers                                      │
│                                                             │
│ [+ Add custom request header]     ← CLICK THIS             │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Header 1                                                │ │
│ │ ┌─────────────────────┐  ┌─────────────────────────────┐│ │
│ │ │ Authorization       │  │ Bearer YOUR_SECRET_TOKEN    ││ │
│ │ └─────────────────────┘  └─────────────────────────────┘│ │
│ │                                           [Remove]       │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ⚠️ REPLACE "YOUR_SECRET_TOKEN" WITH YOUR ACTUAL TOKEN       │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ NOTIFICATIONS                                               │
│ ─────────────────────────────────────────────────────────── │
│                                                             │
│ ☑ Send email on execution failures                         │
│                                                             │
│   Notify after                                              │
│   ┌─────────────────────────────────────────────────────┐  │
│   │ 3                            ▼  consecutive failures│  │
│   └─────────────────────────────────────────────────────┘  │
│                                                             │
│ ☐ Send email on successful executions                      │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│               [Create cronjob]                              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔑 Your Actual Values

Fill these in before configuring:

### 1. Your Vercel Domain
```
Find this at: https://vercel.com/dashboard
Look for: your-project.vercel.app
```

**Examples**:
- `peso-job-application.vercel.app`
- `peso-jobs-abc123.vercel.app`
- `pesoapp.com` (if using custom domain)

### 2. Your CRON_SECRET Token
```
Generate with: openssl rand -hex 32
Or PowerShell: -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```

**Example** (yours will be different):
```
a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a1b2c3d4
```

---

## 📝 Copy-Paste Values

Once you have your domain and token, fill these in:

### Title
```
PESO Chat Timeout Checker
```

### URL
```
https://YOUR-DOMAIN-HERE/api/cron/check-chat-timeouts
```

### Schedule (Advanced)
```
* * * * *
```

### Authorization Header Name
```
Authorization
```

### Authorization Header Value
```
Bearer YOUR-SECRET-TOKEN-HERE
```

---

## ✅ Verification Checklist

After creating the cron job, verify:

- [ ] Title is set
- [ ] URL starts with `https://`
- [ ] URL ends with `/api/cron/check-chat-timeouts`
- [ ] Schedule is "Every minute" or `* * * * *`
- [ ] Header name is exactly `Authorization`
- [ ] Header value starts with `Bearer ` (with space)
- [ ] Header value contains your CRON_SECRET
- [ ] Notifications are enabled for failures
- [ ] Cronjob status is "Active" (not paused)

---

## 📊 What Success Looks Like

### In Cron-job.org History Tab

```
┌──────────────────────────────────────────────────────────┐
│ EXECUTION HISTORY                                        │
├──────────────────────────────────────────────────────────┤
│                                                          │
│ ✅ 2024-01-15 14:32:00    200 OK        Duration: 245ms │
│ ✅ 2024-01-15 14:31:00    200 OK        Duration: 189ms │
│ ✅ 2024-01-15 14:30:00    200 OK        Duration: 312ms │
│ ✅ 2024-01-15 14:29:00    200 OK        Duration: 156ms │
│ ✅ 2024-01-15 14:28:00    200 OK        Duration: 203ms │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### Click on an execution to see details:

```
Response Status: 200 OK
Response Time: 245ms
Response Body:
{
  "success": true,
  "closedCount": 0,
  "message": "No expired sessions",
  "timestamp": "2024-01-15T14:32:00.000Z"
}
```

---

## ❌ Common Mistakes

### Mistake 1: Missing "Bearer" prefix
```
❌ WRONG: Authorization: a1b2c3d4e5f6...
✅ RIGHT: Authorization: Bearer a1b2c3d4e5f6...
```

### Mistake 2: Wrong URL path
```
❌ WRONG: https://your-app.vercel.app/api/chat/check-timeouts
❌ WRONG: https://your-app.vercel.app/check-chat-timeouts
✅ RIGHT: https://your-app.vercel.app/api/cron/check-chat-timeouts
```

### Mistake 3: Localhost URL
```
❌ WRONG: http://localhost:3000/api/cron/check-chat-timeouts
✅ RIGHT: https://your-app.vercel.app/api/cron/check-chat-timeouts
```

### Mistake 4: Different tokens
```
❌ WRONG: Vercel has "token-abc", cron-job.org has "token-xyz"
✅ RIGHT: Both have the EXACT SAME token
```

### Mistake 5: Forgot to redeploy Vercel
```
❌ WRONG: Added CRON_SECRET but didn't redeploy
✅ RIGHT: Added CRON_SECRET → Redeployed → Then created cron job
```

---

## 🧪 Testing Commands

### Test with curl (Mac/Linux/WSL):
```bash
curl -X GET \
  -H "Authorization: Bearer YOUR_SECRET_TOKEN" \
  -v \
  https://your-domain.vercel.app/api/cron/check-chat-timeouts
```

### Test with PowerShell (Windows):
```powershell
$headers = @{
    "Authorization" = "Bearer YOUR_SECRET_TOKEN"
}
Invoke-RestMethod -Uri "https://your-domain.vercel.app/api/cron/check-chat-timeouts" -Headers $headers -Method Get
```

### Expected Output:
```json
{
  "success": true,
  "closedCount": 0,
  "message": "No expired sessions",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

## 🔧 Troubleshooting Responses

### 401 Unauthorized
```json
{
  "error": "Unauthorized"
}
```
**Fix**: Check Authorization header matches CRON_SECRET in Vercel

### 404 Not Found
```json
{
  "message": "Not Found"
}
```
**Fix**: Check URL path is correct (should end with `/api/cron/check-chat-timeouts`)

### 500 Internal Server Error
```json
{
  "error": "Database connection failed"
}
```
**Fix**: Check Vercel logs for detailed error, verify Supabase connection

---

## 📞 Support

If you're stuck:

1. **Check Vercel Logs**: Vercel Dashboard → Deployments → Functions
2. **Check Database**: Ensure Supabase is connected
3. **Test Locally**: Run `npm run dev` and test with curl
4. **Review Docs**: See `CRON_JOB_ORG_SETUP.md` for detailed guide

---

## 🎉 Success Indicators

You're all set when:
- ✅ Cron-job.org shows green checkmarks every minute
- ✅ Status code is 200 OK
- ✅ Response time is under 1 second
- ✅ No failure emails received
- ✅ Chat sessions close after 2 minutes of inactivity

---

**Happy automating!** 🚀