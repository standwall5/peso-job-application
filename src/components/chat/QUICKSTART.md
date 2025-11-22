# Chat System Quick Start Guide

Get the chat system running in 5 minutes!

## Step 1: Verify Database Tables

Make sure these tables exist in your PostgreSQL database:

```sql
-- Check if tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('chat_sessions', 'chat_messages', 'faqs', 'applicants', 'peso');
```

If missing, run the CREATE statements from your schema.

## Step 2: Add Test FAQs

```sql
INSERT INTO faqs (category, question, answer, position) VALUES
('General', 'How do I apply for a job?', 'Browse our job listings and click the Apply button on any position.', 1),
('General', 'How do I update my profile?', 'Go to your Profile page and click the Edit button.', 2),
('Applications', 'How can I track my applications?', 'Visit your Profile page and click on Applied Jobs.', 3);
```

## Step 3: Verify Auth Mapping

Make sure your test users have entries in the correct tables:

```sql
-- For applicants
SELECT id, auth_id, first_name, last_name FROM applicants WHERE auth_id = 'your-supabase-user-id';

-- For admins
SELECT id, auth_id, name FROM peso WHERE auth_id = 'your-admin-supabase-user-id';
```

If missing, add them:

```sql
-- Add applicant (use your Supabase user ID)
INSERT INTO applicants (auth_id, first_name, last_name, email)
VALUES ('supabase-user-uuid', 'John', 'Doe', 'john@example.com');

-- Add admin (use your admin's Supabase user ID)
INSERT INTO peso (auth_id, name, email)
VALUES ('admin-supabase-uuid', 'Admin User', 'admin@example.com');
```

## Step 4: Add Chat to Applicant Page

Create or update a user page:

```tsx
"use client";

import { useState } from "react";
import ChatButton from "@/components/chat/ChatButton";
import ChatWidget from "@/components/chat/ChatWidget";

export default function JobsPage() {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <>
      <h1>My Jobs Page</h1>
      
      {/* Your page content here */}
      
      {/* Add these two components */}
      <ChatButton onClick={() => setIsChatOpen(true)} />
      <ChatWidget isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </>
  );
}
```

## Step 5: Add Chat Panel to Admin Page

```tsx
"use client";

import { useState } from "react";
import AdminChatPanel from "@/components/chat/AdminChatPanel";

export default function AdminDashboard() {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <>
      <h1>Admin Dashboard</h1>
      
      <button onClick={() => setIsChatOpen(true)}>
        Open Chat Management
      </button>
      
      <AdminChatPanel 
        isOpen={isChatOpen} 
        onClose={() => setIsChatOpen(false)} 
      />
    </>
  );
}
```

## Step 6: Test It!

### As Applicant:
1. Navigate to your page with the chat button
2. Click the floating chat button (bottom right)
3. Try "Frequently Asked Questions" - should show FAQs
4. Try "Chat with Admin" - should create a pending request

### As Admin:
1. Open admin dashboard
2. Click "Open Chat Management"
3. Go to "New Requests" tab
4. You should see the applicant's request
5. Click "Accept Chat"
6. Chat moves to "Active Chats"
7. Send a message
8. Click "End Chat" when done

### Back to Applicant:
1. Once admin accepts, status changes to "Connected"
2. Messages from admin appear automatically
3. Send messages back

## Environment Variables

Make sure these are in your `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## API Routes Checklist

All these should exist (they were created for you):

- ✅ `/api/chat/faqs` - GET FAQs
- ✅ `/api/chat/request` - POST create chat
- ✅ `/api/chat/messages` - GET/POST user messages
- ✅ `/api/admin/chat/requests` - GET chat requests by status
- ✅ `/api/admin/chat/accept` - POST accept chat
- ✅ `/api/admin/chat/messages` - POST admin message
- ✅ `/api/admin/chat/messages/[chatId]` - GET messages for chat
- ✅ `/api/admin/chat/close` - POST close chat

## Common Issues

**"Applicant not found"**
- Your Supabase user ID is not in the `applicants` table
- Add it using the SQL above

**"Admin access required"**
- Your Supabase user ID is not in the `peso` table
- Add it using the SQL above

**Chat button doesn't appear**
- Check that you imported the components correctly
- Verify the CSS modules are loading
- Check browser console for errors

**Messages not showing**
- Check Network tab in browser DevTools
- Verify API routes are responding (200 status)
- Check that session is 'active' not 'pending'

## What's Next?

Once basic testing works:

1. **Style Integration**: Components use CSS modules and inherit your design system colors
2. **Real-time**: Replace polling with Supabase Realtime (see CHAT_SYSTEM_UPDATED.md)
3. **Notifications**: Add sound/desktop notifications for new messages
4. **History**: Let users view past chats

## File Locations

All API routes are in:
- `src/app/api/chat/*`
- `src/app/api/admin/chat/*`

All components are in:
- `src/components/chat/*`

## Need Help?

Check these files for detailed information:
- `CHAT_SYSTEM_UPDATED.md` - Complete technical documentation
- `INTEGRATION_EXAMPLE.md` - Code examples and patterns
- `CHAT_SYSTEM_COMPLETE.md` - Full summary of implementation

## You're Done! 🎉

The chat system is fully functional. Just integrate the components into your pages and start chatting!