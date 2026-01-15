# Chat Closing Behavior - Testing Script

This document provides step-by-step testing procedures to verify all chat closing behaviors work correctly.

## Prerequisites

- Development server running (`npm run dev`)
- Access to both user and admin accounts
- Browser developer console open (F12)
- Supabase Studio or SQL client for database verification

## Test Suite 1: User Closes Chat

### Setup
1. Open application in browser
2. Log in as a regular user (applicant)
3. Open chat widget

### Steps
1. Click "Chat with Admin" from menu
2. Enter a concern and submit
3. Send at least one message
4. Click "End Chat" button

### Expected Results
- ✅ Session status updates to "closed" in database
- ✅ Message appears: "Chat has been ended. Thank you for contacting PESO!"
- ✅ "Back to Menu" button is visible
- ✅ Input field and "End Chat" button are hidden
- ✅ Chat status badge shows "Closed"

### After Clicking "Back to Menu"
- ✅ Returns to menu view
- ✅ Menu shows "Chat with Admin" button (NOT "Active Chat")
- ✅ Menu shows "Last Chat History" button (if history exists)
- ✅ Console shows no errors

### Verify in Database
```sql
SELECT id, status, closed_at 
FROM chat_sessions 
WHERE status = 'closed' 
ORDER BY closed_at DESC 
LIMIT 1;
```
- ✅ Most recent session has status = 'closed'
- ✅ `closed_at` timestamp is set

---

## Test Suite 2: Admin Closes Chat

### Setup
1. Open two browser windows/tabs:
   - Window A: User (applicant) logged in
   - Window B: Admin logged in
2. Start a chat from Window A
3. Admin accepts chat in Window B

### Steps (Window B - Admin)
1. Accept the pending chat
2. Send a message to user
3. Click "End Chat" button

### Expected Results (Window B - Admin)
- ✅ Chat closes
- ✅ Returns to chat list
- ✅ Session appears in "Closed" tab

### Expected Results (Window A - User)
- ✅ Real-time update received (within 1-2 seconds)
- ✅ Message appears: "This chat has been closed by the admin."
- ✅ Status badge changes to "Closed"
- ✅ Input field and "End Chat" button disappear
- ✅ "Back to Menu" button appears

### After User Clicks "Back to Menu"
- ✅ Returns to menu
- ✅ "Chat with Admin" button visible (NOT "Active Chat")
- ✅ Closed session appears in history

### Console Logs to Check
```
[ChatWidget] Chat session updated: { status: 'closed', ... }
```

---

## Test Suite 3: Session Timeout (Widget Open)

### Setup
1. Log in as user
2. Open chat widget
3. Start a new chat with admin

### Steps
1. Send one message
2. **DO NOT** send any more messages
3. Wait 90 seconds (1 minute 30 seconds)
4. Observe warning indicators
5. Wait another 30 seconds (2 minutes total)

### Expected Results at 90 Seconds
- ✅ Warning badge (!) appears on "Active Chat" menu button (if you navigate to menu)
- ✅ Warning banner appears in chat: "⚠️ Your session will expire in 30 seconds..."
- ✅ Background color of warning: orange gradient

### Expected Results at 120 Seconds (2 Minutes)
- ✅ Session automatically closes
- ✅ Message appears: "This chat has been closed due to inactivity (2 minutes without response)."
- ✅ Warning banner disappears
- ✅ Status changes to "Closed"
- ✅ Input field hidden
- ✅ "Back to Menu" button appears

### Console Logs
```
[ChatWidget] Session expired
[ChatWidget] Closing session due to timeout
```

### Verify in Database
```sql
SELECT id, status, closed_at, last_user_message_at,
       (closed_at - last_user_message_at) as inactive_duration
FROM chat_sessions 
WHERE status = 'closed' 
ORDER BY closed_at DESC 
LIMIT 1;
```
- ✅ `inactive_duration` should be approximately 2 minutes

---

## Test Suite 4: Session Timeout (Widget Closed - Cron Job)

