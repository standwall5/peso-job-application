# ⚠️ CRITICAL: Database Type Fixes Required

**Priority:** HIGH  
**Impact:** Core functionality broken without these fixes  
**Status:** Must be applied BEFORE using NextAuth migration

---

## 🚨 The Problem

Your current Supabase database has **type mismatches** that break Prisma relations:

| Table | Column | Current Type | Should Be | Impact |
|-------|--------|--------------|-----------|--------|
| `exam_attempts` | `applicant_id` | `integer` | `bigint` | ❌ Can't link exams to applicants |
| `id_change_logs` | `applicant_id` | `integer` | `bigint` | ❌ Can't track ID changes per applicant |
| `id_change_logs` | `application_id` | `integer` | `bigint` | ❌ Can't link ID changes to applications |
| `verified_ids` | `job_id` | `integer` | `bigint` | ❌ Can't link verified IDs to jobs |

---

## 💥 What Breaks Without These Fixes

### 1. Exam System
```typescript
// ❌ THIS WON'T WORK:
const examAttempt = await prisma.examAttempt.findUnique({
  where: { attemptId: 123 },
  include: { applicant: true }  // ERROR: Relation doesn't exist
});

// ❌ THIS WON'T WORK:
const applicant = await prisma.applicant.findUnique({
  where: { id: 456 },
  include: { examAttempts: true }  // ERROR: Relation doesn't exist
});
```

### 2. ID Change Tracking
```typescript
// ❌ THIS WON'T WORK:
const changes = await prisma.idChangeLog.findMany({
  include: { applicant: true }  // ERROR: Relation doesn't exist
});
```

### 3. ID Verification
```typescript
// ❌ THIS WON'T WORK:
const verifiedIds = await prisma.verifiedId.findMany({
  include: { job: true }  // May have issues with job relation
});
```

---

## ✅ The Solution

### Step 1: Apply During Neon Migration

When you migrate from Supabase to Neon, run the SQL fixes:

```bash
# After setting up Neon database
psql $DATABASE_URL -f scripts/fix-database-types.sql
```

### Step 2: Verify Prisma Schema

The Prisma schema (`prisma/schema.prisma`) has been **updated** to expect these fixes:

```prisma
model ExamAttempt {
  applicantId   BigInt    @map("applicant_id")  // ✅ Now BigInt
  applicant     Applicant @relation(...)         // ✅ Relation works
}

model IdChangeLog {
  applicantId   BigInt    @map("applicant_id")  // ✅ Now BigInt
  applicant     Applicant @relation(...)         // ✅ Relation works
}
```

### Step 3: Generate Prisma Client

```bash
npx prisma generate
# Should complete without errors
```

---

## 📋 Migration Checklist

When migrating to Neon:

- [ ] Export Supabase database
- [ ] Create Neon database
- [ ] Import data to Neon
- [ ] **Run `scripts/fix-database-types.sql`** ⚠️ DON'T SKIP
- [ ] Run `npx prisma db pull` (verify schema matches)
- [ ] Run `npx prisma generate`
- [ ] Test exam attempt queries
- [ ] Test ID change log queries

---

## 🔍 How to Verify Fixes Were Applied

After running the SQL script, verify:

```sql
SELECT 
  table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE 
  (table_name = 'exam_attempts' AND column_name = 'applicant_id')
  OR (table_name = 'id_change_logs' AND column_name IN ('applicant_id', 'application_id'))
  OR (table_name = 'verified_ids' AND column_name = 'job_id');
```

**Expected output:**
```
    table_name     |    column_name    | data_type 
-------------------+-------------------+-----------
 exam_attempts     | applicant_id      | bigint     ✅
 id_change_logs    | applicant_id      | bigint     ✅
 id_change_logs    | application_id    | bigint     ✅
 verified_ids      | job_id            | bigint     ✅
```

---

## ⚠️ Why This Happened

Your original Supabase schema had these columns as `integer` when they should have been `bigint` to match the foreign key references. PostgreSQL allowed this with implicit type casting, but Prisma requires **exact type matches** for type-safe relations.

---

## 🆘 If You Skip This Step

If you try to use the NextAuth migration without these fixes:

1. ❌ Prisma Client won't have the relations
2. ❌ You'll need to write raw SQL for joined queries
3. ❌ Type safety is lost
4. ❌ Exam system features will break
5. ❌ ID verification tracking won't work properly

**Don't skip this - it's essential for the migration to work.**

---

## Files Involved

- `scripts/fix-database-types.sql` - SQL fixes (run on Neon)
- `prisma/schema.prisma` - Updated to expect fixed types
- This file - Documentation of the problem and solution

---

**Next Steps:** See `MIGRATION_GUIDE_SUPABASE_TO_NEXTAUTH.md` for the complete migration process.
