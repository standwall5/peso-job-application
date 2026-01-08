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

## Notes

- Always backup your database before running migrations
- Test migrations in a development/staging environment first
- The `IF NOT EXISTS` / `IF EXISTS` clauses make migrations safe to run multiple times
- All existing applicants will have `is_archived` set to `false` by default