### Setup
1. Log in as user
2. Start a chat session
3. Send one message
4. **Close the chat widget** (click X button)

### Steps
1. Wait 2+ minutes without reopening widget
2. Manually trigger cron job OR wait for automatic run

### Manual Cron Trigger
```bash
curl http://localhost:3000/api/cron/check-chat-timeouts
```

### Expected Cron Response
```json
{
  "success": true,
  "closedCount": 1,
  "sessionIds": ["session-uuid"],
  "message": "Successfully closed 1 expired chat session(s)",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Verify Admin Receives Update
1. In admin window, observe "Active" tab
2. Session should disappear and move to "Closed" tab
3. Console should show UPDATE event

### Reopen Widget as User
1. Click chat icon to reopen widget
2. Navigate to menu

### Expected Results
- ✅ "Chat with Admin" button visible (NOT "Active Chat")
- ✅ "Last Chat History" button visible
- ✅ Click history → see closed session with timeout message

### Verify in Database
```sql
-- Check timeout message was added
SELECT sender, message, created_at 
FROM chat_messages 
WHERE chat_session_id = 'your-session-id' 
ORDER BY created_at DESC 
LIMIT 1;
```
- ✅ Last message sender = 'bot'
- ✅ Message = "This chat has been closed due to inactivity..."

---

## Test Suite 5: Warning System

### Setup
1. Start a chat session
2. Send one message

### Steps
1. Wait exactly 90 seconds
2. Send another message
3. Wait another 90 seconds

### Expected Results (First 90 Seconds)
- ✅ Warning badge appears
- ✅ Warning banner appears

### Expected Results (After Sending Message)
- ✅ Warning badge disappears immediately
- ✅ Warning banner disappears immediately
- ✅ Timer resets (new 2-minute countdown starts)

### Expected Results (Second 90 Seconds)
- ✅ Warning appears again
- ✅ Session does not timeout (because message was sent)

---

## Test Suite 6: Multiple Session Scenarios

### Test 6.1: Close Widget, Reopen Within 2 Minutes
1. Start chat, send message
2. Close widget
3. Wait 1 minute
4. Reopen widget

**Expected**: 
- ✅ Same session resumes
- ✅ Warning may appear if <30 seconds remain
- ✅ Session ID unchanged

### Test 6.2: Close Widget, Reopen After 2 Minutes
1. Start chat, send message
2. Close widget
3. Wait 2+ minutes
4. Reopen widget

**Expected**:
- ✅ Session is closed
- ✅ Menu shows "Chat with Admin" (not "Active Chat")
- ✅ History shows the closed session

### Test 6.3: End Chat Then Start New Chat
1. Start chat, send message
2. Click "End Chat"
3. Click "Back to Menu"
4. Click "Chat with Admin" again
5. Start new chat

**Expected**:
- ✅ New session created (different session ID)
- ✅ Previous session in history
- ✅ No interference between sessions

---

## Test Suite 7: Cron Job Configuration

### Verify Vercel Deployment
1. Deploy to Vercel
2. Check deployment logs
3. Look for cron execution logs

### Expected Log Entries (Every Minute)
```
[Cron] Starting chat timeout check...
[Cron] No expired chat sessions found
```

OR (if sessions expired):
```
[Cron] Starting chat timeout check...
[Cron] Found 2 expired session(s)
[Cron] Successfully closed 2 expired session(s)
```

### Test External Cron Service
If using cron-job.org or similar:

1. Configure cron job with URL
2. Set schedule to every minute
3. Add Authorization header: `Bearer YOUR_CRON_SECRET`
4. Check execution history in service dashboard

**Expected**:
- ✅ HTTP 200 response
- ✅ Response body contains `"success": true`
- ✅ Runs every minute without errors

---

## Test Suite 8: Edge Cases

### Test 8.1: Close Chat Multiple Times
1. Start chat
2. Click "End Chat"
3. Try clicking "End Chat" again (button should be hidden)

**Expected**: 
- ✅ No errors
- ✅ Session remains closed
- ✅ No duplicate messages

### Test 8.2: Rapid Open/Close
1. Open chat widget
2. Close immediately
3. Reopen immediately
4. Repeat 5 times

**Expected**:
- ✅ No errors in console
- ✅ State remains consistent
- ✅ No memory leaks (check browser task manager)

### Test 8.3: Network Disconnection
1. Start chat
2. Disconnect network (airplane mode)
3. Click "End Chat"
4. Reconnect network

**Expected**:
- ✅ Request retries or shows error
- ✅ State eventually syncs
- ✅ No corrupt data

---

## Test Suite 9: State Cleanup Verification

### Memory Leak Check
1. Start chat
2. End chat
3. Open browser DevTools → Memory tab
4. Take heap snapshot
5. Search for "subscription" or "channel"

**Expected**:
- ✅ No lingering Supabase channel objects
- ✅ No active timers (check `setTimeout`/`setInterval`)

### React DevTools Check
1. Install React DevTools extension
2. Start chat
3. End chat
4. Click "Back to Menu"
5. Inspect ChatWidget component state

**Expected State**:
```javascript
hasActiveSession: false
sessionExpiryTime: null
showExpiryWarning: false
chatStatus: "waiting"
sessionId: null (or previous session ID)
```

---

## Test Suite 10: Database Integrity

### SQL Verification Queries

```sql
-- Check for orphaned active sessions (should timeout after 2 min)
SELECT id, status, last_user_message_at,
       NOW() - last_user_message_at as inactive_for
