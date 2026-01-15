# Chat Session Timeout Feature Guide

## Overview

This guide documents the chat session timeout feature that automatically closes inactive chat sessions after 2 minutes of user inactivity.

## How It Works

### User Side (ChatWidget.tsx)

1. **Session Tracking**: When a user sends a message or starts a chat, the `last_user_message_at` timestamp is updated in the database.

2. **Expiry Timer**: The widget calculates when the session will expire (2 minutes after the last user message) and stores this in `sessionExpiryTime` state.

3. **Warning System**: 
   - When 30 seconds remain before timeout, a warning badge appears on the "Active Chat" menu button
   - A warning banner displays in the chat window
   - User is prompted to send a message to keep the session active

4. **Auto-Close on Client**: 
   - Every second, the widget checks if the session has expired
   - When time runs out, the session is closed locally and a timeout message is displayed
   - Real-time subscriptions are cleaned up
   - Chat history is reloaded to include the closed session

5. **State Management**:
   - When a chat closes (by timeout, user, or admin), `hasActiveSession` is set to `false`
   - This ensures the menu shows "Chat with Admin" instead of "Active Chat"
   - The closed chat message persists until the user clicks "Back to Menu"

### Server Side (Cron Job)

1. **Automatic Cleanup**: A cron job runs every minute at `/api/cron/check-chat-timeouts`

2. **Detection**: The cron job queries for all `pending` or `active` sessions where `last_user_message_at` is older than 2 minutes

3. **Closure Process**:
   - Updates session status to `closed`
   - Sets `closed_at` timestamp
   - Inserts a bot message notifying about inactivity closure

4. **Real-time Updates**: When a session is closed server-side:
   - Supabase broadcasts the status change via real-time subscription
   - Admin panel receives the update
   - User widget receives the update and shows "Chat has been closed" message

## Files Modified/Created

### User Widget
- **`src/components/chat/ChatWidget.tsx`**: Enhanced with timeout logic, warning system, and proper state cleanup
- **`src/components/chat/ChatWidget.module.css`**: Added styles for warning badge, banner, and back-to-menu button

### API Routes
- **`src/app/api/chat/check-timeouts/route.ts`**: Manual timeout check endpoint (can be called directly)
- **`src/app/api/cron/check-chat-timeouts/route.ts`**: Cron job endpoint for automatic timeout checks

### Configuration
- **`vercel.json`**: Added cron job configuration to run timeout check every minute

## Database Schema Requirements

The `chat_sessions` table must have:
```sql
- id (uuid, primary key)
- user_id (integer, foreign key to applicants)
- admin_id (integer, nullable, foreign key to peso)
- status (text: 'pending', 'active', or 'closed')
- concern (text, nullable)
- created_at (timestamptz)
- closed_at (timestamptz, nullable)
- last_user_message_at (timestamptz, nullable) -- Critical for timeout detection
```

## User Flow

### Normal Chat Flow
1. User clicks "Chat with Admin" → Creates session, sets `last_user_message_at`
2. User sends messages → Updates `last_user_message_at` each time
3. Admin responds → Session stays active
4. User or admin clicks "End Chat" → Session closes

### Timeout Flow (Widget Closed)
1. User closes widget → Session persists (not ended)
2. User doesn't reopen within 2 minutes → Cron job closes session
3. User reopens widget → Sees session is closed in history

### Timeout Flow (Widget Open)
1. User stops sending messages for 90 seconds → Warning badge appears
2. User still doesn't send message for 30 more seconds → Session auto-closes
3. Widget shows "Chat has ended" message
4. User clicks "Back to Menu" → Returns to main menu
5. Menu now shows "Chat with Admin" (not "Active Chat")

### Admin Flow
1. Admin sees active chats in "Active" tab
2. If user is inactive for 2 minutes → Session auto-closes (cron job)
3. Real-time update moves session to "Closed" tab
4. Admin sees the session disappear from active list

## Testing

### Manual Testing

1. **Test User-Side Timeout**:
   ```
   - Start a chat as a user
   - Send a message
   - Wait 90 seconds → Warning should appear
   - Wait 30 more seconds → Chat should close with timeout message
   - Click "Back to Menu" → Should show "Chat with Admin" button
   ```

2. **Test Admin-Side Timeout**:
   ```
   - Start a chat as a user
   - Admin accepts the chat
   - User stops responding for 2+ minutes
   - Check admin panel → Session should move to "Closed" tab
   ```

