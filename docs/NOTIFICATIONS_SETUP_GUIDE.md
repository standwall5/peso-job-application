# Notifications System Setup Guide

## Overview
This guide will help you set up and troubleshoot the notifications system for the PESO Job Application platform.

## Issues That Were Fixed

### 1. Missing RLS (Row Level Security) Policies
The notifications table had no RLS policies, which prevented users from reading their own notifications.

### 2. Realtime Not Enabled
The notifications table wasn't added to the Supabase realtime publication.

### 3. Inefficient Realtime Subscription
The frontend was subscribing to ALL notification changes instead of filtering by the current user.

### 4. Limited Notification Creation
Notifications were only created for "Referred" status, missing other important status updates.

---

## Setup Steps

### Step 1: Run the SQL Migration

You need to run the SQL migration to set up RLS policies and enable realtime.

**Option A: Using Supabase Dashboard**
1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `supabase/migrations/setup_notifications.sql`
4. Click "Run"

**Option B: Using Supabase CLI**
```bash
# If you have Supabase CLI installed
supabase db push
```

### Step 2: Verify RLS Policies

Check that the policies were created:

```sql
-- Run this query in Supabase SQL Editor
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'notifications';
```

You should see these policies:
- `Users can view their own notifications` (SELECT)
- `Users can update their own notifications` (UPDATE)
- `System can insert notifications` (INSERT)

### Step 3: Verify Realtime is Enabled

```sql
-- Run this query in Supabase SQL Editor
SELECT 
    schemaname,
    tablename 
FROM 
    pg_publication_tables 
WHERE 
    pubname = 'supabase_realtime' 
    AND tablename = 'notifications';
```

You should see one row with `notifications` table.

### Step 4: Test the System

#### Method 1: Using the Test API Endpoint

1. **Log in as an applicant** in your application
2. **Send a test notification** by making a POST request:
   ```bash
   # Replace with your actual URL
   curl -X POST http://localhost:3000/api/notifications/test \
     -H "Content-Type: application/json" \
     -H "Cookie: your-session-cookie"
   ```
   
3. **Or use the browser console:**
   ```javascript
   fetch('/api/notifications/test', {
     method: 'POST',
     credentials: 'include'
   })
   .then(r => r.json())
   .then(console.log)
   ```

4. **Check system status:**
   ```javascript
   fetch('/api/notifications/test', {
     method: 'GET',
     credentials: 'include'
   })
   .then(r => r.json())
   .then(console.log)
   ```

#### Method 2: Change Application Status

1. Log in as a PESO admin
2. Go to the applications management page
3. Change an application's status to any of these:
   - **Referred** - "Application Referred! 🎉"
   - **Accepted** - "Application Accepted! 🎊"
   - **For Interview** - "Interview Scheduled! 📅"
   - **Hired** - "Congratulations - You're Hired! 🎉"
   - **Rejected** - "Application Update"
4. The applicant should receive a notification immediately

#### Method 3: Manually Insert a Notification

```sql
-- Run this in Supabase SQL Editor
-- Replace 1 with an actual applicant_id from your database
INSERT INTO notifications (applicant_id, type, title, message, link, is_read, created_at)
VALUES (
  1, -- Change this to a valid applicant_id
  'application_update',
  'Test Notification',
  'This is a test notification to verify the system is working',
  '/profile',
  false,
  NOW()
);
```

---

## Testing Realtime Updates

### Browser Console Test

1. Open your application as an applicant user
2. Open browser DevTools (F12) and go to Console
3. You should see logs like:
   ```
   Realtime subscription status: SUBSCRIBED
   ```

4. When a notification is created, you should see:
   ```
   Notification change: { ... }
   ```

5. The notification dropdown should update automatically without refreshing

### Testing Multiple Tabs

1. Open your application in two browser tabs
2. In tab 1, keep the notification dropdown open
3. In tab 2 (or use SQL/API), create a new notification
4. Tab 1 should show the new notification automatically

