# Chat Enhancement Implementation Guide

## Overview
This guide documents the enhancements made to the user chat system, including notifications, persistence, timeout warnings, and service-based architecture.

## ✅ Completed Changes

### 1. Backup Files Created
- `src/components/chat/ChatWidget.tsx.backup`
- `src/components/chat/ChatButton.tsx.backup`
- `src/lib/db/services/chat.service.ts.backup`
- `src/app/(user)/layout.tsx.backup`

### 2. Enhanced Chat Service (`src/lib/db/services/chat.service.ts`)

**New Features:**
- `getActiveChatSession()` - Retrieves user's active chat (enables persistence)
- `getUnreadMessageCount()` - Counts unread admin messages
- `markMessagesAsRead()` - Marks messages as read when user opens chat
- Auto-timeout check (closes chat after 2 minutes of inactivity)
- GMT+8 timestamp conversion
- `last_user_message_at` tracking for timeout monitoring

**Key Changes:**
- Session ID changed from `number` to `string` (UUID)
- Added `read_by_user` field to ChatMessage interface
- Added timeout logic in `getActiveChatSession()`
- Updated all methods to use server actions pattern

### 3. User Chat Actions (`src/app/(user)/actions/chat.actions.ts`)

**New Actions:**
- `getActiveChatSessionAction()` - Load persistent session
- `getUnreadMessageCountAction()` - Get notification count
- `markMessagesAsReadAction()` - Mark messages read
- `createChatRequestAction()` - Create new chat
- `getChatMessagesAction()` - Load messages
- `sendChatMessageAction()` - Send message
- `closeChatSessionAction()` - Close session
- `getChatFAQsAction()` - Load FAQs

All actions use the service layer instead of direct API calls.

### 4. Enhanced Chat Button (`src/components/chat/ChatButton.tsx`)

**New Features:**
- Real-time unread message count display
- Supabase real-time subscription for new messages
- Polling every 10 seconds as fallback
- Shows bullet (•) when there's an active session but no unread messages
- Badge updates automatically when messages are read

### 5. CSS Enhancements (`src/components/chat/ChatWidget.module.css`)

**New Styles Added:**
```css
.timeoutWarning - Orange warning banner with pulse animation
.sessionNotification - Blue info banner for restored sessions
@keyframes warningPulse - Subtle pulsing effect
@keyframes warningShake - Icon shake animation
```

## 🚧 Remaining Work: ChatWidget Enhancement

The main ChatWidget file needs comprehensive updates. Here's what needs to be changed:

### Required ChatWidget Changes

#### A. New State Variables to Add
```typescript
const [showTimeoutWarning, setShowTimeoutWarning] = useState(false);
const [lastUserMessageTime, setLastUserMessageTime] = useState<Date | null>(null);
const [showRestoredNotification, setShowRestoredNotification] = useState(false);

const timeoutWarningTimerRef = useRef<NodeJS.Timeout | null>(null);
const autoCloseTimerRef = useRef<NodeJS.Timeout | null>(null);
```

#### B. New Imports to Add
```typescript
import {
  getActiveChatSessionAction,
  markMessagesAsReadAction,
  createChatRequestAction,
  getChatMessagesAction,
  sendChatMessageAction,
  closeChatSessionAction,
  getChatFAQsAction,
} from "@/app/(user)/actions/chat.actions";
```

#### C. New Effects to Add

**1. Load Active Session on Mount (Persistence)**
```typescript
useEffect(() => {
  if (isOpen && user) {
    loadActiveSession();
  }
}, [isOpen, user]);
```

