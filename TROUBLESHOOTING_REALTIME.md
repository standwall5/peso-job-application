# 🔧 Troubleshooting Real-Time Chat Issues

## Problem: User closes chat but admin doesn't see it / Typing indicators not working

### Quick Diagnostic Steps

#### Step 1: Open Browser Console (BOTH user and admin windows)

**User Window:**
1. Open user site in one browser/tab
2. Press F12 to open DevTools
3. Go to Console tab
4. Start a chat

**Admin Window:**
1. Open admin panel in another browser/incognito
2. Press F12 to open DevTools  
3. Go to Console tab
4. Accept the chat

#### Step 2: Test Typing Indicators

**In User Window:**
1. Type something in the input field
2. **Look for these logs:**
   ```
   [ChatWidget] Input changed, length: 1
   [ChatWidget] sendTypingIndicator called { hasSessionId: true, hasChannel: true }
   [ChatWidget] Broadcasting typing event
   ```

**In Admin Window:**
3. You should see:
   ```
   [AdminChatPanel] Typing broadcast received: { ... }
   [AdminChatPanel] User is typing!
   ```

**If you DON'T see these logs, go to Step 3.**

#### Step 3: Test Chat Close

**In User Window:**
1. Click the X button to close chat
2. **Look for these logs:**
   ```
   [ChatWidget] handleCloseChat called { sessionId: '...', mode: 'live', chatStatus: 'connected' }
   [ChatWidget] User closing chat, ending session: ...
   [ChatWidget] Close API response status: 200
   [ChatWidget] Chat session closed successfully: { success: true, ... }
   [ChatWidget] Waiting 300ms for realtime propagation...
   [ChatWidget] Realtime propagation wait complete
   ```

**In Admin Window:**
3. You should see:
   ```
   [AdminChatPanel] Chat session updated: { oldStatus: 'active', newStatus: 'closed', ... }
   [AdminChatPanel] User closed chat - showing notification
   ```

**If you DON'T see these logs, continue to Step 4.**

---

## Common Issues & Fixes

### Issue 1: Typing Subscription Not Created

**Symptoms:**
- No typing indicator logs at all
- Log shows: `[ChatWidget] Typing channel subscription status: CLOSED`

**Check:**
```
[ChatWidget] Setting up typing subscription for: <session-id>
[ChatWidget] Typing channel subscription status: SUBSCRIBED
```

**If status is NOT "SUBSCRIBED":**

**Cause:** Supabase Realtime Broadcast not enabled or project settings issue

**Fix:**
1. Go to Supabase Dashboard
2. Project Settings → API
3. Check if Realtime is enabled (green toggle)
4. If disabled, enable it
5. Restart your dev server

### Issue 2: Typing Events Not Broadcasting

**Symptoms:**
- User types, sees `Broadcasting typing event`
- Admin sees nothing

**Check Network Tab:**
1. In DevTools, go to Network tab
2. Filter by "WS" (WebSocket)
3. Look for active WebSocket connection to Supabase
4. Click on it → Messages tab
5. Type in chat input
6. You should see messages being sent

**If no WebSocket connection:**

**Cause:** Realtime not initialized properly

