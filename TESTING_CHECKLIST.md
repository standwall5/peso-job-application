# 🧪 PESO Job Application - Testing Checklist

**Last Updated:** January 13, 2026  
**Status:** Ready for Testing  
**Branch:** `main`

---

## ✅ How to Use This Checklist

- [ ] Check each item as you test
- [ ] Note any issues in the "Issues Found" section at bottom
- [ ] Test at different zoom levels (100%, 125%, 150%)
- [ ] Test on different screen sizes

---

## 🎯 Critical Features to Test

### 1. Authentication & User Management

#### Applicant Login

- [ ] Can register as new applicant
- [ ] Can login with valid credentials
- [ ] Cannot login with invalid credentials
- [ ] Password reset works
- [ ] Session persists after page refresh
- [ ] Can logout successfully

#### Admin Login

- [ ] Can login as admin/PESO staff
- [ ] Admin dashboard loads correctly
- [ ] Session persists after page refresh
- [ ] Can logout successfully

---

### 2. Applicant Features

#### Profile Management

- [ ] Can view profile
- [ ] Can edit personal details
- [ ] Can update contact information
- [ ] Profile picture upload works
- [ ] Changes save correctly
- [ ] UI is readable at 125% zoom
- [ ] UI is readable at 150% zoom

#### Resume/CV

- [ ] Can upload resume
- [ ] Can download resume
- [ ] Resume preview works
- [ ] Can edit resume sections
- [ ] Education section works
- [ ] Work experience section works
- [ ] Skills section works

#### Job Applications

- [ ] Can view available jobs
- [ ] Job listings display correctly
- [ ] Can filter jobs by category
- [ ] Can search jobs
- [ ] Can apply for a job
- [ ] Application status updates
- [ ] Can view application history

#### Exams

- [ ] Can access assigned exam
- [ ] Exam questions display correctly
- [ ] Can answer multiple choice questions
- [ ] Can answer checkbox questions
- [ ] Can answer paragraph questions
- [ ] Can submit exam
- [ ] Exam timer works (if applicable)
- [ ] Exam results display correctly

#### ID Verification

- [ ] Can upload ID documents
- [ ] Can upload front of ID
- [ ] Can upload back of ID
- [ ] Can upload selfie with ID
- [ ] Upload progress shows
- [ ] Can view verification status

#### Notifications

- [ ] Notification dropdown works
- [ ] Notifications display correctly
- [ ] Can mark notifications as read
- [ ] Notification count updates
- [ ] Real-time notifications work

---

### 3. Admin Features

#### Dashboard

- [ ] Statistics display correctly
- [ ] Charts/graphs load
- [ ] Recent activities show
- [ ] At 125% zoom, dashboard is usable
- [ ] At 150% zoom, dashboard is usable

#### Applicant Management

- [ ] Can view applicant list
- [ ] Can search applicants
- [ ] Can filter applicants
- [ ] Can view applicant profile
- [ ] Can verify applicant IDs
- [ ] Can archive applicants
- [ ] Export applicant data works

#### Company Profiles

- [ ] Can view company list
- [ ] Can create new company
- [ ] **Company name field has label** ✅
- [ ] **Contact email field has label** ✅
- [ ] **Address field has label** ✅
- [ ] **Industry field has label** ✅
- [ ] **Description field has label** ✅
- [ ] Can edit company details
- [ ] Can upload company logo
- [ ] Company logo displays correctly

#### Job Posting Management

- [ ] Can view all job postings
- [ ] Can create new job posting
- [ ] Can edit job posting
- [ ] Can delete job posting
- [ ] Can assign exam to job
- [ ] **PostJobsTab displays correctly** ✅
- [ ] **Modal opens when clicking job** ✅
- [ ] Can set job expiration date

#### Exam Management

- [ ] Can view exam list
- [ ] Can create new exam
- [ ] Can add questions to exam
- [ ] Can edit exam questions
- [ ] Can set correct answers
- [ ] Can assign exam to job
- [ ] Can view exam results
- [ ] Can grade paragraph questions

