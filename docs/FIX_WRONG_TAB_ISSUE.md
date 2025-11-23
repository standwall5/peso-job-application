# Fix: Chat Requests Appearing in Wrong Tab

## Problem

Chat requests are appearing in the **"Active Chats"** tab even though they have status **"pending"** and haven't been accepted yet.

**Expected:**
- Status "pending" → Shows in "New Requests" tab
- Status "active" → Shows in "Active Chats" tab  
- Status "closed" → Shows in "Closed" tab

**Actual:**
- Requests showing in wrong tabs
- Notification badges on wrong tabs

---

## Diagnostic Steps

### Step 1: Check Server Logs

Look at your terminal where `npm run dev` is running. You should see:

```
[Admin Requests API] Fetching chat requests: {
  requestedStatus: "new",
  mappedStatus: "pending",
  adminId: 123
}

[Admin Requests API] Database response: {
  requestedStatus: "pending",
  sessionsCount: 2,
  sessions: [
    { id: "...", status: "pending", concern: "I need help..." },
    { id: "...", status: "pending", concern: "How do I..." }
  ]
}
```

**Check:**
- Are sessions returned for the correct status?
- Do the status values match what you expect?

---

### Step 2: Run Database Diagnostics

Open **Supabase SQL Editor** and run this query:

```sql
-- Check actual status values in database
SELECT
    status,
    COUNT(*) as count
FROM chat_sessions
GROUP BY status
ORDER BY count DESC;
```

**Expected results:**
```
status   | count
---------|-------
pending  | 3
active   | 5
closed   | 10
```

**If you see something different:**
```
status      | count
------------|-------
"pending "  | 3     ← Extra space!
"active"    | 5
" pending"  | 2     ← Leading space!
```

This means there are **whitespace issues** in your status values.

---

### Step 3: Check Recent Sessions

```sql
-- Show recent sessions with status
SELECT
    id,
    status,
    LENGTH(status) as status_length,
    concern,
    created_at
FROM chat_sessions
ORDER BY created_at DESC
LIMIT 10;
```

**Good result:**
```
status_length: 7  (for "pending")
status_length: 6  (for "active")
status_length: 6  (for "closed")
```

**Bad result:**
```
status_length: 8  ← Should be 7 for "pending" - has extra char!
```

---

### Step 4: Test Database Function

```sql
-- Test if function returns correct data
SELECT * FROM get_chat_sessions_for_admin('pending');
SELECT * FROM get_chat_sessions_for_admin('active');
SELECT * FROM get_chat_sessions_for_admin('closed');
```

Each should return only sessions with that status.

---

## Common Causes & Fixes

### Cause 1: Database Function Type Mismatch

**Problem:** Function parameter type doesn't match status column type.

**Check:**
```sql
-- See column type
SELECT data_type FROM information_schema.columns
WHERE table_name = 'chat_sessions' AND column_name = 'status';

-- Should return: character varying or varchar
```

**Fix:** Recreate function with correct types:

```sql
DROP FUNCTION IF EXISTS get_chat_sessions_for_admin(TEXT);

CREATE OR REPLACE FUNCTION get_chat_sessions_for_admin(session_status VARCHAR(20))
RETURNS TABLE (
  id UUID,
  user_id BIGINT,
  admin_id BIGINT,
  status VARCHAR(20),
  concern TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  closed_at TIMESTAMP WITH TIME ZONE,
  applicant_name TEXT,
  applicant_email TEXT,
  applicant_auth_id UUID
)
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Verify caller is an admin
  IF NOT EXISTS (
    SELECT 1 FROM peso WHERE auth_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Unauthorized: Admin access required';
  END IF;

  -- Return chat sessions with applicant details
  RETURN QUERY
  SELECT
    cs.id,
    cs.user_id,
    cs.admin_id,
    cs.status::VARCHAR(20),
    cs.concern,
    cs.created_at,
    cs.closed_at,
    a.name as applicant_name,
    au.email as applicant_email,
    a.auth_id as applicant_auth_id
  FROM chat_sessions cs
  LEFT JOIN applicants a ON cs.user_id = a.id
  LEFT JOIN auth.users au ON a.auth_id = au.id
  WHERE cs.status = session_status::VARCHAR(20)
  ORDER BY cs.created_at DESC;
END;
$$;

GRANT EXECUTE ON FUNCTION get_chat_sessions_for_admin(VARCHAR) TO authenticated;
```

---

### Cause 2: Status Values Have Whitespace

**Problem:** Status values have extra spaces like `"pending "` or `" active"`.

**Detect:**
```sql
-- Find problematic status values
SELECT
    id,
    status,
    LENGTH(status) as len,
    status = 'pending' as is_pending,
    status = 'active' as is_active
FROM chat_sessions
WHERE LENGTH(status) != LENGTH(TRIM(status))
OR status NOT IN ('pending', 'active', 'closed');
```

