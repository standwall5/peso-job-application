# Notifications System - Visual Guide 🎨

## 🔔 How Notifications Work (Simple Explanation)

```
┌─────────────────────────────────────────────────────────────────┐
│                    THE NOTIFICATION JOURNEY                      │
└─────────────────────────────────────────────────────────────────┘

Step 1: ADMIN TAKES ACTION
┌──────────────────────────────┐
│  👨‍💼 PESO Admin              │
│  Changes application status   │
│  "Pending" → "Referred"      │
└──────────┬───────────────────┘
           │
           ▼
Step 2: NOTIFICATION IS CREATED
┌──────────────────────────────┐
│  💾 Database                 │
│  INSERT INTO notifications    │
│  - Title: "Referred! 🎉"     │
│  - Message: "Your app..."     │
│  - For: Applicant #123       │
└──────────┬───────────────────┘
           │
           ▼
Step 3: SUPABASE BROADCASTS
┌──────────────────────────────┐
│  📡 Realtime System          │
│  Detects new notification     │
│  Sends to all subscribers     │
│  (Only applicant #123)       │
└──────────┬───────────────────┘
           │
           ▼
Step 4: USER SEES IT INSTANTLY
┌──────────────────────────────┐
│  👤 Applicant User           │
│  🔔 Bell icon updates         │
│  Shows "1" unread badge       │
│  Opens dropdown = sees notif  │
└──────────────────────────────┘
```

---

## 🎭 The Two Main Players

### Player 1: The Backend (Database + API)

```
┌─────────────────────────────────────────────┐
│           SUPABASE DATABASE                  │
│                                             │
│  ┌───────────────────────────────┐         │
│  │   notifications TABLE         │         │
│  │                               │         │
│  │  id | applicant_id | title    │         │
│  │  ───┼──────────────┼─────────  │         │
│  │  1  | 123          | "Hired!" │         │
│  │  2  | 123          | "Refer"  │         │
│  │  3  | 456          | "Test"   │         │
│  └───────────────────────────────┘         │
│                                             │
│  RLS Policies:                              │
│  ✅ User 123 can only see rows 1, 2        │
│  ✅ User 456 can only see row 3            │
│                                             │
│  Realtime:                                  │
│  📡 Broadcasts when rows added/changed     │
└─────────────────────────────────────────────┘
```

### Player 2: The Frontend (Your Browser)

```
┌─────────────────────────────────────────────┐
│         YOUR BROWSER                         │
│                                             │
│  ┌─────────────────────────────────┐       │
│  │  NotificationDropdown.tsx       │       │
│  │                                 │       │
│  │  • Subscribes to realtime       │       │
│  │  • Filter: applicant_id = 123   │       │
│  │  • Shows only YOUR notifications│       │
│  │                                 │       │
│  │  🔔 Bell Icon                   │       │
│  │  [3] ← Unread count             │       │
│  └─────────────────────────────────┘       │
└─────────────────────────────────────────────┘
```

---

## 🔐 Security: How RLS Policies Work

```
WITHOUT RLS (❌ BROKEN):
┌──────────────────────────────────────┐
│  User A logs in                      │
│  Queries: SELECT * FROM notifications│
│  Gets: ALL notifications (everyone's)│ ← BAD!
└──────────────────────────────────────┘

WITH RLS (✅ WORKING):
┌──────────────────────────────────────┐
│  User A (applicant_id: 123) logs in  │
│  Queries: SELECT * FROM notifications│
│  RLS adds: WHERE applicant_id = 123  │
│  Gets: Only their notifications      │ ← GOOD!
└──────────────────────────────────────┘
```

### The RLS Policy (Plain English)

```sql
-- This policy says:
"You can SELECT (read) from notifications table,
 BUT ONLY if the applicant_id matches your ID"

CREATE POLICY "Users can view their own notifications"
ON notifications
FOR SELECT
TO authenticated
USING (
  applicant_id IN (
    SELECT id FROM applicants WHERE auth_id = auth.uid()
  )
);
```

**Translation:**
- `FOR SELECT` = For reading data
- `TO authenticated` = Only logged-in users
- `USING (...)` = Check if applicant_id matches current user

---

## 📡 Realtime: The Magic Behind Instant Updates

### Without Realtime (Old Way)

