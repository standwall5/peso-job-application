# Real-Time Chat System Documentation

## Overview

The PESO Job Application platform features a real-time chat system that allows applicants to communicate with administrators. The system uses Supabase Realtime for instant message delivery and supports the following features:

- **User Concern Submission**: Users describe their issue before creating a chat request
- **Real-time Messaging**: Instant message delivery using Supabase Realtime subscriptions
- **Admin Management**: Administrators can accept, manage, and close chat sessions
- **FAQ Support**: Self-service FAQ system for common questions
- **Status Tracking**: Live updates on chat request status (pending, active, closed)

## Architecture

### Components

1. **ChatWidget** (`src/components/chat/ChatWidget.tsx`)
   - User-facing chat interface
   - Modes: Menu, FAQ, Concern Input, Live Chat
   - Real-time message subscriptions
   - Session status monitoring

2. **AdminChatPanel** (`src/components/chat/AdminChatPanel.tsx`)
   - Administrator chat management interface
   - Real-time request and message subscriptions
   - Multi-chat support with tabs (New, Active, Closed)
   - Displays user concerns

### API Routes

#### User Routes
- `POST /api/chat/request` - Create new chat request with concern
- `GET /api/chat/messages` - Fetch messages for user's active session
- `POST /api/chat/messages` - Send message from user
- `GET /api/chat/faqs` - Fetch FAQ entries

#### Admin Routes
- `GET /api/admin/chat/requests?status={pending|active|closed}` - Fetch chat requests
- `POST /api/admin/chat/accept` - Accept a pending chat request
- `POST /api/admin/chat/close` - Close an active chat session
- `GET /api/admin/chat/messages/[chatId]` - Fetch messages for specific chat
- `POST /api/admin/chat/messages` - Send message as admin

### Database Schema

#### chat_sessions Table
```sql
- id (uuid, primary key)
- user_id (int, references applicants.id)
- admin_id (int, references peso.id, nullable)
- status (text) - 'pending', 'active', 'closed'
- concern (text) - User's initial concern/question
- created_at (timestamp)
- closed_at (timestamp, nullable)
```

#### chat_messages Table
```sql
- id (uuid, primary key)
- chat_session_id (uuid, references chat_sessions.id)
- sender (text) - 'user' or 'admin'
- message (text)
- created_at (timestamp)
```

## User Flow

### 1. Starting a Chat

```
User opens ChatWidget
  ↓
Clicks "Chat with Admin"
  ↓
Enters concern/question in textarea
  ↓
Clicks "Send Request to Admin"
  ↓
System creates chat_sessions record with concern
  ↓
System creates initial chat_messages record
  ↓
User sees "waiting for admin" status
  ↓
Real-time subscription monitors session status
```

### 2. Admin Accepting Chat

```
Admin opens AdminChatPanel
  ↓
Real-time subscription receives new chat_sessions INSERT
  ↓
Admin sees request in "New Requests" tab with user concern
  ↓
Admin clicks "Accept Chat"
  ↓
System updates chat_sessions.status to 'active'
  ↓
Both user and admin receive real-time status update
  ↓
Chat input becomes enabled for messaging
```

### 3. Real-time Messaging

```
User/Admin types message and sends
  ↓
Message sent via POST to /api/chat/messages or /api/admin/chat/messages
  ↓
System inserts into chat_messages table
  ↓
Supabase triggers real-time INSERT event
  ↓
Both user and admin receive message via subscription
  ↓
Message appears instantly in chat UI
```

### 4. Closing Chat

```
Admin clicks "End Chat"
  ↓
System updates chat_sessions.status to 'closed'
  ↓
System sets chat_sessions.closed_at timestamp
  ↓
Real-time subscription notifies user
  ↓
User sees "Chat closed" message
  ↓
Chat moves to "Closed Chats" tab for admin
```

## Real-time Implementation

### Supabase Realtime Channels

The system uses Supabase Realtime PostgreSQL Change Data Capture (CDC) to listen for database changes:

#### User Subscriptions (ChatWidget)

```typescript
// Subscribe to messages for active chat
supabase
  .channel(`chat_messages:${sessionId}`)
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'chat_messages',
    filter: `chat_session_id=eq.${sessionId}`
  }, handleNewMessage)
  .on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public',
    table: 'chat_sessions',
    filter: `id=eq.${sessionId}`
  }, handleSessionUpdate)
  .subscribe()
```

#### Admin Subscriptions (AdminChatPanel)

```typescript
// Subscribe to new chat requests
supabase
  .channel('chat_sessions_admin')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'chat_sessions'
  }, handleNewRequest)
  .on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public',
    table: 'chat_sessions'
  }, handleRequestUpdate)
  .subscribe()

// Subscribe to messages for specific chat
supabase
  .channel(`chat_messages_admin:${chatId}`)
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'chat_messages',
    filter: `chat_session_id=eq.${chatId}`
  }, handleNewMessage)
  .subscribe()
```

## Setup Instructions

### 1. Database Migration

Run the migration to add the `concern` column:

```bash
# If using Supabase CLI
supabase db push

# Or run the SQL directly in Supabase Dashboard
# Navigate to SQL Editor and execute:
# supabase/migrations/add_concern_to_chat_sessions.sql
```

