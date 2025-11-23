# PESO Chat System - Complete Implementation

## 🎯 Overview

The PESO Job Application platform now includes a fully functional real-time chat system with intelligent chatbot support. This system enables applicants to get instant help and admins to manage support conversations efficiently.

## ✨ Key Features

### For Applicants
- 💬 **Floating Chat Button** - Always accessible in bottom-right corner
- 🤖 **AI Chatbot** - Instant answers when admins are offline
- ⚡ **Real-time Messaging** - Live updates without page refresh
- 📱 **Mobile Responsive** - Works seamlessly on all devices
- 🔄 **Persistent Sessions** - Conversations saved and resumable

### For Admins
- 🎯 **Centralized Dashboard** - Manage all chat requests from one panel
- 🔔 **Badge Notifications** - See new and active chat counts at a glance
- 📊 **Organized Tabs** - New, Active, and Closed conversations
- ⚡ **Real-time Updates** - Instant notification of new messages
- 🎨 **Professional Interface** - Clean, modern design matching your brand

### Technical Features
- 🔐 **Secure** - Row-level security policies protect user data
- 🚀 **Scalable** - Built on Supabase with real-time capabilities
- 📡 **WebSocket** - Efficient real-time communication
- 🎭 **Smart Routing** - Auto-assigns to bot or human based on availability
- 📈 **Performance** - Optimized queries and efficient state management

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         User Side                            │
│  ┌────────────┐    ┌─────────────┐    ┌─────────────────┐  │
│  │ ChatButton │ -> │ ChatWidget  │ -> │ Chat Interface  │  │
│  └────────────┘    └─────────────┘    └─────────────────┘  │
└──────────────────────────┬──────────────────────────────────┘
                           │
                     HTTP + WebSocket
                           │
