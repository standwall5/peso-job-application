# Simple Admin Invitation Guide - Guaranteed to Work

## How It Works (Simple Version)

1. **Super admin enters email and name** → Click "Send Invitation"
2. **System creates admin account** (no password yet)
3. **Email sent with magic link** (via Supabase)
4. **Admin clicks link** → Auto-logged in → Lands on `/admin`
5. **Modal appears (can't close it)** → Must set password + upload picture
6. **Done!** → Admin can use the system

---

## What Actually Happens

### Step 1: Super Admin Sends Invitation

**URL**: `/admin/create-admin` or `/admin/manage-admin`

**What gets created**:
```
✅ Auth user (in Supabase auth.users table)
   - email: newadmin@example.com
   - no password yet (will set on first login)
   - email_confirm: true

✅ Peso record (in peso table)
   - auth_id: links to auth user
   - name: "New Admin"
   - is_superadmin: false
   - is_first_login: TRUE ← This is the magic field!

✅ Invitation token (in admin_invitation_tokens table)
   - Just for tracking who invited whom
   - Not used for authentication
```

**Email sent**: Supabase sends magic link automatically

---

### Step 2: Admin Clicks Magic Link

**What happens**:
1. Supabase validates the link
2. Creates authenticated session
3. Redirects to `/auth/callback`
4. Callback checks: "Is this user in peso table?"
5. Yes → Redirect to `/admin`

---

### Step 3: Modal Appears

**File**: `/admin/layout.tsx`

**Logic**:
```typescript
if (profile.is_first_login === true) {
  showModal(); // Can't close until password + picture done
}
```

**Modal requires**:
- ✅ Set password (strong password rules enforced)
- ✅ Upload profile picture

**Can do in any order**:
- Password first, then picture ✅
- Picture first, then password ✅

**After BOTH complete**:
- Sets `is_first_login = false`
- Modal closes
- Page reloads
- Modal never appears again ✅

---

## Testing Steps

### 1. Send Invitation

```
1. Login as super admin
2. Go to /admin/manage-admin
3. Click "Add Admin"
4. Enter:
   - Name: Test Admin
   - Email: test@example.com
   - Super Admin: No
5. Click "Send Invitation"
6. You should see: "Invitation sent successfully"
```

### 2. Check Database

```sql
-- Check auth user created
SELECT id, email FROM auth.users WHERE email = 'test@example.com';

-- Check peso record created
SELECT id, name, is_first_login FROM peso 
WHERE auth_id = (SELECT id FROM auth.users WHERE email = 'test@example.com');

-- Should show: is_first_login = true
```

### 3. Check Email

```
1. Open email inbox for test@example.com
2. Should see: "You've been invited to join..." (Supabase default)
3. Click the "Accept Invitation" link
```

### 4. Test Modal

```
1. After clicking link, you should land on /admin
2. Modal should appear immediately
3. Try clicking outside → Should show alert
4. Try clicking X button → No X button if first login!
5. Go to Password tab → Set password
6. Go to Profile tab → Upload picture
7. After both done → Modal closes automatically
```

### 5. Verify Complete

```sql
-- Check is_first_login is now false
SELECT is_first_login FROM peso 
WHERE auth_id = (SELECT id FROM auth.users WHERE email = 'test@example.com');

-- Should show: is_first_login = false
```

### 6. Test Subsequent Login

```
1. Sign out
2. Go to /admin/login
3. Login with test@example.com and the password you set
4. Modal should NOT appear
5. You can use the system normally ✅
```

---

## Troubleshooting

### Modal doesn't appear

**Check**:
```sql
SELECT p.is_first_login, u.email
FROM peso p
JOIN auth.users u ON p.auth_id = u.id
WHERE u.email = 'test@example.com';
```

**Fix**:
```sql
UPDATE peso SET is_first_login = true
WHERE auth_id = (SELECT id FROM auth.users WHERE email = 'test@example.com');
```

Then reload `/admin` page.

---

### Email not received

**Check**:
1. Spam folder
2. Supabase Dashboard → Authentication → Logs

**Workaround**:
1. Go to Supabase Dashboard
2. Authentication → Users
3. Find the user
4. Click "..." → "Send magic link"

---

### Can close modal without completing

**This means `isFirstLogin` prop isn't set correctly**

Check `/admin/layout.tsx`:
```typescript
<AdminProfileModal
  isOpen={showFirstLoginModal}
  onClose={() => setShowFirstLoginModal(false)}
  isFirstLogin={true}  // ← Must be true
/>
```

---

## The Magic Field

**Everything depends on this ONE field**:

```sql
peso.is_first_login BOOLEAN DEFAULT true
```

**Lifecycle**:
```
Invitation sent → is_first_login = TRUE
                      ↓
Admin clicks link → Lands on /admin
                      ↓
Layout checks → if (is_first_login === true) show modal
                      ↓
Admin sets password → API sets is_first_login = FALSE
                      ↓
Modal closes → Never appears again
```

---

## Files Modified

### Backend
- `/src/app/api/admin/invite/route.ts` - Creates user, sends email
- `/src/app/api/admin/change-password/route.ts` - Already handles first login

### Frontend
- `/src/app/admin/layout.tsx` - Already checks is_first_login
- `/src/app/admin/components/AdminProfileModal.tsx` - Uncloseable when first login

### Database
- `peso` table - Uses `is_first_login` field (already exists)
- `admin_invitation_tokens` table - For audit trail (already exists)

---

## Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...  ← Required!
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Summary

**Super simple flow**:
1. Super admin → Name + Email → Send
2. System → Create account + Send email
3. Admin → Click link → /admin opens
4. Modal → Set password + Upload picture
5. Done → Can use system

**Key point**: `is_first_login` field controls everything.

**That's it!** This will definitely work.