**Fix:**
1. Check `.env.local` has correct Supabase URL and anon key:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```
2. Restart dev server
3. Hard refresh browser (Ctrl+Shift+R or Cmd+Shift+R)

### Issue 3: Chat Close API Fails

**Symptoms:**
- User clicks X
- Log shows: `[ChatWidget] Failed to close chat session: { error: '...' }`

**Common Errors:**

**A) "Not authenticated" (401)**
```
[ChatWidget] Close API response status: 401
```
**Cause:** User not logged in or session expired

**Fix:**
1. Check user is logged in
2. Refresh page to get new auth token
3. Try again

**B) "Chat session not found" (404)**
```
[ChatWidget] Close API response status: 404
```
**Cause:** Session ID invalid or chat already deleted

**Fix:**
1. Check `sessionId` in console log
2. Verify chat session exists in Supabase database:
   ```sql
   SELECT * FROM chat_sessions WHERE id = 'session-id-here';
   ```
3. If it doesn't exist, there's an issue with chat creation

**C) "Not authorized for this chat session" (403)**
```
[ChatWidget] Close API response status: 403
```
**Cause:** User trying to close someone else's chat

**Fix:**
1. Check `applicants` table has correct `auth_id`:
   ```sql
   SELECT id, name, auth_id FROM applicants WHERE auth_id = 'user-auth-id';
   ```
2. Verify chat `user_id` matches applicant `id`

### Issue 4: Admin Doesn't Receive Session Update

**Symptoms:**
- Chat closes successfully (status 200)
- Admin panel doesn't show "User has closed the chat"

**Check:**
1. In Admin Console, look for:
   ```
   [AdminChatPanel] Chat session updated: { ... }
   ```

**If you DON'T see this:**

**Cause A:** Realtime not enabled for `chat_sessions` table

**Fix:**
1. Go to Supabase Dashboard
2. Database → Replication
3. Find `chat_sessions` table
4. Make sure:
   - Realtime toggle is ON (green)
   - UPDATE events are enabled (checkbox checked)
5. Save changes
6. Refresh admin panel

**Cause B:** Admin panel not subscribed to session updates

**Fix:**
1. Check admin has an active chat selected
2. Log should show:
   ```
   [AdminChatPanel] Setting up typing subscription for: <chat-id>
   ```
3. If not, the subscription isn't being created

**Cause C:** Subscription created but events not coming through

**Fix:**
1. Check Network tab → WebSocket connection
2. Click on WS connection → Messages
3. When user closes chat, you should see UPDATE message
4. If you don't see it:
   - Realtime not enabled (see Cause A)
   - RLS policies blocking it
   - Check Supabase logs for errors

### Issue 5: "User has closed the chat" Shows But Chat Doesn't Move to Closed Tab

**Symptoms:**
- Admin sees system message
- Chat still in Active tab

**Cause:** `onRefresh()` not being called or not working

**Check logs:**
```
[AdminChatPanel] Calling onRefresh after user close
[AdminChatWidget] Fetching all chats...
[AdminChatWidget] Closed chats: X
```

**If onRefresh is called but counts don't update:**

**Fix:**
1. Check AdminChatWidget's realtime subscription:
   ```
   [AdminChatWidget] UPDATE event: { oldStatus: 'active', newStatus: 'closed' }
   ```
2. Should trigger debounced fetch
3. Check if fetch is being blocked (see `isFetchingRef`)

---

## Manual Testing Checklist

### Prerequisites
✅ Supabase Realtime enabled in project settings  
✅ Realtime enabled for `chat_sessions` table (Replication)  
✅ Realtime enabled for `chat_messages` table (Replication)  
✅ UPDATE events enabled for `chat_sessions`  
✅ INSERT events enabled for `chat_messages`  
✅ Dev server restarted after env changes  
✅ Browser hard-refreshed (Ctrl+Shift+R)  

### Test 1: Typing Indicators - User → Admin
1. [ ] User starts typing in chat input
2. [ ] User console shows: "Broadcasting typing event"
3. [ ] Admin console shows: "Typing broadcast received"
4. [ ] Admin console shows: "User is typing!"
5. [ ] Admin UI shows typing indicator with 3 bouncing dots
6. [ ] Stop typing
7. [ ] After 3 seconds, indicator disappears

### Test 2: Typing Indicators - Admin → User
1. [ ] Admin starts typing in chat input
2. [ ] Admin console shows: "Broadcasting typing event"
3. [ ] User console shows: "Typing broadcast received"
4. [ ] User console shows: "Admin is typing!"
5. [ ] User UI shows typing indicator with 3 bouncing dots
6. [ ] Stop typing
7. [ ] After 3 seconds, indicator disappears

### Test 3: User Closes Chat
1. [ ] User clicks X button
2. [ ] User console shows: "handleCloseChat called"
3. [ ] User console shows: "Close API response status: 200"
4. [ ] User console shows: "Chat session closed successfully"
5. [ ] Widget closes
6. [ ] Admin console shows: "Chat session updated"
7. [ ] Admin console shows: "User closed chat - showing notification"
8. [ ] Admin UI shows: "🔴 User has closed the chat" message
9. [ ] After 500ms, chat moves to "Closed" tab
10. [ ] Admin can still see message history

---

## Database Checks

### Verify Chat Session Closed
```sql
-- Check if chat actually closed in database
SELECT 
  id,
  status,
  closed_at,
  created_at
