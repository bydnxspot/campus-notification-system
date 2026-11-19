# University Notice and Announcement Management System

A locally runnable academic prototype for centralising university notices. This is **not an official university service**, institutional deployment, or integration. All accounts and notices are fictional demonstration data.

## Technologies used

- React 19 and TypeScript for the application interface and typed notice models.
- TanStack Start and TanStack Router for pages and navigation; TanStack Query provides the application query context.
- Vite 8 for local development and production bundling; Nitro supplies the standalone Node.js production server.
- Tailwind CSS 4, Radix UI controls, Lucide icons, and Sonner notifications for the existing interface.
- Browser localStorage for all notice data, demo accounts, sessions, and notification read state. **No MySQL or shared database is used.**
- Vitest, Testing Library, and jsdom for automated tests.

Use **Node.js 24.x LTS** and its bundled npm on Windows. The exported source uses the standalone configuration; no Lovable account, hosted service, private key, or environment file is needed to run it.

## Windows setup (exact steps)

1. Install **Node.js LTS 24.x** from https://nodejs.org (includes npm). Close and reopen your terminal after installation. Check `node --version` and `npm --version`.
2. Download/export the project source as a ZIP, or download the connected source repository. Extract the ZIP to a normal folder, for example `C:\Projects\university-notices`. Do not run commands inside the ZIP.
3. Open the extracted folder containing **package.json** in File Explorer. Right-click and choose **Open in Terminal**, or open Command Prompt and run:
   ```bat
   cd /d C:\Projects\university-notices
   ```
4. Install dependencies (internet required for this step):
   ```bat
   npm install
   ```
5. Start the local application:
   ```bat
   npm run dev
   ```
6. Open **http://localhost:8080** in your browser. Keep the terminal open. Press **Ctrl+C** to stop it. If port 8080 is busy, stop the other application first.

If PowerShell blocks `npm.ps1`, use Command Prompt, or run `npm.cmd install` and `npm.cmd run dev` in PowerShell. No account, API key, payment, hosting subscription, environment file, or Lovable runtime is required. After dependencies are installed, the application works without internet access. Use the same browser and URL to retain data.

## Demo credentials

Credentials are also visible on the sign-in page under **Student demo** and **Admin demo**. Click a labelled account for one-click sign-in, or use the email/password fields.

| Role | Email | Password |
| --- | --- | --- |
| System Administrator | admin@demo.edu | admin123 |
| Faculty Administrator | faculty@demo.edu | faculty123 |
| Department Administrator | dept@demo.edu | dept123 |
| Student Affairs Office | affairs@demo.edu | affairs123 |
| Lecturer | lecturer@demo.edu | lecturer123 |
| Student — Computer Science, 400 Level | student@demo.edu | student123 |
| Student — English, 200 Level | fatima@demo.edu | student123 |

The inactive sample account `inactive@demo.edu / student123` intentionally cannot sign in.

## Five-minute demonstration

1. Sign in as System Administrator. Open **New announcement**, enter a title (5–150 characters) and body (at least 20 characters). Choose a category, priority, and today's publication date. Select **Level**, **Computer Science**, **400**. Preview and close the preview; **Save as draft**.
2. In **Manage announcements**, edit the new draft, save, then **Publish**. **Archive**, **Restore** (returns to draft), and **Publish** again. Refresh to show persistence.
3. Sign out. Sign in as the Computer Science student. Open **Notices**, search for the new title, combine category/priority/date filters, then **Clear**. Open the notice to read it; this also marks its notification read.
4. Open **Notifications**; mark another alert read or use **Mark all as read**. Refresh to confirm.
5. As the student, type `http://localhost:8080/app/manage/new`: the app redirects to the dashboard. No admin links appear. Sign out and log in as the English student to show that the Computer Science targeted notice is absent.

## Manual acceptance checklist