---

## Troubleshooting

### Problem: "Error fetching notifications"

**Possible Causes:**
- User is not authenticated
- Applicant record doesn't exist for the user
- RLS policies not set up correctly

**Solution:**
```sql
-- Check if user has an applicant record
SELECT a.id, a.name, a.auth_id 
FROM applicants a
JOIN auth.users u ON a.auth_id = u.id
WHERE u.email = 'your-email@example.com';

-- If no record exists, the user needs to complete signup
```

### Problem: Notifications don't appear in real-time

**Possible Causes:**
- Realtime not enabled on the table
- Browser console shows subscription errors
- Network/WebSocket issues

**Solution:**
1. Check browser console for errors
2. Verify realtime is enabled:
   ```sql
   SELECT * FROM pg_publication_tables 
   WHERE pubname = 'supabase_realtime' 
   AND tablename = 'notifications';
   ```
3. Check Supabase project settings → Database → Replication
4. Ensure "notifications" table is checked for realtime

### Problem: "Unauthorized" error

**Possible Causes:**
- User not logged in
- Session expired
- Auth token invalid

**Solution:**
1. Log out and log back in
2. Check if `auth.users` has a record for the user
3. Verify the session is active in browser DevTools → Application → Cookies

### Problem: Notifications created but user can't see them

**Possible Causes:**
- RLS policies blocking access
- Wrong `applicant_id` in notification record

**Solution:**
```sql
-- Check if notifications exist
SELECT * FROM notifications 
WHERE applicant_id = YOUR_APPLICANT_ID
ORDER BY created_at DESC;

-- Test RLS policy by switching to user's role
SET ROLE authenticated;
SET request.jwt.claims.sub TO 'user-uuid-here';
SELECT * FROM notifications WHERE applicant_id = 1;
RESET ROLE;
```

### Problem: Realtime subscription status shows "CLOSED"

**Possible Causes:**
- Supabase project realtime quota exceeded
- WebSocket connection blocked
- Invalid realtime configuration

**Solution:**
1. Check Supabase Dashboard → Project Settings → API → Realtime
2. Ensure you haven't exceeded realtime connection limits
3. Check browser network tab for WebSocket connection
4. Verify no browser extensions are blocking WebSockets

---

## System Architecture

### Flow Diagram

```
┌─────────────────┐
│  Admin Action   │ (Change application status)
└────────┬────────┘
         │
         ▼
┌─────────────────────────────┐
│ updateApplicationStatus API │
└────────┬────────────────────┘
         │
         ▼
┌──────────────────────────┐
│ Insert into notifications│
│ table (Supabase)         │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ Supabase Realtime        │
│ broadcasts change        │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ NotificationDropdown     │
│ receives update          │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ fetchNotifications()     │
│ updates UI               │
└──────────────────────────┘
```

### Database Schema

