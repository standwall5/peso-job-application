-- Migration: Add ID verification fields to applicants table
-- This adds support for storing multiple ID types directly on the applicant record
-- along with verification status and default ID type

ALTER TABLE applicants
  ADD COLUMN IF NOT EXISTS national_id_front TEXT,
  ADD COLUMN IF NOT EXISTS national_id_back TEXT,
  ADD COLUMN IF NOT EXISTS national_id_selfie TEXT,
  ADD COLUMN IF NOT EXISTS postal_id_front TEXT,
  ADD COLUMN IF NOT EXISTS postal_id_back TEXT,
  ADD COLUMN IF NOT EXISTS postal_id_selfie TEXT,
  ADD COLUMN IF NOT EXISTS drivers_license_front TEXT,
  ADD COLUMN IF NOT EXISTS drivers_license_back TEXT,
  ADD COLUMN IF NOT EXISTS drivers_license_selfie TEXT,
  ADD COLUMN IF NOT EXISTS passport_front TEXT,
  ADD COLUMN IF NOT EXISTS passport_back TEXT,
  ADD COLUMN IF NOT EXISTS passport_selfie TEXT,
  ADD COLUMN IF NOT EXISTS sss_id_front TEXT,
  ADD COLUMN IF NOT EXISTS sss_id_back TEXT,
  ADD COLUMN IF NOT EXISTS sss_id_selfie TEXT,
  ADD COLUMN IF NOT EXISTS umid_front TEXT,
  ADD COLUMN IF NOT EXISTS umid_back TEXT,
  ADD COLUMN IF NOT EXISTS umid_selfie TEXT,
  ADD COLUMN IF NOT EXISTS philhealth_id_front TEXT,
  ADD COLUMN IF NOT EXISTS philhealth_id_back TEXT,
  ADD COLUMN IF NOT EXISTS philhealth_id_selfie TEXT,
  ADD COLUMN IF NOT EXISTS tin_id_front TEXT,
  ADD COLUMN IF NOT EXISTS tin_id_back TEXT,
  ADD COLUMN IF NOT EXISTS tin_id_selfie TEXT,
  ADD COLUMN IF NOT EXISTS voters_id_front TEXT,
  ADD COLUMN IF NOT EXISTS voters_id_back TEXT,
  ADD COLUMN IF NOT EXISTS voters_id_selfie TEXT,
  ADD COLUMN IF NOT EXISTS prc_id_front TEXT,
  ADD COLUMN IF NOT EXISTS prc_id_back TEXT,
  ADD COLUMN IF NOT EXISTS prc_id_selfie TEXT,
  ADD COLUMN IF NOT EXISTS pwd_id_front TEXT,
  ADD COLUMN IF NOT EXISTS pwd_id_back TEXT,
  ADD COLUMN IF NOT EXISTS pwd_id_selfie TEXT,
  ADD COLUMN IF NOT EXISTS senior_citizen_id_front TEXT,
  ADD COLUMN IF NOT EXISTS senior_citizen_id_back TEXT,
  ADD COLUMN IF NOT EXISTS senior_citizen_id_selfie TEXT,
  ADD COLUMN IF NOT EXISTS default_id_type TEXT;

-- Add comments for documentation
COMMENT ON COLUMN applicants.default_id_type IS 'The ID type the user prefers to use for applications (e.g., NATIONAL ID, POSTAL ID)';
COMMENT ON COLUMN applicants.id_verified IS 'Whether any of the user IDs have been verified by an admin';
COMMENT ON COLUMN applicants.id_verified_at IS 'Timestamp when ID was last verified';
COMMENT ON COLUMN applicants.id_verified_by IS 'PESO admin who verified the ID';
