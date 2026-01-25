# Profile Modal Testing Instructions

## Changes Made

### 1. **Landscape/Horizontal Layout** ✅
- Modal is now wider (max-width: 1200px, up from 900px)
- Two-column layout optimized: 40% left (profile picture) / 60% right (password)
- Increased padding and spacing for better horizontal flow
- Better proportions for landscape viewing

### 2. **Forced/Blocking Modal Mode** ✅
- Added `isForced` prop to AdminProfileModal
- When forced:
  - Modal cannot be closed (no close button, clicking overlay does nothing)
  - Stronger visual cues (border, darker overlay, warning icon)
  - Higher z-index to block all other interactions
  - Profile picture marked as required
- Automatically detects incomplete profiles and shows forced modal
- Admin cannot access other pages until profile is complete

### 3. **Image Upload Verification** ✅
- Added comprehensive console logging throughout the entire upload pipeline:
  - **Client-side (ProfilePictureUpload.tsx)**:
    - File selection
    - Validation (type, size)
    - Cropping process
    - Upload start/progress/completion
  - **API endpoint (route.ts)**:
    - Request received
    - Authentication
    - File validation
    - Storage upload
    - Database update
    - Public URL generation
- Logs use emoji prefixes for easy scanning:
  - ✅ Success
  - ❌ Error
  - ⚠️ Warning
  - 📁 File operations
  - 🌐 Network requests
  - 💾 Database operations

---

## How to Test

### Test 1: Visual Layout (Landscape Mode)
1. **Login as admin** with existing account
2. **Click profile icon** in header → "Profile"
3. **Verify modal appearance**:
   - Modal should be wide and horizontal (landscape)
   - Left side: Profile picture (40% width)
   - Right side: Password change form (60% width)
   - Good spacing and padding
   - Not too tall/vertical

**Expected**: Modal looks landscape/horizontal, not cramped or too tall

---

### Test 2: Forced Modal (Incomplete Profile)
1. **Create a new admin** via Super Admin panel
2. **Login with new admin** (or use admin without profile picture)
3. **Observe modal behavior**:
   - Modal should appear automatically
   - Header shows "⚠️ Complete Your Profile"
   - Red warning message visible
   - NO close button (X) visible
   - Profile Picture section has red asterisk (*)
   - Clicking outside modal does NOT close it
   - Darker overlay with blur effect
   - Green border around modal

4. **Try to navigate**:
   - Click sidebar links
   - Try to access other pages
   - **Expected**: Modal blocks everything, cannot navigate away

5. **Complete profile**:
   - Upload a profile picture
   - **Expected**: Modal allows closing OR automatically closes after upload

**Expected**: Admin is forced to complete profile before accessing admin panel

---

### Test 3: Image Upload Verification
1. **Open browser console** (F12)
2. **Open profile modal** (or forced modal)
3. **Select an image** to upload:
   - Look for console logs: `📁 [Upload Component] File selected`
   - Check file details (name, type, size)

4. **Crop the image**:
   - Adjust crop area
   - Click "Crop & Continue"
   - Look for: `✂️ [Upload Component] Cropping image...`
   - Check for: `✅ [Upload Component] Image cropped successfully`

5. **Upload the image**:
   - Click "Upload" button
   - **Watch console for complete pipeline**:

**Client Side:**
```
⬆️ [Upload Component] Starting upload process...
📦 [Upload Component] FormData prepared with file: [filename]
🌐 [Upload Component] Sending POST request to /api/admin/profile-picture
📡 [Upload Component] Response received, status: 200
✅ [Upload Component] Upload successful! Response: {...}
🎉 [Upload Component] Upload complete, URL: [public_url]
```

**API Side:**
```
📸 [Profile Picture API] POST request received
✅ [Profile Picture API] User authenticated: [user_id]
✅ [Profile Picture API] Admin found: [admin_id]
📁 [Profile Picture API] File received: {name, type, size}
✅ [Profile Picture API] File validation passed
⬆️ [Profile Picture API] Uploading to storage: [file_path]
✅ [Profile Picture API] File uploaded to storage successfully
🔗 [Profile Picture API] Public URL generated: [url]
💾 [Profile Picture API] Updating database for admin: [admin_id]
✅ [Profile Picture API] Database updated successfully
🎉 [Profile Picture API] Upload complete! URL: [url]
```

6. **Verify in database**:
   - Check Supabase Storage bucket `admin-profiles`
   - Verify file exists in `{user_id}/{timestamp}.{ext}`
   - Check `peso` table → `profile_picture_url` column
   - URL should match console log

7. **Verify in UI**:
   - Profile picture should update immediately
   - Header profile icon should show new picture
   - No errors in console

**Expected**: Every step logged clearly, file appears in storage, database updated, UI reflects change

---