- [ ] Incorrect password and inactive account show a clear error; all seven active demo accounts sign in.
- [ ] Admin links open dashboard, notices, notifications, management, new announcement, activity log, and user management.
- [ ] Empty/short title or body and expiry before publication prevent saving with field errors.
- [ ] Preview, attachment metadata add/edit/remove, draft save, edit, publish, unpublish, archive, and restore work. Restore yields a draft, not an automatically published notice.
- [ ] Delete confirmation can be cancelled; confirmed delete removes the notice and its notifications.
- [ ] Refresh retains announcements, session, user changes, and notification read state.
- [ ] Students see only published, date-current notices matching all-university/faculty/department/level audiences; drafts, archives, future notices, expired notices, and other departments are excluded.
- [ ] Search matches title/body without case sensitivity; category, priority, and inclusive publication-date filters combine; Clear resets all notice filters.
- [ ] Notifications contain relevant current notices; opening a notice, marking one read, and marking all read update the unread indicator.
- [ ] Direct student navigation to `/app/manage`, `/app/manage/new`, `/app/manage/n1`, `/app/activity`, and `/app/users` redirects to dashboard.
- [ ] Faculty/department/affairs/lecturer staff edit their own notices only. Only System Administrator manages users; own deactivation/demotion is refused.
- [ ] Reset demo data requires confirmation, restores the eleven sample notices with dates relative to reset, and signs out. Cancel makes no changes.
- [ ] At a narrow screen width, navigation opens/closes and forms remain usable; wide tables scroll horizontally.
- [ ] After installation, disconnect internet, restart `npm run dev`, and repeat sign-in and a notice edit.

## Tests and build

```bat
npm test
npm run build
npm run preview
```

The standalone build uses TanStack Start, React, Vite, Tailwind and Nitro's local Node server; `npm run preview` runs `.output/server/index.mjs` (normally at http://localhost:3000; use the terminal's printed address). These are standard npm dependencies. `vite.local.ts` is the standalone configuration used by npm commands; `vite.config.ts` is retained solely for the editor's preview tooling. Export the source/configuration, package.json and lockfiles, not node_modules, `.git`, or generated build output. `npm install` creates npm's lockfile on first installation; retain that lockfile for subsequent `npm ci` installs.

The provided standalone source ZIP omits editor-only tooling and includes a matching `package-lock.json`. Use `npm install` as above (or `npm ci` for the exact locked versions). The repository's editor configuration is not needed by either command.

## Final verification

- All 16 automated tests pass, covering demo login, announcement lifecycle, permissions, audience/date visibility, notifications, search, form validation, and the nested-page guard.
- Browser checks passed on the editor preview and the independent `vite.local.ts` development server: administrator and both student logins; create/edit/preview/publish/unpublish/archive/restore/delete; refresh persistence; search/category filtering; notifications and mark-as-read; five direct student attempts at administrator pages; all administrator navigation; reset confirmation; and narrow-screen navigation.
- The editor's automated compilation reported **build OK**. A separate standalone production build was **not run** in this workspace; run `npm run build` and `npm run preview` on the demonstration laptop before presenting.
- The standalone export's locked dependencies were installed successfully with npm on Linux. Actual Windows/Node.js 24 execution is **not verified** here; the numbered Windows steps above are the intended setup.
- Dependency audit reports two high-severity advisories in the existing Vite and Zod versions. No forced major dependency upgrade was made during final verification. Keep this local-only fictional-data demo bound to localhost; it is not a production-ready or publicly hosted system.

## Limitations and storage

- **localStorage only**, on this browser/origin. No MySQL, shared server database, real user authentication, email/SMS/push service, paid APIs, or hosted integration.
- Demo passwords are plaintext and role/session controls can be bypassed using browser tools. **Not suitable for production or sensitive data.** Route protections demonstrate the workflow; they are not a security boundary against someone controlling the browser.
- No data synchronisation between devices, browsers, ports, or users on separate computers. Clearing browser storage erases changes; private browsing may erase them when closed. Browser storage must be permitted and has a size limit.
- Attachments store **file name, type, and size only**; the actual file is not uploaded or downloadable. Never select sensitive files.
- Publication and expiry use UTC dates; publication/expiry endpoints are inclusive. Scheduled notices appear on/after their publication date when the page is visited/refreshed; no background email or job runs.
- Eleven seeded notices cover examinations, registration, academic calendar, hostel, scholarship, emergency, faculty/department audiences, a draft, and an archive. Older seed dates are preserved across refresh; reset before a defence to obtain fresh dates.
- This is a small demonstrable prototype, not evidence of survey results, real deployment, or official integration.