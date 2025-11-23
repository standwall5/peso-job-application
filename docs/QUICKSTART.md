# Quick Start Guide - Testing the Chat System

This guide will help you quickly test the chatbot and real-time chat system.

## Prerequisites

- Next.js development server running (`npm run dev`)
- Supabase project configured
- At least one test user account (applicant)
- At least one admin account

## 5-Minute Setup

### 1. Apply Database Migrations

Open Supabase SQL Editor and run:

```sql
-- Add concern column
ALTER TABLE chat_sessions
ADD COLUMN IF NOT EXISTS concern TEXT;

-- Add updated_at column
ALTER TABLE chat_sessions
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create admin function
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

GRANT EXECUTE ON FUNCTION get_chat_sessions_for_admin(VARCHAR) TO authenticated;
```

### 2. Enable Realtime

In Supabase Dashboard:

1. Go to **Database** → **Replication**
2. Find `chat_sessions` → Toggle **ON**
3. Enable events: INSERT, UPDATE
4. Find `chat_messages` → Toggle **ON**
5. Enable events: INSERT, UPDATE
6. Wait 30 seconds

### 3. Add Admin User

Check if your admin exists:

```sql
SELECT * FROM peso WHERE email = 'your-admin-email@example.com';
```

If not, add them:

```sql
-- Get your auth user ID first
SELECT id, email FROM auth.users WHERE email = 'your-admin-email@example.com';

-- Then insert into peso table
INSERT INTO peso (auth_id, name, email)
VALUES ('your-auth-id-here', 'Admin Name', 'your-admin-email@example.com');
```

### 4. Add AdminChatWidget to Admin Layout

Edit `src/app/admin/layout.tsx`:

```tsx
import AdminChatWidget from "@/components/chat/AdminChatWidget";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      {children}
      <AdminChatWidget />
    </div>
  );
}
```

## Testing Scenarios

### Test 1: Chatbot (2 minutes)

**Force bot mode for testing:**

Edit `src/utils/chatbot.ts` line ~20:

```typescript
export function isAdminAvailable(): boolean {
  return false; // Force bot mode
}
```

**Test steps:**

1. Log in as a user (applicant)
2. Click the chat button (bottom-right)
3. Enter concern: "I need help"
4. Click Submit
5. ✅ Bot greeting should appear immediately
6. Type: "how to apply"
7. ✅ Bot should respond with application instructions
8. Type: "what are your office hours"
9. ✅ Bot should respond with hours

**Verify in database:**

```sql
SELECT * FROM chat_sessions ORDER BY created_at DESC LIMIT 1;
-- Status should be 'active'

SELECT * FROM chat_messages ORDER BY created_at DESC LIMIT 5;
-- Should see user + bot messages
```

### Test 2: Admin Chat (3 minutes)

**Restore normal availability:**

Edit `src/utils/chatbot.ts` back to:

```typescript
export function isAdminAvailable(): boolean {
  const now = new Date();
  const currentHour = now.getHours();
  const currentDay = now.getDay();

  const isBusinessDay = BUSINESS_HOURS.days.includes(currentDay);
  const isBusinessHour =
    currentHour >= BUSINESS_HOURS.start && currentHour < BUSINESS_HOURS.end;

  return isBusinessDay && isBusinessHour;
}
```

**If outside business hours, temporarily change hours to test:**

```typescript
const BUSINESS_HOURS = {
  start: 0,  // Midnight
  end: 23,   // 11 PM
  days: [0, 1, 2, 3, 4, 5, 6], // All days
};
```

**Test steps:**

1. Log in as user
2. Click chat button
3. Enter concern: "I need to speak with an admin"
4. ✅ Should see "Your request has been submitted" message
5. Log in as admin (different browser/incognito)
6. ✅ Chat button badge should show "1"
7. Click chat button
8. ✅ See request in "New" tab
9. Click the request
10. Click "Accept Chat"
11. ✅ Status changes to "Active" tab
12. Type a message: "Hello, how can I help?"
13. ✅ Message appears in admin panel

**Switch to user browser:**

