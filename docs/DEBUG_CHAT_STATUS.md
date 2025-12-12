# Chat Status Debugging Guide

## Problem Summary
When a chat request is created with status "pending", it appears briefly then disappears from the admin panel. The status seems to change from "pending" to "active" immediately.

## Architecture Changes Made

### 1. Centralized Data Fetching
- **AdminChatWidget** now fetches ALL chat data (pending, active, closed)
- **AdminChatPanel** receives this data as props (no more internal fetching)
- This eliminates duplicate API calls and race conditions

### 2. Key Components

**AdminChatWidget.tsx:**
- Fetches pending, active, and closed chats separately
- Passes arrays down to AdminChatPanel as props
- Has realtime subscriptions with 500ms debouncing
- Polls every 30 seconds as backup

**AdminChatPanel.tsx:**
- Receives `pendingChats`, `activeChats`, `closedChats` as props
- Calls `onRefresh()` after accepting or closing chats
- No internal fetching or realtime subscriptions for chat lists

## Debugging Steps

### Step 1: Check FORCE_ADMIN_MODE Setting

Open `src/utils/chatbot.ts` and check line 27:

```typescript
export const FORCE_ADMIN_MODE = true;  // ← Should this be true or false?
```

**What it does:**
- `FORCE_ADMIN_MODE = true` → `isAdminAvailable()` always returns `true`
- This means chats are created with status `"pending"`
- If you want bot mode (status `"active"` for testing), set to `false`

**Expected behavior:**
- `true` → Chats start as `"pending"`, wait for admin to accept
- `false` → Chats start as `"active"`, bot responds immediately

### Step 2: Open Browser Console

1. Open admin panel in one browser window
2. Open user chat in another (or incognito)
3. Open DevTools console in BOTH windows
4. Clear console logs

### Step 3: Create a Chat Request

In the **user window**, start a new chat:

1. Click chat button
2. Enter a concern (e.g., "Test chat status")
3. Click "Start Chat"

### Step 4: Watch Console Logs

**In USER console**, look for:
```
[Chat Request] Creating session: {
  adminAvailable: true/false,
  initialStatus: "pending" or "active",
  ...
}

[Chat Request] Session created successfully: {
  sessionId: "...",
  status: "pending" or "active",  ← KEY: What is this?
  ...
}

[Chat Request] Returning response: {
  finalStatus: "pending" or "active",  ← Should match above
  ...
}
```

**In ADMIN console**, look for:
```
[AdminChatWidget] Fetching all chats...
[AdminChatWidget] Pending chats: X
[AdminChatWidget] Active chats: Y
[AdminChatWidget] Closed chats: Z

[Admin Requests API] Fetching chat requests: {
  requestedStatus: "pending",
  ...
}

[Admin Requests API] Database response: {
  requestedStatus: "pending",
  sessionsCount: X,
  sessions: [{ id: "...", status: "...", ... }]  ← Check status values
}
```

### Step 5: Check Database Directly

Open Supabase SQL Editor and run:

```sql
-- Get the most recent chat session
SELECT 
  id,
  user_id,
  status,
  concern,
  admin_id,
  created_at,
  updated_at
FROM chat_sessions
ORDER BY created_at DESC
LIMIT 5;
```

**Look for:**
- What is the `status` column value?
- Is `admin_id` NULL (it should be for pending/active bot sessions)?
- Is `updated_at` changing (indicating something is updating it)?

### Step 6: Check for Automatic Status Changes

Run this query to see status update history:

```sql
-- Check if there are any triggers or functions that might auto-update status
SELECT 
  tgname AS trigger_name,
  tgtype,
  proname AS function_name
FROM pg_trigger
JOIN pg_proc ON pg_trigger.tgfoid = pg_proc.oid
WHERE tgrelid = 'chat_sessions'::regclass;
```

## Common Issues & Solutions

### Issue 1: Chat Created as "active" Instead of "pending"

**Symptoms:**
- Console shows `initialStatus: "active"`
- Chat never appears in pending tab

**Cause:**
- `FORCE_ADMIN_MODE = false` or business hours logic

**Fix:**
- Set `FORCE_ADMIN_MODE = true` in `src/utils/chatbot.ts`
- OR adjust business hours logic for your timezone

### Issue 2: Chat Appears Then Disappears

**Symptoms:**
- Chat shows briefly in pending tab
- Then disappears
- Console shows multiple fetch calls

**Cause (OLD - should be fixed now):**
- Multiple realtime events triggering fetches
- Different tabs overwriting each other's data

**Current Fix:**
- AdminChatWidget now manages all data
- AdminChatPanel just displays it
- No more conflicting fetches