```
Time: 0s
┌─────────────┐
│ Your Browser│  "Let me check for new notifications..."
└──────┬──────┘
       │
       ▼
Time: 1s
┌─────────────┐
│  Database   │  "Nope, nothing new"
└──────┬──────┘
       │
       ▼
Time: 5s
┌─────────────┐
│ Your Browser│  "Let me check again..."
└──────┬──────┘
       │
       ▼
Time: 6s
┌─────────────┐
│  Database   │  "Still nothing"
└─────────────┘

🔄 Keeps checking every 5 seconds (wasteful!)
```

### With Realtime (New Way)

```
Time: 0s
┌─────────────┐
│ Your Browser│  "Tell me when something changes"
└──────┬──────┘
       │ (subscribes)
       ▼
┌─────────────┐
│  Supabase   │  "OK, I'll notify you!"
│  Realtime   │
└─────────────┘
       │
       │ ... waiting ... waiting ...
       │
       │ (Admin creates notification)
       │
       ▼
┌─────────────┐
│  Supabase   │  "HEY! New notification for you!"
│  Realtime   │  *broadcasts instantly*
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Your Browser│  🔔 Updates UI immediately
└─────────────┘

✅ Instant updates, no polling needed!
```

---

## 🎯 Status Changes → Notifications

```
┌─────────────────────────────────────────────────────────┐
│           APPLICATION STATUS FLOW                        │
└─────────────────────────────────────────────────────────┘

Admin Action              Applicant Sees
─────────────────────────────────────────────────────────

"Referred"          →     🎉 "Application Referred!"
                          "Your application has been 
                           referred to the employer"

"For Interview"     →     📅 "Interview Scheduled!"
                          "You've been shortlisted 
                           for an interview"

"Accepted"          →     🎊 "Application Accepted!"
                          "Congratulations! Your 
                           application was accepted"

"Hired"             →     🎉 "You're Hired!"
                          "You have been hired! The
                           company will contact you"

"Rejected"          →     📋 "Application Update"
                          "Your application status
                           has been updated"
```

---

## 🧪 Testing Flow

### Visual Test Process

```
┌─────────────────────────────────────────────────────────┐
│                    TESTING CHECKLIST                     │
└─────────────────────────────────────────────────────────┘

Step 1: RUN SQL MIGRATION
┌──────────────────┐
│ Supabase         │  Paste setup_notifications.sql
│ SQL Editor       │  Click RUN
└────────┬─────────┘
         │
         ▼
    ✅ Policies created
    ✅ Realtime enabled

Step 2: TEST WITH API
┌──────────────────┐
│ Browser Console  │  fetch('/api/notifications/test', 
│ (F12)            │        { method: 'POST' })
└────────┬─────────┘
         │
         ▼
    ✅ { success: true }
    ✅ Notification created

Step 3: CHECK UI
┌──────────────────┐
│ Click Bell Icon  │  🔔 [1]
└────────┬─────────┘
         │
         ▼
    ✅ Dropdown opens
    ✅ Notification appears
    ✅ Can mark as read

Step 4: TEST REALTIME
┌──────────────────┐
│ Open 2 Tabs      │  Tab 1: Keep dropdown open
│ Same User        │  Tab 2: Send test notification
└────────┬─────────┘
         │
         ▼
    ✅ Tab 1 updates instantly
    ✅ No refresh needed
```

---

## 🐛 Troubleshooting Visual Guide

### Problem: No Notifications Appear

```
START HERE
│
├─ Can you log in?
│  │
│  ├─ NO → Fix authentication first
│  │
│  └─ YES → Continue
│
├─ Do you have an applicant record?
│  │  Run: SELECT * FROM applicants WHERE auth_id = 'your-uuid'
│  │
│  ├─ NO → Complete signup process
│  │
│  └─ YES → Continue
│
├─ Did you run the SQL migration?
│  │
│  ├─ NO → Run setup_notifications.sql NOW
│  │
│  └─ YES → Continue
│
├─ Test API: fetch('/api/notifications/test', {method:'GET'})
│  │
│  ├─ Returns error → Check error message
│  │  │
│  │  ├─ "permission denied" → RLS policies missing
│  │  ├─ "unauthorized" → Not logged in
│  │  └─ "applicant not found" → No applicant record
│  │
│  └─ Returns success → System OK, create a notification!
│
└─ Send test: fetch('/api/notifications/test', {method:'POST'})
   │
   └─ Check bell icon 🔔
```

