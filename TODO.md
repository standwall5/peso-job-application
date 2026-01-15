## TODO

- [x] Ensure reports in admin is working correct
- [x] implement the same profile icon in user for admins (and super admin) (put the profile icon in header for admin).
- [x] implement dropdown when clicking profile icon in header
- [x] (AD01) move change password and change profile into one modal (by clicking the profile icon user and clicking the dropdown that says profile)
- [ ] jobseekser
- [x] implement deployed jobseekers system (if jobseeker is marked as deployed they will be moved to the deployed page)
- [x] make a deployed jobseekers page (exact design as archived jobseekers, admin has option to also change status of jobseeker to not deployed)
- [x] if applicant is deployed, they will be able to access the system but if they try to click on a job card, application modal wont appear, instead a notice modal will appear saying "You don't have access to the website as you are currently deployed.
      If you wish to re-apply
      <button>Chat with Admin</button>(opens chat widget if clicked)"

- [ ] Make sure ID is viewable on admin side (sharp keeps failing on vercel, please dont recommend to turn off image optimizations or an npm install in vercel.json)
- [x] When user submits an id in ApplicationModal tsx, it should now appear in profile. Please remember/keep the implementation of having different set ID pictures for each type of ID.
- [x] (ID01) When user selects POSTAL ID in profile, if there is an uploaded POSTAL ID picture, it should show that, and if they switch to NATIONAL ID, it should show the pictures/IDS set for national ID.
- [x] In application modal, same behavior as ID01
- [x] In application modal, if user uploads a new set of ID pictures (they have uploaded for front id,back id and selfie with id), or when they click save, for ID, a modal should appear saying "ID successfully saved. Use this ID for future applications?" It means we need to remove the hardcoded NATIONAL ID and maybe add a new field in the database for default ID? please refer to the database file.
- [x] Admin should be able to set an ID as verified or not. (should be in verify ID)
- [x] ID View of applicant in admin should have a dropdown too of the types of ID (Same behavior as ID01 just admin)
- [x] If admin sets an ID as verified, a small check icon with a green circle bg should be at the top right corner of each ID (or maybhe just one check, idk where you would put that though) in ID section of profile.
- [ ] Ensure admin change password does work.
- [x] Verify if when super admin creates an account, a unique login link is sent to the email of a created admin (or if you think a generated password is better) then, the first time they login, a modal should appear (AD01) where they can change password (without needing a link sent to their email, it just works there because its their first time logging in, make sure to implement security for this and cant be exploited) and profile pic.
