# Chat Session Persistence and Navigation Guide

## Overview

The chat system now features persistent sessions that remain active for 2 minutes after the user closes the chat window, along with dynamic navigation that reflects the current session state.

---

## Features Implemented

### 1. Session Persistence (2-Minute Window)

When a user closes the chat widget:
- ✅ The chat session **remains active** for 2 minutes
- ✅ If reopened within 2 minutes, the **same session continues**
- ✅ Messages are preserved and visible when reopening
- ✅ No duplicate sessions are created

### 2. Session Expiry Warning

When 30 seconds remain before session expiration:
- ✅ A **warning badge (!)** appears on the "Active Chat" menu option
- ✅ An **orange warning banner** displays in the chat window
- ✅ Warning message: _"Your session will expire in 30 seconds due to inactivity"_
- ✅ Matches admin-side notification behavior

### 3. Automatic Session Timeout

After 2 minutes of user inactivity:
- ✅ Session **automatically closes**
- ✅ Bot message notifies: _"This chat has been closed due to inactivity"_
- ✅ Session moves to **Chat History**
- ✅ Navigation updates to show "Chat with Admin" again

### 4. Dynamic Navigation States

The chat menu navigation adapts based on session status:

#### State 1: No Active Chat
```
┌─────────────────────────────┐
│ FAQ                         │
│ Chat with Admin             │
└─────────────────────────────┘
```

#### State 2: Active Chat Session
```
┌─────────────────────────────┐
│ FAQ                         │
│ Active Chat            (!) │  ← Badge when expiring
└─────────────────────────────┘
```

#### State 3: After Chat Ends
```
┌─────────────────────────────┐
│ FAQ                         │
│ Chat with Admin             │
│ Chat History                │
└─────────────────────────────┘
```

---

## User Experience Flow

### Scenario 1: Normal Chat Session

1. User clicks "Chat with Admin"
2. User enters concern and starts chat
3. Session status: **"Waiting"** (pending admin acceptance)
4. Admin accepts chat
5. Session status: **"Connected"**
6. User and admin exchange messages
7. User closes chat widget → Session persists for 2 minutes
8. User reopens within 2 minutes → Same chat continues
9. User sends message → Session expiry timer resets to 2 minutes

### Scenario 2: Session Expiry

1. User has active chat
2. User closes widget or stops sending messages
3. After **1 minute 30 seconds**: Warning badge appears
4. After **2 minutes**: Session auto-closes
5. Bot message: "Chat closed due to inactivity"
6. Navigation updates: "Chat History" appears
7. User can view ended chat in history

### Scenario 3: Viewing Chat History

1. User clicks "Chat History"
2. List shows all past conversations
3. Each entry displays:
   - Concern/topic
   - Date (e.g., "Dec 15, 2024")
   - Status: "Closed"
   - Close time (e.g., "2:45 PM")
4. Clicking an entry opens read-only view of messages
5. Cannot send messages in closed chats

---

## Technical Implementation

### API Endpoints

#### `GET /api/chat/active-session`
- Returns user's active or pending chat session
- Checks for session timeout (2 minutes)
- Auto-closes expired sessions
- Returns `null` if no active session

**Response:**
```json
{
  "success": true,
  "session": {
    "id": "uuid",
    "status": "active",
    "concern": "User concern text",
    "last_user_message_at": "2024-01-15T13:40:00Z",
    "created_at": "2024-01-15T13:38:00Z"
  }
}
```

#### `GET /api/chat/history`
- Returns all closed chat sessions for the user
- Ordered by most recent first

**Response:**
```json
{
  "success": true,
  "sessions": [
    {
      "id": "uuid",
      "status": "closed",
      "concern": "Previous chat topic",
      "created_at": "2024-01-15T10:00:00Z",
      "closed_at": "2024-01-15T10:15:00Z"
    }
  ]
}
```

#### `GET /api/chat/messages?sessionId=<id>`
- Returns all messages for a specific session
- Works for both active and closed sessions

**Response:**
```json
{
  "success": true,
  "messages": [
    {
      "id": 1,
      "sender": "user",
      "message": "Hello",
      "created_at": "2024-01-15T13:40:00Z"
    }
  ]
}
```

### State Management

#### Key States

```typescript
const [hasActiveSession, setHasActiveSession] = useState(false);
const [hasChatHistory, setHasChatHistory] = useState(false);
const [sessionExpiryTime, setSessionExpiryTime] = useState<number | null>(null);
const [showExpiryWarning, setShowExpiryWarning] = useState(false);
const [chatHistory, setChatHistory] = useState<ChatSession[]>([]);
```

