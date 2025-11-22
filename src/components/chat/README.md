# Chat System Documentation

## Overview

This chat system provides a complete FAQ chatbot and live admin chat functionality for the PESO Job Application platform.

## Components

### 1. ChatButton
Floating button at bottom-right corner that opens the chat widget.

**Props:**
- `onClick: () => void` - Handler for button click
- `unreadCount?: number` - Number of unread messages (shows badge)

**Usage:**
```tsx
import ChatButton from "@/components/chat/ChatButton";

function MyComponent() {
  const [showChat, setShowChat] = useState(false);
  
  return (
    <ChatButton 
      onClick={() => setShowChat(true)} 
      unreadCount={3} 
    />
  );
}
```

---

### 2. ChatWidget (Applicant Side)
Main chat interface for applicants with FAQ and live chat options.

**Props:**
- `isOpen: boolean` - Controls widget visibility
- `onClose: () => void` - Handler for close button
- `userId?: string` - Current user's ID

**Features:**
- **Menu View**: Choose between FAQ or Live Chat
- **FAQ Mode**: Browse categories and get instant answers
- **Live Chat Mode**: Request chat with admin and communicate in real-time

**Usage:**
```tsx
import ChatWidget from "@/components/chat/ChatWidget";

function ApplicantPage() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  
  return (
    <>
      <ChatButton onClick={() => setIsChatOpen(true)} />
      <ChatWidget 
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        userId={user?.id}
      />
    </>
  );
}
```

---

### 3. AdminChatPanel
Admin interface for managing chat requests and conversations.

**Props:**
- `isOpen: boolean` - Controls panel visibility
- `onClose: () => void` - Handler for close button

**Features:**
- **New Requests**: View and accept pending chat requests
- **Active Chats**: Manage ongoing conversations
- **Closed Chats**: View chat history
- **Real-time messaging**: Send and receive messages

**Usage:**
```tsx
import AdminChatPanel from "@/components/chat/AdminChatPanel";

function AdminDashboard() {
  const [showChatPanel, setShowChatPanel] = useState(false);
  
  return (
    <>
      <button onClick={() => setShowChatPanel(true)}>
        Chat Management
      </button>
      <AdminChatPanel 
        isOpen={showChatPanel}
        onClose={() => setShowChatPanel(false)}
      />
    </>
  );
}
```

---

## User Flows

### Applicant Flow
1. Applicant clicks **ChatButton** (bottom-right corner)
2. **ChatWidget** opens with two options:
   - **FAQ** (automated answers)
   - **Chat with Admin** (live support)
3. If **FAQ** selected:
   - Browse categories
   - Click question to see answer
   - Continue browsing or ask more questions
4. If **Chat with Admin** selected:
   - System sends chat request to admin
   - Applicant waits in chat window
   - Once admin accepts → real-time chat starts
   - Applicant can send messages and receive responses
5. Applicant closes chat → session ends

### Admin Flow
1. Admin opens **AdminChatPanel**
2. Sees three tabs:
   - **New Requests** (pending chats)
   - **Active Chats** (ongoing conversations)
   - **Closed Chats** (completed sessions)
3. Admin clicks **Accept Chat** on a request
4. Chat window opens → Admin can message applicant
5. When done, Admin clicks **End Chat**
6. Chat moves to **Closed Chats**

---

## API Endpoints Required

You'll need to create these API routes:

### Chat Requests
```typescript
// GET /api/chat/request - Get user's active chat request
// POST /api/chat/request - Create new chat request
{
  userId: string;
  timestamp: string;
}

// GET /api/admin/chat/requests?status=new|active|closed
// Returns: ChatRequest[]
```

### Messages
```typescript
// GET /api/chat/messages?chatId=xxx - Get messages for a chat
// POST /api/chat/messages - Send message
{
  chatId: string;
  userId: string;
  message: string;
  timestamp: string;
}

// GET /api/admin/chat/messages/:chatId
// POST /api/admin/chat/messages
{
  chatId: string;
  message: string;
  sender: "admin" | "user";
  timestamp: string;
}
```

### Chat Management
```typescript
// POST /api/admin/chat/accept - Accept chat request
{
  chatId: string;
}

// POST /api/admin/chat/close - End chat session
{
  chatId: string;
}
```