**2. Timeout Monitoring**
```typescript
useEffect(() => {
  if (mode === "live" && chatStatus === "connected" && lastUserMessageTime && sessionId) {
    // Clear existing timers
    if (timeoutWarningTimerRef.current) clearTimeout(timeoutWarningTimerRef.current);
    if (autoCloseTimerRef.current) clearTimeout(autoCloseTimerRef.current);

    // Show warning after 90 seconds (1.5 minutes)
    timeoutWarningTimerRef.current = setTimeout(() => {
      setShowTimeoutWarning(true);
    }, 90000);

    // Auto-close after 120 seconds (2 minutes)
    autoCloseTimerRef.current = setTimeout(async () => {
      console.log("[ChatWidget] Chat timed out due to inactivity");
      await closeChatSessionAction(sessionId);
      setChatStatus("closed");
      setMessages((prev) => [...prev, {
        id: "system-timeout",
        text: "Chat has been closed due to inactivity (2 minutes without response).",
        sender: "bot",
        timestamp: new Date(),
      }]);
    }, 120000);

    return () => {
      if (timeoutWarningTimerRef.current) clearTimeout(timeoutWarningTimerRef.current);
      if (autoCloseTimerRef.current) clearTimeout(autoCloseTimerRef.current);
    };
  }
}, [mode, chatStatus, lastUserMessageTime, sessionId]);
```

#### D. New Functions to Add

**1. loadActiveSession**
```typescript
const loadActiveSession = async () => {
  try {
    const activeSession = await getActiveChatSessionAction();
    if (activeSession) {
      setSessionId(activeSession.id);
      setMode("live");
      setShowRestoredNotification(true);
      setTimeout(() => setShowRestoredNotification(false), 5000);
      
      if (activeSession.status === "pending") setChatStatus("waiting");
      else if (activeSession.status === "active") setChatStatus("connected");
      else setChatStatus("closed");
      
      await loadMessages(activeSession.id);
      await markMessagesAsReadAction(activeSession.id);
      
      if (activeSession.last_user_message_at) {
        setLastUserMessageTime(new Date(activeSession.last_user_message_at));
      }
    }
  } catch (error) {
    console.error("[ChatWidget] Error loading active session:", error);
  }
};
```

**2. loadMessages**
```typescript
const loadMessages = async (chatId: string) => {
  try {
    const messagesData = await getChatMessagesAction(chatId);
    const parsedMessages: Message[] = messagesData.map((msg) => {
      const parsed = parseMessage(msg.message);
      return {
        id: msg.id.toString(),
        text: parsed.text,
        sender: msg.sender as "user" | "admin" | "bot",
        timestamp: new Date(msg.created_at),
        buttons: parsed.buttons,
      };
    });
    setMessages(parsedMessages);
  } catch (error) {
    console.error("[ChatWidget] Error loading messages:", error);
  }
};
```

#### E. Functions to Modify

**1. handleCloseChat** - Change to NOT close session (persistence)
```typescript
const handleCloseChat = async () => {
  console.log("[ChatWidget] handleCloseChat called");
  // Don't close the session, just hide the widget for persistence
  onClose();
};
```

**2. handleEndChat** - Add timer cleanup
```typescript
const handleEndChat = async () => {
  if (!sessionId) return;
  
  try {
    await closeChatSessionAction(sessionId);
    setChatStatus("closed");
    setMessages((prev) => [...prev, {
      id: "system-closed",
      text: "Chat has been ended. Thank you for contacting PESO!",
      sender: "bot",
      timestamp: new Date(),
    }]);
    
    // Clear timers
    if (timeoutWarningTimerRef.current) clearTimeout(timeoutWarningTimerRef.current);
    if (autoCloseTimerRef.current) clearTimeout(autoCloseTimerRef.current);
    setShowTimeoutWarning(false);
  } catch (error) {
    console.error("[ChatWidget] Error ending chat:", error);
  }
};
```

**3. handleSendMessage** - Add optimistic updates and reset timeout
```typescript
const handleSendMessage = async () => {
  if (!inputValue.trim() || !sessionId) return;

  const messageText = inputValue;
  setInputValue("");

  if (mode === "live") {
    // Add message optimistically
    const tempId = "temp-" + Date.now();
    const optimisticMessage: Message = {
      id: tempId,
      text: messageText,
      sender: "user",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, optimisticMessage]);

    try {
      const sentMessage = await sendChatMessageAction(sessionId, messageText);
      
      // Update last user message time and reset warning
      setLastUserMessageTime(new Date());
      setShowTimeoutWarning(false);

      // Replace temp message with actual message
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === tempId
            ? { ...msg, id: sentMessage.id.toString(), timestamp: new Date(sentMessage.created_at) }
            : msg
        )
      );
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) => prev.filter((msg) => msg.id !== tempId));
      setMessages((prev) => [...prev, {
        id: "error-" + Date.now(),
        text: "Failed to send message. Please try again.",
        sender: "bot",
        timestamp: new Date(),
      }]);
    }
  }
};
```