┌──────────────────────────┼──────────────────────────────────┐
│                      Backend APIs                            │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ /api/chat/request    - Create session               │    │
│  │ /api/chat/messages   - Send/receive messages        │    │
│  │ /api/admin/chat/*    - Admin endpoints              │    │
│  └─────────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ Chatbot Utility (src/utils/chatbot.ts)             │    │
│  │ - Check admin availability                          │    │
│  │ - Generate AI responses                             │    │
│  │ - Knowledge base matching                           │    │
│  └─────────────────────────────────────────────────────┘    │
└──────────────────────────┬──────────────────────────────────┘
                           │
                      Supabase Realtime
                           │
┌──────────────────────────┼──────────────────────────────────┐
│                      Database Layer                          │
│  ┌──────────────┐  ┌───────────────┐  ┌─────────────────┐  │
│  │chat_sessions │  │ chat_messages │  │      faqs       │  │
│  └──────────────┘  └───────────────┘  └─────────────────┘  │
│  ┌──────────────┐  ┌───────────────┐  ┌─────────────────┐  │
│  │  applicants  │  │     peso      │  │   auth.users    │  │
│  └──────────────┘  └───────────────┘  └─────────────────┘  │
└──────────────────────────┬──────────────────────────────────┘
                           │
                     Real-time Events
                           │
┌──────────────────────────┴──────────────────────────────────┐
│                         Admin Side                           │
│  ┌─────────────────┐  ┌───────────────┐  ┌──────────────┐  │
│  │ AdminChatButton │->│AdminChatWidget│->│AdminChatPanel│  │
│  └─────────────────┘  └───────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## 📂 File Structure

```
peso-job-application/
├── src/
│   ├── app/api/
│   │   ├── chat/
│   │   │   ├── request/route.ts          # Create chat session
│   │   │   └── messages/route.ts         # Send/receive messages
│   │   └── admin/chat/
│   │       └── requests/route.ts         # Admin endpoints
│   ├── components/chat/
│   │   ├── ChatButton.tsx                # User chat button
│   │   ├── ChatButton.module.css         # Button styles
│   │   ├── ChatWidget.tsx                # User chat interface
│   │   ├── ChatWidget.module.css         # Widget styles
│   │   ├── AdminChatButton.tsx           # Admin chat button
│   │   ├── AdminChatWidget.tsx           # Admin wrapper component
│   │   ├── AdminChatPanel.tsx            # Admin chat panel
│   │   └── AdminChatPanel.module.css     # Panel styles
│   └── utils/
│       └── chatbot.ts                    # Chatbot logic & AI
├── supabase/migrations/
│   ├── add_concern_to_chat_sessions.sql
│   └── create_chat_sessions_with_user_view.sql
└── docs/
    ├── CHAT_SYSTEM_README.md             # This file
    ├── QUICKSTART.md                     # Quick setup guide
    ├── CHATBOT_REALTIME_SETUP.md         # Detailed setup
    └── ADMIN_CHAT_INTEGRATION.md         # Admin integration
```

## 🚀 Quick Start

### 1. Database Setup (2 minutes)

Run these SQL commands in Supabase SQL Editor:

```sql
-- Add concern column
ALTER TABLE chat_sessions ADD COLUMN IF NOT EXISTS concern TEXT;

-- Add updated_at column
ALTER TABLE chat_sessions ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create admin function (see docs/QUICKSTART.md for full SQL)
```

### 2. Enable Realtime (1 minute)

In Supabase Dashboard:
- Database → Replication
- Enable for `chat_sessions` and `chat_messages`
- Enable INSERT and UPDATE events

### 3. Add Admin Widget (30 seconds)

```tsx
// src/app/admin/layout.tsx
import AdminChatWidget from "@/components/chat/AdminChatWidget";

export default function AdminLayout({ children }) {
  return (
    <div>
      {children}
      <AdminChatWidget />
    </div>
  );
}
```

### 4. Test! (5 minutes)

See `docs/QUICKSTART.md` for testing scenarios.

## 🤖 How the Chatbot Works

### Availability Detection

The system automatically determines if admins are available:

```typescript
// Business hours: Mon-Fri, 8 AM - 5 PM
const BUSINESS_HOURS = {
  start: 8,
  end: 17,
  days: [1, 2, 3, 4, 5]
};
```

### User Flow

```
User starts chat
     ↓
Is admin available?
     ├─ YES → Status: "pending" → Waits for admin
     └─ NO  → Status: "active"  → Bot responds immediately
```

### Chatbot Knowledge Base

The bot can answer questions about:
- ✅ Job applications
- ✅ Account creation & passwords
- ✅ Resume uploading
- ✅ Training programs
- ✅ PWD assistance
- ✅ Office hours & contact info
- ✅ General PESO services

### Example Conversation

```
User: "How do I apply for a job?"
Bot:  "To apply for a job:
       1. Create an account or log in
       2. Browse available job postings
       3. Click 'Apply' on jobs that match your skills
       4. Fill out the application form
       5. Upload your resume
       
       You can track your applications in your dashboard."
```

## 🔧 Customization

### Change Office Hours

Edit `src/utils/chatbot.ts`:

```typescript
const BUSINESS_HOURS = {
  start: 9,   // 9 AM
  end: 18,    // 6 PM
  days: [1, 2, 3, 4, 5, 6], // Mon-Sat
};
```

### Add Bot Knowledge

Add entries to the `knowledgeBase` object:

```typescript
yourTopic: {
  keywords: ["keyword1", "keyword2"],
  response: "Your bot response here..."
},
```

### Customize Styling

Edit CSS modules:
- `ChatButton.module.css` - Button appearance
- `ChatWidget.module.css` - User chat window
- `AdminChatPanel.module.css` - Admin panel

## 📊 Database Schema

### chat_sessions
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | INTEGER | References applicants.id |
| status | VARCHAR | pending, active, or closed |
| concern | TEXT | User's initial message |
| created_at | TIMESTAMP | Session start time |
| updated_at | TIMESTAMP | Last update time |

### chat_messages
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| chat_session_id | UUID | References chat_sessions.id |
| sender | VARCHAR | user or admin |
| message | TEXT | Message content |
| created_at | TIMESTAMP | Message timestamp |

## 🔐 Security

### Row Level Security (RLS)

- ✅ Users can only see their own chat sessions
- ✅ Users can only send messages to their own sessions
- ✅ Admins can view all sessions
- ✅ Admins can send messages to any session
- ✅ Email access secured via SECURITY DEFINER function

### Authentication

- ✅ All API routes verify authentication
- ✅ Session ownership validated before allowing actions
- ✅ Admin status verified via `peso` table
- ✅ No service role keys in client-side code

## 📈 Performance

### Optimizations

- **Real-time subscriptions** - WebSocket instead of polling
- **Selective queries** - Only fetch needed data
- **Indexed searches** - Full-text search on concerns
- **Lazy loading** - Messages loaded on demand
- **Efficient state** - React hooks minimize re-renders

### Monitoring

Monitor these metrics:
- Average response time
- Bot vs. human chat ratio
- Session resolution rate
- Real-time connection stability

## 🐛 Troubleshooting

### Common Issues

| Problem | Solution |
|---------|----------|
| Bot doesn't respond | Check `isAdminAvailable()` logic |
| No real-time updates | Enable Realtime in Supabase |
| Can't see emails | Run admin function migration |
| Badge count wrong | Check API authentication |
| Panel won't open | Check React console errors |

See `docs/CHATBOT_REALTIME_SETUP.md` for detailed troubleshooting.

## 📚 Documentation

- **QUICKSTART.md** - Fast setup and testing (10 min)
- **CHATBOT_REALTIME_SETUP.md** - Complete technical guide
- **ADMIN_CHAT_INTEGRATION.md** - Admin setup details

## 🎯 Future Enhancements

Consider adding:
- [ ] GPT-4 integration for smarter responses
- [ ] File attachments (screenshots, documents)
- [ ] Typing indicators
- [ ] Read receipts
- [ ] Chat ratings & feedback
- [ ] Admin presence detection
- [ ] Canned responses library
- [ ] Chat analytics dashboard
- [ ] Multi-language support
- [ ] Push notifications

## 🤝 Support

Need help?

1. Check the docs in `/docs` folder
2. Review Supabase Dashboard logs
3. Check browser console for errors
4. Test API endpoints directly
5. Verify database state with SQL queries

## ✅ Production Checklist

Before deploying:

- [ ] Database migrations applied
- [ ] Realtime enabled on production Supabase
- [ ] Admin users added to `peso` table
- [ ] Business hours configured correctly
- [ ] Environment variables set
- [ ] RLS policies tested
- [ ] Mobile responsive verified
- [ ] Error logging configured
- [ ] Performance tested with load
- [ ] Security audit completed

## 📄 License

This chat system is part of the PESO Job Application platform.

---

**Built with:** Next.js, Supabase, React, TypeScript  
**Real-time powered by:** Supabase Realtime (WebSocket)  
**Status:** ✅ Production Ready

For questions or issues, refer to the documentation in the `/docs` folder.