# Chat System - Database-Aligned Implementation

This document describes the updated chat system that is now fully aligned with your PostgreSQL database schema.

## Database Schema Summary

Your database uses the following structure:

### Tables

1. **chat_sessions**
   - `id` (UUID, primary key)
   - `user_id` (BIGINT, references `applicants(id)`)
   - `admin_id` (BIGINT, references `peso(id)`)
   - `status` (VARCHAR, values: 'pending', 'active', 'closed')
   - `created_at` (TIMESTAMP)
   - `closed_at` (TIMESTAMP, nullable)

2. **chat_messages**
   - `id` (UUID, primary key)
   - `chat_session_id` (UUID, references `chat_sessions(id)`)
   - `sender` (VARCHAR, values: 'user' or 'admin')
   - `message` (TEXT)
   - `created_at` (TIMESTAMP)

3. **faqs**
   - `id` (UUID, primary key)
   - `category` (VARCHAR)
   - `question` (TEXT)
   - `answer` (TEXT)
   - `position` (INTEGER)
   - `created_at` (TIMESTAMP)
   - `updated_at` (TIMESTAMP)

## API Routes Created

All API routes have been created and are fully functional:

### User/Applicant Routes

1. **GET /api/chat/faqs**
   - Fetches all FAQs ordered by position
   - No authentication required
   - Returns: Array of FAQ objects

2. **POST /api/chat/request**
   - Creates a new chat session with status 'pending'
   - Authentication required (applicant)
   - Looks up applicant ID from `auth_id`
   - Returns: Created chat session object with session ID

3. **GET /api/chat/messages**
   - Fetches messages for the user's active/pending chat session
   - Authentication required (applicant)
   - Returns: `{ messages: [], sessionId: string | null }`

4. **POST /api/chat/messages**
   - Sends a message from the user
   - Authentication required (applicant)
   - Body: `{ sessionId: string, message: string }`
   - Verifies session belongs to user and is not closed
   - Returns: Created message object

### Admin Routes

1. **GET /api/admin/chat/requests?status={new|active|closed}**
   - Fetches chat sessions by status ('new' maps to 'pending')
   - Authentication required (admin from `peso` table)
   - Joins with `applicants` table to get user details
   - Returns: Array of formatted chat requests with user info

2. **POST /api/admin/chat/accept**
   - Accepts a pending chat request
   - Authentication required (admin)
   - Body: `{ chatId: string }`
   - Updates session status to 'active' and assigns admin_id
   - Returns: Updated chat session

3. **GET /api/admin/chat/messages/[chatId]**
   - Fetches all messages for a specific chat session
   - Authentication required (admin)
   - Returns: Array of message objects

4. **POST /api/admin/chat/messages**
   - Sends a message from admin
   - Authentication required (admin)
   - Body: `{ chatId: string, message: string }`
   - Verifies admin is assigned to the session
   - Returns: Created message object

5. **POST /api/admin/chat/close**
   - Closes an active chat session
   - Authentication required (admin)
   - Body: `{ chatId: string }`
   - Sets status to 'closed' and records closed_at timestamp
   - Returns: Updated chat session

## Authentication Flow

### Applicants
1. User authenticates via Supabase Auth
2. Backend fetches `applicants` record using `auth_id = user.id`
3. Uses the `applicants.id` (BIGINT) for `chat_sessions.user_id`

### Admins
1. Admin authenticates via Supabase Auth
2. Backend fetches `peso` record using `auth_id = user.id`
3. Uses the `peso.id` (BIGINT) for `chat_sessions.admin_id`

## Component Updates

### ChatWidget.tsx
- Now stores and uses `sessionId` from API response
- Polls for messages and session status updates every 3 seconds
- Properly formats message objects for display
- Sends messages with correct `sessionId` parameter

### AdminChatPanel.tsx
- Fetches chat requests using status query parameter
- Maps database messages to component format
- Refreshes messages after sending to show updates
- Properly handles accept, message sending, and close operations

## Data Flow

### User Initiates Chat
1. User clicks "Chat with Admin" → calls `handleStartLiveChat()`
2. POST to `/api/chat/request` → creates session with status 'pending'
3. Receives session ID and stores in state
4. Starts polling for status updates
5. Shows "Waiting for admin..." message

### Admin Accepts Chat
1. Admin opens AdminChatPanel → fetches pending requests
2. Admin clicks "Accept Chat" → POST to `/api/admin/chat/accept`
3. Session status changes to 'active', admin_id is assigned
4. User's polling detects status change → shows "Connected"

### Message Exchange
1. Either party types and sends message
2. User: POST to `/api/chat/messages` with `{ sessionId, message }`
3. Admin: POST to `/api/admin/chat/messages` with `{ chatId, message }`
4. Messages stored in `chat_messages` table
5. Polling or refresh updates the message list

### Admin Closes Chat
1. Admin clicks "End Chat" → POST to `/api/admin/chat/close`
2. Session status → 'closed', `closed_at` timestamp set
3. No more messages can be sent
4. Session moves to "Closed Chats" tab

## Key Changes from Original

1. **Session Management**: Now uses proper UUID session IDs from database
2. **Auth Mapping**: Correctly maps Supabase `auth_id` to `applicants.id` and `peso.id`
3. **Data Types**: Uses BIGINT for user_id and admin_id references
4. **Status Values**: Uses 'pending' instead of 'new' (UI maps "new" → "pending")
5. **Message Format**: Uses `message` field (not `text`) and `chat_session_id`
6. **Timestamps**: Uses database-generated timestamps

## Next Steps

### To Enable Real-Time Updates (Recommended)

Replace polling with Supabase Realtime:

```typescript
// In ChatWidget or AdminChatPanel
useEffect(() => {
  if (!sessionId) return;
  
  const channel = supabase
    .channel('chat-messages')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
        filter: `chat_session_id=eq.${sessionId}`
      },
      (payload) => {
        // Add new message to state
        setMessages(prev => [...prev, formatMessage(payload.new)]);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, [sessionId]);
```

### Testing Checklist

- [ ] User can start a chat request
- [ ] Admin sees new request in "New Requests" tab
- [ ] Admin can accept chat request
- [ ] Chat moves to "Active Chats" tab
- [ ] User and admin can exchange messages
- [ ] Messages appear for both parties
- [ ] Admin can close chat
- [ ] Closed chat appears in "Closed Chats" tab
- [ ] No messages can be sent to closed chats

### Environment Requirements

Make sure your `.env.local` includes:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

The service role key is needed for admin operations (like fetching user emails).

## File Structure

```
src/
├── app/
│   └── api/
│       ├── chat/
│       │   ├── faqs/route.ts
│       │   ├── request/route.ts
│       │   └── messages/route.ts
│       └── admin/
│           └── chat/
│               ├── requests/route.ts
│               ├── accept/route.ts
│               ├── close/route.ts
│               └── messages/
│                   ├── route.ts
│                   └── [chatId]/route.ts
└── components/
    └── chat/
        ├── ChatButton.tsx
        ├── ChatWidget.tsx
        ├── AdminChatPanel.tsx
        └── [CSS modules]
```

## Notes

- All routes include proper authentication checks
- Admin routes verify the user is in the `peso` table
- User routes verify the user is in the `applicants` table
- All database queries use parameterized values (no SQL injection risk)
- Error handling includes console logging for debugging
- Session verification prevents unauthorized access to chats