# Chat System Integration Example

This guide shows you how to integrate the chat system into your application.

## For Applicant/User Pages

Add the chat button and widget to any applicant-facing page:

```tsx
"use client";

import { useState } from "react";
import ChatButton from "@/components/chat/ChatButton";
import ChatWidget from "@/components/chat/ChatWidget";

export default function ApplicantPage() {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <div>
      {/* Your page content */}
      <h1>Job Applications</h1>
      
      {/* Chat components */}
      <ChatButton 
        onClick={() => setIsChatOpen(true)}
        unreadCount={0} // You can implement unread message tracking
      />
      
      <ChatWidget 
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
      />
    </div>
  );
}
```

## For Admin Pages

Add the admin chat panel to your admin dashboard:

```tsx
"use client";

import { useState } from "react";
import AdminChatPanel from "@/components/chat/AdminChatPanel";
import Button from "@/components/Button";

export default function AdminDashboard() {
  const [isChatPanelOpen, setIsChatPanelOpen] = useState(false);
  const [unreadChats, setUnreadChats] = useState(0);

  return (
    <div>
      {/* Your admin dashboard content */}
      <h1>Admin Dashboard</h1>
      
      {/* Button to open chat management */}
      <Button 
        onClick={() => setIsChatPanelOpen(true)}
        variant="primary"
      >
        Chat Management {unreadChats > 0 && `(${unreadChats})`}
      </Button>
      
      {/* Chat management panel */}
      <AdminChatPanel 
        isOpen={isChatPanelOpen}
        onClose={() => setIsChatPanelOpen(false)}
      />
    </div>
  );
}
```

## Global Layout Integration (Recommended)

Add chat to your applicant layout so it's available on all pages:

```tsx
// app/(user)/layout.tsx
"use client";

import { useState } from "react";
import ChatButton from "@/components/chat/ChatButton";
import ChatWidget from "@/components/chat/ChatWidget";

export default function UserLayout({ children }: { children: React.ReactNode }) {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <>
      {children}
      
      {/* Floating chat button - available on all user pages */}
      <ChatButton 
        onClick={() => setIsChatOpen(true)}
      />
      
      <ChatWidget 
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
      />
    </>
  );
}
```

## Admin Layout Integration

```tsx
// app/admin/layout.tsx
"use client";

import { useState } from "react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin-layout">
      <aside className="sidebar">
        {/* Other admin nav items */}
        <button onClick={() => {/* open chat panel */}}>
          💬 Chat Management
        </button>
      </aside>
      
      <main>{children}</main>
    </div>
  );
}
```

## Fetching Unread Message Count

You can create a hook to fetch unread message count:

```tsx
// hooks/useUnreadMessages.ts
import { useState, useEffect } from 'react';

export function useUnreadMessages() {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        // You would need to create this endpoint
        const res = await fetch('/api/chat/unread');
        const data = await res.json();
        setUnreadCount(data.count || 0);
      } catch (error) {
        console.error('Error fetching unread count:', error);
      }
    };

    fetchUnread();
    
    // Poll every 30 seconds
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, []);

  return unreadCount;
}

// Usage:
const unreadCount = useUnreadMessages();
<ChatButton onClick={openChat} unreadCount={unreadCount} />
```

## Admin Notification Hook

For admins to see new chat requests:

```tsx
// hooks/useNewChatRequests.ts
import { useState, useEffect } from 'react';

export function useNewChatRequests() {
  const [newRequestsCount, setNewRequestsCount] = useState(0);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await fetch('/api/admin/chat/requests?status=new');
        const data = await res.json();
        setNewRequestsCount(data.length);
      } catch (error) {
        console.error('Error fetching chat requests:', error);
      }
    };

    fetchRequests();
    
    // Poll every 10 seconds for new requests
    const interval = setInterval(fetchRequests, 10000);
    return () => clearInterval(interval);
  }, []);

  return newRequestsCount;
}
```

## Styling Notes

The chat components use CSS modules and are styled with your design system's colors. They use these CSS variables:

- `--accent` - Primary accent color
- `--button` - Button color
- Font family inherits from your global styles

The components are already responsive and will work on mobile devices.

## Real-time Updates (Optional Enhancement)

Replace polling with Supabase Realtime for instant updates:

```tsx
// In ChatWidget.tsx
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

useEffect(() => {
  if (!sessionId) return;
  
  const supabase = createClientComponentClient();
  
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
        const newMsg = payload.new;
        setMessages(prev => [...prev, {
          id: newMsg.id,
          text: newMsg.message,
          sender: newMsg.sender,
          timestamp: new Date(newMsg.created_at)
        }]);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, [sessionId]);
```

## Permission Checking

Make sure to protect admin routes:

```tsx
// middleware.ts or page-level check
import { createClient } from '@/utils/supabase/server';

export async function checkAdminAccess() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return false;
  
  const { data: admin } = await supabase
    .from('peso')
    .select('id')
    .eq('auth_id', user.id)
    .single();
    
  return !!admin;
}
```

## Testing Your Integration

1. **As an applicant:**
   - Click the chat button
   - Try the FAQ section
   - Request a live chat
   - Verify you see "Waiting for admin..."

2. **As an admin:**
   - Open the admin chat panel
   - Check you see the new request in "New Requests"
   - Accept the chat
   - Send a message
   - Verify the applicant receives it
   - Close the chat
   - Verify it appears in "Closed Chats"

3. **Edge cases:**
   - Test with no internet connection
   - Test closing and reopening widgets
   - Test multiple simultaneous chats (admin side)
   - Test session expiration

## Troubleshooting

**Chat requests not appearing:**
- Check browser console for API errors
- Verify Supabase authentication is working
- Check that `applicants` table has `auth_id` column
- Verify `peso` table has `auth_id` column

**Messages not sending:**
- Verify the session ID is being stored correctly
- Check that the session status is 'active' (not 'pending' or 'closed')
- Look at network tab to see API response

**Admin can't accept chats:**
- Verify the admin user exists in `peso` table
- Check that `auth_id` matches their Supabase user ID
- Ensure admin has proper permissions

## Complete Example Page

Here's a complete example of an applicant page with chat:

```tsx
"use client";

import { useState } from "react";
import ChatButton from "@/components/chat/ChatButton";
import ChatWidget from "@/components/chat/ChatWidget";
import Navbar from "@/components/Navbar";

export default function JobsPage() {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <>
      <Navbar userType="applicant" />
      
      <main className="container">
        <h1>Available Jobs</h1>
        
        {/* Your job listings */}
        <div className="job-list">
          {/* Job cards */}
        </div>
      </main>
      
      {/* Chat system */}
      <ChatButton 
        onClick={() => setIsChatOpen(true)}
      />
      
      <ChatWidget 
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
      />
    </>
  );
}
```

That's it! The chat system is now fully integrated and ready to use.