#### Reports

- [ ] Reports page loads
- [ ] Can generate applicant report
- [ ] Can generate job report
- [ ] Can generate application report
- [ ] **Export buttons visible** ✅
- [ ] Can export to Excel
- [ ] Can export to PDF
- [ ] Charts display correctly
- [ ] Date filters work

#### Chat System

- [ ] Admin can initiate chat
- [ ] Chat widget displays
- [ ] Messages send correctly
- [ ] Messages receive in real-time
- [ ] Chat history loads
- [ ] Unread message count shows

---

## 🔍 UI/UX Testing at Different Zoom Levels

### Test at 100% Zoom (Normal)

- [ ] All text is readable
- [ ] Buttons are clickable
- [ ] Forms are properly aligned
- [ ] Images display correctly
- [ ] Navigation menu works
- [ ] Dropdown menus work

### Test at 125% Zoom

- [ ] All text is readable
- [ ] No text overlap
- [ ] Buttons are clickable
- [ ] Forms don't overflow
- [ ] Sidebar navigation works
- [ ] Modals display correctly
- [ ] Tables are scrollable if needed

### Test at 150% Zoom

- [ ] All text is readable
- [ ] Layout adjusts properly
- [ ] Buttons remain accessible
- [ ] Forms are usable
- [ ] No horizontal scroll on main content
- [ ] Modals fit on screen
- [ ] Navigation collapses if needed

---

## 📱 Responsive Design Testing

### Desktop (1920x1080)

- [ ] Layout looks professional
- [ ] Sidebar visible
- [ ] Content centered or full-width
- [ ] No unnecessary spacing

### Laptop (1366x768)

- [ ] Content fits without scrolling
- [ ] Sidebar adjusts
- [ ] Text remains readable

### Tablet (768x1024)

- [ ] Sidebar collapses to hamburger
- [ ] Touch targets are large enough
- [ ] Forms are easy to fill
- [ ] Tables are scrollable

### Mobile (375x667)

- [ ] Navigation hamburger works
- [ ] Content stacks vertically
- [ ] Forms are mobile-friendly
- [ ] Buttons are thumb-friendly

---

## 🚀 Performance Testing

- [ ] Pages load in < 3 seconds
- [ ] Images load progressively
- [ ] No memory leaks in chat
- [ ] Smooth scrolling
- [ ] No laggy animations
- [ ] File uploads don't freeze UI

---

## 🔐 Security Testing

- [ ] Cannot access admin pages as applicant
- [ ] Cannot access applicant pages as admin
- [ ] Session expires after timeout
- [ ] Protected routes redirect to login
- [ ] File upload validates file types
- [ ] SQL injection attempts fail
- [ ] XSS attempts are sanitized

---

## 🐛 Known Issues (Fixed)

✅ **Company form labels missing** - FIXED  
✅ **PostJobsTab modal rendering bug** - FIXED  
✅ **Reports export buttons missing** - VERIFIED WORKING

---

## 📝 Issues Found During Testing

### Issue Template

```
**Issue #X:** [Short description]
**Severity:** High | Medium | Low
**Location:** [Page/component]
**Steps to Reproduce:**
1.
2.
3.

**Expected:**
**Actual:**
**Screenshot:** [if applicable]
**Browser:**
**Zoom Level:**
```

---

### Your Issues Go Here:

---

## ✅ Sign-Off

- [ ] All critical features tested
- [ ] All zoom levels tested
- [ ] All responsive breakpoints tested
- [ ] Performance is acceptable
- [ ] Security checks passed
- [ ] No blocking issues found

**Tested By:** **\*\***\_\_\_**\*\***  
**Date:** **\*\***\_\_\_**\*\***  
**Ready for Production:** Yes ☐ / No ☐

---

## 🆘 Need Help?

- Check `QUICK_START.md` for setup
- Check `TODO.md` for known issues
- Check `README.md` for documentation

**Happy Testing! 🎉**
