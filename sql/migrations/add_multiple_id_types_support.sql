-- Migration: Add support for multiple ID types per user
-- This allows users to upload different ID types and switch between them

-- Step 0A: First, drop the old constraint completely
ALTER TABLE public.applicant_ids
DROP CONSTRAINT IF EXISTS applicant_ids_id_type_check;

-- Step 0B: Update existing data to match new format
-- Map old values to new uppercase format
UPDATE public.applicant_ids
SET id_type = CASE
    WHEN LOWER(id_type) = 'national id' THEN 'NATIONAL ID'
    WHEN LOWER(id_type) = 'driver license' OR LOWER(id_type) = 'driver''s license' THEN 'DRIVER''S LICENSE'
    WHEN LOWER(id_type) = 'passport' THEN 'PASSPORT'
    WHEN LOWER(id_type) = 'sss id' THEN 'SSS ID'
    WHEN LOWER(id_type) = 'voter id' OR LOWER(id_type) = 'voter''s id' THEN 'VOTER''S ID'
    WHEN LOWER(id_type) = 'postal id' THEN 'POSTAL ID'
    WHEN LOWER(id_type) = 'prc id' THEN 'PRC ID'
    WHEN LOWER(id_type) = 'umid' THEN 'UMID'
    WHEN LOWER(id_type) = 'philhealth id' THEN 'PhilHealth ID'
    WHEN LOWER(id_type) = 'tin id' THEN 'TIN ID'
    WHEN LOWER(id_type) = 'pwd id' THEN 'PWD ID'
    WHEN LOWER(id_type) = 'senior citizen id' THEN 'SENIOR CITIZEN ID'
    WHEN LOWER(id_type) = 'barangay id' THEN 'BARANGAY ID'
    WHEN LOWER(id_type) = 'other' THEN 'NATIONAL ID'
    ELSE id_type -- Keep as is if already in correct format
END
WHERE id_type IS NOT NULL;

-- Step 0C: Verify no invalid data remains (this will show any problematic rows)
-- Comment this out after confirming data is clean
-- SELECT id, applicant_id, id_type FROM public.applicant_ids
-- WHERE id_type NOT IN (
--     'NATIONAL ID', 'DRIVER''S LICENSE', 'PASSPORT', 'SSS ID', 'UMID',
--     'PhilHealth ID', 'TIN ID', 'POSTAL ID', 'VOTER''S ID', 'PRC ID',
--     'PWD ID', 'SENIOR CITIZEN ID', 'BARANGAY ID'
-- );

-- Step 1: Remove the UNIQUE constraint on applicant_id in applicant_ids table
-- This allows multiple ID records per applicant
ALTER TABLE public.applicant_ids
DROP CONSTRAINT IF EXISTS applicant_ids_applicant_id_key;

-- Step 2: Add a unique constraint on (applicant_id, id_type) combination
-- This ensures one record per ID type per applicant
ALTER TABLE public.applicant_ids
DROP CONSTRAINT IF EXISTS applicant_ids_applicant_id_type_key;

ALTER TABLE public.applicant_ids
ADD CONSTRAINT applicant_ids_applicant_id_type_key
UNIQUE (applicant_id, id_type);

-- Step 3: Add the new id_type check constraint with all ID types
ALTER TABLE public.applicant_ids
ADD CONSTRAINT applicant_ids_id_type_check
CHECK (id_type IN (
    'NATIONAL ID',
    'DRIVER''S LICENSE',
    'PASSPORT',
    'SSS ID',
    'UMID',
    'PhilHealth ID',
    'TIN ID',
    'POSTAL ID',
    'VOTER''S ID',
    'PRC ID',
    'PWD ID',
    'SENIOR CITIZEN ID',
    'BARANGAY ID'
));

-- Step 4: Add index for better query performance when fetching IDs by applicant
CREATE INDEX IF NOT EXISTS idx_applicant_ids_applicant_id
ON public.applicant_ids(applicant_id);

-- Step 5: Add index for fetching specific ID type for an applicant
CREATE INDEX IF NOT EXISTS idx_applicant_ids_applicant_id_type
ON public.applicant_ids(applicant_id, id_type);

-- Step 6: Update the updated_at column to use a trigger
CREATE OR REPLACE FUNCTION update_applicant_ids_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_applicant_ids_updated_at ON public.applicant_ids;

CREATE TRIGGER trigger_update_applicant_ids_updated_at
    BEFORE UPDATE ON public.applicant_ids
    FOR EACH ROW
    EXECUTE FUNCTION update_applicant_ids_updated_at();

-- Step 7: Add comment explaining the new structure
COMMENT ON TABLE public.applicant_ids IS
'Stores government ID images for applicants. Each applicant can have multiple ID types stored. The combination of applicant_id and id_type must be unique.';

COMMENT ON CONSTRAINT applicant_ids_applicant_id_type_key ON public.applicant_ids IS
'Ensures each applicant can only have one record per ID type. Users can upload multiple ID types but only one of each kind.';

-- Migration complete!
-- Users can now upload multiple ID types and switch between them in the dropdown.
