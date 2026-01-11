-- Migration: Add profile picture support for admins (peso table)
-- Description: Adds profile_picture_url column to peso table and sets up storage policies
-- Date: 2024

-- Add profile_picture_url column to peso table
ALTER TABLE peso
ADD COLUMN IF NOT EXISTS profile_picture_url TEXT;

-- Note: Storage bucket creation must be done in Supabase Dashboard first
--
-- To set up storage:
-- 1. Go to Supabase Dashboard > Storage
-- 2. Create new bucket named: "admin-profiles"
-- 3. Set as Private
-- 4. Max file size: 5MB
-- 5. Allowed MIME types: image/jpeg, image/png, image/webp
--
-- Then run the rest of this migration for policies:

-- Drop existing policies if they exist (to make migration idempotent)
DROP POLICY IF EXISTS "Admins can upload their own profile pictures" ON storage.objects;
DROP POLICY IF EXISTS "Admins can view admin profile pictures" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update their own profile pictures" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete their own profile pictures" ON storage.objects;

-- Policy: Allow admins to upload their own profile pictures
CREATE POLICY "Admins can upload their own profile pictures"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'admin-profiles'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Allow admins to view all admin profile pictures
CREATE POLICY "Admins can view admin profile pictures"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'admin-profiles');

-- Policy: Allow admins to update their own profile pictures
CREATE POLICY "Admins can update their own profile pictures"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'admin-profiles'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Allow admins to delete their own profile pictures
CREATE POLICY "Admins can delete their own profile pictures"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'admin-profiles'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_peso_profile_picture_url
ON peso(profile_picture_url)
WHERE profile_picture_url IS NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN peso.profile_picture_url IS 'URL to admin profile picture stored in Supabase Storage (admin-profiles bucket)';
