# Chatbot & Real-time Chat System - Complete Setup Guide

This document provides a complete guide to the PESO chat system with automated chatbot support.

## Table of Contents
1. [System Overview](#system-overview)
2. [Architecture](#architecture)
3. [Database Setup](#database-setup)
4. [Admin Setup](#admin-setup)
5. [User Experience](#user-experience)
6. [Chatbot Configuration](#chatbot-configuration)
7. [Testing Guide](#testing-guide)
8. [Troubleshooting](#troubleshooting)

---

## System Overview

The PESO chat system provides real-time communication between applicants and admins with intelligent automation:

### Key Features
- ✅ Real-time messaging using Supabase Realtime
- ✅ Automated chatbot for off-hours support
- ✅ Admin availability detection (business hours)
- ✅ Floating chat buttons for both users and admins
- ✅ Badge notifications for unread/pending chats
- ✅ FAQ-based intelligent responses
- ✅ Seamless handoff from bot to human admin

### Components
- **User Side**: `ChatButton` + `ChatWidget` (bottom-right floating button)
- **Admin Side**: `AdminChatButton` + `AdminChatWidget` + `AdminChatPanel`
- **Backend**: Chatbot utility (`src/utils/chatbot.ts`)
- **Database**: `chat_sessions`, `chat_messages`, `faqs` tables

---

## Architecture

### User Flow
```
User clicks chat → System checks admin availability
                    ↓                           ↓
              Available                   Not Available
                    ↓                           ↓
          Status: "pending"              Status: "active"
          Waits for admin                Bot responds
                    ↓                           ↓
          Admin accepts                  Bot conversation
          Status: "active"                     ↓
                    ↓                   (Admin can join later)
          Human conversation ← ← ← ← ← ← ← ← ←
```

### Admin Availability Logic
- **Business Hours**: Monday-Friday, 8:00 AM - 5:00 PM
- **Location**: `src/utils/chatbot.ts` → `isAdminAvailable()`
- **Customizable**: Edit `BUSINESS_HOURS` constant

### Message Flow
1. User sends message → API validates → Inserts to DB
2. Supabase Realtime broadcasts → All subscribers receive
3. If bot session → Generate bot response → Insert to DB → Broadcast

---

## Database Setup

### Step 1: Apply Migrations

Run the following migrations in order:

#### Migration 1: Add concern column
```sql
-- File: supabase/migrations/add_concern_to_chat_sessions.sql
ALTER TABLE chat_sessions
ADD COLUMN IF NOT EXISTS concern TEXT;

COMMENT ON COLUMN chat_sessions.concern IS 'The initial concern or question from the user';

CREATE INDEX IF NOT EXISTS idx_chat_sessions_concern 
ON chat_sessions USING gin(to_tsvector('english', concern));
```

#### Migration 2: Create admin view/function
```sql
-- File: supabase/migrations/create_chat_sessions_with_user_view.sql
-- This function allows admins to fetch applicant emails securely
CREATE OR REPLACE FUNCTION get_chat_sessions_for_admin(session_status VARCHAR(20))
RETURNS TABLE (
  id UUID,
  user_id INTEGER,
  user_name TEXT,
  user_email TEXT,
  concern TEXT,
  status VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
)
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Verify the caller is an admin
  IF NOT EXISTS (
    SELECT 1 FROM peso WHERE auth_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Unauthorized: Admin access required';
  END IF;

  RETURN QUERY
  SELECT 
    cs.id,
    cs.user_id,
    a.name as user_name,
    u.email::text as user_email,
    cs.concern,
    cs.status::VARCHAR(20),
    cs.created_at,
    cs.updated_at
  FROM chat_sessions cs
  INNER JOIN applicants a ON cs.user_id = a.id
  LEFT JOIN auth.users u ON a.auth_id = u.id
  WHERE cs.status::VARCHAR(20) = session_status
  ORDER BY cs.created_at DESC;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_chat_sessions_for_admin(VARCHAR) TO authenticated;
```

#### Migration 3: Add updated_at trigger (optional but recommended)
```sql
-- Add updated_at column if it doesn't exist
ALTER TABLE chat_sessions
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS update_chat_sessions_updated_at ON chat_sessions;
CREATE TRIGGER update_chat_sessions_updated_at
  BEFORE UPDATE ON chat_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### Step 2: Enable Realtime

In your Supabase Dashboard:

1. Navigate to **Database** → **Replication**
2. Find `chat_sessions` table → Click to expand
3. Toggle **Enable Realtime** to ON
4. Enable events: **INSERT** and **UPDATE**
5. Repeat for `chat_messages` table
6. Wait 30-60 seconds for changes to propagate

### Step 3: Verify Row Level Security (RLS)

Ensure proper RLS policies exist:

```sql
-- Users can only see their own chat sessions
CREATE POLICY "Users can view own sessions" ON chat_sessions
  FOR SELECT USING (
    user_id IN (
      SELECT id FROM applicants WHERE auth_id = auth.uid()
    )
  );

-- Users can insert their own sessions
CREATE POLICY "Users can create sessions" ON chat_sessions
  FOR INSERT WITH CHECK (
    user_id IN (
      SELECT id FROM applicants WHERE auth_id = auth.uid()
    )
  );

-- Admins can view all sessions
CREATE POLICY "Admins can view all sessions" ON chat_sessions
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM peso WHERE auth_id = auth.uid())
  );

-- Similar policies for chat_messages...
```

---

## Admin Setup

### Step 1: Add AdminChatWidget to Layout

Edit your admin layout file (e.g., `src/app/admin/layout.tsx`):

```tsx
import AdminChatWidget from "@/components/chat/AdminChatWidget";

export default function AdminLayout({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  return (
    <div className="admin-layout">
      {/* Your existing admin sidebar, header, etc. */}
      {children}
      
      {/* Add floating chat widget - it positions itself */}
      <AdminChatWidget />
    </div>
  );
}
```

### Step 2: Ensure Admin Authentication

Verify that admin users exist in the `peso` table:

```sql
-- Check if your admin user exists
SELECT * FROM peso WHERE auth_id = 'your-supabase-user-uuid';

-- If not, add them:
INSERT INTO peso (auth_id, name, email)
VALUES ('your-supabase-user-uuid', 'Admin Name', 'admin@example.com');
```

### Step 3: Test Admin Access

1. Log in as an admin
2. You should see the chat button in bottom-right corner
3. Badge should show count of pending/active chats
4. Click to open the admin chat panel

---

## User Experience

### For Applicants

1. **Start Chat**:
   - Click floating chat button (bottom-right)
   - Enter their concern/question
   - Submit

2. **During Business Hours**:
   - Status: "pending"
   - Message: "Your chat request has been submitted..."
   - Waits for admin to accept

3. **Outside Business Hours**:
   - Status: "active" (auto-started)
   - Bot greeting appears immediately
   - Can chat with bot for instant help

4. **Chat Interface**:
   - Real-time message updates
   - See when admin joins
   - Can close and reopen (conversation persists)

### For Admins

1. **Notifications**:
   - Badge shows: `(new count) + (active count)`
   - Example: "3" could mean 2 new + 1 active

2. **Chat Panel**:
   - **New Tab**: Pending requests (need to accept)
   - **Active Tab**: Ongoing conversations
   - **Closed Tab**: Completed chats

3. **Accept Chat**:
   - Click on pending request
   - Click "Accept Chat" button
   - Status changes to "active"
   - Can now exchange messages

4. **Real-time Updates**:
   - New messages appear instantly
   - New requests auto-appear in list
   - Badge count updates automatically

---

## Chatbot Configuration

### Business Hours

Edit `src/utils/chatbot.ts`:

```typescript
const BUSINESS_HOURS = {
  start: 8,              // 8:00 AM
  end: 17,               // 5:00 PM
  days: [1, 2, 3, 4, 5], // Mon-Fri (0=Sunday, 6=Saturday)
};
```

### Add Knowledge Base Topics

In `src/utils/chatbot.ts`, add to `knowledgeBase`:

```typescript
myNewTopic: {
  keywords: ["keyword1", "keyword2", "search term"],
  response: "This is the bot's response when user mentions these keywords."
},
```

### Bot Greeting Customization

Edit the `getBotGreeting()` function:

```typescript
export function getBotGreeting(): string {
  const isAvailable = isAdminAvailable();
  
  if (isAvailable) {
    return "Your custom greeting for busy admins...";
  }
  
  return "Your custom greeting for off-hours...";
}
```

### Suggested Questions

Edit `getSuggestedQuestions()`:

```typescript
export function getSuggestedQuestions(): string[] {
  return [
    "Your question 1?",
    "Your question 2?",
    "Your question 3?",
  ];
}
```

---

## Testing Guide

### Test 1: Bot Flow (Outside Business Hours)

1. Temporarily force bot mode:
   ```typescript
   // In src/utils/chatbot.ts
   export function isAdminAvailable(): boolean {
     return false; // Force bot mode for testing
   }
   ```

2. As a user:
   - Click chat button
   - Enter a concern: "How do I apply?"
   - Submit
   - Bot greeting should appear immediately
   - Type: "how to apply"
   - Bot should respond with application instructions

3. Verify in database:
   - Session status should be "active"
   - Messages table should have user + bot messages

### Test 2: Admin Flow (During Business Hours)

1. Set `isAdminAvailable()` back to normal (or test during actual business hours)

2. As a user:
   - Submit chat request
   - Should see "waiting for admin" message
   - Status should be "pending"

3. As admin:
   - Should see badge count increase
   - Click chat button
   - See request in "New" tab
   - Click request → Click "Accept"
   - Status changes to "active"
   - Exchange messages in real-time

### Test 3: Real-time Updates

Open two browser windows:
- Window A: User chat
- Window B: Admin chat panel

1. Send message from Window A
2. Should appear instantly in Window B
3. Reply from Window B
4. Should appear instantly in Window A

### Test 4: Multiple Sessions

1. Create 3 chat requests from different user accounts
2. Admin panel should show all 3 in "New" tab with badge "3"
3. Accept one → moves to "Active" tab
4. Badge shows "2" for new, and active count separately

---

## Troubleshooting

### Issue: Bot not responding

**Symptoms**: User sends message, no bot reply appears

**Solutions**:
1. Check `isAdminAvailable()` is returning `false`
2. Verify session status is "active" in database
3. Check browser console for errors in `/api/chat/messages` POST
4. Verify setTimeout in message route is working
5. Check Realtime is enabled for `chat_messages`

**Debug**:
```javascript
// Add console.log in src/app/api/chat/messages/route.ts
console.log('Admin available?', adminAvailable);
console.log('Session status:', chatSession.status);
console.log('Bot response:', botResponse);
```

### Issue: Admin can't see applicant emails

**Symptoms**: "Applicant not found" or email shows as null

**Solutions**:
1. Verify `get_chat_sessions_for_admin` function exists:
   ```sql
   SELECT * FROM pg_proc WHERE proname = 'get_chat_sessions_for_admin';
   ```
2. Check admin exists in `peso` table
3. Verify `auth.users` has email for applicant
4. Re-run the migration SQL

**Debug**:
```sql
-- Test the function directly
SELECT * FROM get_chat_sessions_for_admin('pending');
```

### Issue: Real-time not working

**Symptoms**: Messages don't appear without refresh

**Solutions**:
1. Check Supabase Dashboard → Database → Replication
2. Ensure `chat_messages` has Realtime enabled
3. Verify INSERT/UPDATE events are enabled
4. Check browser Network tab for WebSocket connection
5. Look for `wss://` connection to Supabase Realtime

**Debug**:
```javascript
// In browser console
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('your-url', 'your-anon-key');
const channel = supabase.channel('test');
channel.on('broadcast', { event: 'test' }, payload => console.log(payload));
channel.subscribe();
```

### Issue: Badge count not updating

**Symptoms**: New chats don't update the badge number

**Solutions**:
1. Check `/api/admin/chat/requests?status=pending` returns correct data
2. Verify `AdminChatWidget` is mounted in admin layout
3. Check browser console for fetch errors
4. Verify admin authentication (401 errors?)

**Debug**:
```bash
# Test API endpoint directly
curl -X GET 'http://localhost:3000/api/admin/chat/requests?status=pending' \
  -H 'Cookie: your-session-cookie'
```

### Issue: Chat panel not opening

**Symptoms**: Click button, nothing happens

**Solutions**:
1. Check React DevTools for component state
2. Verify `isOpen` state is toggling
3. Check for z-index conflicts in CSS
4. Look for JavaScript errors in console
5. Verify `AdminChatPanel` component is rendering

**Debug**:
```javascript
// In AdminChatWidget.tsx, add:
console.log('Panel open state:', isOpen);
```

### Issue: Session status stuck on "pending"

**Symptoms**: Admin accepts chat but status doesn't change

**Solutions**:
1. Check `/api/admin/chat/requests/:id/accept` endpoint
2. Verify RLS policies allow admin to UPDATE sessions
3. Check database triggers aren't blocking updates
4. Test SQL directly:
   ```sql
   UPDATE chat_sessions 
   SET status = 'active' 
   WHERE id = 'session-uuid';
   ```

---

## API Reference

### User Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/chat/request` | Create new chat session |
| GET | `/api/chat/messages` | Get messages for user's active session |
| POST | `/api/chat/messages` | Send message from user |

### Admin Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/chat/requests?status=X` | Get chat sessions by status |
| POST | `/api/admin/chat/requests/:id/accept` | Accept a pending chat |
| GET | `/api/admin/chat/:sessionId/messages` | Get messages for a session |
| POST | `/api/admin/chat/:sessionId/messages` | Send admin message |

---

## Performance Tips

1. **Polling Interval**: Adjust in `AdminChatWidget.tsx` (default: 10 seconds)
   ```typescript
   const interval = setInterval(fetchCounts, 10000); // Change 10000
   ```

2. **Message History**: Limit messages loaded per session:
   ```typescript
   .order('created_at', { ascending: true })
   .limit(100) // Add this
   ```

3. **Real-time Channels**: Unsubscribe when components unmount
   ```typescript
   useEffect(() => {
     const channel = supabase.channel('...');
     return () => { channel.unsubscribe(); };
   }, []);
   ```

---

## Security Checklist

- ✅ RLS policies prevent users from seeing other users' chats
- ✅ Admin verification in `get_chat_sessions_for_admin` function
- ✅ Service role key NOT used in client-side code
- ✅ All API routes verify authentication
- ✅ Chat session ownership verified before allowing messages
- ✅ SQL injection protected by parameterized queries

---

## Future Enhancements

### Recommended Additions

1. **AI Integration**: Replace keyword bot with GPT-4
2. **File Attachments**: Allow users to send screenshots/documents
3. **Typing Indicators**: Show "Admin is typing..."
4. **Read Receipts**: Mark messages as seen
5. **Chat Ratings**: Let users rate their support experience
6. **Admin Presence**: Real-time admin online/offline status
7. **Canned Responses**: Quick reply templates for admins
8. **Chat Analytics**: Dashboard with metrics (avg response time, satisfaction, etc.)
9. **Multi-language**: i18n support for chatbot responses
10. **Push Notifications**: Browser notifications for new messages

---

## Support

For issues or questions:
1. Check this documentation first
2. Review Supabase logs in Dashboard
3. Check browser console for errors
4. Test API endpoints directly with curl/Postman
5. Verify database state with SQL queries

**Common Support Queries**:
- Schema issues → Check migrations were applied
- Real-time issues → Verify Supabase Replication settings
- Permission issues → Check RLS policies and admin table
- Bot issues → Verify `chatbot.ts` logic and imports