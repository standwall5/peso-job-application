# Database Migrations

This folder contains SQL migration scripts for the PESO Job Application database.

## Running Migrations

These migrations need to be run in your Supabase database.

### Option 1: Via Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy the contents of the migration file
4. Paste and execute the SQL

### Option 2: Via Supabase CLI

```bash
supabase db push
```

## Available Migrations

### `add_id_change_logs_table.sql`

**Purpose:** Creates an audit trail system for tracking all changes to applicant ID documents.

**Changes:**
- Creates `id_change_logs` table to track ID uploads and updates
- Adds indexes for query performance on `applicant_id`, `application_id`, `changed_at`, and `change_type`
- Creates helper functions:
  - `get_id_change_count_for_application(app_id)` - Returns count of ID changes for an application
  - `was_id_changed_after_submission(app_id)` - Checks if ID was modified after application submission
- Supports tracking of:
  - Initial uploads
  - Updates to existing IDs
  - Changes to ID type
  - IP address and user agent for security
  - Links to specific applications when changed post-submission

**How to run:**
1. Open the Supabase SQL Editor
2. Copy and paste the contents of `add_id_change_logs_table.sql`
3. Click "Run" to execute

**Rollback (if needed):**
See the commented rollback section at the end of the migration file.

**Use Cases:**
- Admin oversight of ID changes on submitted applications
- Audit trail for compliance
- Fraud detection and prevention
- User accountability

### `add_is_archived_to_applicants.sql`

**Purpose:** Adds an `is_archived` column to the `applicants` table to support archiving jobseekers.

**Changes:**
- Adds `is_archived` boolean column (default: `false`)
- Creates an index on `is_archived` for query performance
- Adds column documentation

**How to run:**
1. Open the Supabase SQL Editor
2. Copy and paste the contents of `add_is_archived_to_applicants.sql`
3. Click "Run" to execute

**Rollback (if needed):**
```sql
-- Remove the index
DROP INDEX IF EXISTS idx_applicants_is_archived;

-- Remove the column
ALTER TABLE applicants DROP COLUMN IF EXISTS is_archived;
```

### `003_allow_admin_initiate_chat.sql` ⭐ **REQUIRED FOR ADMIN CHAT**

**Purpose:** Sets up comprehensive RLS (Row-Level Security) policies for `chat_sessions` table to enable admin-initiated chats.

**Changes:**
- Enables RLS on `chat_sessions` table
- Creates SELECT policy: Applicants can view their own sessions, admins can view all
- Creates INSERT policy: Applicants can create their own sessions, admins can create sessions for any applicant
- Creates UPDATE policy: Admins can update any session (accept requests, change status, close chats)
- Drops all existing conflicting policies for clean setup

**How to run:**
1. Open the Supabase SQL Editor
2. Copy and paste the contents of `003_allow_admin_initiate_chat.sql`
3. Click "Run" to execute
4. **Verify success:** Should see "Success. No rows returned"

**⚠️ IMPORTANT:** This migration is required to fix the error:
```
Error creating chat session: new row violates row-level security policy
```

**Use Cases:**
- Admin can proactively reach out to jobseekers via "Message Jobseeker" button
- Admin can initiate support conversations
- Admin can create chat sessions with applicants directly from the admin panel

**After running this migration:**
- ✅ Admins can create chat sessions with `admin_id` set
- ✅ Chat sessions will automatically be in `active` status when admin-initiated
- ✅ Users will receive notifications when admins message them
- ✅ No more RLS policy errors

---

### `004_chat_messages_rls_policies.sql` ⭐ **REQUIRED FOR ADMIN CHAT**

**Purpose:** Sets up comprehensive RLS policies for `chat_messages` table to allow proper message viewing and sending.

**Changes:**
- Enables RLS on `chat_messages` table
- Creates SELECT policy: Applicants can view messages from their sessions, admins can view all
- Creates INSERT policy: Applicants can send messages in their sessions, admins can send to any session
- Creates UPDATE policy: Both admins and users can update messages (for read receipts)
- Ensures admin-initiated chat messages are properly accessible

**How to run:**
1. Open the Supabase SQL Editor
2. Copy and paste the contents of `004_chat_messages_rls_policies.sql`
3. Click "Run" to execute
4. **Verify success:** Should see "Success. No rows returned"

**⚠️ IMPORTANT:** Run this migration AFTER `003_allow_admin_initiate_chat.sql`

**After running this migration:**
- ✅ Applicants can view and send messages in their chat sessions
- ✅ Admins can view and send messages in any chat session
- ✅ Messages are properly marked as read/unread
- ✅ Real-time message subscriptions work correctly

---

### 🚀 **Quick Setup Guide for Admin Chat Feature**

To enable the complete admin-initiated chat feature:

1. **Run Migration 003:**
   - Open Supabase SQL Editor
   - Execute `003_allow_admin_initiate_chat.sql`
   - Verify: "Success. No rows returned"

2. **Run Migration 004:**
   - Execute `004_chat_messages_rls_policies.sql`
   - Verify: "Success. No rows returned"

3. **Test the Feature:**
   - Log in as admin
   - Navigate to a jobseeker's profile
   - Click "Message Jobseeker" button
   - Chat widget should open without errors
   - Send a message
   - User should see notification badge on their chat button

4. **Troubleshooting:**
   - If you get RLS errors, verify both migrations ran successfully
   - Check policies: `SELECT * FROM pg_policies WHERE tablename IN ('chat_sessions', 'chat_messages');`
   - Ensure your admin account exists in the `peso` table

## Notes

- Always backup your database before running migrations
- Test migrations in a development/staging environment first
- The `IF NOT EXISTS` / `IF EXISTS` clauses make migrations safe to run multiple times
- All existing applicants will have `is_archived` set to `false` by default