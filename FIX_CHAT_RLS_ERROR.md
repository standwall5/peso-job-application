# 🔧 Quick Fix: Chat RLS Error

## Error Message
```
Error creating chat session: {
  code: '42501',
  message: 'new row violates row-level security policy for table "chat_sessions"'
}
```

## Root Cause
The database Row-Level Security (RLS) policies don't allow admins to create chat sessions for users.

## Solution: Run 2 Migrations

### Step 1: Fix chat_sessions Table

1. Open **Supabase Dashboard** → **SQL Editor**
2. Copy and paste this migration:

```sql
-- File: migrations/003_allow_admin_initiate_chat.sql

-- Migration: Allow Admin to Initiate Chat Sessions
-- Description: Sets up comprehensive RLS policies for chat_sessions to allow admin-initiated chats
-- Created: 2024-01-26

-- Enable RLS on chat_sessions (if not already enabled)
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies (clean slate)
DROP POLICY IF EXISTS "Users can create chat sessions" ON chat_sessions;
DROP POLICY IF EXISTS "Users and admins can create chat sessions" ON chat_sessions;
DROP POLICY IF EXISTS "Applicants can create their own chat sessions" ON chat_sessions;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON chat_sessions;
DROP POLICY IF EXISTS "Users can view their own chat sessions" ON chat_sessions;
DROP POLICY IF EXISTS "Enable select for authenticated users" ON chat_sessions;
DROP POLICY IF EXISTS "Admins can view all chat sessions" ON chat_sessions;
DROP POLICY IF EXISTS "Admins can update chat sessions" ON chat_sessions;
DROP POLICY IF EXISTS "Enable update for admins" ON chat_sessions;

-- Policy: Applicants can view their own chat sessions
CREATE POLICY "Applicants can view their own sessions"
ON chat_sessions
FOR SELECT
USING (
  user_id IN (
    SELECT id FROM applicants WHERE auth_id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM peso WHERE auth_id = auth.uid()
  )
);

-- Policy: Applicants and admins can create chat sessions
CREATE POLICY "Allow applicants and admins to create sessions"
ON chat_sessions
FOR INSERT
WITH CHECK (
  user_id IN (
    SELECT id FROM applicants WHERE auth_id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM peso WHERE auth_id = auth.uid()
  )
);

-- Policy: Admins can update any chat session (accept, close, etc.)
CREATE POLICY "Admins can update any session"
ON chat_sessions
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM peso WHERE auth_id = auth.uid()
  )
);
```

3. Click **Run** → Should see "Success. No rows returned"

---

### Step 2: Fix chat_messages Table

1. Still in **SQL Editor**
2. Copy and paste this migration:

```sql
-- File: migrations/004_chat_messages_rls_policies.sql

-- Migration: Chat Messages RLS Policies
-- Description: Sets up comprehensive RLS policies for chat_messages table
-- Created: 2024-01-26

-- Enable RLS on chat_messages (if not already enabled)
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies (clean slate)
DROP POLICY IF EXISTS "Users can view messages from their sessions" ON chat_messages;
DROP POLICY IF EXISTS "Users can insert messages to their sessions" ON chat_messages;
DROP POLICY IF EXISTS "Admins can view all messages" ON chat_messages;
DROP POLICY IF EXISTS "Admins can insert messages" ON chat_messages;
DROP POLICY IF EXISTS "Admins can update messages" ON chat_messages;
DROP POLICY IF EXISTS "Enable select for authenticated users" ON chat_messages;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON chat_messages;
DROP POLICY IF EXISTS "Enable update for admins" ON chat_messages;

-- Policy: Applicants and admins can view messages
CREATE POLICY "Applicants and admins can view messages"
ON chat_messages
FOR SELECT
USING (
  chat_session_id IN (
    SELECT id FROM chat_sessions
    WHERE user_id IN (
      SELECT id FROM applicants WHERE auth_id = auth.uid()
    )
  )
  OR
  EXISTS (
    SELECT 1 FROM peso WHERE auth_id = auth.uid()
  )
);

-- Policy: Applicants and admins can send messages
CREATE POLICY "Applicants and admins can send messages"
ON chat_messages
FOR INSERT
WITH CHECK (
  chat_session_id IN (
    SELECT id FROM chat_sessions
    WHERE user_id IN (
      SELECT id FROM applicants WHERE auth_id = auth.uid()
    )
  )
  OR
  EXISTS (
    SELECT 1 FROM peso WHERE auth_id = auth.uid()
  )
);

-- Policy: Admins and users can update messages
CREATE POLICY "Admins and users can update messages"
ON chat_messages
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM peso WHERE auth_id = auth.uid()
  )
  OR
  chat_session_id IN (
    SELECT id FROM chat_sessions
    WHERE user_id IN (
      SELECT id FROM applicants WHERE auth_id = auth.uid()
    )
  )
);
```

3. Click **Run** → Should see "Success. No rows returned"

---

## ✅ Verify It Works

1. **Log in as admin**
2. **Go to Jobseekers page**
3. **Click on a jobseeker** to view their profile
4. **Click "Message Jobseeker" button**
5. **Chat widget should open** ✅
6. **Type and send a message** ✅
7. **Log in as that user** → Should see notification badge on chat button ✅

---

## 🐛 Troubleshooting

### Still getting RLS errors?

Run this query in Supabase SQL Editor to check policies:

```sql
SELECT 
  schemaname,
  tablename, 
  policyname, 
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename IN ('chat_sessions', 'chat_messages')
ORDER BY tablename, cmd;
```

You should see:
- **chat_sessions**: 3 policies (SELECT, INSERT, UPDATE)
- **chat_messages**: 3 policies (SELECT, INSERT, UPDATE)

### Verify RLS is enabled:

```sql
SELECT tablename, rowsecurity
FROM pg_tables
WHERE tablename IN ('chat_sessions', 'chat_messages');
```

Both should show `rowsecurity = true`

---

## 📝 What These Migrations Do

**Migration 003 (chat_sessions):**
- ✅ Allows admins to create chat sessions for any applicant
- ✅ Allows applicants to create their own chat sessions
- ✅ Allows admins to view all sessions
- ✅ Allows applicants to view only their own sessions
- ✅ Allows admins to update sessions (accept, close, etc.)

**Migration 004 (chat_messages):**
- ✅ Allows admins to send messages to any chat
- ✅ Allows applicants to send messages in their own chats
- ✅ Allows admins to view all messages
- ✅ Allows applicants to view messages in their own chats
- ✅ Allows marking messages as read

---

## Need Help?

If you still encounter issues:
1. Check that your admin account exists in the `peso` table
2. Verify the admin is authenticated (check `auth.uid()`)
3. Check browser console for detailed error messages
4. Verify both migrations ran successfully (no errors in SQL Editor)

---

**That's it! The chat feature should now work perfectly.** 🎉