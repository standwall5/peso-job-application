# Admin Invitation - Database Schema Quick Reference

## 🎯 Quick Facts

- ✅ Email stored in `auth.users` table (NOT in `peso`)
- ✅ Password stored in `auth.users` table (hashed)
- ✅ `peso.is_first_login` triggers the modal
- ✅ Invitation token is for audit trail only

---

## 📋 Tables at a Glance

### `auth.users` (Supabase Managed)
```
id (UUID) ────┐
email         │
password      │ (hashed)
user_metadata │
```

### `peso` (Admin Profiles)
```
id (BIGINT)
auth_id (UUID) ────→ Links to auth.users.id
name
is_superadmin
is_first_login ← 🔑 KEY FIELD (default: true)
profile_picture_url
status
```

### `admin_invitation_tokens` (Audit Trail)
```
id
email
admin_name
token
created_by ────→ Links to peso.id
used (immediately set to true)
created_at
expires_at
```

---

## 🔄 Field Lifecycle: `is_first_login`

```
Invitation Sent
    ↓
peso.is_first_login = TRUE
    ↓
Admin clicks magic link
    ↓
Redirects to /admin
    ↓
Modal appears (UNCLOSEABLE)
    ↓
Admin sets password
    ↓
peso.is_first_login = FALSE
    ↓
Modal closes, never appears again
```

---

## 🔍 Essential Queries

### Get admin by email (CORRECT WAY)
```sql
SELECT p.*, u.email
FROM peso p
JOIN auth.users u ON p.auth_id = u.id
WHERE u.email = 'admin@example.com';
```

### ❌ WRONG - Don't do this
```sql
-- This WON'T work - email not in peso table!
SELECT * FROM peso WHERE email = 'admin@example.com';
```

### Check who needs first login setup
```sql
SELECT p.name, u.email, p.is_first_login
FROM peso p
JOIN auth.users u ON p.auth_id = u.id
WHERE p.is_first_login = true;
```

### Force first login modal (testing)
```sql
UPDATE peso 
SET is_first_login = true
WHERE auth_id = (
  SELECT id FROM auth.users WHERE email = 'test@example.com'
);
```

### Invitation audit trail
```sql
SELECT 
  inviter.name AS invited_by,
  ait.admin_name,
  ait.email,
  ait.created_at
FROM admin_invitation_tokens ait
JOIN peso inviter ON ait.created_by = inviter.id
ORDER BY ait.created_at DESC;
```

---

## 🚨 Common Mistakes to Avoid

### ❌ Trying to insert email into peso
```typescript
// WRONG - email not in schema!
await supabase.from("peso").insert({
  auth_id: userId,
  name: "Admin",
  email: "admin@example.com", // ❌ This field doesn't exist!
  is_superadmin: false
});
```

### ✅ Correct way
```typescript
// CORRECT - email in auth.users only
await supabase.from("peso").insert({
  auth_id: userId,
  name: "Admin",
  is_superadmin: false,
  is_first_login: true
});
```

### ❌ Querying peso by email
```sql
-- WRONG - email not in peso!
SELECT * FROM peso WHERE email = 'admin@example.com';
```

### ✅ Correct way
```sql
-- CORRECT - join with auth.users
SELECT p.*, u.email
FROM peso p
JOIN auth.users u ON p.auth_id = u.id
WHERE u.email = 'admin@example.com';
```

---

## 📊 Data Locations

| What | Where | Access Via |
|------|-------|------------|
| Email | `auth.users.email` | JOIN with peso |
| Password | `auth.users.encrypted_password` | Supabase API only |
| Name | `peso.name` | Direct query |
| First Login Flag | `peso.is_first_login` | Direct query |
| Profile Picture | `peso.profile_picture_url` | Direct query |
| Permissions | `peso.is_superadmin` | Direct query |

---

## 🔗 Relationships

```
auth.users (1) ←──→ (1) peso
    ↑                   ↑
    │                   │
    id ←──auth_id───────┘
                        │
                        id
                        ↑
                        │
    admin_invitation_tokens
        created_by ─────┘
```

---

## 💡 Remember

1. **Email is in auth.users, NOT peso**
2. **Always JOIN to get email**
3. **is_first_login = true triggers modal**
4. **Invitation token is audit trail only**
5. **Password stored in auth.users (hashed)**

---

## 🛠️ Debug Checklist

Modal not appearing?
```sql
-- Check the flag
SELECT p.is_first_login, u.email
FROM peso p
JOIN auth.users u ON p.auth_id = u.id
WHERE u.email = 'your@email.com';
-- Should be TRUE
```

Admin can't login?
```sql
-- Check both tables exist
SELECT 
  u.id AS auth_id,
  u.email,
  u.email_confirmed_at,
  p.id AS peso_id,
  p.name
FROM auth.users u
LEFT JOIN peso p ON p.auth_id = u.id
WHERE u.email = 'your@email.com';
-- Both should have values
```

Profile picture missing?
```sql
SELECT p.profile_picture_url, u.email
FROM peso p
JOIN auth.users u ON p.auth_id = u.id
WHERE u.email = 'your@email.com';
-- Should have URL
```

---

## 📝 Schema Summary

```sql
-- What gets created during invitation:

-- 1. Auth user (Supabase)
INSERT INTO auth.users (email, user_metadata)
VALUES ('admin@example.com', '{"name":"Admin","role":"peso_admin"}');

-- 2. Peso record
INSERT INTO peso (auth_id, name, is_superadmin, is_first_login)
VALUES ('{auth_user_id}', 'Admin', false, true);

-- 3. Invitation token (audit)
INSERT INTO admin_invitation_tokens (email, admin_name, token, created_by, used)
VALUES ('admin@example.com', 'Admin', '{token}', {super_admin_id}, true);
```

---

**For full details, see: `ADMIN_INVITATION_DATABASE_SCHEMA.md`**