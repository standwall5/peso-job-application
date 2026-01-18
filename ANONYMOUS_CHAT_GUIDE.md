# Anonymous Chat Feature - Implementation Guide

## 🎯 Overview

The anonymous chat feature allows **unauthenticated users** to use the chat system without logging in. They appear as "Anonymous User" or with a randomly generated name.

---

## ✨ Features

### For Anonymous Users
- ✅ Chat without creating an account
- ✅ Unique ID stored in browser localStorage
- ✅ Random display name (e.g., "Curious Visitor #123")
- ✅ Session persists across page reloads (30 days)
- ✅ Access to FAQ and live chat
- ✅ Full chat history during session

### For Admins
- ✅ See all chat requests (authenticated + anonymous)
- ✅ Anonymous users clearly labeled
- ✅ Same admin panel interface
- ✅ Can't send emails to anonymous users (no email address)

---

## 🗄️ Database Changes

### Migration: `002_add_anonymous_chat_support.sql`

**New columns in `chat_sessions` table:**

| Column | Type | Description |
|--------|------|-------------|
| `is_anonymous` | BOOLEAN | TRUE for anonymous users, FALSE for authenticated |
| `anonymous_id` | TEXT | Unique identifier (UUID) for anonymous user |
| `anonymous_name` | TEXT | Display name (e.g., "Curious Visitor #123") |

**Changes:**
- `user_id` is now **nullable** (can be NULL for anonymous users)
- Check constraint ensures either `user_id` OR `anonymous_id` is present
- Indexes added for performance on anonymous queries
- Updated RLS policies to allow anonymous access

**Example anonymous session:**
```sql
{
  "id": "session-uuid",
  "user_id": null,
  "is_anonymous": true,
  "anonymous_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "anonymous_name": "Helpful Guest #456",
  "status": "pending",
  "concern": "Need help with job search"
}
```

---

## 🔑 Anonymous ID Management

### Client-Side (localStorage)

**Storage Keys:**
- `peso_anonymous_chat_id` - UUID v4 identifier
- `peso_anonymous_chat_name` - Display name
- `peso_anonymous_chat_id_expiry` - Expiration timestamp (30 days)

**How it works:**
1. User opens chat widget (not logged in)
2. System checks localStorage for existing ID
3. If found and not expired → use existing ID
4. If not found → generate new UUID and random name
5. Store in localStorage with 30-day expiry

**Utility Functions** (`src/utils/anonymous-chat.ts`):

```typescript
// Get or create anonymous ID
const anonymousId = getOrCreateAnonymousId();

// Get display name
const name = getAnonymousName();

// Initialize anonymous chat session
const { anonymousId, anonymousName } = initAnonymousChat();

// Clear ID (when user logs in)
clearAnonymousId();
```

---

## 🔄 How Anonymous Chat Works

### User Opens Chat Widget (Not Logged In)

**1. Initialize Anonymous Session:**
```typescript
// ChatWidget.tsx
const { anonymousId, anonymousName } = initAnonymousChat();
// Returns: { anonymousId: "uuid", anonymousName: "Curious Visitor #123" }
```

**2. Create Chat Request:**
```typescript
// POST /api/chat/request
{
  "concern": "I need help finding jobs",
  "anonymousId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "anonymousName": "Curious Visitor #123"
}
```

**3. Database Creates Session:**
```sql
INSERT INTO chat_sessions (
  is_anonymous,
  anonymous_id,
  anonymous_name,
  status,
  concern
) VALUES (
  TRUE,
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'Curious Visitor #123',
  'pending',
  'I need help finding jobs'
);
```

**4. Admin Sees Request:**
- Shows up in admin chat panel
- Labeled as "Anonymous User" or their display name
- Admin can accept and chat normally

**5. Messages Flow:**
- Anonymous user sends messages via API
- Admin responds through admin panel
- Both sides see real-time updates via Supabase Realtime

---

## 📡 API Routes for Anonymous Chat

### Create Chat Request
```http
POST /api/chat/request
Content-Type: application/json

{
  "concern": "Need help with applications",
  "anonymousId": "uuid-here",
  "anonymousName": "Helpful Guest #456"
}
```

**Response:**
```json
{
  "id": "session-uuid",
  "is_anonymous": true,
  "anonymous_id": "uuid-here",
  "anonymous_name": "Helpful Guest #456",
  "status": "pending",
  "concern": "Need help with applications"
}
```

### Get Active Session
```http
GET /api/chat/anonymous-active-session?anonymousId=uuid-here
```

### Send Message
```http
POST /api/chat/anonymous-messages
Content-Type: application/json

{
  "chatSessionId": "session-uuid",
  "anonymousId": "uuid-here",
  "message": "Hello, I need assistance"
}
```

