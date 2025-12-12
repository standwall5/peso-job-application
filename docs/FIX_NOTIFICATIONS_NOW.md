# Fix Notifications NOW - 5 Minute Guide

## ⚡ Quick Fix (Follow These Steps)

### Step 1: Run SQL Migration (2 minutes)

1. Open Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Click **SQL Editor** in the left sidebar
4. Click **New Query**
5. Copy EVERYTHING from this file: `supabase/migrations/setup_notifications.sql`
6. Paste into the SQL Editor
7. Click **RUN** button

**Expected Result:** You should see "Success. No rows returned"

---

### Step 2: Verify It Worked (1 minute)

Run this in SQL Editor:

```sql
SELECT policyname FROM pg_policies WHERE tablename = 'notifications';
```

**Expected Result:** You should see 3 rows:
- Users can view their own notifications
- Users can update their own notifications
- System can insert notifications

---

### Step 3: Test Notifications (2 minutes)

**Option A - Browser Console (Easiest):**

1. Log in to your app as an **applicant** (not admin)
2. Press **F12** to open Developer Tools
3. Go to **Console** tab
4. Paste this and press Enter:

```javascript
fetch('/api/notifications/test', { method: 'POST' })
  .then(r => r.json())
  .then(data => {
    console.log(data);
    if (data.success) {
      alert('✅ Notification sent! Check the bell icon.');
    } else {
      alert('❌ Error: ' + data.error);
    }
  });
```

5. **Click the bell icon** in the navbar
6. You should see a new notification!

**Option B - Test Button:**

Add this to any page (temporarily):

```tsx
import NotificationTestButton from '@/components/NotificationTestButton';

// Inside your component JSX:
<NotificationTestButton />
```

Then click "Send Test Notification"

---

## 🎯 How to Know It's Working

### ✅ Success Indicators:

1. **Browser Console shows:**
   ```
   Realtime subscription status: SUBSCRIBED
   ```

2. **When you send a test notification:**
   - Bell icon shows red badge with count
   - Clicking bell shows the notification
   - No errors in console

3. **Realtime works:**
   - Open 2 tabs with same user
   - Send notification in tab 2
   - Tab 1 updates WITHOUT refreshing

---

## ❌ Common Issues

### "Error fetching notifications"

**Fix:**
```sql
-- Run in SQL Editor to check if you have an applicant record:
SELECT a.id, a.name, a.auth_id 
FROM applicants a
JOIN auth.users u ON a.auth_id = u.id
WHERE u.email = 'YOUR_EMAIL@example.com';
```

If no result: You need to complete signup as an applicant first.

---

### "Unauthorized" error

**Fix:** Log out and log back in

---

### Notifications don't appear in real-time

**Fix:**
1. Go to Supabase Dashboard
2. **Database** → **Replication**
3. Find **notifications** table
4. Make sure it's **checked** ✅
5. Click **Save** if you made changes
6. Refresh your app

---

### Still not working?

Run this diagnostic:

```javascript
fetch('/api/notifications/test', { method: 'GET' })
  .then(r => r.json())
  .then(console.log);
```

This will tell you exactly what's wrong.

---

## 📱 Test Checklist

- [ ] SQL migration ran successfully
- [ ] 3 RLS policies created
- [ ] Test endpoint returns `{ success: true }`
- [ ] Notifications appear in dropdown
- [ ] Bell icon shows unread count
- [ ] Clicking notification marks it as read
- [ ] "Mark all as read" works
- [ ] Real-time updates work (test with 2 tabs)

---

## 🚀 After It Works

### Test Application Status Notifications:

1. Log in as **PESO admin**
2. Go to **Applications** page
3. Change an application status to **"Referred"**
4. Log in as that **applicant**
5. Check notifications - should see "Application Referred! 🎉"

### Other Status Changes That Trigger Notifications:

- **Accepted** → "Application Accepted! 🎊"
- **For Interview** → "Interview Scheduled! 📅"
- **Hired** → "Congratulations - You're Hired! 🎉"
- **Rejected** → "Application Update"

---

## 📁 Files You Need

All the code is already in your project:

1. `supabase/migrations/setup_notifications.sql` - RUN THIS FIRST
2. `src/components/NotificationDropdown.tsx` - Already updated
3. `src/app/api/updateApplicationStatus/route.ts` - Already updated
4. `src/app/api/notifications/test/route.ts` - NEW test endpoint
5. `src/components/NotificationTestButton.tsx` - NEW test button

---

## 🆘 Emergency Troubleshooting

If nothing works, do this in order:

1. **Check you ran the SQL migration** (Step 1 above)
2. **Clear browser cache and cookies**
3. **Log out and log back in**
4. **Check browser console for errors** (F12)
5. **Check Supabase logs:**
   - Dashboard → Logs → Database
   - Look for errors
6. **Try in incognito/private window**

---

## ✨ That's It!

If you followed these steps, notifications should now work.

For detailed documentation, see:
- `NOTIFICATIONS_FIX.md` - Quick guide
- `NOTIFICATIONS_SETUP_GUIDE.md` - Full documentation

**Need more help?** Check the browser console - it shows exactly what's happening!