---

## 📊 Data Structure Visualized

### Single Notification Object

```javascript
{
  id: 123,                          // Unique ID
  applicant_id: 456,                // Who it's for
  type: "application_update",       // Category
  title: "Application Referred! 🎉", // Bold text
  message: "Your application...",   // Detail text
  link: "/profile",                 // Where to go when clicked
  is_read: false,                   // Unread = show badge
  created_at: "2024-01-15T10:30:00Z" // When it was created
}
```

### How It Looks in UI

```
┌────────────────────────────────────────────┐
│  🔔 Notifications                    [×]   │
├────────────────────────────────────────────┤
│                                            │
│  ┌──────────────────────────────────────┐ │
│  │ 📄 Application Referred! 🎉     • 5m │ │  ← Unread dot
│  │ Your application for Software Dev    │ │
│  │ at ABC Company has been referred.    │ │
│  └──────────────────────────────────────┘ │
│                                            │
│  ┌──────────────────────────────────────┐ │
│  │ 💼 New Job Posted              2h    │ │  ← No dot (read)
│  │ A new job matching your profile      │ │
│  └──────────────────────────────────────┘ │
│                                            │
│  ┌──────────────────────────────────────┐ │
│  │ 🎓 Exam Results Available      1d    │ │
│  │ Your exam results are now available  │ │
│  └──────────────────────────────────────┘ │
│                                            │
└────────────────────────────────────────────┘
```

---

## 🔧 The Files and Their Jobs

```
┌─────────────────────────────────────────────────────────┐
│                    FILE STRUCTURE                        │
└─────────────────────────────────────────────────────────┘

DATABASE
├─ setup_notifications.sql ───────────┐
   "Sets up security and realtime"    │ RUN THIS FIRST!
                                       └─────────────────┐
                                                         ▼
BACKEND (API)                                    ┌──────────────┐
├─ /api/notifications/route.ts                   │  Supabase    │
│  "Get/Create notifications"                    │  Database    │
│                                                 │              │
├─ /api/notifications/mark-read/route.ts         │  ✅ RLS      │
│  "Mark as read"                                 │  ✅ Realtime │
│                                                 └──────────────┘
├─ /api/notifications/test/route.ts
│  "Testing & debugging"
│
└─ /api/updateApplicationStatus/route.ts
   "Creates notifications when status changes"

FRONTEND (UI)
└─ NotificationDropdown.tsx ─────────┐
   "Shows notifications, handles     │
    realtime updates"                │
                                      │
TEST TOOLS                            │
├─ NotificationTestButton.tsx ───────┤
   "Visual test button"              │
                                      │
DOCUMENTATION                         │
├─ FIX_NOTIFICATIONS_NOW.md          │
├─ NOTIFICATIONS_FIX.md               │
├─ NOTIFICATIONS_SETUP_GUIDE.md      │
├─ NOTIFICATIONS_CHANGES_SUMMARY.md  │
└─ NOTIFICATIONS_VISUAL_GUIDE.md ────┘
   (You are here!)
```

---

## ⚡ Quick Commands Reference

### Browser Console Commands

```javascript
// 1. CHECK SYSTEM STATUS
fetch('/api/notifications/test', { method: 'GET' })
  .then(r => r.json())
  .then(console.log);
// Shows: applicant_id, notification count, system status

// 2. SEND TEST NOTIFICATION
fetch('/api/notifications/test', { method: 'POST' })
  .then(r => r.json())
  .then(console.log);
// Creates: Random test notification

// 3. GET YOUR NOTIFICATIONS
fetch('/api/notifications')
  .then(r => r.json())
  .then(console.log);
// Returns: Array of your notifications

// 4. GET ONLY UNREAD
fetch('/api/notifications?unread=true')
  .then(r => r.json())
  .then(console.log);
// Returns: Only unread notifications

// 5. MARK AS READ
fetch('/api/notifications/mark-read', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ mark_all: true })
})
.then(r => r.json())
.then(console.log);
// Marks: All your notifications as read
```

### SQL Commands (Supabase Dashboard)