### 2. Enable Realtime

In Supabase Dashboard:
1. Navigate to Database → Replication
2. Enable replication for `chat_sessions` table
3. Enable replication for `chat_messages` table
4. Ensure the following events are enabled:
   - INSERT
   - UPDATE

### 3. Row Level Security (RLS)

Ensure proper RLS policies are in place:

```sql
-- Users can only read their own chat sessions
CREATE POLICY "Users can view own chat sessions"
ON chat_sessions FOR SELECT
USING (user_id IN (
  SELECT id FROM applicants WHERE auth_id = auth.uid()
));

-- Users can only insert their own chat sessions
CREATE POLICY "Users can create chat sessions"
ON chat_sessions FOR INSERT
WITH CHECK (user_id IN (
  SELECT id FROM applicants WHERE auth_id = auth.uid()
));

-- Users can view messages from their sessions
CREATE POLICY "Users can view own chat messages"
ON chat_messages FOR SELECT
USING (chat_session_id IN (
  SELECT id FROM chat_sessions WHERE user_id IN (
    SELECT id FROM applicants WHERE auth_id = auth.uid()
  )
));

-- Users can insert messages to their sessions
CREATE POLICY "Users can send messages"
ON chat_messages FOR INSERT
WITH CHECK (chat_session_id IN (
  SELECT id FROM chat_sessions WHERE user_id IN (
    SELECT id FROM applicants WHERE auth_id = auth.uid()
  ) AND status = 'active'
));

-- Admins can view all chat sessions
CREATE POLICY "Admins can view all chat sessions"
ON chat_sessions FOR SELECT
USING (EXISTS (
  SELECT 1 FROM peso WHERE auth_id = auth.uid()
));

-- Admins can update chat sessions
CREATE POLICY "Admins can update chat sessions"
ON chat_sessions FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM peso WHERE auth_id = auth.uid()
));

-- Admins can view all messages
CREATE POLICY "Admins can view all messages"
ON chat_messages FOR SELECT
USING (EXISTS (
  SELECT 1 FROM peso WHERE auth_id = auth.uid()
));

-- Admins can send messages
CREATE POLICY "Admins can send messages"
ON chat_messages FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM peso WHERE auth_id = auth.uid()
));
```

### 4. Environment Variables

Ensure the following are set in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Testing the System

### User Side Testing

1. Log in as an applicant
2. Click the chat widget button (usually in bottom-right corner)
3. Select "Chat with Admin"
4. Enter a concern: "I need help with my application status"
5. Click "Send Request to Admin"
6. Verify you see "waiting" status
7. Keep the page open

### Admin Side Testing

1. Log in as an admin in a separate browser/window
2. Open the admin chat panel
3. Verify the new request appears in "New Requests" tab
4. Verify you can see the user's concern
5. Click "Accept Chat"
6. Verify status changes to "Connected" on user side
7. Send messages from both sides
8. Verify messages appear instantly (no page refresh needed)
9. Click "End Chat" as admin
10. Verify chat moves to "Closed" tab
11. Verify user sees "Chat closed" message

## Troubleshooting

### Messages Not Appearing in Real-time

1. Check browser console for Supabase subscription errors
2. Verify Realtime is enabled for both tables in Supabase Dashboard
3. Check that RLS policies allow reading from the tables
4. Ensure WebSocket connection is not blocked by firewall/proxy

### Chat Request Not Creating

1. Check browser console for API errors
2. Verify `concern` field is not empty
3. Check applicant is authenticated
4. Verify applicant record exists and links to auth.uid()

### Admin Cannot See Requests

1. Verify admin is authenticated
2. Check admin record exists in `peso` table with correct `auth_id`
3. Verify RLS policies allow admin to SELECT from `chat_sessions`
4. Check `/api/admin/chat/requests` endpoint response

### Subscription Cleanup

The components properly clean up subscriptions on unmount:

```typescript
useEffect(() => {
  // Setup subscription
  return () => {
    if (subscriptionRef.current) {
      supabase.removeChannel(subscriptionRef.current);
    }
  };
}, [dependencies]);
```

## Performance Considerations

1. **Subscription Limits**: Supabase has limits on concurrent realtime connections per project
2. **Message History**: Consider implementing pagination for chat history
3. **Cleanup**: Always remove channel subscriptions when components unmount
4. **Debouncing**: Consider debouncing typing indicators if implemented

## Future Enhancements

- [ ] Typing indicators ("Admin is typing...")
- [ ] File/image sharing in chat
- [ ] Chat history export for admins
- [ ] Automated responses for common questions
- [ ] Chat assignment to specific admins
- [ ] Notification sounds for new messages
- [ ] Unread message counts
- [ ] Search chat history
- [ ] Chat ratings/feedback
- [ ] Multi-language support

## Security Best Practices

1. Always validate user authentication before creating chat sessions
2. Use RLS policies to restrict data access
3. Sanitize message content to prevent XSS attacks
4. Rate limit chat requests to prevent spam
5. Monitor for abusive behavior
6. Implement message length limits
7. Use HTTPS for all API calls

## Support

For issues or questions about the chat system:
1. Check this documentation
2. Review Supabase Realtime documentation: https://supabase.com/docs/guides/realtime
3. Check application logs for errors
4. Contact the development team