3. **Test Cron Job Manually**:
   ```bash
   # Call the cron endpoint directly
   curl http://localhost:3000/api/cron/check-chat-timeouts
   
   # Or with authentication (if CRON_SECRET is set)
   curl -H "Authorization: Bearer YOUR_CRON_SECRET" \
        http://localhost:3000/api/cron/check-chat-timeouts
   ```

4. **Test Warning System**:
   ```
   - Start a chat
   - Send a message
   - Wait 90 seconds
   - Verify warning badge appears on menu button
   - Verify warning banner appears in chat
   - Send another message → Warning should disappear
   ```

### Database Verification

```sql
-- Check for sessions that should be timed out
SELECT id, status, last_user_message_at,
       NOW() - last_user_message_at as inactive_duration
FROM chat_sessions
WHERE status IN ('pending', 'active')
  AND last_user_message_at IS NOT NULL
  AND last_user_message_at < NOW() - INTERVAL '2 minutes';

-- View recently closed sessions
SELECT id, status, closed_at, concern
FROM chat_sessions
WHERE status = 'closed'
  AND closed_at > NOW() - INTERVAL '10 minutes'
ORDER BY closed_at DESC;
```

## Deployment

### Vercel Deployment

The cron job is automatically configured in `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/cron/check-chat-timeouts",
      "schedule": "* * * * *"
    }
  ]
}
```

**Note**: Vercel cron jobs are only available on Pro plans. For free plans, use external cron services.

### External Cron Services (Free Alternative)

If using Vercel's free tier, set up an external cron service:

1. **cron-job.org**:
   - Create free account
   - Add new cron job
   - URL: `https://your-domain.vercel.app/api/cron/check-chat-timeouts`
   - Schedule: `* * * * *` (every minute)
   - Add header: `Authorization: Bearer YOUR_CRON_SECRET`

2. **EasyCron.com**:
   - Similar setup to cron-job.org
   - Free tier allows 1-minute intervals

3. **GitHub Actions** (Alternative):
   ```yaml
   name: Chat Timeout Check
   on:
     schedule:
       - cron: '* * * * *'  # Every minute
   jobs:
     timeout-check:
       runs-on: ubuntu-latest
       steps:
         - name: Trigger timeout check
           run: |
             curl -X POST \
               -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}" \
               https://your-domain.vercel.app/api/cron/check-chat-timeouts
   ```

## Environment Variables

Add to your `.env.local` and Vercel environment variables:

```env
# Optional: Secret token for cron job authentication
CRON_SECRET=your-secret-token-here
```

## Troubleshooting

### Sessions Not Timing Out

1. **Check cron job is running**:
   - View Vercel deployment logs
   - Look for `[Cron] Starting chat timeout check...` messages

2. **Verify last_user_message_at is updating**:
   ```sql
   SELECT id, last_user_message_at FROM chat_sessions WHERE status = 'active';
   ```

3. **Manually trigger timeout check**:
   ```bash
   curl http://localhost:3000/api/cron/check-chat-timeouts
   ```

### Warning Not Appearing

1. Check browser console for errors
2. Verify `sessionExpiryTime` state is being set correctly
3. Check that interval is running (look for console logs)

### Admin Not Seeing Updates

1. Verify Supabase real-time is enabled for `chat_sessions` table
2. Check real-time subscription in admin panel is active
3. Verify admin is calling `onRefresh()` after receiving updates

### Database Timezone Issues

If timeout calculations are off:

1. Ensure `last_user_message_at` column is `TIMESTAMPTZ` (not `TIMESTAMP`)
2. Verify server is using UTC for all timestamp comparisons
3. Check migration: `migrations/fix_chat_timestamps_timezone.sql`

## Performance Considerations

- **Cron frequency**: Running every minute is reasonable for ~100-1000 active sessions
- **Query optimization**: The timeout query uses an index on `status` and `last_user_message_at`
- **Real-time load**: Each closed session triggers one real-time update

### Recommended Indexes

```sql
-- Optimize timeout queries
CREATE INDEX idx_chat_sessions_timeout 
ON chat_sessions(status, last_user_message_at) 
WHERE status IN ('pending', 'active');
```

## Future Enhancements

- [ ] Configurable timeout duration (per user preference)
- [ ] Warning at multiple intervals (2 minutes, 1 minute, 30 seconds)
- [ ] "Are you still there?" prompt to extend session
- [ ] Session activity tracking (typing, viewing chat)
- [ ] Admin-side timeout warnings
- [ ] Timeout statistics and analytics

## Support

For issues or questions:
1. Check Vercel deployment logs
2. Check Supabase logs for database errors
3. Review browser console for client-side errors
4. Verify cron job is running (check external service logs if using one)