FROM chat_sessions
WHERE status IN ('pending', 'active')
  AND last_user_message_at IS NOT NULL
  AND last_user_message_at < NOW() - INTERVAL '5 minutes';
-- Should return 0 rows if cron is working

-- Check closed sessions have closed_at timestamp
SELECT id, status, closed_at
FROM chat_sessions
WHERE status = 'closed' AND closed_at IS NULL;
-- Should return 0 rows

-- Check messages match session status
SELECT cs.id, cs.status, COUNT(cm.id) as message_count,
       MAX(cm.created_at) as last_message
FROM chat_sessions cs
LEFT JOIN chat_messages cm ON cs.id = cm.chat_session_id
GROUP BY cs.id, cs.status
HAVING cs.status = 'closed' AND COUNT(cm.id) = 0;
-- Closed sessions should have at least one message
```

---

## Success Criteria

All tests should pass with ✅ for the fix to be considered complete.

### Critical Tests
- Test 1: User closes chat properly
- Test 2: Admin closes chat, user sees update
- Test 3: Timeout with widget open
- Test 4: Timeout with widget closed (cron)
- Test 9: No memory leaks

### Performance Benchmarks
- Real-time updates: < 2 seconds
- Cron execution: < 1 second
- State cleanup: < 100ms
- UI response: < 200ms

---

## Troubleshooting

### If Tests Fail

1. **Check Console Logs**: Look for errors or missing log statements
2. **Verify Database**: Run SQL queries to check actual state
3. **Check Network Tab**: Verify API calls are succeeding
4. **React DevTools**: Inspect component state
5. **Supabase Dashboard**: Check real-time subscriptions are active

### Common Issues

- **Timeout not working**: Check `last_user_message_at` is updating
- **Warning not appearing**: Verify timer interval is running
- **Admin not updated**: Check real-time subscription is active
- **State not clearing**: Check all cleanup code paths

---

## Reporting Issues

When reporting test failures, include:
1. Test suite and test case number
2. Expected vs actual results
3. Browser console logs
4. Network tab screenshot
5. Database query results
6. React DevTools component state

---

## Sign-off

After all tests pass:
- [ ] All 10 test suites completed
- [ ] No console errors
- [ ] No memory leaks
- [ ] Database queries return expected results
- [ ] Cron job running successfully
- [ ] Documentation reviewed and updated
- [ ] Code changes committed and pushed