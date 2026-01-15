# Profile Picture System Fixes

## Changes Made

### 1. Added Image Cropping Feature

**File:** `src/app/admin/components/ProfilePictureUpload.tsx`

- Integrated `react-easy-crop` library for professional image cropping
- Added a modal interface that appears when an image is selected
- Features:
  - Circular crop preview (matches the circular profile display)
  - Zoom slider (1x to 3x zoom)
  - Drag to reposition the crop area
  - "Crop & Continue" to confirm the crop
  - "Cancel" to select a different image
  - Crops image to JPEG format with 95% quality

**User Flow:**

1. Click "Choose Picture" button
2. Select an image from your device
3. Cropping modal appears
4. Adjust zoom and position the image
5. Click "Crop & Continue"
6. Review the cropped preview
7. Click "Upload" to save to your profile

### 2. Added Image Cropper Styling

**File:** `src/app/admin/components/ProfilePictureUpload.module.css`

- Added `.cropperModal` - Full-screen overlay with semi-transparent background
- Added `.cropperContainer` - White modal card with rounded corners
- Added `.cropperWrapper` - 400px height container for the cropping area
- Added `.zoomSlider` - Custom-styled range input with accent color thumb
- Added responsive styles for mobile devices (300px cropper height)

### 3. Fixed Profile Picture Caching Issues

**File:** `src/app/admin/components/Header.tsx`

- Added `profileTimestamp` state to track when profile picture is updated
- Appended timestamp as query parameter to image URLs (`?t={timestamp}`)
- Forces browser to refresh the image instead of using cached version
- Updates timestamp when profile is successfully uploaded
- Ensures both header icon and dropdown show the latest picture immediately

### 4. Database Persistence

**File:** `src/app/api/admin/profile-picture/route.ts`

The existing API route already handles:

- Uploading to Supabase Storage (`admin-profiles` bucket)
- Updating the `peso.profile_picture_url` field in the database
- Deleting old profile pictures when uploading new ones
- Proper error handling and validation

## Required Supabase Setup

Make sure you have created the `admin-profiles` bucket in Supabase Storage with these policies:

### Bucket: `admin-profiles`

- **Public:** Yes (for viewing profile pictures)

### Storage Policies:

**1. Upload Policy:**

```sql
CREATE POLICY "Admins can upload their own profile pictures"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'admin-profiles' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

**2. Update Policy:**

```sql
CREATE POLICY "Admins can update their own profile pictures"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'admin-profiles' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

**3. Delete Policy:**

```sql
CREATE POLICY "Admins can delete their own profile pictures"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'admin-profiles' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

**4. Public Read Policy:**

```sql
CREATE POLICY "Profile pictures are publicly viewable"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'admin-profiles');
```

## Testing Checklist

- [ ] Upload a new profile picture
- [ ] Verify cropping modal appears
- [ ] Adjust zoom and position in cropper
- [ ] Confirm cropped image looks correct in preview
- [ ] Click Upload and verify it saves
- [ ] Check that header profile icon updates immediately
- [ ] Check that dropdown profile image updates immediately
- [ ] Refresh the page and verify picture persists
- [ ] Upload a different picture and verify old one is replaced
- [ ] Click "Remove Picture" and verify it's deleted
- [ ] Try uploading invalid file types (should show error)
- [ ] Try uploading files over 5MB (should show error)

## Technical Details

**Dependencies Added:**

- `react-easy-crop` - Professional image cropping component

**Image Processing:**

- Crops are rendered to a canvas element
- Canvas is converted to a Blob with JPEG compression (95% quality)
- Blob is converted to a File object for upload
- Original file extension is preserved in the cropped file name

**Cache Busting:**

- Uses timestamp query parameter approach
- Updates on every successful upload
- Prevents browser from serving stale images from cache

## File Changes Summary

1. ✅ `ProfilePictureUpload.tsx` - Added complete cropping workflow
2. ✅ `ProfilePictureUpload.module.css` - Added cropper modal styles
3. ✅ `Header.tsx` - Added cache-busting timestamp mechanism
4. ✅ `route.ts` - Already had proper database save logic (no changes needed)

## Known Issues & Solutions

**Issue:** Profile picture not updating in the header after upload
**Solution:** ✅ Fixed with cache-busting timestamp

**Issue:** No way to crop images before upload
**Solution:** ✅ Added react-easy-crop modal with zoom and positioning

**Issue:** Large images look distorted or poorly framed
**Solution:** ✅ User can now zoom and reposition before upload

## Next Steps

1. Test the cropping feature with various image sizes
2. Verify the bucket exists in Supabase with correct policies
3. Test on mobile devices to ensure responsive cropper works
4. Consider adding rotation controls if needed (currently not included)