### FAQs
```typescript
// GET /api/chat/faqs - Get all FAQs
// Returns: FAQ[]

// POST /api/admin/chat/faqs - Create/update FAQ (Admin only)
{
  category: string;
  question: string;
  answer: string;
}

// DELETE /api/admin/chat/faqs/:id - Delete FAQ (Admin only)
```

---

## Database Schema

### Table: chat_sessions
```sql
CREATE TABLE chat_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  status VARCHAR(20) DEFAULT 'pending', -- pending, active, closed
  created_at TIMESTAMP DEFAULT NOW(),
  closed_at TIMESTAMP,
  admin_id UUID REFERENCES admins(id)
);
```

### Table: chat_messages
```sql
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chat_session_id UUID REFERENCES chat_sessions(id),
  sender VARCHAR(10), -- 'user' or 'admin'
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Table: faqs
```sql
CREATE TABLE faqs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category VARCHAR(100),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  position INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## Styling

All components use CSS modules with modern design:
- ✅ Rounded corners (12px-16px border-radius)
- ✅ Smooth animations (slide-in, fade-in)
- ✅ Shadow-based design (no harsh borders)
- ✅ Gradient backgrounds using `var(--accent)` and `var(--button)`
- ✅ Responsive design (mobile-friendly)
- ✅ Hover effects with accent color

---

## Real-time Updates (Optional Enhancement)

For real-time message updates, consider using:
- **WebSockets** (Socket.io)
- **Server-Sent Events (SSE)**
- **Polling** (simple but less efficient)

Example with polling:
```typescript
useEffect(() => {
  if (activeChat) {
    const interval = setInterval(() => {
      fetchMessages(activeChat.id);
    }, 3000); // Poll every 3 seconds
    
    return () => clearInterval(interval);
  }
}, [activeChat]);
```

---

## Features Checklist

### Applicant Side
- ✅ Floating chat button (bottom-right)
- ✅ Chat widget with menu
- ✅ FAQ browsing by category
- ✅ Live chat request system
- ✅ Real-time messaging interface
- ✅ Message history
- ✅ Smooth animations

### Admin Side
- ✅ Chat management panel
- ✅ New requests tab with badge count
- ✅ Active chats tab
- ✅ Closed chats tab
- ✅ Accept/reject requests
- ✅ Real-time messaging
- ✅ End chat functionality
- ✅ User info display

### Optional (Future Enhancement)
- ⬜ FAQ management interface for admins
- ⬜ File/image sharing in chat
- ⬜ Chat transcripts download
- ⬜ Typing indicators
- ⬜ Read receipts
- ⬜ Emoji support
- ⬜ Canned responses for admins
- ⬜ Chat analytics dashboard

---

## Installation & Setup

1. **Copy components** to your project:
   ```
   src/components/chat/
   ├── ChatButton.tsx
   ├── ChatButton.module.css
   ├── ChatWidget.tsx
   ├── ChatWidget.module.css
   ├── AdminChatPanel.tsx
   └── AdminChatPanel.module.css
   ```

2. **Add to applicant pages**:
   ```tsx
   // In your main layout or specific pages
   import ChatButton from "@/components/chat/ChatButton";
   import ChatWidget from "@/components/chat/ChatWidget";
   
   const [isChatOpen, setIsChatOpen] = useState(false);
   
   return (
     <>
       {/* Your page content */}
       <ChatButton onClick={() => setIsChatOpen(true)} />
       <ChatWidget 
         isOpen={isChatOpen}
         onClose={() => setIsChatOpen(false)}
         userId={user?.id}
       />
     </>
   );
   ```

3. **Add to admin dashboard**:
   ```tsx
   import AdminChatPanel from "@/components/chat/AdminChatPanel";
   
   const [showPanel, setShowPanel] = useState(false);
   
   return (
     <>
       <button onClick={() => setShowPanel(true)}>
         Manage Chats
       </button>
       <AdminChatPanel 
         isOpen={showPanel}
         onClose={() => setShowPanel(false)}
       />
     </>
   );
   ```

4. **Create API routes** (see API Endpoints section above)

5. **Set up database tables** (see Database Schema section above)

---

## Browser Support

- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)
- ✅ Mobile browsers

---

## Accessibility

- ✅ Keyboard navigation support
- ✅ ARIA labels on interactive elements
- ✅ Focus management
- ✅ Screen reader friendly

---

## Performance

- Lazy loading of chat history
- Debounced message sending
- Optimized re-renders with React.memo (if needed)
- Pagination for large chat lists

---

## License

Part of the PESO Job Application project.