FROM chat_sessions 
WHERE id = 'your-session-id-here';
```

**Expected:**
- `status` = `'closed'`
- `closed_at` = timestamp (not null)

### Check Realtime Publication
```sql
-- Check if realtime is enabled for the table
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename IN ('chat_sessions', 'chat_messages');
```

### Check RLS Policies
```sql
-- Make sure admins can see session updates
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename IN ('chat_sessions', 'chat_messages');
```

---

## Emergency Fixes

### If Nothing Works - Nuclear Option

1. **Disable RLS temporarily** (testing only!):
   ```sql
   ALTER TABLE chat_sessions DISABLE ROW LEVEL SECURITY;
   ALTER TABLE chat_messages DISABLE ROW LEVEL SECURITY;
   ```
   Test again. If it works, RLS is the issue.
   
2. **Re-enable RLS and fix policies:**
   ```sql
   ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
   ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
   
   -- Add permissive policy for admins
   CREATE POLICY "Admins can do everything on chat_sessions"
   ON chat_sessions
   FOR ALL
   TO authenticated
   USING (
     EXISTS (
       SELECT 1 FROM peso 
       WHERE peso.auth_id = auth.uid()
     )
   );
   ```

### If Typing Indicators Don't Work

**Option 1: Check Supabase project tier**
- Free tier has Realtime limits
- Check your quota in Supabase Dashboard

**Option 2: Use Polling Instead** (fallback)
Create a `typing_status` table:
```sql
CREATE TABLE typing_status (
  chat_session_id UUID REFERENCES chat_sessions(id),
  sender TEXT NOT NULL,
  last_typed_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (chat_session_id, sender)
);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE typing_status;
```

Poll this table instead of using Broadcast.

---

## Getting Help

If you're still stuck, collect this info:

1. **Console logs** from both user and admin windows
2. **Network tab** screenshot showing WebSocket messages
3. **Supabase Dashboard** → Logs → Filter by "realtime"
4. **Database query results:**
   ```sql
   SELECT * FROM chat_sessions ORDER BY created_at DESC LIMIT 5;
   ```
5. **Your Supabase project tier** (Free/Pro/Team)

Then post in:
- Supabase Discord #help-and-questions
- Stack Overflow with tag `supabase`
- GitHub issue (if it's a Supabase bug)

---

## Summary

**Most common issues:**
1. ❌ Realtime not enabled in Supabase Dashboard
2. ❌ Realtime not enabled for specific tables (Replication settings)
3. ❌ UPDATE events not enabled for `chat_sessions`
4. ❌ RLS policies blocking realtime events
5. ❌ WebSocket connection not established
6. ❌ Browser hard refresh needed after env changes

**Quick fixes:**
1. ✅ Enable Realtime in Supabase project settings
2. ✅ Enable Replication for `chat_sessions` and `chat_messages`
3. ✅ Enable UPDATE events for `chat_sessions`
4. ✅ Restart dev server
5. ✅ Hard refresh browser (Ctrl+Shift+R)
6. ✅ Check console logs for errors

**Test with console open** - logs will tell you exactly where it's failing!