### Test 4: Remove Profile Picture
1. **Open profile modal** with existing picture
2. **Open console** (F12)
3. **Click "Remove Picture"**
4. **Watch console logs**:
```
🗑️ [Upload Component] Starting remove process...
🌐 [Upload Component] Sending DELETE request
🗑️ [Profile Picture API] DELETE request received
✅ [Profile Picture API] User authenticated
🗑️ [Profile Picture API] Removing file from storage
✅ [Profile Picture API] File removed from storage
💾 [Profile Picture API] Clearing database reference
✅ [Profile Picture API] Database reference cleared
🎉 [Profile Picture API] Delete complete
```

5. **Verify**:
   - File removed from Supabase Storage
   - `profile_picture_url` set to NULL in database
   - UI shows placeholder icon

**Expected**: Complete removal logged and verified

---

### Test 5: Error Handling
Test various error scenarios and verify logging:

**Invalid file type:**
- Try uploading .txt, .pdf, etc.
- Look for: `❌ [Upload Component] Invalid file type: [type]`

**File too large:**
- Try uploading >5MB file
- Look for: `❌ [Upload Component] File too large: [size]`

**Network error:**
- Disconnect internet
- Try upload
- Look for: `❌ [Upload Component] Upload error: [message]`

**Expected**: All errors logged clearly with ❌ prefix

---

## Scenarios to Test

### Scenario A: New Admin First Login
1. Super admin invites new admin
2. New admin receives email
3. New admin clicks link and sets password
4. On first login → redirected to `/admin/setup-initial`
5. Must upload picture and set password
6. After completion → redirected to `/admin`

### Scenario B: Existing Admin Without Picture
1. Admin somehow has NULL profile_picture_url
2. Login → forced modal appears
3. Cannot close or navigate
4. Must upload picture
5. After upload → modal closes, normal access

### Scenario C: Normal Profile Update
1. Admin with complete profile
2. Opens profile modal voluntarily
3. Can close modal anytime
4. Can change picture or password
5. Changes saved successfully

---

## What to Look For

### ✅ SUCCESS INDICATORS
- Modal is wide and horizontal (landscape)
- Forced mode blocks all navigation
- Every upload/delete step is logged to console
- Files appear in Supabase Storage
- Database updates confirmed in logs
- UI updates immediately after changes
- No console errors
- Toast notifications appear

### ❌ FAILURE INDICATORS
- Modal is too tall/vertical
- Can close forced modal prematurely
- Missing console logs (gaps in pipeline)
- Files not appearing in storage
- Database not updating
- UI not refreshing
- Console errors
- Upload fails silently

---

## Console Log Cheat Sheet

Look for these patterns in console:

| Operation | Log Pattern |
|-----------|-------------|
| File selected | `📁 [Upload Component] File selected` |
| Validation | `✅ [Upload Component] File validation passed` |
| Crop start | `✂️ [Upload Component] Cropping image...` |
| Upload start | `⬆️ [Upload Component] Starting upload process...` |
| API received | `📸 [Profile Picture API] POST request received` |
| Storage upload | `⬆️ [Profile Picture API] Uploading to storage` |
| DB update | `💾 [Profile Picture API] Updating database` |
| Success | `🎉 [Profile Picture API] Upload complete!` |
| Errors | `❌ [Component/API] Error message` |

---

## Questions to Answer

After testing, confirm:

1. ✅ Is the modal landscape/horizontal and not too tall?
2. ✅ Can you close the modal in forced mode? (Should be NO)
3. ✅ Do you see ALL console logs during upload?
4. ✅ Does the file appear in Supabase Storage?
5. ✅ Does the database `profile_picture_url` update?
6. ✅ Does the UI show the new picture immediately?
7. ✅ Are there any console errors?
8. ✅ Does the forced modal prevent accessing other pages?

---

## Troubleshooting

**Modal still too tall?**
- Check browser width (needs >1024px for landscape)
- Mobile devices will stack vertically (expected behavior)

**No console logs appearing?**
- Ensure console is open BEFORE starting action
- Check console filter (should be "All levels")
- Try hard refresh (Ctrl+Shift+R)

**Upload not working?**
- Check Supabase Storage bucket exists: `admin-profiles`
- Verify bucket is public
- Check RLS policies on `peso` table
- Look for ❌ errors in console

**Forced modal not showing?**
- Check `profile_picture_url` is NULL in database
- Verify `is_first_login` is false
- Check Header component console logs

---

## Files Modified

1. `AdminProfileModal.module.css` - Layout and forced mode styles
2. `AdminProfileModal.tsx` - Forced mode logic and UI
3. `Header.tsx` - Incomplete profile detection
4. `ProfilePictureUpload.tsx` - Client-side logging
5. `route.ts` (profile-picture API) - Server-side logging

All changes are backward compatible - existing functionality preserved!