### Issue 3: Status Changes Immediately After Creation

**Symptoms:**
- Database shows status changes from "pending" → "active"
- No admin accepted it

**Possible Causes:**
1. Some code is auto-accepting chats
2. Database trigger is updating status
3. Race condition in realtime subscriptions

**Debug:**
```sql
-- Add a trigger to log all updates to chat_sessions
CREATE OR REPLACE FUNCTION log_chat_session_changes()
RETURNS TRIGGER AS $$
BEGIN
  RAISE NOTICE 'chat_sessions UPDATE: id=%, old_status=%, new_status=%, updated_at=%', 
    NEW.id, OLD.status, NEW.status, NEW.updated_at;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER chat_session_changes_logger
BEFORE UPDATE ON chat_sessions
FOR EACH ROW
EXECUTE FUNCTION log_chat_session_changes();
```

Then check Supabase logs for NOTICE messages.

## Expected Flow (Correct Behavior)

### With FORCE_ADMIN_MODE = true (Pending → Admin Accepts)

1. **User creates chat:**
   - `isAdminAvailable()` returns `true`
   - Status: `"pending"`
   - No bot greeting
   - User sees: "Your message has been sent..."

2. **Admin sees chat:**
   - Appears in "Pending" tab
   - Badge shows count
   - Can click "Accept"

3. **Admin accepts:**
   - Status changes: `"pending"` → `"active"`
   - Chat moves to "Active" tab
   - `admin_id` is set
   - Message: "An admin has joined the chat..."

4. **Chat continues:**
   - Admin and user exchange messages
   - Real-time updates work

5. **Admin ends chat:**
   - Status changes: `"active"` → `"closed"`
   - Chat moves to "Closed" tab

### With FORCE_ADMIN_MODE = false (Active → Bot → Admin Join)

1. **User creates chat:**
   - `isAdminAvailable()` returns `false`
   - Status: `"active"` (bot session)
   - Bot greeting sent
   - User sees: "Hello! 👋 Our admins are..."

2. **Bot responds:**
   - User sends messages
   - Bot replies with keyword-based responses
   - Status remains `"active"`
   - `admin_id` is `NULL`

3. **Admin sees chat:**
   - Appears in "Active" tab (it's already active!)
   - Can click "Join Chat"

4. **Admin joins:**
   - `admin_id` is set
   - Status stays `"active"`
   - Message: "An admin has joined the chat..."
   - Bot stops responding

## Quick Tests

### Test 1: Simple Pending Chat
```
1. Set FORCE_ADMIN_MODE = true
2. Create chat as user
3. Check admin pending tab
4. Should appear and STAY there
5. Accept chat
6. Should move to active tab
```

### Test 2: Bot Session
```
1. Set FORCE_ADMIN_MODE = false
2. Create chat as user
3. Check admin active tab (NOT pending!)
4. Should appear there
5. Join chat
6. Bot stops, admin takes over
```

### Test 3: Rapid Fire
```
1. Create 3 chats in quick succession
2. All should appear in correct tabs
3. None should disappear
4. Counts should be accurate
```

## If Problem Persists

### Last Resort Debugging

Add this to AdminChatWidget.tsx in the `fetchAllChats` function:

```typescript
console.log("[DEBUG] Full pending response:", {
  status: pendingResponse.status,
  ok: pendingResponse.ok,
  data: pendingData,
  formatted: formattedPending,
  count: formattedPending.length,
  statuses: formattedPending.map(c => ({ id: c.id, status: c.status }))
});
```

Add this to AdminChatPanel.tsx where chatRequests is computed:

```typescript
console.log("[DEBUG] Current tab data:", {
  activeTab,
  pendingCount: pendingChats.length,
  activeCount: activeChats.length,
  closedCount: closedChats.length,
  currentChatRequests: chatRequests.map(c => ({ 
    id: c.id, 
    status: c.status,
    userName: c.userName 
  }))
});
```

This will show EXACTLY what data each component has at render time.

## Summary

The new architecture should prevent the "disappearing chat" issue because:

1. ✅ **Single source of truth**: AdminChatWidget fetches all data
2. ✅ **No conflicting fetches**: AdminChatPanel doesn't fetch, just displays
3. ✅ **Proper data flow**: Props down, callbacks up
4. ✅ **Debounced updates**: Realtime events wait 500ms before fetching
5. ✅ **Explicit logging**: Console shows exactly what's happening

If chats still disappear, it means:
- Database function is returning wrong data for the status filter
- Status is being changed by something external
- Browser state is being corrupted somehow

Use the SQL queries and console logging above to track down the exact issue!