14. ✅ Admin message should appear automatically (no refresh)
15. Reply: "Thanks for your help!"

**Switch to admin browser:**

16. ✅ User message should appear automatically

### Test 3: Real-time Updates (1 minute)

**Setup:**
- Browser A: User chat (logged in as applicant)
- Browser B: Admin panel (logged in as admin)

**Test:**

1. Browser A: Send "Test message 1"
2. Browser B: ✅ Should appear within 1-2 seconds
3. Browser B: Reply "Test response"
4. Browser A: ✅ Should appear within 1-2 seconds

### Test 4: Multiple Sessions (2 minutes)

1. Create 3 different user accounts
2. From each account, start a chat
3. ✅ Admin badge should show "3"
4. Accept one chat
5. ✅ Badge changes to "2" new
6. ✅ Active tab shows 1 chat
7. Accept another
8. ✅ Badge shows "1" new, Active shows 2

## Troubleshooting

### Bot not responding?

```bash
# Check browser console
# Should NOT see errors like:
# - "generateBotResponse is not defined"
# - "isAdminAvailable is not defined"

# If you see import errors:
# 1. Restart dev server
# 2. Clear .next cache: rm -rf .next
# 3. npm run dev
```

### Real-time not working?

```bash
# Check browser Network tab
# Look for WebSocket connection (wss://)
# Should see: wss://[project].supabase.co/realtime/v1/websocket

# If missing:
# 1. Verify Realtime enabled in Supabase
# 2. Check browser console for connection errors
# 3. Try hard refresh (Ctrl+Shift+R)
```

### Admin can't see emails?

```sql
-- Test the function directly in Supabase SQL Editor
SELECT * FROM get_chat_sessions_for_admin('pending');

-- If error "function does not exist":
-- Re-run the migration SQL from step 1

-- If error "Unauthorized":
-- Check admin exists in peso table
```

### Badge count stuck at 0?

```bash
# Test API endpoint
curl http://localhost:3000/api/admin/chat/requests?status=pending

# Expected: JSON array of requests
# If 401 Unauthorized: Not logged in as admin
# If 500 Error: Check server console logs
```

## Common Issues & Fixes

| Issue | Quick Fix |
|-------|-----------|
| Bot doesn't respond | Check `isAdminAvailable()` returns `false` |
| Messages don't appear | Enable Realtime in Supabase Dashboard |
| Can't accept chat | Verify admin exists in `peso` table |
| Badge shows 0 | Check `/api/admin/chat/requests` returns data |
| Panel won't open | Check browser console for React errors |

## Next Steps

Once testing is complete:

1. ✅ Restore `isAdminAvailable()` to use actual business hours
2. ✅ Customize bot responses in `src/utils/chatbot.ts`
3. ✅ Add more FAQ topics
4. ✅ Customize office hours
5. ✅ Test on mobile devices
6. ✅ Set up production environment variables

## Production Checklist

Before deploying:

- [ ] Database migrations applied
- [ ] Realtime enabled on production Supabase
- [ ] Admin users added to `peso` table
- [ ] `isAdminAvailable()` uses correct hours/timezone
- [ ] Environment variables set correctly
- [ ] RLS policies tested
- [ ] Mobile responsive tested
- [ ] Error logging configured

## Support

If you encounter issues:

1. Check `docs/CHATBOT_REALTIME_SETUP.md` for detailed troubleshooting
2. Review `docs/ADMIN_CHAT_INTEGRATION.md` for integration details
3. Verify all prerequisites are met
4. Check Supabase logs in Dashboard
5. Review browser console for errors

## Quick Commands

```bash
# Restart dev server
npm run dev

# Clear cache and restart
rm -rf .next && npm run dev

# Check Supabase connection
# (in browser console on your site)
console.log(window.localStorage.getItem('supabase.auth.token'));

# Test API endpoint
curl http://localhost:3000/api/chat/messages

# View database tables
# Go to Supabase Dashboard > Table Editor
```

---

**Total Setup Time: ~5 minutes**  
**Total Testing Time: ~8 minutes**  
**You're ready to go! 🚀**