**4. handleSubmitConcern** - Use actions and set lastUserMessageTime
```typescript
const handleSubmitConcern = async () => {
  if (!concernValue.trim()) {
    alert("Please describe your concern before starting a chat.");
    return;
  }

  setMode("live");
  setChatStatus("waiting");

  try {
    const chatSession = await createChatRequestAction(concernValue.trim());

    if (chatSession && chatSession.id) {
      setSessionId(chatSession.id);
      setLastUserMessageTime(new Date());
      setMessages([
        { id: "user-concern", text: concernValue.trim(), sender: "user", timestamp: new Date() },
        { id: "system-1", text: "Your message has been sent to our support team...", sender: "bot", timestamp: new Date() },
      ]);
      setConcernValue("");
    } else {
      setMessages([{
        id: "system-error",
        text: "Failed to start chat. Please try again.",
        sender: "bot",
        timestamp: new Date(),
      }]);
      setMode("concern");
    }
  } catch (error: any) {
    console.error("Error starting chat:", error);
    
    if (error.message?.includes("already have an active chat session")) {
      await loadActiveSession();
    } else {
      setMessages([{
        id: "system-error",
        text: "Failed to start chat. Please try again.",
        sender: "bot",
        timestamp: new Date(),
      }]);
      setMode("concern");
    }
  }
};
```

**5. fetchFAQs** - Use action instead of API
```typescript
const fetchFAQs = async () => {
  try {
    const data = await getChatFAQsAction();
    setFaqs(data.map((faq) => ({
      id: faq.id.toString(),
      category: faq.category || "General",
      question: faq.question,
      answer: faq.answer,
    })));
  } catch (error) {
    console.error("Error fetching FAQs:", error);
    // fallback FAQs...
  }
};
```

**6. subscribeToMessages** - Add read marking and skip user messages
```typescript
const subscribeToMessages = async (chatId: string) => {
  if (!chatId) return;
  
  if (messageSubscriptionRef.current) {
    await supabase.removeChannel(messageSubscriptionRef.current);
  }

  const channel = supabase
    .channel(`messages:${chatId}`)
    .on("postgres_changes", {
      event: "INSERT",
      schema: "public",
      table: "chat_messages",
      filter: `chat_session_id=eq.${chatId}`,
    }, async (payload) => {
      const newMsg = payload.new as { id: string; message: string; sender: string; created_at: string };
      
      // Skip if it's our own message (already added optimistically)
      if (newMsg.sender === "user") return;
      
      const parsed = parseMessage(newMsg.message);
      const message: Message = {
        id: newMsg.id,
        text: parsed.text,
        sender: newMsg.sender as "user" | "admin" | "bot",
        timestamp: new Date(newMsg.created_at),
        buttons: parsed.buttons,
      };

      setMessages((prev) => {
        if (prev.some((m) => m.id === message.id)) return prev;
        return [...prev, message];
      });

      // Mark as read if widget is open
      if (isOpen && newMsg.sender === "admin") {
        await markMessagesAsReadAction(chatId);
      }
    })
    .on("postgres_changes", {
      event: "UPDATE",
      schema: "public",
      table: "chat_sessions",
      filter: `id=eq.${chatId}`,
    }, (payload) => {
      const updatedSession = payload.new as { id: string; status: string; admin_id: number | null };
      const oldSession = payload.old as { status: string; admin_id: number | null };

      if (updatedSession.status === "active" && oldSession.status === "pending") {
        setChatStatus("connected");
        setMessages((prev) => [
          ...prev.filter((m) => m.id !== "system-1"),
          { id: "system-connected", text: "Admin has joined the chat.", sender: "bot", timestamp: new Date() },
        ]);
      } else if (updatedSession.status === "closed") {
        setChatStatus("closed");
        setMessages((prev) => [...prev, {
          id: "system-closed-admin",
          text: "This chat has been closed by the admin.",
          sender: "bot",
          timestamp: new Date(),
        }]);
        
        // Clear timers
        if (timeoutWarningTimerRef.current) clearTimeout(timeoutWarningTimerRef.current);
        if (autoCloseTimerRef.current) clearTimeout(autoCloseTimerRef.current);
        setShowTimeoutWarning(false);
      }
    })
    .subscribe();

  messageSubscriptionRef.current = channel;
};
```

