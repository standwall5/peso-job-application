# API & Database Quick Reference

This document provides a quick reference for API endpoints and database schema used in the PESO Job Application System.

---

## API Endpoints

### Authentication & User
- `GET /api/user/verification-status` - Get user's ID verification status
- `POST /api/user/set-preferred-id` - Set user's preferred ID type
- `GET /api/user/id-documents` - Get all user ID documents

### Admin - ID Management
- `GET /api/admin/view-id?applicantId=...&imageType=...&applicationId=...` - View watermarked ID image
- `POST /api/admin/verify-id` - Mark applicant ID as verified (TO IMPLEMENT)
- `POST /api/admin/request-id-change` - Request ID update from applicant (TO IMPLEMENT)

### Admin - Chat
- `GET /api/admin/chat/requests` - Get pending chat requests
- `POST /api/admin/chat/accept` - Accept chat session
- `POST /api/admin/chat/close` - Close chat session
- `GET /api/admin/chat/messages/[chatId]` - Get chat messages
- `POST /api/admin/chat/messages` - Send admin message

### Chat (User)
- `GET /api/chat/active-session` - Get user's active chat session
- `POST /api/chat/request` - Create new chat request
- `GET /api/chat/messages?chatId=...` - Get chat messages
- `POST /api/chat/messages` - Send user message
- `POST /api/chat/close` - Close chat session
- `GET /api/chat/faqs` - Get FAQ list
- `GET /api/chat/history` - Get chat history

### Notifications
- `GET /api/notifications` - Get user notifications
- `POST /api/notifications/mark-read` - Mark notification(s) as read
- `DELETE /api/notifications?id=...` - Delete notification

### Archive
- `POST /api/archiveJobseeker` - Archive/unarchive jobseeker
- `POST /api/archiveCompany` - Archive/unarchive company (TO VERIFY)

### Cron Jobs
- `GET /api/cron/chat-timeout` - Auto-close inactive chat sessions

---

## Database Schema

### `applicants`
Main user profile table
```sql
- id (integer, PK)
- auth_id (uuid, references auth.users)
- first_name (text)
- middle_name (text)
- last_name (text)
- email (text)
- phone (text)
- birth_date (date)
- address (text)
- city (text)
- province (text)
- applicant_type (text)
- is_archived (boolean)
- created_at (timestamp)
- updated_at (timestamp)
```

### `applicant_ids`
ID verification documents
```sql
- id (integer, PK)
- applicant_id (integer, FK → applicants.id)
- id_type (text) -- e.g., "Driver's License", "National ID"
- id_number (text)
- id_front_url (text) -- Storage path
- id_back_url (text) -- Storage path
- selfie_with_id_url (text) -- Storage path
- is_verified (boolean) -- ADD THIS
- verified_by (integer, FK → peso.id) -- ADD THIS
- verified_at (timestamp) -- ADD THIS
- status (text) -- 'pending', 'approved', 'rejected' -- ADD THIS
- rejection_reason (text) -- ADD THIS
- rejected_by (integer, FK → peso.id) -- ADD THIS
- rejected_at (timestamp) -- ADD THIS
- is_preferred (boolean) -- ADD THIS
- created_at (timestamp)
- updated_at (timestamp)
```

### `id_view_logs`
Audit trail for ID document views
```sql
- id (integer, PK)
- applicant_id (integer, FK → applicants.id)
- admin_id (integer, FK → peso.id)
- application_id (integer, nullable)
- ip_address (text)
- user_agent (text)
- image_type (text) -- 'front', 'back', 'selfie'
- viewed_at (timestamp, default: now())
```

### `id_verification_logs`
Audit trail for ID verification actions (TO CREATE)
```sql
- id (integer, PK)
- applicant_id (integer, FK → applicants.id)
- admin_id (integer, FK → peso.id)
- application_id (integer, nullable)
- action (text) -- 'verified', 'rejected', 'updated'
- reason (text, nullable)
- timestamp (timestamp, default: now())
```

### `notifications`
User notifications
```sql
- id (integer, PK)
- applicant_id (integer, FK → applicants.id)
- type (text) -- 'referred', 'rejected', 'id_verified', 'application_completed', 'id_change_required'
- title (text)
- message (text)
- link (text, nullable)
- is_read (boolean, default: false)
- is_archived (boolean, default: false)
- job_id (integer, nullable)
- job_title (text, nullable)
- company_name (text, nullable)
- company_logo (text, nullable)
- created_at (timestamp, default: now())
```

### `peso`
Admin/staff accounts
```sql
- id (integer, PK)
- auth_id (uuid, references auth.users)
- name (text)
- email (text)
- role (text) -- 'admin', 'super_admin'
- is_archived (boolean)
- created_at (timestamp)
- updated_at (timestamp)
```

### `admin_presence`
Admin online status tracking (TO CREATE)
```sql
- id (integer, PK)
- admin_id (integer, FK → peso.id, UNIQUE)
- is_online (boolean, default: false)
- last_seen (timestamp, default: now())
```

### `chat_sessions`
Chat conversation sessions
```sql
- id (text, PK)
- user_id (integer, FK → applicants.id)
- admin_id (integer, FK → peso.id, nullable)
- status (text) -- 'pending', 'active', 'closed'
- concern (text, nullable)
- created_at (timestamp, default: now())
- updated_at (timestamp)
- closed_at (timestamp, nullable)
- last_user_message_at (timestamp, nullable)
```

