# PESO Job Application System - Implementation Guide

This guide provides detailed instructions for completing the remaining TODO items in the PESO Job Application System.

## Table of Contents
1. [Archived Companies](#1-archived-companies)
2. [ID Verification Workflow](#2-id-verification-workflow)
3. [ID Change Notification](#3-id-change-notification)
4. [User ID Selection](#4-user-id-selection)
5. [Jobseekers Table Cleanup](#5-jobseekers-table-cleanup)
6. [Email Notifications](#6-email-notifications)
7. [Admin Online Status](#7-admin-online-status)
8. [Chat System Verification](#8-chat-system-verification)
9. [Chatbot Configuration](#9-chatbot-configuration)
10. [Complete Notification Integration](#10-complete-notification-integration)

---

## 1. Archived Companies

**Location:** Create new directory at `/src/app/admin/archived-companies/`

### Files to Create:

#### `/src/app/admin/archived-companies/page.tsx`
```typescript
import ArchivedCompanies from "./components/ArchivedCompanies";

export default function ArchivedCompaniesPage() {
  return <ArchivedCompanies />;
}
```

#### `/src/app/admin/archived-companies/components/ArchivedCompanies.tsx`
```typescript
"use client";

import { useState, useEffect } from "react";
import styles from "@/app/admin/company-profiles/components/CompanyProfiles.module.css";

// Reference the archived-jobseekers implementation:
// /src/app/admin/archived-jobseekers/components/ArchivedJobseekers.tsx

export default function ArchivedCompanies() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch archived companies from Supabase
  // Similar pattern to useArchivedJobseekerData hook

  // Implement unarchive functionality
  // Button to restore companies to active status

  return (
    <section className={styles.companies}>
      {/* Company list with unarchive option */}
    </section>
  );
}
```

### Database Considerations:
- Ensure `companies` table has `is_archived` boolean field
- Create API route: `/src/app/api/archiveCompany/route.ts` (may already exist)

### Navigation:
- Add "Archived Companies" link in admin navigation menu
- Location: `/src/components/AdminNavbar.tsx` or similar

---

## 2. ID Verification Workflow

**Files to Modify:**
- `/src/components/admin/IDViewModal.tsx` (or create if doesn't exist)
- Create API route: `/src/app/api/admin/verify-id/route.ts`

### Step 1: Create Verify ID API Route

**File:** `/src/app/api/admin/verify-id/route.ts`
```typescript
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createIdVerificationNotification } from "@/lib/db/services/notification.service";

export async function POST(req: Request) {
  const supabase = await createClient();
  const body = await req.json();
  const { applicantId, applicationId } = body;

  // Verify admin authentication
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: admin } = await supabase
    .from("peso")
    .select("id")
    .eq("auth_id", user.id)
    .single();

  if (!admin) {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  try {
    // Update applicant_ids table to mark as verified
    const { error: updateError } = await supabase
      .from("applicant_ids")
      .update({
        is_verified: true,
        verified_by: admin.id,
        verified_at: new Date().toISOString(),
      })
      .eq("applicant_id", applicantId);

    if (updateError) throw updateError;

    // Create notification for applicant
    await createIdVerificationNotification(applicantId);

    // Log the verification action
    await supabase.from("id_verification_logs").insert({
      applicant_id: applicantId,
      admin_id: admin.id,
      action: "verified",
      application_id: applicationId,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error verifying ID:", error);
    return NextResponse.json({ error: "Failed to verify ID" }, { status: 500 });
  }
}
```

### Step 2: Update ID View Modal

Add "Verify ID" button to the modal that displays ID images:

```typescript
// In IDViewModal component
const handleVerifyID = async () => {
  try {
    const response = await fetch("/api/admin/verify-id", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        applicantId: applicant.id,
        applicationId: application?.id,
      }),
    });

    if (response.ok) {
      alert("ID verified successfully!");
      onClose();
      // Refresh parent component
    }
  } catch (error) {
    console.error("Error verifying ID:", error);
    alert("Failed to verify ID");
  }
};

// Add button in modal:
<button onClick={handleVerifyID} className={styles.verifyButton}>
  ✓ Mark ID as Verified
</button>
```

### Database Schema Check:
Ensure `applicant_ids` table has these fields:
- `is_verified` (boolean, default false)
- `verified_by` (integer, references peso.id)
- `verified_at` (timestamp)

---

## 3. ID Change Notification

**Files to Modify:**
- Create API route: `/src/app/api/admin/request-id-change/route.ts`
- Update ID View Modal to include "Request ID Update" button

### Step 1: Create Request ID Change API Route

**File:** `/src/app/api/admin/request-id-change/route.ts`
```typescript
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createIdChangeNotification } from "@/lib/db/services/notification.service";

export async function POST(req: Request) {
  const supabase = await createClient();
  const body = await req.json();
  const { applicantId, reason } = body;

  // Verify admin authentication
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: admin } = await supabase
    .from("peso")
    .select("id, name")
    .eq("auth_id", user.id)
    .single();

  if (!admin) {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  try {
    // Mark current ID as rejected/needs update
    const { error: updateError } = await supabase
      .from("applicant_ids")
      .update({
        status: "rejected",
        rejection_reason: reason,
        rejected_by: admin.id,
        rejected_at: new Date().toISOString(),
      })
      .eq("applicant_id", applicantId);

    if (updateError) throw updateError;

    // Send notification to applicant
    await createIdChangeNotification(applicantId, reason);

    // Log the action
    await supabase.from("id_verification_logs").insert({
      applicant_id: applicantId,
      admin_id: admin.id,
      action: "rejected",
      reason: reason,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error requesting ID change:", error);
    return NextResponse.json({ error: "Failed to request ID change" }, { status: 500 });
  }
}
```

### Step 2: Add Rejection UI to ID View Modal

```typescript
// In IDViewModal component
const [showRejectForm, setShowRejectForm] = useState(false);
const [rejectionReason, setRejectionReason] = useState("");

const handleRequestIDChange = async () => {
  if (!rejectionReason.trim()) {
    alert("Please provide a reason for ID update request");
    return;
  }

  try {
    const response = await fetch("/api/admin/request-id-change", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        applicantId: applicant.id,
        reason: rejectionReason,
      }),
    });

    if (response.ok) {
      alert("ID update request sent to applicant");
      setShowRejectForm(false);
      setRejectionReason("");
      onClose();
    }
  } catch (error) {
    console.error("Error requesting ID change:", error);
    alert("Failed to send ID update request");
  }
};

// Add to modal UI:
{showRejectForm ? (
  <div className={styles.rejectForm}>
    <textarea
      value={rejectionReason}
      onChange={(e) => setRejectionReason(e.target.value)}
      placeholder="Enter reason for ID update request..."
      className={styles.reasonTextarea}
    />
    <div className={styles.rejectActions}>
      <button onClick={handleRequestIDChange} className={styles.confirmButton}>
        Send Request
      </button>
      <button onClick={() => setShowRejectForm(false)} className={styles.cancelButton}>
        Cancel
      </button>
    </div>
  </div>
) : (
  <button onClick={() => setShowRejectForm(true)} className={styles.rejectButton}>
    ⚠️ Request ID Update
  </button>
)}
```

### Database Schema Update:
Add to `applicant_ids` table:
- `status` (enum: 'pending', 'approved', 'rejected', default: 'pending')
- `rejection_reason` (text, nullable)
- `rejected_by` (integer, references peso.id, nullable)
- `rejected_at` (timestamp, nullable)

---

## 4. User ID Selection

**Files to Modify:**
- `/src/app/(user)/profile/components/sections/ViewIdSection.tsx`
- Create/update components in `/src/components/verified-id/`

### Implementation Steps:

1. **Add ID Type Selection Dropdown**
```typescript
// In ViewIdSection.tsx
const [selectedIdType, setSelectedIdType] = useState<string>("");
const [availableIds, setAvailableIds] = useState<any[]>([]);

useEffect(() => {
  fetchUserIds();
}, []);

const fetchUserIds = async () => {
  const response = await fetch("/api/user/id-documents");
  const data = await response.json();
  setAvailableIds(data.ids);
  setSelectedIdType(data.preferred_id_type || data.ids[0]?.id_type);
};

const handleSavePreferredId = async () => {
  await fetch("/api/user/set-preferred-id", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id_type: selectedIdType }),
  });
  alert("Preferred ID updated successfully");
};

return (
  <div>
    <label>Select ID Type for Verification:</label>
    <select value={selectedIdType} onChange={(e) => setSelectedIdType(e.target.value)}>
      {availableIds.map((id) => (
        <option key={id.id_type} value={id.id_type}>
          {id.id_type}
        </option>
      ))}
    </select>
    <button onClick={handleSavePreferredId}>Save Preferred ID</button>
  </div>
);
```

2. **Create API Routes**

**File:** `/src/app/api/user/set-preferred-id/route.ts`
```typescript
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(req: Request) {
  const supabase = await createClient();
  const { id_type } = await req.json();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: applicant } = await supabase
    .from("applicants")
    .select("id")
    .eq("auth_id", user.id)
    .single();

  if (!applicant) {
    return NextResponse.json({ error: "Applicant not found" }, { status: 404 });
  }

  // Update preferred ID type
  const { error } = await supabase
    .from("applicant_ids")
    .update({ is_preferred: false })
    .eq("applicant_id", applicant.id);

  const { error: updateError } = await supabase
    .from("applicant_ids")
    .update({ is_preferred: true })
    .eq("applicant_id", applicant.id)
    .eq("id_type", id_type);

  if (updateError) {
    return NextResponse.json({ error: "Failed to update preferred ID" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
```

### Database Schema Update:
Add to `applicant_ids` table:
- `is_preferred` (boolean, default: false)

Or create new field in `applicants` table:
- `preferred_id_type` (text, nullable)

---

## 5. Jobseekers Table Cleanup

**File to Modify:** `/src/app/admin/jobseekers/components/list/JobseekerTable.tsx`

### Current Issue:
When clicking on an applicant, an expandable row shows applied jobs. This may not be needed.

### Solution:
Comment out the expanded row functionality:

```typescript
// In JobseekerTable.tsx

// Comment out the expanded row state and handlers:
// const [expandedApplicantId, setExpandedApplicantId] = useState<number | null>(null);
// const [appliedJobs, setAppliedJobs] = useState<JobApplication[]>([]);

// Comment out the toggle function:
// const handleRowClick = async (applicantId: number) => { ... }

// Comment out the expanded row rendering in the return statement:
// {expandedApplicantId === app.applicant.id && (
//   <tr className={styles.expandedRow}>
//     ...
//   </tr>
// )}

// Keep only the main row:
<tr key={app.id} className={styles.tableRow}>
  {/* ... existing cells ... */}
</tr>
```

**Alternative:** Create a toggle in admin settings to enable/disable this feature.

---

## 6. Email Notifications

**Files to Check:**
- Email service configuration
- Super admin creation flow
- Email templates

### Verification Steps:

1. **Check Email Service Setup:**
   - Look for Supabase email templates
   - Check for Resend/SendGrid/NodeMailer configuration
   - Location: `/src/lib/email/` or environment variables

2. **Test Super Admin Creation:**
   - File: Look for super admin creation in `/src/app/admin/` or `/src/app/api/admin/`
   - Verify email trigger exists
   - Check email template content

3. **Create Email Service (if missing):**

**File:** `/src/lib/email/emailService.ts`
```typescript
import { createClient } from "@/utils/supabase/server";

export async function sendAdminWelcomeEmail(
  adminEmail: string,
  adminName: string,
  tempPassword: string
) {
  const supabase = await createClient();
  
  // Use Supabase's built-in email or external service
  // Example with Resend:
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: "PESO <noreply@peso.gov.ph>",
      to: adminEmail,
      subject: "Welcome to PESO Admin Panel",
      html: `
        <h1>Welcome ${adminName}!</h1>
        <p>Your admin account has been created.</p>
        <p>Temporary Password: <strong>${tempPassword}</strong></p>
        <p>Please change your password after first login.</p>
      `,
    }),
  });

  return response.ok;
}
```

---

## 7. Admin Online Status

**Implementation:** Use Supabase Realtime for presence tracking

### Step 1: Create Presence Table

```sql
-- In Supabase SQL Editor
CREATE TABLE admin_presence (
  id SERIAL PRIMARY KEY,
  admin_id INTEGER REFERENCES peso(id),
  is_online BOOLEAN DEFAULT false,
  last_seen TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(admin_id)
);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE admin_presence;
```

### Step 2: Update Admin Session

**File:** Create `/src/hooks/useAdminPresence.ts`
```typescript
"use client";

import { useEffect } from "react";
import { createClient } from "@/utils/supabase/client";

export function useAdminPresence(adminId: number) {
  useEffect(() => {
    const supabase = createClient();
    
    // Set online when component mounts
    const setOnline = async () => {
      await supabase
        .from("admin_presence")
        .upsert({
          admin_id: adminId,
          is_online: true,
          last_seen: new Date().toISOString(),
        });
    };

    // Set offline when component unmounts or page closes
    const setOffline = async () => {
      await supabase
        .from("admin_presence")
        .update({
          is_online: false,
          last_seen: new Date().toISOString(),
        })
        .eq("admin_id", adminId);
    };

    setOnline();

    // Update presence every 30 seconds
    const interval = setInterval(() => {
      supabase
        .from("admin_presence")
        .update({ last_seen: new Date().toISOString() })
        .eq("admin_id", adminId);
    }, 30000);

    // Handle page close/refresh
    window.addEventListener("beforeunload", setOffline);

    return () => {
      clearInterval(interval);
      setOffline();
      window.removeEventListener("beforeunload", setOffline);
    };
  }, [adminId]);
}
```

### Step 3: Display Online Status

```typescript
// In admin list component
const [onlineAdmins, setOnlineAdmins] = useState<Set<number>>(new Set());

useEffect(() => {
  const supabase = createClient();
  
  // Subscribe to presence changes
  const channel = supabase
    .channel("admin-presence")
    .on("postgres_changes", 
      { event: "*", schema: "public", table: "admin_presence" },
      (payload) => {
        // Update online admins list
        fetchOnlineAdmins();
      }
    )
    .subscribe();

  fetchOnlineAdmins();

  return () => {
    supabase.removeChannel(channel);
  };
}, []);

// Display indicator:
{onlineAdmins.has(admin.id) && (
  <span className={styles.onlineIndicator}>🟢 Online</span>
)}
```

---

## 8. Chat System Verification

**Testing Checklist:**

### Test Cases:

1. **Chat Session Creation:**
   - User clicks chat button
   - System creates chat session
   - Session appears in admin panel

2. **Admin Acceptance:**
   - Admin sees pending chat request
   - Admin accepts chat
   - User receives confirmation
   - Chat becomes active

3. **Messaging:**
   - User sends message
   - Admin receives message
   - Admin replies
   - User receives reply
   - Test real-time updates

4. **Timeout (2 minutes):**
   - Start chat session
   - Wait 2+ minutes without interaction
   - Verify session auto-closes
   - Check timeout message appears

5. **Manual Close:**
   - User closes chat
   - Verify session marked as closed
   - Check closing message sent

### Files to Review:
- `/src/lib/db/services/chat.service.ts` - Check timeout logic
- `/src/components/chat/ChatWidget.tsx` - User interface
- `/src/components/chat/AdminChatWidget.tsx` - Admin interface
- `/src/app/api/chat/` - API routes

### Potential Issues:
- Realtime subscription not working
- Timeout not triggering
- Messages not syncing
- Session state inconsistency

---

## 9. Chatbot Configuration

**CRITICAL:** Update production settings

### File to Modify: `/src/utils/chatbot.ts`

**Current Settings (Line 22-30):**
```typescript
// TESTING MODE - MUST CHANGE FOR PRODUCTION
export const FORCE_BOT_MODE = false;
export const FORCE_ADMIN_MODE = true;  // ← SET TO FALSE FOR PRODUCTION
```

### Production Configuration:
```typescript
export const FORCE_BOT_MODE = false;
export const FORCE_ADMIN_MODE = false;  // ← Changed to false
```

### Verify Business Hours Configuration:
```typescript
const BUSINESS_HOURS = {
  start: 8,    // 8:00 AM
  end: 17,     // 5:00 PM
  days: [1, 2, 3, 4, 5], // Monday to Friday
};
```

### Timezone Considerations:

**Current Implementation:** Uses server timezone
**Required:** Philippine Time (UTC+8)

**Solution:** Update `isAdminAvailable()` function:
```typescript
export function isAdminAvailable(): boolean {
  if (FORCE_BOT_MODE) return false;
  if (FORCE_ADMIN_MODE) return true;

  // Get current time in Philippine Time (UTC+8)
  const now = new Date();
  const phTime = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Manila" }));
  
  const currentHour = phTime.getHours();
  const currentDay = phTime.getDay();

  const isBusinessDay = BUSINESS_HOURS.days.includes(currentDay);
  const isBusinessHour = currentHour >= BUSINESS_HOURS.start && currentHour < BUSINESS_HOURS.end;

  return isBusinessDay && isBusinessHour;
}
```

### Test Cases:
1. **During Business Hours (Mon-Fri 8am-5pm PH Time):**
   - Chat should connect to admin
   - Bot should only assist if all admins busy

2. **Outside Business Hours:**
   - Bot should greet immediately
   - Bot should explain office hours
   - Bot should provide automated assistance

3. **Weekends:**
   - Bot should be active
   - Should display weekend message

---

## 10. Complete Notification Integration

**Files to Modify:** Various application workflow files

### Notification Trigger Points:

#### A. Application Referred
**File:** `/src/app/admin/jobseekers/components/list/JobseekerTable.tsx` or application status update file

```typescript
import { createApplicationStatusNotification } from "@/lib/db/services/notification.service";

const handleReferApplicant = async (applicantId: number, jobId: number) => {
  // Update application status in database
  await updateApplicationStatus(applicationId, "referred");
  
  // Send notification
  await createApplicationStatusNotification(applicantId, jobId, "referred");
  
  alert("Applicant referred successfully!");
};
```

#### B. Application Rejected
```typescript
const handleRejectApplicant = async (applicantId: number, jobId: number) => {
  await updateApplicationStatus(applicationId, "rejected");
  await createApplicationStatusNotification(applicantId, jobId, "rejected");
  alert("Application rejected");
};
```

#### C. Application Submitted
**File:** `/src/app/(user)/job-opportunities/[companyId]/components/application/ApplicationModal.tsx` or submission handler

```typescript
import { createApplicationCompletedNotification } from "@/lib/db/services/notification.service";

const handleSubmitApplication = async () => {
  // Submit application
  const result = await submitApplication(formData);
  
  if (result.success) {
    // Send completion notification
    await createApplicationCompletedNotification(applicantId, jobId);
  }
};
```

#### D. ID Verified
Already implemented in Section 2 (ID Verification Workflow)

#### E. ID Change Required
Already implemented in Section 3 (ID Change Notification)

### Notification UI Component

**Create:** `/src/components/NotificationBell.tsx`
```typescript
"use client";

import { useState, useEffect } from "react";
import { getNotifications } from "@/lib/db/services/notification.service";
import styles from "./NotificationBell.module.css";

export default function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    fetchNotifications();
    
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    const data = await getNotifications(true); // unread only
    setUnreadCount(data.length);
  };

  return (
    <div className={styles.notificationBell}>
      <button onClick={() => setShowDropdown(!showDropdown)}>
        🔔
        {unreadCount > 0 && (
          <span className={styles.badge}>{unreadCount}</span>
        )}
      </button>
      
      {showDropdown && (
        <NotificationDropdown 
          notifications={notifications}
          onClose={() => setShowDropdown(false)}
        />
      )}
    </div>
  );
}
```

**Add to Navbar:** `/src/components/Navbar.tsx`
```typescript
import NotificationBell from "./NotificationBell";

// Add in navbar:
<NotificationBell />
```

---

## Database Migration Checklist

Run these SQL commands in Supabase SQL Editor:

```sql
-- 1. Update applicant_ids table for ID verification
ALTER TABLE applicant_ids ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false;
ALTER TABLE applicant_ids ADD COLUMN IF NOT EXISTS verified_by INTEGER REFERENCES peso(id);
ALTER TABLE applicant_ids ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ;
ALTER TABLE applicant_ids ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';
ALTER TABLE applicant_ids ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
ALTER TABLE applicant_ids ADD COLUMN IF NOT EXISTS rejected_by INTEGER REFERENCES peso(id);
ALTER TABLE applicant_ids ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMPTZ;
ALTER TABLE applicant_ids ADD COLUMN IF NOT EXISTS is_preferred BOOLEAN DEFAULT false;

-- 2. Create ID verification logs table
CREATE TABLE IF NOT EXISTS id_verification_logs (
  id SERIAL PRIMARY KEY,
  applicant_id INTEGER REFERENCES applicants(id),
  admin_id INTEGER REFERENCES peso(id),
  application_id INTEGER,
  action TEXT NOT NULL, -- 'verified', 'rejected', 'updated'
  reason TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Add archived status to companies (if not exists)
ALTER TABLE companies ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT false;

-- 4. Create admin presence table
CREATE TABLE IF NOT EXISTS admin_presence (
  id SERIAL PRIMARY KEY,
  admin_id INTEGER REFERENCES peso(id) UNIQUE,
  is_online BOOLEAN DEFAULT false,
  last_seen TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Update notifications table to support new types
-- This should already support the types if you've updated notification.service.ts

-- 6. Enable realtime for required tables
ALTER PUBLICATION supabase_realtime ADD TABLE admin_presence;
ALTER PUBLICATION supabase_realtime ADD TABLE chat_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
```

---

## Testing Checklist

- [ ] Test archived companies (archive, view, unarchive)
- [ ] Test ID verification (verify, notification sent)
- [ ] Test ID rejection (reject, notification sent, user can update)
- [ ] Test preferred ID selection (user selects, admin sees correct ID)
- [ ] Verify jobseekers table row expansion is commented/removed
- [ ] Test super admin email notification
- [ ] Test admin online status (online/offline indicators)
- [ ] Test chat during business hours
- [ ] Test chat outside business hours (bot active)
- [ ] Test chatbot timezone (Philippine Time)
- [ ] Test all notification types (referred, rejected, verified, completed, ID change)
- [ ] Test notification UI (bell icon, dropdown, mark as read)

---

## Deployment Steps

1. **Update Environment Variables:**
   - Verify Supabase credentials
   - Add email service API keys (if using Resend/SendGrid)
   - Check timezone settings

2. **Database Migrations:**
   - Run all SQL scripts in Supabase
   - Verify table structures
   - Check indexes for performance

3. **Configuration:**
   - Set `FORCE_ADMIN_MODE = false` in `/src/utils/chatbot.ts`
   - Verify business hours configuration
   - Check sharp configuration in `next.config.ts`

4. **Build and Test:**
   ```bash
   npm run build
   npm run start
   ```

5. **Deploy to Vercel:**
   - Push changes to Git
   - Vercel auto-deploys
   - Verify build succeeds
   - Test on production URL

6. **Post-Deployment Verification:**
   - Test image loading (sharp fix)
   - Test notifications
   - Test chat system
   - Test chatbot outside business hours
   - Verify admin features work

---

## Support & Resources

- **Supabase Docs:** https://supabase.com/docs
- **Next.js Docs:** https://nextjs.org/docs
- **Vercel Docs:** https://vercel.com/docs
- **Sharp Docs:** https://sharp.pixelplumbing.com/

---

## Notes

- Always test in development before deploying to production
- Keep backups of database before running migrations
- Monitor error logs in Vercel dashboard
- Use Supabase logs for debugging database issues
- Test chatbot timezone handling thoroughly (Philippine Time vs Server Time)

---

**Last Updated:** 2024
**Version:** 1.0