**Fix:**
```sql
-- Clean up status values
UPDATE chat_sessions
SET status = TRIM(status)
WHERE LENGTH(status) != LENGTH(TRIM(status));

-- Add constraint to prevent future issues
ALTER TABLE chat_sessions
ADD CONSTRAINT check_status_valid
CHECK (status IN ('pending', 'active', 'closed'));
```

---

### Cause 3: Multiple Sessions Being Created

**Problem:** Code creates multiple sessions when user clicks "Start Chat" multiple times.

**Detect:**
```sql
-- Find users with multiple pending sessions
SELECT
    user_id,
    COUNT(*) as session_count,
    array_agg(status) as statuses,
    array_agg(created_at ORDER BY created_at DESC) as timestamps
FROM chat_sessions
GROUP BY user_id
HAVING COUNT(*) > 1;
```

**Fix:** Add unique constraint (one active session per user):

```sql
-- Create unique index - one open session per user
CREATE UNIQUE INDEX idx_one_open_session_per_user
ON chat_sessions (user_id)
WHERE status IN ('pending', 'active');
```

---

### Cause 4: Real-time Events Causing Tab Confusion

**Problem:** Real-time subscription updates are moving chats between tabs incorrectly.

**Check AdminChatPanel.tsx:**

The real-time subscription should only refresh the CURRENT tab's data, not move items between tabs.

**Fix:** Already implemented with debouncing, but verify the subscription only fetches when status matches current tab.

---

## Quick Workaround

If database function isn't working, use direct query instead:

**Edit:** `src/app/api/admin/chat/requests/route.ts`

Replace the RPC call with direct query:

```typescript
// Instead of this:
const { data: chatSessions, error: sessionsError } = await supabase.rpc(
  "get_chat_sessions_for_admin",
  { session_status: statusValue },
);

// Use this:
const { data: chatSessions, error: sessionsError } = await supabase
  .from("chat_sessions")
  .select(`
    id,
    user_id,
    admin_id,
    status,
    concern,
    created_at,
    closed_at,
    applicants!inner (
      name,
      auth_id
    )
  `)
  .eq("status", statusValue)
  .order("created_at", { ascending: false });

// Then manually join email from auth.users if needed
// (This bypasses the database function)
```

---

## Testing Checklist

After applying fixes:

- [ ] Create new chat request
- [ ] Check server logs - see which status it's created with
- [ ] Open admin panel "New Requests" tab
- [ ] Verify request appears there (not in Active)
- [ ] Click "Accept Chat"
- [ ] Verify request moves to "Active" tab
- [ ] Check badge counts are correct
- [ ] End chat
- [ ] Verify request moves to "Closed" tab

---

## Debug Commands

**See all sessions by status:**
```sql
SELECT
    id,
    user_id,
    status,
    concern,
    created_at
FROM chat_sessions
ORDER BY
    CASE status
        WHEN 'pending' THEN 1
        WHEN 'active' THEN 2
        WHEN 'closed' THEN 3
        ELSE 4
    END,
    created_at DESC;
```

**See what each tab should show:**
```sql
-- New Requests tab
SELECT COUNT(*) as new_requests FROM chat_sessions WHERE status = 'pending';

-- Active Chats tab
SELECT COUNT(*) as active_chats FROM chat_sessions WHERE status = 'active';

-- Closed tab
SELECT COUNT(*) as closed_chats FROM chat_sessions WHERE status = 'closed';
```

**Check specific session:**
```sql
SELECT * FROM chat_sessions WHERE id = 'your-session-id';
```

---

## Prevention

To prevent this issue in the future:

1. **Add constraint:**
```sql
ALTER TABLE chat_sessions
ADD CONSTRAINT check_status_valid
CHECK (status IN ('pending', 'active', 'closed'));
```

2. **Add constraint for admin_id:**
```sql
-- Prevent active sessions without admin
ALTER TABLE chat_sessions
ADD CONSTRAINT check_active_has_admin
CHECK (
  (status = 'pending' AND admin_id IS NULL) OR
  (status != 'pending')
);
```

3. **Use TypeScript enums in code:**
```typescript
enum ChatStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  CLOSED = 'closed'
}

// Use: status: ChatStatus.PENDING instead of "pending"
```

---

## Still Having Issues?

1. **Check browser console** for errors
2. **Check server logs** for the database response
3. **Run the diagnostic SQL** to see actual data
4. **Try the direct query workaround** instead of RPC function
5. **Check if FORCE_BOT_MODE or FORCE_ADMIN_MODE are set** in chatbot.ts

---

## Summary

**Most likely causes:**
1. Database function type mismatch (TEXT vs VARCHAR)
2. Status values have whitespace
3. FORCE_BOT_MODE is enabled (sets status to "active")

**Quick fix:**
1. Set `FORCE_ADMIN_MODE = true` in chatbot.ts
2. Recreate database function with correct types
3. Clean up any whitespace in status values

**Verify fix:**
Create new chat → Should appear in "New Requests" tab with status "pending"