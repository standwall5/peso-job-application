# Remaining Implementation Tasks

## Status Color Coding Implementation

### Files to Update:

1. **src/app/admin/jobseekers/components/Jobseekers.module.css**
   - Update `.statusPending` to use orange colors
   - Update `.statusReferred` to use blue colors
   - Update `.statusDeployed` to use green colors

2. **src/app/admin/jobseekers/components/list/AppliedJobsRow.tsx**
   - Verify status badge color assignments

3. **Global Status Badge Styles**
   - Create consistent status badge styles across the application

### Color Specifications:

```css
/* Pending - Orange */
.statusPending {
    background-color: #fff7ed;
    color: #f97316;
    border: 1px solid #fb923c;
}

/* Referred - Blue */
.statusReferred {
    background-color: #eff6ff;
    color: #3b82f6;
    border: 1px solid #60a5fa;
}

/* Deployed - Green */
.statusDeployed {
    background-color: #ecfdf5;
    color: #10b981;
    border: 1px solid: #34d399;
}
```

---

## Admin Sidebar Enhancements

### 1. Burger Menu for Mobile

Add to **src/app/admin/components/Sidebar.tsx**:

```tsx
const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

// Add burger button (visible only on mobile)
<button
  className={styles.burgerButton}
  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
  aria-label="Toggle menu"
>
  <span className={styles.burgerLine}></span>
  <span className={styles.burgerLine}></span>
  <span className={styles.burgerLine}></span>
</button>

// Wrap sidebar in conditional for mobile
<section className={`${styles.sideBar} ${mobileMenuOpen ? styles.mobileOpen : ''}`}>
```

Add to **src/app/admin/Admin.module.css**:

```css
.burgerButton {
  display: none; /* Hidden on desktop */
  position: fixed;
  top: 1rem;
  left: 1rem;
  z-index: 1001;
  background: var(--accent);
  border: none;
  padding: 0.75rem;
  border-radius: 0.375rem;
  cursor: pointer;
  flex-direction: column;
  gap: 0.25rem;
}

.burgerLine {
  width: 24px;
  height: 3px;
  background: white;
  border-radius: 2px;
  transition: all 0.3s ease;
}

@media (max-width: 1024px) {
  .burgerButton {
    display: flex;
  }

  .sideBar {
    transform: translateX(-100%);
    transition: transform 0.3s ease;
    position: fixed;
    left: 0;
    top: 0;
    height: 100vh;
    z-index: 1000;
  }

  .sideBar.mobileOpen {
    transform: translateX(0);
  }
}
```

### 2. Dropdown Indicator Icons

Update expandable menu items in **src/app/admin/components/Sidebar.tsx**:

```tsx
<li
  className={`${styles.menuItem} ${
    openMenus.includes("dashboard") ? styles.active : ""
  }`}
  onClick={() => handleToggle("dashboard")}
>
  <span>Dashboard</span>
  <svg
    className={`${styles.dropdownIcon} ${openMenus.includes("dashboard") ? styles.rotated : ""}`}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
  >
    <path
      fillRule="evenodd"
      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
      clipRule="evenodd"
    />
  </svg>
  <ul
    className={`${styles.subMenu} ${openMenus.includes("dashboard") ? styles.open : ""}`}
  >
    {/* submenu items */}
  </ul>
</li>
```

Add to **src/app/admin/Admin.module.css**:

```css
.menuItem {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1.5rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.dropdownIcon {
  width: 1.25rem;
  height: 1.25rem;
  transition: transform 0.3s ease;
}

.dropdownIcon.rotated {
  transform: rotate(180deg);
}
```

---

## Admin Chat Search Enhancement

Update **src/components/chat/AdminChatPanel.tsx**:

```tsx
const [searchQuery, setSearchQuery] = useState("");

// Add search input
<div className={styles.searchContainer}>
  <input
    type="text"
    placeholder="Search applicants..."
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
    className={styles.searchInput}
  />
</div>;

// Filter chats based on search
const filteredPendingChats = pendingChats.filter(
  (chat) =>
    chat.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.concern.toLowerCase().includes(searchQuery.toLowerCase()),
);
```

Add CSS:

```css
.searchContainer {
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
}

.searchInput {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  transition: border-color 0.2s;
}

.searchInput:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
}
```

---

## Summary of Completed Changes

✅ ID Verification rejection reasons dropdown  
✅ Auto-archive changed to 30 days  
✅ Referral Reports changed to line graph  
⚠️ Resume icon buttons (already implemented)  
⚠️ 3 ID requirement (already configured)

## Remaining Manual Implementation

- Burger menu for admin sidebar
- Dropdown indicators on expandable items
- Chat search functionality
- Status color standardization

These can be implemented by copying the code snippets above into the appropriate files.