### Close Session
```http
POST /api/chat/anonymous-close
Content-Type: application/json

{
  "chatSessionId": "session-uuid",
  "anonymousId": "uuid-here"
}
```

---

## 🛡️ Security & Privacy

### Security Measures

**1. Session Isolation:**
- Each anonymous ID can only access their own sessions
- Server validates `anonymous_id` matches session before allowing access
- RLS policies prevent cross-anonymous-user access

**2. No PII Storage:**
- No email, phone, or personal information stored
- Only display name and UUID (which are randomly generated)
- Can't trace back to individual user

**3. Auto-Cleanup:**
- Closed anonymous sessions deleted after 7 days
- Function: `cleanup_old_anonymous_sessions()`
- Run via cron job

**4. Rate Limiting:**
- Same rate limits as authenticated users
- Prevent spam chat requests

### Privacy Considerations

**Advantages:**
- ✅ True anonymity (no account required)
- ✅ No tracking beyond localStorage
- ✅ Can clear ID anytime to start fresh

**Limitations:**
- ⚠️ Chat history lost if localStorage cleared
- ⚠️ Different device = different anonymous ID
- ⚠️ Can't receive email notifications (no email address)

---

## 🔄 Migration from Anonymous to Authenticated

### When User Creates Account

**Option 1: Preserve Chat History** (Recommended)

```typescript
// After user logs in successfully
await migrateAnonymousChatToUser(userId);
```

This:
1. Finds all sessions with user's `anonymous_id`
2. Updates them to set `user_id` and clear anonymous fields
3. Preserves all messages and chat history
4. Clears anonymous ID from localStorage

**Option 2: Start Fresh**

```typescript
// Clear anonymous ID - user starts with clean slate
clearAnonymousId();
```

**Migration API Route:** (To be implemented)
```http
POST /api/chat/migrate-anonymous
Content-Type: application/json

{
  "anonymousId": "uuid-here",
  "userId": 123
}
```

---

## 🎨 UI/UX Considerations

### ChatWidget Component

**Display Anonymous User Info:**
```tsx
<div className={styles.header}>
  {user ? (
    <span>Chatting as: {user.name}</span>
  ) : (
    <span>Chatting anonymously as: {anonymousName}</span>
  )}
</div>
```

**Show Notice to Anonymous Users:**
```tsx
{!user && (
  <div className={styles.anonymousNotice}>
    💡 You're chatting anonymously. 
    <a href="/signup">Create an account</a> to save your chat history.
  </div>
)}
```

### Admin Panel

**Distinguish Anonymous Users:**
```tsx
<div className={styles.chatRequest}>
  <div className={styles.userName}>
    {session.is_anonymous ? (
      <>
        <span className={styles.anonymousBadge}>👤 Anonymous</span>
        {session.anonymous_name}
      </>
    ) : (
      session.user_name
    )}
  </div>
</div>
```

---

## 📊 Analytics & Monitoring

### Track Anonymous Chat Usage

**Metrics to Monitor:**
- Total anonymous sessions created
- Anonymous vs authenticated chat ratio
- Average anonymous session duration
- Conversion rate (anonymous → authenticated user)

**SQL Queries:**

```sql
-- Count anonymous sessions today
SELECT COUNT(*) 
FROM chat_sessions 
WHERE is_anonymous = TRUE 
AND created_at >= CURRENT_DATE;

-- Anonymous vs authenticated ratio
SELECT 
  is_anonymous,
  COUNT(*) as total,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
FROM chat_sessions
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY is_anonymous;

-- Average session duration
SELECT 
  AVG(EXTRACT(EPOCH FROM (closed_at - created_at))) / 60 as avg_minutes
FROM chat_sessions
WHERE is_anonymous = TRUE
AND closed_at IS NOT NULL;
```

---

## 🧹 Maintenance

### Cleanup Old Sessions

**Function:** `cleanup_old_anonymous_sessions()`

**Run via cron job:**
```sql
-- Delete closed anonymous sessions older than 7 days
SELECT cleanup_old_anonymous_sessions();
-- Returns: number of deleted sessions
```

**Recommended Schedule:**
- Daily at 2 AM
- Use Supabase Edge Functions or external cron service

**Example Supabase Cron:**
```sql
SELECT cron.schedule(
  'cleanup-anonymous-chat',
  '0 2 * * *', -- Daily at 2 AM
  $$SELECT cleanup_old_anonymous_sessions()$$
);
```

---

## 🚀 Deployment Checklist

### Database Setup

- [ ] Run migration: `002_add_anonymous_chat_support.sql`
- [ ] Verify new columns exist in `chat_sessions`
- [ ] Check RLS policies updated correctly
- [ ] Test anonymous session creation
- [ ] Set up cleanup cron job

