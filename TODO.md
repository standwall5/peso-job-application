## TODO

### Register ✅ COMPLETE
- [x] Register name should have no int, special characters
- [x] Register name capitalized
- [x] Gender should have prefer not to say
- [x] Email sample placeholder (name@example.com) and validation if there is none

Backups created: form.constants.ts.backup, validation.service.ts.backup, PersonalInfoSection.tsx.backup, ContactSection.tsx.backup, useFormHandlers.ts.backup

### Companies ✅ COMPLETE
- [x] Remove deadline and salaries

Backups created: SortJobs.tsx.backup

### Profile
- [x] Remove edit icon on name; edit details should turn all profile detail fields into editable fields
- [x] Resume edit and download icon, should be color green and blue respectively on hover
- [x] Resume at bottom should say "I hereby certify that the above information is true and correct to the best of my knowledge and belief."
- [ ] Resume adds a signature input, could use a library to draw signatures or choose to upload a photo of signature.
- [ ] Resume signature shown in admin should also have a watermark (similar to verified ids) so as to avoid information stealing
- [x] Profile section in resume should be renamed to Overview and placed after the name.

Backups created: Resume.tsx.backup, UserProfile.tsx.backup, ResumeViewSection.tsx.backup, Profile.module.css.backup, ProfileHeader.tsx.backup


### User applied jobs ✅ COMPLETE
- [x] Remove barangay ID from verified ids
- [x] Add digital / ephilsys id
- [x] Rename national ID to PhilSys or the proper national id name

Backups created: VerifiedIdManager.tsx.backup, EditIdModal.tsx.backup

### User ✅ COMPLETE
- [x] Auto-archive after a period of inactivity/not logging in (decide what that should be) (probably need to add a last_login field)

Backups created: user-archive.service.ts (new), cron route (new), AUTO_ARCHIVE_SETUP.md (guide)
Note: Requires database migration (see AUTO_ARCHIVE_SETUP.md) and cron job setup


### Admin
- [x] Add change password option
- [ ] When creating admin accounts, the superadmin sends an email to the new admin with a link to set their password.
- [ ] Superadmin sets the name of the admin and admin cannot change it so as to make sure the watermarks in verified ids are accurate as to who viewed them.
- [ ] Admins can set their own profile picture
- [x] Admins can change their own password
- [ ] If login from admin and superadmin is from an unusual IP, send a confirmation link to the email address.

Backups created: Header.tsx.backup


### Manage Jobseekers
- [x] Type of applicant shows a dropdown checkbox aligned with the choices in Register
- [x] Place of assignment shows a dropdown checkbox aligned with the choices in Register
- [x] The rows that show when clicking on an applicant in jobseekers should show deployed/rejected but should still say in progress if neither.

Backups created: AppliedJobsRow.tsx.backup, useJobseekerData.ts.backup, JobseekerSearchBar.tsx.backup, Jobseekers.tsx.backup, Jobseekers.module.css.backup, AppliedJobsTab.tsx.backup, ManageJobseeker.tsx.backup
- [x] When viewing details of applicant, in the appliedjobstab, the buttons should also include the valid id (exam result, valid id, referral)
- [ ] The last clicked application in applied jobs tab, when admin clicks back and goes back to the jobseeker page, the row that appears when they click on an applicant, that last clicked application should be highlighted in the rows.
- [x] The select archive system in jobseekers should bbe changed to an active state of the jobseeker row instead; remove checkbox for selection, isntead utilize an active state for jobseeker row for selected effect

Backups created: AppliedJobsTab.tsx.backup, ManageJobseeker.tsx.backup, JobseekerTable.tsx.backup (+ Jobseekers.module.css updated)


### Manage Company - Ignore for now
- [ ] The edit company and create company forms should have labels
- [ ] ManageCompany fix postjobstab
<!-- IGNORE FOR NOW the commented out text - [ ] Pre-screening questions show a preview first and admins can choose to modify it
- [ ] When creating an exam, -->

### Admin Reports (Partial 75%)
- [x] Summary of age bracket and sex
- [x] filter summary age bracket and sex depending if they are in paranaque
- [x] Sort is now by month instead of the current none
- [ ] Each report present in Admin Report should each be exportable and make the xlsx files better; avoid a one export of everything

Backups created: analytics.service.ts.backup, reports.actions.ts.backup
Note: Added getAgeSexSummary() and getApplicationTrendsByMonth() functions with Parañaque filtering

with all this, make a use case diagram or at least a text version or something idk so its easier. Dont make too many documentations and make backups for easy revert in case your implementation is not working as expected.
