# Bot Testing Controls & Troubleshooting

## 🎮 Testing Controls

### Force Bot Mode (Admins "Unavailable")

**Use case:** Test bot responses even during business hours

**How to enable:**

Edit `src/utils/chatbot.ts` line ~22:

```typescript
export const FORCE_BOT_MODE = true;  // Change from false to true
```

**What happens:**
- All new chat requests → Status: `"active"`
- Bot responds immediately
- Admins can still join later
- Appears in "Active" tab, not "New" tab

**To disable:**
```typescript
export const FORCE_BOT_MODE = false;  // Change back to false
```

---

### Force Admin Mode (Admins "Available")

**Use case:** Test admin workflow, skip bot entirely

**How to enable:**

Edit `src/utils/chatbot.ts` line ~27:

```typescript
export const FORCE_ADMIN_MODE = true;  // Change from false to true
```

**What happens:**
- All new chat requests → Status: `"pending"`
- Bot does NOT respond
- Waits for admin to accept
- Appears in "New" tab

**To disable:**
```typescript
export const FORCE_ADMIN_MODE = false;  // Change back to false
```

---

### Normal Mode (Production)

**Both flags set to false:**

```typescript
export const FORCE_BOT_MODE = false;
export const FORCE_ADMIN_MODE = false;
```

**What happens:**
- Uses business hours logic
- Mon-Fri 8 AM - 5 PM → Admins available (pending)
- Outside hours → Bot active

---

## 🐛 Troubleshooting: Chat Goes to Active Instead of New

### Problem

