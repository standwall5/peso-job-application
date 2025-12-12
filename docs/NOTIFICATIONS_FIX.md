# Notifications Fix - Quick Start Guide

## 🚨 Problem
Your notifications system wasn't working because:

1. **No RLS Policies** - Users couldn't read their own notifications
2. **Realtime Not Enabled** - Notifications table wasn't broadcasting changes
3. **Inefficient Subscription** - Frontend wasn't filtering by user
4. **Limited Triggers** - Only "Referred" status created notifications

## ✅ What Was Fixed

### 1. Database Setup (SQL Migration)
**File:** `supabase/migrations/setup_notifications.sql`

- ✅ Added RLS policies so users can read/update their own notifications
- ✅ Enabled realtime broadcasting for the notifications table
- ✅ Created database indexes for better performance
- ✅ Set proper permissions

### 2. Frontend Component
**File:** `src/components/NotificationDropdown.tsx`

- ✅ Added user-specific realtime subscription filtering
- ✅ Added applicant ID tracking
- ✅ Improved error handling
- ✅ Better logging for debugging

### 3. API Enhancements
**File:** `src/app/api/updateApplicationStatus/route.ts`

- ✅ Now creates notifications for ALL status changes:
  - Referred → "Application Referred! 🎉"
  - Accepted → "Application Accepted! 🎊"
  - For Interview → "Interview Scheduled! 📅"
  - Hired → "Congratulations - You're Hired! 🎉"
  - Rejected → "Application Update"

### 4. Test Utilities
**Files:** 
- `src/app/api/notifications/test/route.ts`
- `src/components/NotificationTestButton.tsx`

- ✅ Easy testing endpoint
- ✅ Visual test button component
- ✅ System status checker

---

## 🚀 How to Fix It (3 Steps)

### Step 1: Run the SQL Migration

**Option A - Supabase Dashboard:**
1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to **SQL Editor**
4. Copy the entire contents of `supabase/migrations/setup_notifications.sql`
5. Paste and click **Run**

**Option B - Supabase CLI:**
```bash
supabase db push
```

### Step 2: Verify It Worked

Run this query in Supabase SQL Editor:

```sql
-- Check RLS policies exist
SELECT policyname FROM pg_policies WHERE tablename = 'notifications';

-- Check realtime is enabled
SELECT tablename FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime' AND tablename = 'notifications';
```

You should see:
- 3 policies listed
- 1 row showing notifications table

### Step 3: Test Notifications

**Method 1 - Use Test Button (Easiest)**

Add this to any page where you're logged in as an applicant:

```tsx
import NotificationTestButton from '@/components/NotificationTestButton';

// In your component:
<NotificationTestButton />
```

This adds a floating test button in the bottom-right corner.

**Method 2 - Browser Console**

Open DevTools Console (F12) and run:

```javascript
// Send test notification
fetch('/api/notifications/test', { method: 'POST' })
  .then(r => r.json())
  .then(console.log);

// Check system status
fetch('/api/notifications/test', { method: 'GET' })
  .then(r => r.json())
  .then(console.log);
```

**Method 3 - Change Application Status**

1. Log in as PESO admin
2. Go to applications page
3. Change any application status
4. The applicant should receive a notification

---

## 🧪 Testing Realtime Updates

1. **Open two browser tabs** logged in as the same applicant
2. **In Tab 1:** Open the notifications dropdown (keep it open)
3. **In Tab 2:** Run in console:
   ```javascript
   fetch('/api/notifications/test', { method: 'POST' })
   ```
4. **Tab 1 should instantly show the new notification** without refreshing!

---

## 🐛 Troubleshooting

### "Error fetching notifications"

**Check:**
```sql
-- Does the user have an applicant record?
SELECT a.id, a.name, a.auth_id 
FROM applicants a
JOIN auth.users u ON a.auth_id = u.id
WHERE u.email = 'YOUR_EMAIL_HERE';
```

If no results, the user needs to complete signup.

### Notifications don't appear

**Check browser console:**
- Look for "Realtime subscription status: SUBSCRIBED"
- Look for any error messages

**Check database:**
```sql
-- Do notifications exist?
SELECT * FROM notifications 
WHERE applicant_id = YOUR_APPLICANT_ID 
ORDER BY created_at DESC;
```

### Realtime not working

**Verify in Supabase Dashboard:**
1. Go to **Database** → **Replication**
2. Make sure **notifications** table is checked
3. Save if needed

---

## 📊 System Architecture

```
┌──────────────────┐
│  Status Change   │  (Admin updates application)
└────────┬─────────┘
         │
         ▼
┌─────────────────────┐
│  Create Notification│  (Insert into DB)
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐
│ Supabase Realtime   │  (Broadcasts to subscribers)
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐
│ NotificationDropdown│  (Auto-updates UI)
└─────────────────────┘
```

---

## 📝 Files Changed

1. ✅ `supabase/migrations/setup_notifications.sql` - NEW
2. ✅ `src/components/NotificationDropdown.tsx` - UPDATED
3. ✅ `src/app/api/updateApplicationStatus/route.ts` - UPDATED
4. ✅ `src/app/api/notifications/test/route.ts` - NEW
5. ✅ `src/components/NotificationTestButton.tsx` - NEW
6. ✅ `NOTIFICATIONS_SETUP_GUIDE.md` - NEW (Full documentation)
7. ✅ `NOTIFICATIONS_FIX.md` - NEW (This file)

---

## 🎯 Quick Test Checklist

- [ ] SQL migration executed successfully
- [ ] RLS policies visible in database
- [ ] Realtime enabled for notifications table
- [ ] Test endpoint returns success
- [ ] Test button sends notifications
- [ ] Notifications appear in dropdown
- [ ] Realtime updates work (test with 2 tabs)
- [ ] Status changes create notifications
- [ ] Mark as read works
- [ ] Mark all as read works

---

## 💡 Next Steps

Once notifications work:

1. **Remove test button** from production (it's for development only)
2. **Add more notification triggers:**
   - New job postings matching user profile
   - Exam results available
   - Chat messages from admin
   - Document uploads required
3. **Set up notification cleanup:**
   ```sql
   -- Delete read notifications older than 30 days
   DELETE FROM notifications 
   WHERE is_read = true 
   AND created_at < NOW() - INTERVAL '30 days';
   ```

---

## 📚 Full Documentation

See `NOTIFICATIONS_SETUP_GUIDE.md` for:
- Detailed troubleshooting
- API documentation
- Performance optimization
- Security best practices
- Future enhancements

---

## 🆘 Still Not Working?

1. Check browser console for errors
2. Check Supabase logs in dashboard
3. Run the system status check:
   ```javascript
   fetch('/api/notifications/test').then(r => r.json()).then(console.log)
   ```
4. Verify you ran the SQL migration
5. Try with a fresh incognito window

---

**Need Help?** Check the browser console and Supabase logs first - they usually tell you exactly what's wrong!