# Auto-Archive System Setup Guide

## Overview
Automatically archive inactive users who haven't logged in for 180 days (6 months).

## What's Been Created

### 1. Service Layer
**File**: `src/lib/db/services/user-archive.service.ts`

**Functions**:
- `autoArchiveInactiveUsers(days)` - Archives users inactive for X days
- `updateLastLogin(userId)` - Updates last_login timestamp
- `getInactiveUsersCount(days)` - Count inactive users
- `getInactiveUsers(days)` - List inactive users for review

### 2. Cron API Endpoint
**File**: `src/app/api/cron/archive-inactive-users/route.ts`

**Endpoint**: `/api/cron/archive-inactive-users`
**Methods**: GET, POST
**Auth**: Optional Bearer token (CRON_SECRET env variable)

## Database Requirements

### Add Required Columns

Run this SQL in Supabase:

```sql
-- Add last_login tracking
ALTER TABLE applicants 
ADD COLUMN IF NOT EXISTS last_login TIMESTAMPTZ;

-- Add archived_at timestamp
ALTER TABLE applicants 
ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_applicants_last_login 
ON applicants(last_login) 
WHERE is_archived = false;

-- Create index for archived users
CREATE INDEX IF NOT EXISTS idx_applicants_archived 
ON applicants(is_archived, archived_at);
```

### Verify Columns Exist

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'applicants' 
AND column_name IN ('last_login', 'archived_at');
```

## Setup Instructions

### Step 1: Update Login Flow

Add last_login tracking when users log in. Update your login handler:

```typescript
// In your login success handler (e.g., after successful auth)
import { updateLastLogin } from "@/lib/db/services/user-archive.service";

// After successful login
const { data: applicant } = await supabase
  .from("applicants")
  .select("id")
  .eq("auth_id", user.id)
  .single();

if (applicant) {
  await updateLastLogin(applicant.id);
}
```

### Step 2: Set Up Cron Job

#### Option A: Vercel Cron Jobs (Recommended for Vercel)

Create `vercel.json` in project root:

```json
{
  "crons": [
    {
      "path": "/api/cron/archive-inactive-users",
      "schedule": "0 2 * * 0"
    }
  ]
}
```

Schedule explanation:
- `0 2 * * 0` = Every Sunday at 2:00 AM
- `0 2 * * *` = Every day at 2:00 AM
- `0 2 1 * *` = First day of each month at 2:00 AM

#### Option B: External Cron Service

Use services like:
- cron-job.org
- EasyCron
- AWS CloudWatch Events
- Google Cloud Scheduler

Configure to call:
```
GET https://your-domain.com/api/cron/archive-inactive-users
```

Add environment variable for security:
```
CRON_SECRET=your-secret-token-here
```

Add header:
```
Authorization: Bearer your-secret-token-here
```

### Step 3: Configure Inactivity Period

Default is 180 days (6 months). To change:

Edit `src/app/api/cron/archive-inactive-users/route.ts`:

```typescript
// Line 22
const INACTIVE_DAYS = 90; // Change to 90 days (3 months)
// or
const INACTIVE_DAYS = 365; // Change to 365 days (1 year)
```

## Testing

### Manual Test (Development)

```bash
# Without auth
curl http://localhost:3000/api/cron/archive-inactive-users

# With auth
curl -H "Authorization: Bearer your-secret" \
     http://localhost:3000/api/cron/archive-inactive-users
```

### Check Inactive Users Count

Create a test script or use SQL:

```sql
-- Count users inactive for 180+ days
SELECT COUNT(*) 
FROM applicants 
WHERE (last_login < NOW() - INTERVAL '180 days' OR last_login IS NULL)
AND is_archived = false;

-- List inactive users
SELECT id, name, email, last_login, 
       COALESCE(
         EXTRACT(day FROM (NOW() - last_login)), 
         999
       ) as days_inactive
FROM applicants 
WHERE (last_login < NOW() - INTERVAL '180 days' OR last_login IS NULL)
AND is_archived = false
ORDER BY last_login ASC NULLS FIRST
LIMIT 10;
```

## Admin UI (Optional)

You can create an admin page to:
- View inactive users list
- Manually trigger archiving
- Adjust inactivity threshold
- View archiving logs

Example admin action:

```typescript
"use server";

import { 
  getInactiveUsers, 
  getInactiveUsersCount,
  autoArchiveInactiveUsers 
} from "@/lib/db/services/user-archive.service";

export async function getInactiveUsersAction(days: number = 180) {
  try {
    return await getInactiveUsers(days);
  } catch (error) {
    console.error("Failed to get inactive users:", error);
    return [];
  }
}

export async function triggerAutoArchiveAction(days: number = 180) {
  try {
    return await autoArchiveInactiveUsers(days);
  } catch (error) {
    console.error("Failed to auto-archive:", error);
    throw error;
  }
}
```

## Monitoring

### Check Last Run

Create a logs table (optional):

```sql
CREATE TABLE IF NOT EXISTS archive_logs (
  id SERIAL PRIMARY KEY,
  run_at TIMESTAMPTZ DEFAULT NOW(),
  archived_count INTEGER,
  errors TEXT[],
  duration_ms INTEGER
);
```

Update route to log:

```typescript
// In route.ts, after archiving
await supabase.from("archive_logs").insert({
  archived_count: result.archived,
  errors: result.errors,
  duration_ms: Date.now() - startTime
});
```

### View Logs

```sql
SELECT * FROM archive_logs 
ORDER BY run_at DESC 
LIMIT 10;
```

## Best Practices

1. **Start Conservative**: Use 365 days initially, then reduce if needed
2. **Monitor First**: Run manually a few times before automating
3. **Backup Data**: Ensure archived users can be restored if needed
4. **Notify Users**: Consider emailing users before archiving (30 days warning)
5. **Test Thoroughly**: Test on staging environment first

## Troubleshooting

### Users Not Being Archived

- Check if `last_login` column exists
- Verify `is_archived` defaults to false
- Check cron job is actually running
- Review logs for errors

### Cron Job Not Running

- Verify `vercel.json` is committed
- Check Vercel dashboard > Project > Settings > Cron Jobs
- Ensure endpoint is accessible
- Check CRON_SECRET matches

### Too Many/Few Users Archived

- Adjust `INACTIVE_DAYS` value
- Check `last_login` is being updated on login
- Review inactive users list before running

## Security Considerations

1. **Auth Token**: Always use CRON_SECRET in production
2. **Rate Limiting**: Consider adding rate limiting to prevent abuse
3. **Logging**: Log all archive actions with timestamps
4. **Restore Process**: Have a process to unarchive users if needed

## Unarchive Process

To manually unarchive a user:

```sql
UPDATE applicants 
SET is_archived = false, 
    archived_at = NULL 
WHERE id = <user_id>;
```

Or create a service function:

```typescript
export async function unarchiveUser(userId: number): Promise<void> {
  const supabase = await getSupabaseClient();
  
  await supabase
    .from("applicants")
    .update({
      is_archived: false,
      archived_at: null,
      last_login: new Date().toISOString() // Reset login time
    })
    .eq("id", userId);
}
```

## Summary

- ✅ Service functions created
- ✅ Cron API endpoint ready
- ⏸️ Database columns need to be added
- ⏸️ Login flow needs last_login tracking
- ⏸️ Cron job needs to be configured
- ⏸️ Testing required

**Recommended Timeline**: 180 days (6 months) of inactivity
**Recommended Schedule**: Weekly on Sundays at 2 AM

Done! 🎉