#### Expiry Timer Logic

```typescript
// Calculate expiry: 2 minutes from last user message
const expiryTime = lastMessageTime + (2 * 60 * 1000);

// Check every second
setInterval(() => {
  const timeRemaining = expiryTime - Date.now();
  
  // Show warning at 30 seconds
  if (timeRemaining <= 30000 && timeRemaining > 0) {
    setShowExpiryWarning(true);
  }
  
  // Auto-close at 0
  if (timeRemaining <= 0) {
    handleSessionExpired();
  }
}, 1000);
```

#### Reset Timer on Message Send

```typescript
const handleSendMessage = async () => {
  // Send message...
  
  // Reset expiry time to 2 minutes from now
  const newExpiryTime = Date.now() + (2 * 60 * 1000);
  setSessionExpiryTime(newExpiryTime);
  setShowExpiryWarning(false);
};
```

### Database Schema

The chat system uses these tables:

#### `chat_sessions`
```sql
- id: UUID (primary key)
- user_id: INTEGER (references applicants)
- status: VARCHAR ('pending', 'active', 'closed')
- concern: TEXT
- created_at: TIMESTAMPTZ
- updated_at: TIMESTAMPTZ
- closed_at: TIMESTAMPTZ
- admin_id: INTEGER (references peso)
- last_user_message_at: TIMESTAMPTZ  ← Used for timeout calculation
```

#### `chat_messages`
```sql
- id: SERIAL (primary key)
- chat_session_id: UUID (references chat_sessions)
- sender: VARCHAR ('user', 'admin', 'bot')
- message: TEXT
- created_at: TIMESTAMPTZ
- read_by_user: BOOLEAN
```

---

## UI Components

### Warning Badge

```css
.expiryBadge {
  position: absolute;
  top: -4px;
  right: -4px;
  width: 20px;
  height: 20px;
  background: #ff5722;
  color: white;
  border-radius: 50%;
  animation: pulseBadge 1.5s ease-in-out infinite;
}
```

**Visual:** Red circle with "!" that pulses

### Warning Banner

```css
.timeoutWarning {
  background: linear-gradient(135deg, #ff9800, #ff5722);
  color: white;
  padding: 0.75rem 1rem;
  animation: warningPulse 2s ease-in-out infinite;
}
```

**Visual:** Orange gradient bar with warning icon

### Chat History Item

```css
.historyItem {
  background: white;
  border-radius: 8px;
  padding: 1rem;
  border-left: 4px solid var(--accent);
  cursor: pointer;
}
```

**Visual:** Card with accent border, shows date and status

---

## Behavior Details

### Widget Close vs. Chat End

| Action | Widget Behavior | Session Behavior |
|--------|----------------|------------------|
| Click X button | Widget closes | Session persists 2 min |
| Click "End Chat" | Widget stays open | Session closes immediately |
| Auto-timeout | Widget open/closed | Session closes automatically |

### Session Reactivation

When reopening widget within 2 minutes:
1. `loadActiveSession()` called
2. Existing session detected
3. Mode set to `"live"`
4. Previous messages loaded
5. Expiry timer continues from last message time
6. If < 30s remaining, warning shows immediately

### Navigation Logic

```typescript
// Show "Chat with Admin" only when no active session
{user && !hasActiveSession && (
  <button onClick={() => setMode("concern")}>
    Chat with Admin
  </button>
)}

// Show "Active Chat" when session exists
{user && hasActiveSession && (
  <button onClick={() => setMode("live")}>
    Active Chat {showExpiryWarning && <Badge>!</Badge>}
  </button>
)}

// Show "Chat History" when closed sessions exist
{user && hasChatHistory && (
  <button onClick={() => setMode("history")}>
    Chat History
  </button>
)}
```

---

## Testing Checklist

### Session Persistence
- [ ] Close widget with active chat, reopen within 2 min → Same session continues
- [ ] Close widget with active chat, wait > 2 min → Session auto-closes
- [ ] Send message → Expiry timer resets to 2 minutes

### Expiry Warning
- [ ] At 1:30 remaining → Warning badge appears on menu
- [ ] At 1:30 remaining in chat → Orange banner appears
- [ ] Send message → Warning disappears
- [ ] Wait for expiry → Session closes, bot message sent