```sql
CREATE TABLE notifications (
  id BIGSERIAL PRIMARY KEY,
  applicant_id BIGINT NOT NULL REFERENCES applicants(id),
  type TEXT NOT NULL CHECK (type IN ('application_update', 'new_job', 'exam_result', 'admin_message')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## API Endpoints

### GET `/api/notifications`
Fetch notifications for the current user

**Query Parameters:**
- `unread` (optional): Set to "true" to get only unread notifications

**Response:**
```json
[
  {
    "id": 1,
    "applicant_id": 123,
    "type": "application_update",
    "title": "Application Referred!",
    "message": "Your application has been referred...",
    "link": "/profile",
    "is_read": false,
    "created_at": "2024-01-15T10:30:00Z"
  }
]
```

### POST `/api/notifications`
Create a new notification

**Request Body:**
```json
{
  "applicant_id": 123,
  "type": "application_update",
  "title": "Test Notification",
  "message": "This is a test",
  "link": "/profile"
}
```

### POST `/api/notifications/mark-read`
Mark notifications as read

**Request Body:**
```json
{
  "notification_id": 1  // Mark specific notification as read
}
```

Or:
```json
{
  "mark_all": true  // Mark all user's notifications as read
}
```

### GET `/api/notifications/test`
Check notifications system status (debugging)

**Response:**
```json
{
  "success": true,
  "applicant_id": 123,
  "applicant_name": "John Doe",
  "notifications_count": 5,
  "recent_notifications": [...],
  "message": "Notifications system is working correctly"
}
```

### POST `/api/notifications/test`
Create a random test notification

**Response:**
```json
{
  "success": true,
  "message": "Test notification created",
  "notification": { ... }
}
```

---

## Frontend Components

### NotificationDropdown Component

**Location:** `src/components/NotificationDropdown.tsx`

**Features:**
- Real-time updates using Supabase realtime
- Unread count badge
- Mark as read functionality
- Mark all as read
- Different icons for different notification types
- Time formatting (e.g., "5m ago", "2h ago")

**Usage:**
```tsx
<NotificationDropdown 
  isOpen={showNotifications}
  onClose={() => setShowNotifications(false)}
/>
```

---

## Notification Types

### 1. Application Update
- **Type:** `application_update`
- **Icon:** Document icon
- **Use Cases:** Status changes (Referred, Accepted, Rejected, etc.)

### 2. New Job
- **Type:** `new_job`
- **Icon:** Briefcase icon
- **Use Cases:** New job postings matching user profile

### 3. Exam Result
- **Type:** `exam_result`
- **Icon:** Academic cap icon
- **Use Cases:** Exam completion, scores available

### 4. Admin Message
- **Type:** `admin_message`
- **Icon:** Chat bubble icon
- **Use Cases:** Messages from PESO staff, announcements

---

## Performance Considerations

### Indexes
The following indexes are created for optimal performance:
```sql
CREATE INDEX idx_notifications_applicant_id ON notifications(applicant_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
```

### Realtime Filtering
The subscription is filtered by `applicant_id` to reduce unnecessary data transfer:
```typescript
filter: `applicant_id=eq.${applicantId}`
```

---

## Security

### RLS Policies
- Users can only view their own notifications
- Users can only update their own notifications (for marking as read)
- Only authenticated users can create notifications

### Best Practices
- Never expose other users' notifications
- Validate all input data
- Use prepared statements to prevent SQL injection
- Sanitize notification messages if they contain user input

---

## Future Enhancements

- [ ] Push notifications (browser notifications API)
- [ ] Email notifications
- [ ] SMS notifications
- [ ] Notification preferences (allow users to opt-out of certain types)
- [ ] Notification grouping (e.g., "3 new job postings")
- [ ] Notification history/archive
- [ ] Delete notifications functionality
- [ ] Batch operations for admins

---

## Quick Reference Commands

```bash
# Check notification count for a user
SELECT COUNT(*) FROM notifications WHERE applicant_id = 1;

# Get unread notifications
SELECT * FROM notifications WHERE applicant_id = 1 AND is_read = false;

# Mark all as read
UPDATE notifications SET is_read = true WHERE applicant_id = 1;

# Delete old notifications (older than 30 days)
DELETE FROM notifications 
WHERE created_at < NOW() - INTERVAL '30 days' 
AND is_read = true;

# Get notification statistics
SELECT 
  applicant_id,
  COUNT(*) as total,
  SUM(CASE WHEN is_read THEN 1 ELSE 0 END) as read_count,
  SUM(CASE WHEN NOT is_read THEN 1 ELSE 0 END) as unread_count
FROM notifications
GROUP BY applicant_id;
```

---

## Support

If you continue to have issues:

1. Check browser console for errors
2. Check Supabase logs in the dashboard
3. Verify database schema matches the expected structure
4. Test with a fresh user account
5. Review this guide's troubleshooting section

---

**Last Updated:** 2024
**Version:** 1.0