**7. handleButtonClick** - Use action
```typescript
const handleButtonClick = async (value: string) => {
  if (!sessionId) return;
  try {
    await sendChatMessageAction(sessionId, value);
  } catch (error) {
    console.error("Error sending button click:", error);
  }
};
```

#### F. JSX Changes to Add

**1. Timeout Warning Banner** (after header, before content)
```jsx
{showTimeoutWarning && mode === "live" && chatStatus === "connected" && (
  <div className={styles.timeoutWarning}>
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
      <path fillRule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003ZM12 8.25a.75.75 0 0 1 .75.75v3.75a.75.75 0 0 1-1.5 0V9a.75.75 0 0 1 .75-.75Zm0 8.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" clipRule="evenodd" />
    </svg>
    <span>⚠️ This chat will close in 30 seconds due to inactivity. Send a message to keep it active.</span>
  </div>
)}
```

**2. Session Restored Notification** (after timeout warning)
```jsx
{showRestoredNotification && mode === "live" && sessionId && (
  <div className={styles.sessionNotification}>
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
      <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clipRule="evenodd" />
    </svg>
    <span>Your chat session has been restored.</span>
  </div>
)}
```

## Database Schema Requirements

Make sure the `chat_messages` table has these columns:
```sql
ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS read_by_user BOOLEAN DEFAULT FALSE;
```

Make sure the `chat_sessions` table has these columns:
```sql
ALTER TABLE chat_sessions ADD COLUMN IF NOT EXISTS last_user_message_at TIMESTAMPTZ;
```

## Testing Checklist

- [ ] Open chat widget, close it, reopen - should restore session
- [ ] Receive message from admin - unread count badge appears on chat button
- [ ] Open widget - unread count clears
- [ ] Send message - timeout warning resets
- [ ] Wait 1.5 minutes without sending - warning banner appears
- [ ] Wait 2 minutes total - chat auto-closes with timeout message
- [ ] Close tab/browser, reopen - chat session persists
- [ ] Admin closes chat - user sees "closed by admin" message
- [ ] User has active session, tries to create new - gets error message

## Reverting Changes

To revert any file:
```bash
cp src/components/chat/ChatWidget.tsx.backup src/components/chat/ChatWidget.tsx
cp src/components/chat/ChatButton.tsx.backup src/components/chat/ChatButton.tsx
cp src/lib/db/services/chat.service.ts.backup src/lib/db/services/chat.service.ts
cp src/app/(user)/layout.tsx.backup src/app/(user)/layout.tsx
```

## Notes

1. **Persistence**: Sessions persist across page refreshes and browser sessions until closed by admin or timeout
2. **Timeout**: 2-minute inactivity (warning at 1.5 min, close at 2 min)
3. **Notifications**: Real-time badge updates on chat button
4. **Service Layer**: All API calls replaced with server actions for better type safety
5. **Optimistic Updates**: Messages appear instantly, then confirmed by server
6. **Read Tracking**: Admin messages tracked separately for notification purposes

## Architecture Benefits

- ✅ Type-safe server actions
- ✅ Centralized business logic in services
- ✅ Real-time updates via Supabase
- ✅ Optimistic UI updates
- ✅ Session persistence
- ✅ Auto-cleanup of inactive chats
- ✅ Better UX with notifications and warnings