When user creates chat request:
- ❌ Doesn't appear in "New Requests" tab
- ❌ Appears immediately in "Active Chats" tab
- ❌ Bot is responding (even though it shouldn't)

### Root Causes

#### 1. **Force Bot Mode is ON**

**Check:**
```typescript
// In src/utils/chatbot.ts
export const FORCE_BOT_MODE = true;  // ← Is this true?
```

**Fix:**
```typescript
export const FORCE_BOT_MODE = false;  // Set to false
```

---

#### 2. **Server Timezone is Wrong**

**Problem:** Server thinks it's outside business hours when it's actually during business hours.

**Check server logs:**
```
[Chatbot] Admin availability check: {
  serverTime: "2024-01-15T22:30:00.000Z",  ← Server time
  serverHour: 22,  ← Server hour (10 PM)
  currentDayName: "Mon",
  isBusinessDay: true,
  isBusinessHour: false,  ← Outside 8-17 range
  available: false  ← Admins "unavailable" → bot activates
}
```

**Fix Options:**

**Option A: Use Force Admin Mode for testing**
```typescript
export const FORCE_ADMIN_MODE = true;
```

**Option B: Adjust business hours to match server timezone**
```typescript
// If server is UTC and you're in Philippine Time (UTC+8)
// Philippine 8 AM = UTC 12 AM (midnight)
// Philippine 5 PM = UTC 9 AM
const BUSINESS_HOURS = {
  start: 0,   // Midnight UTC = 8 AM Philippine
  end: 9,     // 9 AM UTC = 5 PM Philippine
  days: [1, 2, 3, 4, 5],
};
```

**Option C: Convert to Philippine timezone (better)**
```typescript
export function isAdminAvailable(): boolean {
  // Testing overrides...
  
  const now = new Date();
  
  // Convert to Philippine Time (UTC+8)
  const philippineTime = new Date(now.toLocaleString("en-US", {
    timeZone: "Asia/Manila"
  }));
  
  const currentHour = philippineTime.getHours();
  const currentDay = philippineTime.getDay();
  
  // ... rest of logic
}
```

---

#### 3. **Business Hours Set to Always Unavailable**

**Check:**
```typescript
const BUSINESS_HOURS = {
  start: 8,
  end: 17,
  days: [1, 2, 3, 4, 5],  // ← Are you testing on weekend?
};
```

**Fix for testing (all days):**
```typescript
const BUSINESS_HOURS = {
  start: 0,   // Midnight
  end: 23,    // 11 PM
  days: [0, 1, 2, 3, 4, 5, 6],  // Every day
};
```

---

## 📊 Debug Logging

### Enable Logging

Already enabled! Check your server console (where `npm run dev` is running).

### What to Look For

**When user creates chat request:**

```
[Chat Request] Creating session: {
  adminAvailable: false,  ← Why is this false?
  initialStatus: "active",  ← This makes it go to Active tab
  willSendBotGreeting: true
}

[Chatbot] Admin availability check: {
  serverTime: "2024-01-15T14:30:00.000Z",
  serverHour: 14,  ← Is this correct for your timezone?
  currentDayName: "Mon",
  isBusinessDay: true,
  isBusinessHour: true,
  available: true  ← Should be true during business hours
}
```

### Reading the Logs

**Good (chat goes to New):**
```
adminAvailable: true
initialStatus: "pending"  ← Goes to New tab
willSendBotGreeting: false  ← Bot doesn't respond
```

**Bad (chat goes to Active):**
```
adminAvailable: false  ← Why?
initialStatus: "active"  ← Goes to Active tab
willSendBotGreeting: true  ← Bot responds
```

---

## 🧪 Testing Scenarios

### Test 1: Normal Business Hours Flow

**Setup:**
```typescript
FORCE_BOT_MODE = false;
FORCE_ADMIN_MODE = false;
// Test during Mon-Fri 8 AM - 5 PM your time
```

**Expected:**
1. User creates chat
2. Server logs: `adminAvailable: true, initialStatus: "pending"`
3. Chat appears in "New Requests" tab
4. Admin clicks "Accept"
5. Chat moves to "Active" tab
6. Bot does NOT respond

---

### Test 2: Bot Mode (Off-Hours)

**Setup:**
```typescript
FORCE_BOT_MODE = true;  // ← Force it
FORCE_ADMIN_MODE = false;
```

**Expected:**
1. User creates chat
2. Server logs: `[Chatbot] FORCE_BOT_MODE is ON`
3. Server logs: `adminAvailable: false, initialStatus: "active"`
4. Chat appears in "Active" tab immediately
5. Bot responds with greeting + buttons
6. User can chat with bot

---

### Test 3: Admin Joins Bot Session

**Setup:**
```typescript
FORCE_BOT_MODE = true;
```

**Steps:**
1. User creates chat (bot responds)
2. Admin opens "Active" tab
3. Sees the bot conversation
4. Admin clicks the chat
5. Admin sends message
6. User receives admin message
7. Bot stops responding (admin_id is set)

---

## 🔧 Quick Fixes

### Issue: All chats go to Active

**Quick fix for testing:**
```typescript
// src/utils/chatbot.ts
export const FORCE_ADMIN_MODE = true;
```

Restart server: `npm run dev`

Now all chats will go to "New" tab.

---

### Issue: Want to test bot during business hours

**Quick fix:**
```typescript
// src/utils/chatbot.ts
export const FORCE_BOT_MODE = true;
```

Restart server: `npm run dev`

Now bot will always activate.

---

### Issue: Server timezone is wrong

**Option 1: Use force mode**
```typescript
export const FORCE_ADMIN_MODE = true;  // For testing
```

**Option 2: Fix timezone (production)**
```typescript
export function isAdminAvailable(): boolean {
  if (FORCE_BOT_MODE) return false;
  if (FORCE_ADMIN_MODE) return true;
  
  // Convert to Philippine Time
  const now = new Date();
  const philippineTime = new Date(now.toLocaleString("en-US", {
    timeZone: "Asia/Manila"
  }));
  
  const currentHour = philippineTime.getHours();
  const currentDay = philippineTime.getDay();
  
  const isBusinessDay = BUSINESS_HOURS.days.includes(currentDay);
  const isBusinessHour = currentHour >= BUSINESS_HOURS.start && 
                         currentHour < BUSINESS_HOURS.end;
  
  return isBusinessDay && isBusinessHour;
}
```

---

## 📋 Current Issue - Checklist

Based on your problem (chat goes to Active instead of New):

- [ ] Check `FORCE_BOT_MODE` - is it `false`?
- [ ] Check `FORCE_ADMIN_MODE` - set to `true` for testing
- [ ] Check server logs - what does `adminAvailable` say?
- [ ] Check current time - are you testing during business hours?
- [ ] Check server timezone - does `serverHour` match your time?
- [ ] Restart server after making changes

---

## 🎯 Recommended for Testing

**During development, use this setup:**

```typescript
// src/utils/chatbot.ts

// Make it easy to switch modes
export const FORCE_BOT_MODE = false;    // Set true to test bot
export const FORCE_ADMIN_MODE = true;   // Set true to test admin flow

// Later in production, set both to false
```

**Benefits:**
- Easy to test both modes
- No timezone issues
- Clear which mode you're in
- Just toggle and restart

---

## 📝 Summary

**To make chats go to "New Requests" tab:**

1. Edit `src/utils/chatbot.ts`
2. Set `FORCE_ADMIN_MODE = true`
3. Set `FORCE_BOT_MODE = false`
4. Restart server: `npm run dev`
5. Create chat request
6. Should appear in "New" tab ✅

**To make chats go to "Active" tab (bot mode):**

1. Edit `src/utils/chatbot.ts`
2. Set `FORCE_BOT_MODE = true`
3. Set `FORCE_ADMIN_MODE = false`
4. Restart server
5. Create chat request
6. Should appear in "Active" tab with bot response ✅

**For production (normal mode):**

1. Set both to `false`
2. Fix timezone if needed
3. Bot activates outside business hours only

---

**Need help?** Check the server console logs - they'll tell you exactly why a chat went to Active vs. New!