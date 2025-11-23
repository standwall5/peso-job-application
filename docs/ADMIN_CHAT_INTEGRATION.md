# Admin Chat Integration Guide

This guide explains how to integrate the floating admin chat button into your admin layout.

## Overview

The admin chat system now includes:
- **AdminChatButton**: A floating button (bottom-right) that shows chat request counts
- **AdminChatPanel**: The main chat interface (opens in center of screen)
- **AdminChatWidget**: Wrapper component that combines both
- **Automated Chatbot**: Handles user queries when admins are unavailable

## Quick Integration

### 1. Add to Admin Layout

Add the `AdminChatWidget` component to your admin layout file:

```tsx
// src/app/admin/layout.tsx or your admin layout file
import AdminChatWidget from "@/components/chat/AdminChatWidget";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      {/* Your existing admin layout */}
      {children}
      
      {/* Add the floating chat widget */}
      <AdminChatWidget />
    </div>
  );
}
```

That's it! The widget will:
- Show a floating chat button in the bottom-right corner
- Display badge counts for new and active chat requests
- Poll for new requests every 10 seconds
- Open the chat panel when clicked

### 2. Remove Old Sidebar Integration (Optional)

If you previously had chat integrated in your sidebar, you can remove it:

```tsx
// Remove this from your sidebar:
// <AdminChatPanel isOpen={...} onClose={...} />
```

## How It Works

### User Flow
1. User clicks chat button on their side
2. System checks if admins are available (Mon-Fri, 8:00 AM - 5:00 PM)
3. If **admins available**: Chat request goes to "pending" status
4. If **no admins**: Chat automatically starts with chatbot (status: "active")

### Admin Flow
1. Admin sees badge count on floating button
2. Clicks button to open chat panel
3. Sees three tabs: New (pending), Active, Closed
4. Can accept pending chats or continue active conversations

### Chatbot Features
The chatbot can answer questions about:
- Job applications and status
- Account creation and password reset
- Resume uploading
- Training programs
- PWD assistance
- Office hours and contact information
- General PESO information

## Customization

### Change Office Hours

Edit `src/utils/chatbot.ts`:

```typescript
const BUSINESS_HOURS = {
  start: 8, // 8:00 AM
  end: 17, // 5:00 PM
  days: [1, 2, 3, 4, 5], // Monday to Friday
};
```

### Add More Bot Knowledge

Add entries to the `knowledgeBase` object in `src/utils/chatbot.ts`:

```typescript
newTopic: {
  keywords: ["keyword1", "keyword2"],
  response: "Your response here...",
},
```

### Customize Badge Colors

Edit `src/components/chat/ChatButton.module.css`:

```css
.badge {
  background: #ff556e; /* Change this color */
}
```

## API Endpoints Used

- `GET /api/admin/chat/requests?status=pending` - Fetch new requests
- `GET /api/admin/chat/requests?status=active` - Fetch active chats
- `POST /api/admin/chat/requests/:id/accept` - Accept a chat request
- `GET /api/admin/chat/:sessionId/messages` - Fetch messages
- `POST /api/admin/chat/:sessionId/messages` - Send admin message

## Real-time Features

The system uses Supabase Realtime for:
- New chat request notifications
- Live message updates
- Session status changes

Make sure Realtime is enabled in your Supabase dashboard:
1. Go to Database > Replication
2. Enable for `chat_sessions` and `chat_messages` tables
3. Enable INSERT and UPDATE events

## Troubleshooting

### Badge count not updating
- Check that the API endpoints are working
- Verify admin authentication
- Check browser console for errors

### Chatbot not responding
- Verify `src/utils/chatbot.ts` is imported correctly
- Check that messages are being inserted into the database
- Verify `isAdminAvailable()` logic

### Panel not opening
- Check that `AdminChatWidget` is mounted in your layout
- Verify no z-index conflicts with other components
- Check browser console for React errors

## Future Enhancements

Consider adding:
- Admin presence detection (beyond time-based availability)
- AI-powered chatbot using OpenAI API
- Typing indicators
- Read receipts
- Message search
- Chat transcripts export
- Performance analytics