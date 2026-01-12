-- Fix Database Type Mismatches
-- Run this AFTER migrating to Neon and BEFORE pushing Prisma schema
--
-- These fixes ensure Prisma can generate proper relations

-- 1. Fix exam_attempts.applicant_id (int → bigint)
ALTER TABLE exam_attempts 
  ALTER COLUMN applicant_id TYPE bigint;

-- 2. Fix id_change_logs.applicant_id (int → bigint)
ALTER TABLE id_change_logs 
  ALTER COLUMN applicant_id TYPE bigint;

-- 3. Fix id_change_logs.application_id (int → bigint)
ALTER TABLE id_change_logs 
  ALTER COLUMN application_id TYPE bigint;

-- 4. Fix verified_ids.job_id (int → bigint)
ALTER TABLE verified_ids 
  ALTER COLUMN job_id TYPE bigint;

-- Verify the changes
SELECT 
  table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE 
  (table_name = 'exam_attempts' AND column_name = 'applicant_id')
  OR (table_name = 'id_change_logs' AND column_name IN ('applicant_id', 'application_id'))
  OR (table_name = 'verified_ids' AND column_name = 'job_id');
