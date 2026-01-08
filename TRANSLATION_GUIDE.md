# 🌐 Translation System Guide

This guide explains how to use the translation system to support English and Tagalog throughout the application.

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [How to Use Translations](#how-to-use-translations)
4. [Adding New Translations](#adding-new-translations)
5. [Translation File Structure](#translation-file-structure)
6. [Best Practices](#best-practices)
7. [Troubleshooting](#troubleshooting)

---

## Overview

The translation system uses:
- **React Context** (`LanguageContext`) to manage language state
- **JSON files** for English (`en.json`) and Tagalog (`tl.json`) translations
- **localStorage** to persist user's language preference
- **LanguageSelector component** for switching languages

### Components:
- `src/contexts/LanguageContext.tsx` - Context provider and hook
- `src/components/LanguageSelector.tsx` - Language dropdown button
- `src/translations/en.json` - English translations
- `src/translations/tl.json` - Tagalog translations

---

## Quick Start

### 1. The LanguageProvider is Already Set Up

It's already wrapped around the app in:
- `src/app/(user)/layout.tsx` (for logged-in users)
- `src/app/(auth)/layout.tsx` (for auth pages)

### 2. Use Translations in Your Component

```tsx
"use client";
import { useLanguage } from "@/contexts/LanguageContext";

const MyComponent = () => {
  const { t, language } = useLanguage();

  return (
    <div>
      <h1>{t("nav.home")}</h1>
      <p>{t("common.loading")}</p>
      <button>{t("common.submit")}</button>
    </div>
  );
};
```

### 3. The Language Selector Button is Already Added

It appears at the bottom-right of the screen, just below the chat widget.

---

## How to Use Translations

### Basic Usage

```tsx
import { useLanguage } from "@/contexts/LanguageContext";

function MyComponent() {
  const { t } = useLanguage();

  return <h1>{t("jobs.title")}</h1>;
}
```

### Nested Keys

Translation keys use dot notation:

```tsx
t("common.search")           // → "Search" or "Maghanap"
t("jobs.manpowerNeeds")      // → "MANPOWER NEEDS" or "PANGANGAILANGAN SA MANPOWER"
t("application.submitAnswers") // → "Submit Answers" or "Isumite ang mga Sagot"
```

### Dynamic Content

```tsx
const count = 5;
return (
  <p>
    {t("application.answered")} {count} {t("application.of")} {total} {t("application.questions")}
  </p>
);
// Output: "Answered 5 of 10 questions" or "Nasagot 5 sa 10 mga tanong"
```

### Get Current Language

```tsx
const { language } = useLanguage();

if (language === "en") {
  // Do something for English
} else if (language === "tl") {
  // Do something for Tagalog
}
```

### Manually Change Language

```tsx
const { setLanguage } = useLanguage();

<button onClick={() => setLanguage("tl")}>Switch to Tagalog</button>
<button onClick={() => setLanguage("en")}>Switch to English</button>
```

---

## Adding New Translations

### Step 1: Add to English File

Edit `src/translations/en.json`:

```json
{
  "common": {
    "search": "Search",
    "newKey": "New English Text"  // ← Add here
  },
  "newSection": {                  // ← Or create new section
    "greeting": "Hello, welcome!",
    "farewell": "Goodbye!"
  }
}
```

### Step 2: Add to Tagalog File

Edit `src/translations/tl.json`:

```json
{
  "common": {
    "search": "Maghanap",
    "newKey": "Bagong Tekstong Tagalog"  // ← Add here
  },
  "newSection": {
    "greeting": "Kamusta, maligayang pagdating!",
    "farewell": "Paalam!"
  }
}
```

### Step 3: Use in Your Component

```tsx
const { t } = useLanguage();

<p>{t("common.newKey")}</p>
<h1>{t("newSection.greeting")}</h1>
```

---

## Translation File Structure

### Current Sections in `en.json` and `tl.json`:

```
common/          - Common words (search, login, logout, buttons, etc.)
nav/             - Navigation items (home, profile, etc.)
jobs/            - Job listings (titles, labels, sorting, etc.)
application/     - Application process (pre-screening, resume, etc.)
profile/         - User profile sections
company/         - Company information
auth/            - Authentication (login, signup, password, etc.)
chat/            - Chat widget
footer/          - Footer links and text
```

### Example Translation Object:

```json
{
  "section": {
    "key": "Translation text",
    "anotherKey": "Another translation"
  }
}
```

---

## Best Practices

### ✅ DO:

1. **Keep keys descriptive**
   ```tsx
   t("jobs.searchPlaceholder")  // Good
   t("p1")                       // Bad
   ```

2. **Group related translations**
   ```json
   {
     "profile": {
       "edit": "Edit Profile",
       "view": "View Profile",
       "save": "Save Profile"
     }
   }
   ```

3. **Use consistent naming conventions**
   - Use camelCase for keys
   - Use descriptive names
   - Group by feature/section

4. **Keep text short and clear**
   - UI buttons should be concise
   - Error messages should be helpful

5. **Always add BOTH English and Tagalog**
   - Never add a key to just one file
   - Keep the structure identical in both files

### ❌ DON'T:

1. **Hardcode text strings**
   ```tsx
   <button>Apply Now</button>  // Bad
   <button>{t("common.applyNow")}</button>  // Good
   ```

2. **Use translation keys for dynamic data**
   ```tsx
   // Bad - Don't translate data from database
   t(companyName)
   
   // Good - Only translate labels
   <label>{t("company.name")}</label>
   <span>{companyName}</span>
   ```

3. **Forget to add translations to both files**
   - Always update both `en.json` AND `tl.json`

---

## Examples

### Button with Translation

```tsx
import { useLanguage } from "@/contexts/LanguageContext";

function ApplyButton() {
  const { t } = useLanguage();
  
  return (
    <button onClick={handleApply}>
      {t("common.applyNow")}
    </button>
  );
}
```

### Form with Translation

```tsx
function LoginForm() {
  const { t } = useLanguage();
  
  return (
    <form>
      <label>{t("auth.email")}</label>
      <input type="email" placeholder={t("auth.email")} />
      
      <label>{t("auth.password")}</label>
      <input type="password" placeholder={t("auth.password")} />
      
      <button type="submit">{t("common.login")}</button>
      <a href="/forgot-password">{t("auth.forgotPassword")}</a>
    </form>
  );
}
```

### Toast/Alert with Translation

```tsx
function MyComponent() {
  const { t } = useLanguage();
  
  const handleSubmit = async () => {
    try {
      await submitData();
      showToast(t("application.preScreeningSubmitted"), t("application.answersSubmitted"));
    } catch (error) {
      showToast(t("application.preScreeningFailed"), error.message);
    }
  };
}
```

### Conditional Rendering Based on Language

```tsx
function DateDisplay({ date }) {
  const { language } = useLanguage();
  
  return (
    <span>
      {language === "en" 
        ? date.toLocaleDateString("en-US")
        : date.toLocaleDateString("tl-PH")}
    </span>
  );
}
```

---

## Troubleshooting

### Issue: Translation shows the key instead of text

**Problem:** `t("common.search")` displays `"common.search"` instead of `"Search"`

**Solutions:**
1. Check if the key exists in both `en.json` and `tl.json`
2. Make sure the key path is correct (case-sensitive!)
3. Verify the translation files are properly formatted JSON
4. Restart the dev server after adding new translations

### Issue: Language doesn't persist after refresh

**Problem:** Language resets to English after page reload

**Solution:** The language preference is saved in localStorage automatically. If it's not working:
1. Check browser console for errors
2. Verify localStorage is enabled in the browser
3. Check if the `LanguageProvider` wraps your app correctly

### Issue: Some text is still in English when Tagalog is selected

**Problem:** Not all text is translated

**Solution:** 
1. Find the hardcoded text in the component
2. Add a translation key to both `en.json` and `tl.json`
3. Replace the hardcoded text with `t("section.key")`

### Issue: New translation doesn't appear

**Problem:** Added translation to JSON but it doesn't show

**Solution:**
1. Verify JSON syntax (no trailing commas, proper quotes)
2. Restart the development server
3. Hard refresh the page (Ctrl+Shift+R or Cmd+Shift+R)
4. Check browser console for JSON parsing errors

---

## Language Selector Styling

The language selector button appears at:
- **Desktop:** Bottom-right corner, below chat widget
- **Mobile:** Adjusted position for smaller screens

To modify its position, edit `src/components/LanguageSelector.module.css`:

```css
.languageSelector {
    position: fixed;
    bottom: 6rem;      /* ← Distance from bottom */
    right: 2rem;       /* ← Distance from right */
    z-index: 999;      /* ← Layer order */
}
```

---

## Next Steps

### To Translate More Pages:

1. Identify all hardcoded text strings
2. Add translation keys to both JSON files
3. Import `useLanguage` hook
4. Replace hardcoded text with `t("key")`

### Priority Areas to Translate:

- ✅ Job listings page (partially done)
- ⬜ Navigation bar
- ⬜ Footer
- ⬜ Profile page
- ⬜ Application forms
- ⬜ Chat widget
- ⬜ Admin pages (if needed)
- ⬜ Error messages
- ⬜ Success messages

---

## Support

For questions or issues with the translation system:
1. Check this guide first
2. Look at existing translated components for examples
3. Verify translation keys exist in both JSON files
4. Check browser console for errors

---

Happy translating! 🌐🇵🇭🇺🇸