```sql
-- 1. CHECK YOUR APPLICANT ID
SELECT id, name, auth_id 
FROM applicants 
WHERE auth_id = auth.uid();

-- 2. SEE YOUR NOTIFICATIONS
SELECT * FROM notifications 
WHERE applicant_id = YOUR_ID_HERE
ORDER BY created_at DESC;

-- 3. COUNT UNREAD
SELECT COUNT(*) 
FROM notifications 
WHERE applicant_id = YOUR_ID_HERE 
AND is_read = false;

-- 4. MANUALLY CREATE TEST NOTIFICATION
INSERT INTO notifications (
  applicant_id, type, title, message, link, is_read
) VALUES (
  YOUR_ID_HERE,
  'application_update',
  'Manual Test',
  'This is a manually created notification',
  '/profile',
  false
);

-- 5. VERIFY RLS POLICIES
SELECT policyname, cmd 
FROM pg_policies 
WHERE tablename = 'notifications';

-- 6. VERIFY REALTIME
SELECT tablename 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime' 
AND tablename = 'notifications';
```

---

## 🎨 Notification Types & Icons

```
┌────────────────────────────────────────────────────────┐
│  TYPE                 ICON        USE CASE              │
├────────────────────────────────────────────────────────┤
│  application_update   📄          Status changes        │
│                                   (Referred, Hired...)  │
│                                                         │
│  new_job              💼          New job posted        │
│                                   matching profile      │
│                                                         │
│  exam_result          🎓          Exam completed        │
│                                   Score available       │
│                                                         │
│  admin_message        💬          Message from PESO     │
│                                   Announcements         │
└────────────────────────────────────────────────────────┘
```

---

## 🎯 Success Indicators

### ✅ System is Working When You See:

```
BROWSER CONSOLE:
✅ "Realtime subscription status: SUBSCRIBED"
✅ No errors in red
✅ fetch('/api/notifications/test') returns success

UI:
✅ Bell icon shows unread count: 🔔 [3]
✅ Dropdown opens and shows notifications
✅ Clicking notification marks it as read
✅ Badge updates when marking as read

REALTIME TEST:
✅ Open 2 tabs, both logged in as same user
✅ Send notification in tab 2
✅ Tab 1 updates instantly (no refresh)

DATABASE:
✅ 3 RLS policies exist
✅ notifications table in realtime publication
✅ Can see notifications in SQL editor
```

### ❌ System is NOT Working When You See:

```
BROWSER CONSOLE:
❌ "permission denied for table notifications"
❌ "Realtime subscription status: CLOSED"
❌ "Error fetching notifications"

UI:
❌ Bell icon never shows numbers
❌ Dropdown is always empty
❌ Clicking bell does nothing

FIX:
→ Run the SQL migration!
→ Check you're logged in as applicant
→ Verify applicant record exists
```

---

## 📞 Get Help

### Where to Look for Clues

```
1. BROWSER CONSOLE (Press F12)
   Look for:
   - Red error messages
   - "Realtime subscription status" message
   - Network errors

2. SUPABASE DASHBOARD → LOGS
   Look for:
   - Database errors
   - RLS policy violations
   - API errors

3. NETWORK TAB (F12 → Network)
   Look for:
   - Failed API calls (red)
   - 401 Unauthorized
   - 403 Forbidden
   - 500 Server Error

4. RUN DIAGNOSTIC
   fetch('/api/notifications/test')
   .then(r => r.json())
   .then(console.log);
   
   This tells you EXACTLY what's wrong!
```

---

## 🎓 Summary (TL;DR)

```
┌────────────────────────────────────────────────┐
│  WHAT YOU NEED TO KNOW                         │
├────────────────────────────────────────────────┤
│                                                │
│  1. Run SQL migration (setup_notifications.sql)│
│     → Sets up security and realtime            │
│                                                │
│  2. Code already fixed and committed           │
│     → No code changes needed                   │
│                                                │
│  3. Test with browser console                  │
│     → fetch('/api/notifications/test')         │
│                                                │
│  4. It should work instantly                   │
│     → Notifications appear in real-time        │
│                                                │
│  5. If not working:                            │
│     → Check browser console                    │
│     → Run diagnostic endpoint                  │
│     → Verify SQL migration ran                 │
│                                                │
└────────────────────────────────────────────────┘
```

---

**That's it! You now understand the entire notifications system visually! 🎉**

For step-by-step fixing instructions, see: `FIX_NOTIFICATIONS_NOW.md`
