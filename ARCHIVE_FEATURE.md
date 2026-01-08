# Archive Jobseekers Feature

## Overview

This document describes the implementation of the archive jobseekers feature, which allows admin users to archive and unarchive jobseekers through a dedicated interface.

## Changes Made

### 1. Database Changes

**File:** `migrations/add_is_archived_to_applicants.sql`

Added `is_archived` boolean column to the `applicants` table:
- Default value: `false`
- Indexed for query performance
- Includes column documentation

**To apply this migration:**
1. Open Supabase SQL Editor
2. Run the migration script
3. See `migrations/README.md` for detailed instructions

### 2. Sidebar Updates

**File:** `src/app/admin/components/Sidebar.tsx`

- Changed "Dashboard" from a single menu item to a dropdown menu
- Added two submenu items:
  - "Jobseekers" → `/admin/jobseekers`
  - "Archived Jobseekers" → `/admin/archived-jobseekers`
- Used the commented-out dropdown styling that was already in the code

### 3. API Endpoints

#### Archive/Unarchive Endpoint

**File:** `src/app/api/archiveJobseeker/route.ts`

New POST endpoint to archive or unarchive jobseekers:
- Accepts `applicantId` and `isArchived` in request body
- Updates the `is_archived` field in the `applicants` table
- Returns success/error response

**Usage:**
```javascript
fetch("/api/archiveJobseeker", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    applicantId: 123,
    isArchived: true  // or false to unarchive
  })
});
```

#### Get Jobseekers with Archive Filter

**File:** `src/app/api/getJobseekers/route.ts`

Updated to support filtering by archived status:
- Accepts `?archived=true` query parameter
- Defaults to showing non-archived jobseekers (archived=false)
- Filters applicants based on their `is_archived` status

**Usage:**
```javascript
// Get non-archived (active) jobseekers
fetch("/api/getJobseekers")

// Get archived jobseekers
fetch("/api/getJobseekers?archived=true")
```

### 4. Jobseekers Page Updates

**File:** `src/app/admin/jobseekers/components/Jobseekers.tsx`

- Removed the tabs (Active/Archived) since archived jobseekers are now on a separate page
- Implemented the archive API call in `handleConfirmArchive`
- Now only displays active (non-archived) jobseekers

### 5. New Archived Jobseekers Page

**Files:**
- `src/app/admin/archived-jobseekers/page.tsx`
- `src/app/admin/archived-jobseekers/components/ArchivedJobseekers.tsx`
- `src/app/admin/archived-jobseekers/hooks/useArchivedJobseekerData.ts`

New dedicated page for viewing and managing archived jobseekers:
- Displays only archived jobseekers
- Shows unarchive button instead of archive button
- Includes unarchive confirmation modal
- Reuses existing components (JobseekerTable, JobseekerSearchBar, etc.)

### 6. Shared Component Updates

#### JobseekerTable

**File:** `src/app/admin/jobseekers/components/list/JobseekerTable.tsx`

Added `isArchived` prop:
- Changes header from "ARCHIVE" to "UNARCHIVE" when `isArchived={true}`
- Shows different icon (restore arrow vs archive box)
- Updates button tooltip text

#### JobseekerStatsHeader

**File:** `src/app/admin/jobseekers/components/list/JobseekerStatsHeader.tsx`

Added `isArchived` prop:
- Changes "TOTAL JOBSEEKERS" to "TOTAL ARCHIVED JOBSEEKERS" when archived
- Hides "ACTIVE APPLICATIONS" count on archived page

## User Flow

### Archiving a Jobseeker

1. Admin navigates to **Dashboard → Jobseekers**
2. Clicks the archive icon (box with down arrow) for a jobseeker
3. Confirms the action in the modal
4. Jobseeker is moved to the archived list
5. Page refreshes to show updated list

### Unarchiving a Jobseeker

1. Admin navigates to **Dashboard → Archived Jobseekers**
2. Clicks the unarchive icon (left arrow) for a jobseeker
3. Confirms the action in the modal
4. Jobseeker is restored to the active list
5. Page refreshes to show updated list

## Technical Details

### Data Flow

```
[Admin Action] → [Confirmation Modal] → [API Call] → [Database Update] → [Page Refresh]
```

### Archive Status Logic

- When `is_archived = false`: Jobseeker appears in `/admin/jobseekers`
- When `is_archived = true`: Jobseeker appears in `/admin/archived-jobseekers`
- The API endpoint filters based on this field

### Component Reusability

The archived jobseekers page reuses most components from the regular jobseekers page:
- `JobseekerTable` (with `isArchived` prop)
- `JobseekerStatsHeader` (with `isArchived` prop)
- `JobseekerSearchBar`
- `JobseekerSortDropdown`
- `ManageJobseeker` (for viewing details)
- `BackButton`

## Testing Checklist

- [ ] Run the database migration in Supabase
- [ ] Verify the `is_archived` column exists in `applicants` table
- [ ] Test archiving a jobseeker from the active list
- [ ] Verify archived jobseeker appears in the Archived Jobseekers page
- [ ] Verify archived jobseeker disappears from the active Jobseekers page
- [ ] Test unarchiving a jobseeker from the archived list
- [ ] Verify unarchived jobseeker returns to the active list
- [ ] Test search functionality on both pages
- [ ] Test sorting on both pages
- [ ] Test pagination on both pages
- [ ] Verify the sidebar dropdown works correctly
- [ ] Test viewing jobseeker details from both pages

## Future Enhancements

Potential improvements for consideration:

1. **Bulk Operations:** Archive/unarchive multiple jobseekers at once
2. **Archive Reasons:** Add optional reason field when archiving
3. **Archive Date:** Track when a jobseeker was archived
4. **Soft Delete vs Archive:** Consider if archived jobseekers should be excluded from certain queries
5. **Notifications:** Notify admin users when jobseekers are archived/unarchived
6. **Audit Log:** Track who archived/unarchived which jobseekers and when

## Notes

- Archiving a jobseeker does NOT delete their data or applications
- Archived jobseekers can still be viewed in detail
- The archive status is independent of application status
- All existing jobseekers will default to `is_archived = false` after migration