### `chat_messages`
Individual chat messages
```sql
- id (integer, PK)
- chat_session_id (text, FK → chat_sessions.id)
- sender (text) -- 'user', 'admin', 'bot'
- message (text)
- read_by_user (boolean, default: false)
- created_at (timestamp, default: now())
```

### `companies`
Company/employer profiles
```sql
- id (integer, PK)
- name (text)
- logo (text)
- description (text)
- industry (text)
- website (text)
- email (text)
- phone (text)
- address (text)
- is_archived (boolean, default: false) -- VERIFY THIS EXISTS
- created_at (timestamp)
- updated_at (timestamp)
```

### `jobs`
Job postings
```sql
- id (integer, PK)
- company_id (integer, FK → companies.id)
- title (text)
- description (text)
- requirements (text)
- salary_range (text)
- employment_type (text) -- 'full-time', 'part-time', 'contract'
- location (text)
- slots (integer)
- status (text) -- 'active', 'closed'
- created_at (timestamp)
- updated_at (timestamp)
```

### `applications`
Job applications
```sql
- id (integer, PK)
- job_id (integer, FK → jobs.id)
- applicant_id (integer, FK → applicants.id)
- status (text) -- 'pending', 'referred', 'rejected', 'accepted'
- applied_at (timestamp, default: now())
- updated_at (timestamp)
```

---

## Supabase Storage Buckets

### `applicant-ids`
Stores ID verification images
- Path structure: `{applicant_id}/{id_type}/{filename}`
- Access: Private (requires authentication)
- File types: JPEG, PNG, WebP

### `resumes`
Stores applicant resumes
- Path structure: `{applicant_id}/{filename}`
- Access: Private
- File types: PDF, DOC, DOCX

### `company-logos`
Stores company logos
- Path structure: `{company_id}/{filename}`
- Access: Public
- File types: JPEG, PNG, SVG

---

## Notification Types

### `referred`
Applicant referred to employer
- Title: "Application Referred! 🎉"
- Link: `/profile?tab=applications`

### `rejected`
Application reviewed/rejected
- Title: "Application Update"
- Link: `/profile?tab=applications`

### `id_verified`
ID successfully verified
- Title: "ID Verified Successfully ✓"
- Link: `/profile`

### `application_completed`
Application successfully submitted
- Title: "Application Submitted! 📄"
- Link: `/profile?tab=applications`

### `id_change_required`
Admin requests ID update
- Title: "ID Update Required ⚠️"
- Link: `/profile?tab=viewId`

---

## Chat Workflow

1. **User initiates chat:**
   - POST `/api/chat/request` with concern
   - Creates `chat_sessions` record with status='pending'

2. **Admin accepts:**
   - Admin sees request in admin panel
   - POST `/api/admin/chat/accept`
   - Updates status='active'

3. **Messaging:**
   - User: POST `/api/chat/messages`
   - Admin: POST `/api/admin/chat/messages`
   - Both use Supabase Realtime for live updates

4. **Auto-timeout:**
   - After 2 minutes of inactivity
   - Cron job or client-side check
   - Updates status='closed'

5. **Manual close:**
   - Either party can close
   - POST `/api/chat/close` or `/api/admin/chat/close`

---

## Business Rules

### Working Hours
- **Office Hours:** Monday-Friday, 8:00 AM - 5:00 PM (Philippine Time)
- **Chatbot Active:** Outside office hours
- **Admin Chat:** During office hours only

### Chat Timeout
- **Inactivity Period:** 2 minutes
- **Action:** Auto-close session
- **Message:** "This chat has been closed due to inactivity"

### ID Verification
- **Statuses:** pending → approved/rejected
- **Watermark:** Required when admin views ID
- **Audit:** All views logged in `id_view_logs`

### Notifications
- **Delivery:** Instant via Supabase
- **Read Status:** Tracked per notification
- **Archive:** Soft delete (is_archived=true)

---

## Environment Variables

Required in `.env.local` and Vercel:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Email Service (if using Resend)
RESEND_API_KEY=

# Optional
NEXT_PUBLIC_APP_URL=
NODE_ENV=production
```

---

## Realtime Subscriptions

Enable realtime for these tables in Supabase:

```sql
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE chat_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE admin_presence;
```

---

## Common Queries

### Get unread notifications for user
```typescript
const { data } = await supabase
  .from('notifications')
  .select('*')
  .eq('applicant_id', userId)
  .eq('is_read', false)
  .eq('is_archived', false)
  .order('created_at', { ascending: false });
```

### Get active chat session
```typescript
const { data } = await supabase
  .from('chat_sessions')
  .select('*')
  .eq('user_id', userId)
  .in('status', ['pending', 'active'])
  .order('created_at', { ascending: false })
  .limit(1)
  .maybeSingle();
```

### Get applicant with verified ID
```typescript
const { data } = await supabase
  .from('applicants')
  .select(`
    *,
    applicant_ids!inner (
      *
    )
  `)
  .eq('id', applicantId)
  .eq('applicant_ids.is_verified', true)
  .single();
```

---

**Last Updated:** 2024