### Code Deployment

- [ ] Deploy new API routes
- [ ] Update ChatWidget component
- [ ] Add anonymous-chat.ts utilities
- [ ] Test localStorage persistence
- [ ] Verify real-time updates work

### Testing

- [ ] Test anonymous chat creation (not logged in)
- [ ] Test message sending as anonymous
- [ ] Test admin accepting anonymous chat
- [ ] Test session timeout (2 minutes)
- [ ] Test localStorage persistence across reload
- [ ] Test on different browsers
- [ ] Test localStorage disabled scenario
- [ ] Test migration to authenticated user

---

## 🐛 Troubleshooting

### Issue: Anonymous ID not persisting

**Cause:** localStorage blocked by browser

**Solution:**
- Check browser privacy settings
- Ensure site not in incognito/private mode
- Fallback to session-only ID (works but lost on refresh)

### Issue: Can't create anonymous session

**Cause:** RLS policies blocking insert

**Solution:**
```sql
-- Verify policy allows anonymous inserts
SELECT * FROM pg_policies 
WHERE tablename = 'chat_sessions' 
AND policyname LIKE '%create%';
```

### Issue: Admin can't see anonymous sessions

**Cause:** Admin view filtering out anonymous users

**Solution:**
- Check admin query includes `is_anonymous = TRUE`
- Verify RLS policy allows admin to see all sessions

---

## 📝 Example Implementation

### Complete Flow Example

**1. User visits site (not logged in)**
```typescript
// Auto-generates ID on chat open
const { anonymousId, anonymousName } = initAnonymousChat();
// Result: { anonymousId: "uuid", anonymousName: "Brave Explorer #789" }
```

**2. User opens chat and submits concern**
```typescript
const response = await fetch('/api/chat/request', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    concern: "How do I apply for jobs?",
    anonymousId: anonymousId,
    anonymousName: anonymousName
  })
});

const session = await response.json();
// session.is_anonymous = true
// session.anonymous_name = "Brave Explorer #789"
```

**3. Admin sees request**
```sql
SELECT 
  id,
  is_anonymous,
  anonymous_name,
  concern,
  status
FROM chat_sessions
WHERE status = 'pending'
ORDER BY created_at DESC;

-- Result:
-- | is_anonymous | anonymous_name        | concern                  |
-- |--------------|----------------------|--------------------------|
-- | TRUE         | Brave Explorer #789  | How do I apply for jobs? |
```

**4. Real-time messaging works automatically**
- Anonymous user sends message → Admin receives
- Admin responds → Anonymous user receives
- All via Supabase Realtime

**5. User creates account**
```typescript
// After signup/login
await migrateAnonymousChatToUser(newUserId);
clearAnonymousId();
// Chat history now associated with authenticated user account
```

---

## 🎯 Best Practices

### Development

1. **Always validate anonymous_id** on server
2. **Filter by anonymous_id** in all queries
3. **Don't expose other users' sessions** to anonymous users
4. **Handle localStorage unavailable** gracefully
5. **Log anonymous activity** for security monitoring

### UX

1. **Show clear "anonymous" indicator** in UI
2. **Explain benefits of creating account** (save history)
3. **Offer easy signup/login** from chat
4. **Don't require name** unless user wants to customize
5. **Make it easy to start fresh** (clear ID button)

### Security

1. **Rate limit anonymous requests** more strictly
2. **Monitor for abuse** (spam, harassment)
3. **Clean up old sessions** regularly
4. **Don't store sensitive info** in anonymous chats
5. **Validate all inputs** server-side

---

## 📚 Related Files

- **Migration:** `migrations/002_add_anonymous_chat_support.sql`
- **Service:** `src/lib/db/services/anonymous-chat.service.ts`
- **Utilities:** `src/utils/anonymous-chat.ts`
- **API Routes:** `src/app/api/chat/anonymous-*/route.ts`
- **Component:** `src/components/chat/ChatWidget.tsx` (updated)

---

## 🔮 Future Enhancements

### Potential Features

1. **Custom Anonymous Names**
   - Let users pick their own display name
   - Validate for appropriate content

2. **Session Transfer**
   - QR code to transfer session to mobile
   - Continue chat on different device

3. **Anonymous Chat Limits**
   - Max 3 sessions per day per IP
   - Prevent spam and abuse

4. **Analytics Dashboard**
   - Track anonymous conversion rate
   - Monitor popular questions from anonymous users

5. **Anonymous Feedback**
   - Rate chat experience without account
   - Improve service quality

---

**Document Version:** 1.0  
**Created:** 2024  
**Status:** Implemented and ready for deployment  
**Next Step:** Run migration and test anonymous chat flow