### Navigation States
- [ ] No active chat → Shows "FAQ" + "Chat with Admin"
- [ ] Active chat → Shows "FAQ" + "Active Chat"
- [ ] After chat ends → Shows "FAQ" + "Chat with Admin" + "Chat History"
- [ ] Click "Active Chat" → Opens live chat with messages
- [ ] Click "Chat History" → Shows list of past chats

### Chat History
- [ ] List shows all closed sessions
- [ ] Clicking entry loads messages (read-only)
- [ ] Cannot send messages in closed chat
- [ ] Date and time display correctly
- [ ] Status shows "Closed"

### Edge Cases
- [ ] Multiple reopens within 2 min → Same session
- [ ] Admin closes chat → User sees closure message
- [ ] Network error during close → Graceful handling
- [ ] Open widget after exactly 2:00 → Session closed
- [ ] Send message at 1:59 → Timer resets

---

## Configuration

### Timeout Duration

To change the 2-minute timeout:

**File:** `src/lib/db/services/chat.service.ts`
```typescript
// Line ~80
if (minutesSinceLastMessage > 2) {  // ← Change this value
  // Auto-close session
}
```

**File:** `src/components/chat/ChatWidget.tsx`
```typescript
// Session expiry calculation
const expiryTime = lastMessageTime + (2 * 60 * 1000);  // ← Change minutes here
```

### Warning Threshold

To change 30-second warning:

**File:** `src/components/chat/ChatWidget.tsx`
```typescript
// Line ~95
if (timeRemaining <= 30000 && timeRemaining > 0) {  // ← Change to 60000 for 1 min
  setShowExpiryWarning(true);
}
```

---

## Troubleshooting

### Issue: Session not persisting

**Check:**
1. Database has `last_user_message_at` column in `chat_sessions`
2. Column is type `TIMESTAMPTZ` (not `TIMESTAMP`)
3. API endpoint `/api/chat/active-session` is accessible
4. Browser console for errors

**Fix:**
```sql
ALTER TABLE chat_sessions
ADD COLUMN IF NOT EXISTS last_user_message_at TIMESTAMPTZ;
```

### Issue: Warning badge not showing

**Check:**
1. `showExpiryWarning` state is being set
2. CSS class `.expiryBadge` exists
3. Icon has `position: relative` parent

**Fix:**
```typescript
// Ensure interval is running
console.log('Time remaining:', sessionExpiryTime - Date.now());
```

### Issue: Chat history empty

**Check:**
1. User has closed chat sessions in database
2. API endpoint `/api/chat/history` returns data
3. Filter includes `status === 'closed'`

**Fix:**
```typescript
// Check database
SELECT * FROM chat_sessions WHERE user_id = ? AND status = 'closed';
```

### Issue: Timer not resetting

**Check:**
1. `handleSendMessage` updates `sessionExpiryTime`
2. Message API call succeeds
3. `last_user_message_at` updates in database

**Fix:**
```typescript
// Add logging
console.log('New expiry time:', newExpiryTime);
console.log('Current time:', Date.now());
```

---

## Future Enhancements

### Potential Features

1. **Adjustable Timeout**
   - Admin can set timeout per session
   - Different timeouts for different chat types

2. **Session Recovery**
   - Button to "Resume Chat" from history
   - Reopens closed session with admin approval

3. **Typing Indicator During Timeout**
   - If user types, extend timeout
   - Don't require sending message

4. **Desktop Notifications**
   - Notify user when session about to expire
   - Notify when admin responds

5. **Session Analytics**
   - Track average session duration
   - Monitor timeout rates
   - Identify peak chat times

---

## Related Files

### Core Components
- `src/components/chat/ChatWidget.tsx` - Main chat widget
- `src/components/chat/ChatWidget.module.css` - Styling
- `src/components/chat/AdminChatPanel.tsx` - Admin interface

### API Routes
- `src/app/api/chat/active-session/route.ts` - Get active session
- `src/app/api/chat/history/route.ts` - Get chat history
- `src/app/api/chat/messages/route.ts` - Get/send messages
- `src/app/api/chat/close/route.ts` - Close session

### Services
- `src/lib/db/services/chat.service.ts` - User chat logic
- `src/lib/db/services/admin-chat.service.ts` - Admin chat logic

### Documentation
- `CHAT_TIMESTAMP_FIX_GUIDE.md` - Timezone fixes
- `src/components/chat/README.md` - General chat docs

---

## Support

For questions or issues:
1. Check browser console for errors
2. Verify database schema is up to date
3. Run timezone migration if needed
4. Check Supabase real-time subscriptions are active

**Key Principle:** Sessions persist on the server, not the client. Closing the widget only hides the UI.