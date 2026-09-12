# Complete the Project: Personal Interview Preparation & Engineering Growth Tracker

## Objective

Take the existing project and turn it into a **complete, production-quality personal interview preparation tracker** that I can use comfortably on both desktop and mobile after deploying it on **Vercel or Netlify** (whichever is easiest to set up).

This should **NOT remain a simple spreadsheet-based tracker**.

The spreadsheet should only be used as an **input/import mechanism for DSA problems**. Once DSA data is imported, the application itself should become the primary source of truth and provide a complete dashboard and tracking experience.

Think of this as a polished personal productivity/productivity SaaS application for tracking:

- DSA
- System Design
- Development Projects
- Learning / Study Notes
- Interview Preparation
- Progress
- Consistency
- Goals
- Daily activity
- Time spent
- Overall readiness

The final result should feel like a real product, not a demo or CRUD prototype.

---

# 1. FIRST: AUDIT THE EXISTING PROJECT

Before making changes:

1. Inspect the entire repository.
2. Understand:
   - Frontend architecture
   - Backend/API architecture, if present
   - Database/storage strategy
   - Authentication, if present
   - Existing components
   - Existing routes
   - Existing dashboard
   - Spreadsheet/CSV import implementation
   - Time tracking implementation
   - Delete functionality
   - State management
   - Deployment configuration
   - Environment variables
3. Run the existing application.
4. Identify all current errors, broken flows, console errors, TypeScript errors, API errors, UI issues, mobile issues, and data persistence problems.
5. Do not blindly rewrite working functionality.
6. Refactor where necessary, but preserve useful existing functionality.

Create a short internal implementation plan before making major changes.

---

# 2. CHANGE THE CORE PRODUCT IDEA

Change the product concept from a sheet-centric tracker into:

> **A complete Interview Preparation & Engineering Growth Tracker**

The DSA spreadsheet is simply an import source.

The application should not feel like:

> "I uploaded a sheet and now I can view my sheet."

It should feel like:

> "This is my personal engineering/interview preparation command center."

---

# 3. MAIN APPLICATION SECTIONS

Divide the application into clear sections:

- Dashboard
- DSA Tracker
- System Design
- Projects
- Daily Journal / Activity
- Goals & Roadmap
- Analytics
- Settings

Use a responsive sidebar on desktop and a mobile-friendly navigation pattern on phones.

Do not overcrowd the navigation.

---

# 4. DASHBOARD

The dashboard should be the central command center.

## DSA

Show:

- Total problems
- Completed
- Remaining
- Completion %
- Easy / Medium / Hard distribution
- Problems solved this week
- Problems solved this month
- Current streak
- Longest streak
- Topics completed
- Weak topics
- Recently solved problems
- Upcoming/recommended problems

## System Design

Show:

- Topics studied
- Topics remaining
- Notes created
- Study streak
- Recent study sessions
- Current focus topic
- Progress percentage

## Projects

Show:

- Active projects
- Completed projects
- Current project
- Project progress
- Recent project activity

## Overall

Show:

- Today's activity
- Time spent today
- Time spent this week
- Weekly goal progress
- Monthly goal progress
- Current preparation streak
- Overall preparation score/readiness indicator

The dashboard should provide useful insights, not just display numbers.

---

# 5. DSA TRACKER

This is the only section that should support spreadsheet importing.

## Import

Allow the user to upload a DSA sheet.

Support common formats where practical:

- CSV
- XLSX

The import system should:

1. Validate the file.
2. Validate required columns.
3. Show a preview before importing.
4. Detect duplicates.
5. Inform the user about duplicate rows.
6. Allow safe import.
7. Never silently overwrite existing records.
8. Provide clear import success/error feedback.
9. Preserve existing records.
10. Store imported DSA problems in the application's database/storage.

The sheet should NOT remain the primary data source after import.

---

# 6. DSA DATA MODEL

Design a proper DSA problem model.

Potential fields:

- id
- title
- platform
- problemUrl
- difficulty
- topic
- subTopic
- pattern
- status
- notes
- approach
- mistakes
- timeTaken
- attempts
- confidence
- solvedAt
- reviewAt
- createdAt
- updatedAt

Do not add unnecessary fields simply for complexity.

Use the existing spreadsheet's columns where appropriate and intelligently map them.

---

# 7. DSA STATUS

Support statuses such as:

- Not Started
- In Progress
- Solved
- Needs Review
- Revisit

The user should be able to update status directly from the application.

Do not require editing the original spreadsheet.

---

# 8. DSA PROBLEM DETAIL PAGE

Clicking a problem should open a proper detail view.

Include:

- Problem title
- Difficulty
- Topic
- Pattern
- Platform
- Problem link
- Status
- Notes
- Approach
- Mistakes
- Confidence
- Time spent
- Attempt count
- Last solved date
- Next review date

Allow editing.

Changes must persist correctly.

---

# 9. DSA FILTERING AND SEARCH

Provide professional filtering:

- Search
- Difficulty
- Topic
- Pattern
- Status
- Platform
- Solved / unsolved
- Date
- Needs review

Allow sorting by:

- Recently solved
- Difficulty
- Topic
- Time spent
- Review date
- Created date

The UI must remain usable on mobile.

---

# 10. DSA REVIEW SYSTEM

Add a lightweight revision system.

For solved problems, allow:

- Mark for review
- Review date
- Confidence
- Mistakes
- Reattempt

Dashboard should surface problems that need revision.

Example:

> "3 problems are due for review today."

Do not build an unnecessarily complicated spaced-repetition algorithm unless the existing architecture makes it easy.

---

# 11. SYSTEM DESIGN SECTION

This must be a completely independent tracker.

Do NOT make it another spreadsheet.

The System Design section should behave like a study/workspace.

Allow the user to track topics such as:

- Scalability
- Load Balancing
- Caching
- Databases
- Distributed Systems
- Message Queues
- CAP Theorem
- Consistency
- Sharding
- Replication
- Microservices
- API Design
- System Architecture

The user should be able to create/edit/delete topics.

---

# 12. SYSTEM DESIGN DAILY NOTES

Provide a daily study journal specifically for System Design.

Each entry should support:

- Date
- Topic studied
- What I learned
- Key concepts
- Questions
- Things I didn't understand
- Architecture/design notes
- Resources
- Confidence
- Time spent
- Next steps

Example:

> Date: September 8
> Topic: Database Sharding
> Studied: Horizontal partitioning and shard keys
> Learned: ...
> Still unclear: ...
> Next step: Study consistent hashing

Make this feel like a proper engineering study journal.

---

# 13. SYSTEM DESIGN PROGRESS

For every System Design topic, track:

- Status
- Progress %
- Confidence
- Notes
- Last studied
- Next review
- Time invested

Suggested statuses:

- Not Started
- Learning
- Practicing
- Comfortable
- Needs Review

Dashboard should summarize this.

---

# 14. SYSTEM DESIGN PROBLEM / CASE STUDY TRACKING

Allow the user to create system design exercises such as:

- Design URL Shortener
- Design Instagram
- Design YouTube
- Design Uber
- Design WhatsApp
- Design Notification System

Each case study can have:

- Problem statement
- Requirements
- Functional requirements
- Non-functional requirements
- High-level architecture
- Components
- Database choice
- Scaling considerations
- Bottlenecks
- Trade-offs
- Final notes
- Confidence
- Status
- Time spent

This should be editable directly in the application.

---

# 15. PROJECTS SECTION

Create a proper project tracker.

A project should have:

- Project name
- Description
- Status
- Priority
- Start date
- Target date
- Progress
- Tech stack
- Repository URL
- Deployment URL
- Goals
- Notes

Statuses:

- Planned
- Active
- On Hold
- Completed

---

# 16. PROJECT DAILY LOG

Each project should have its own activity journal.

Example:

### September 8

Time spent: 2h 15m

Worked on:
- Authentication
- API integration

Completed:
- Login API

Blockers:
- JWT refresh flow

Next:
- Implement refresh token handling

This should make the project tracker useful for long-running projects.

---

# 17. DAILY JOURNAL / ACTIVITY

Create a centralized daily activity system.

Each day should allow the user to record:

- DSA activity
- System Design activity
- Project activity
- General learning
- Notes
- Time spent
- Today's wins
- Problems/blockers
- Tomorrow's priorities

This should provide a timeline of the user's preparation journey.

---

# 18. TIME TRACKING — FIX COMPLETELY

The existing time-log functionality has issues.

Audit and fix it completely.

Time tracking must be reliable.

Requirements:

- Start timer
- Pause timer
- Resume timer
- Stop timer
- Manual time entry
- Edit time entry
- Delete time entry
- Correct duration calculation
- Correct date handling
- Correct timezone handling
- No duplicate timers
- No negative durations
- No broken timers after refresh
- No incorrect durations after closing/reopening browser
- Persist active timer state appropriately
- Correctly handle midnight/date changes
- Correctly calculate daily/weekly/monthly totals

If a timer is running and the page refreshes, the timer should not reset incorrectly.

Use timestamps rather than incrementing a client-side counter as the source of truth.

For example:

`duration = endTimestamp - startTimestamp`

Do not trust a JavaScript interval as the authoritative elapsed time.

---

# 19. TIME LOG CATEGORIES

Time logs should be associated with:

- DSA
- System Design
- Project
- General Learning
- Other

Allow optional linking to:

- DSA problem
- System Design topic
- System Design case study
- Project

This allows meaningful analytics.

---

# 20. DELETE FUNCTIONALITY

Fix all delete functionality.

Deleting a record should actually delete it from persistent storage.

Do not merely remove it from UI state.

Requirements:

- Delete confirmation
- Clear warning for destructive action
- Backend/database deletion
- UI updates immediately after successful deletion
- Proper error handling
- No stale records after refresh
- No orphaned references where possible

For important records, use a confirmation such as:

> "Delete this record permanently?"

If cascading deletion is dangerous, handle relationships safely.

---

# 21. DATA PERSISTENCE

This is critical.

The application must not depend on temporary browser state for important information.

Audit every feature and determine:

- What is persisted?
- Where?
- When?
- What happens after refresh?
- What happens after deployment?
- What happens from another device?

If the existing project uses localStorage for everything, evaluate whether that is appropriate.

Because I want to use this on my phone after deploying to Vercel or Netlify, the application should have a proper persistent backend/database where appropriate.

Do NOT assume serverless platform filesystem storage is persistent (neither Vercel nor Netlify provides persistent disk).

Use the existing backend/database if appropriate. If the project lacks a proper persistent data layer, introduce an appropriate production-ready solution that works well with both Vercel and Netlify.

Keep architecture simple and maintainable.

---

# 22. MOBILE-FIRST EXPERIENCE

The application must work properly on phones.

Test responsive layouts at approximately:

- 320px
- 375px
- 390px
- 430px
- tablet
- desktop

Fix:

- overflowing tables
- horizontal scrolling
- tiny buttons
- unusable modals
- oversized navigation
- broken charts
- form layouts
- date pickers
- dropdowns
- cards
- timer controls

On mobile, DSA tables should transform into cards or another usable layout instead of forcing a massive spreadsheet across the screen.

Buttons should be touch-friendly.

---

# 23. PWA / PHONE EXPERIENCE

If appropriate for the architecture, make the application installable as a PWA.

Include:

- manifest
- icons
- mobile-friendly viewport
- installable experience

Do not add unnecessary offline complexity unless it can be implemented reliably.

The primary requirement is:

> Open the deployed URL (Vercel or Netlify) on my phone and have the application work properly.

---

# 24. ANALYTICS

Create an Analytics section.

## DSA

- Problems solved over time
- Difficulty distribution
- Topic distribution
- Weekly/monthly activity
- Average time per problem
- Completion rate
- Review backlog

## System Design

- Hours studied
- Topics completed
- Study consistency
- Case studies completed

## Projects

- Hours invested
- Projects completed
- Active projects
- Activity over time

## Overall

- Total study hours
- DSA hours
- System Design hours
- Project hours
- Weekly consistency
- Monthly consistency
- Streak

Charts should be clean and meaningful.

Avoid adding charts just for decoration.

---

# 25. GOALS & ROADMAP

Create a section for goals.

Allow:

- Daily goals
- Weekly goals
- Monthly goals

Examples:

- Solve 3 DSA problems/day
- Study System Design 1 hour/day
- Complete 2 case studies/week
- Spend 10 hours/week on projects

Track:

- Target
- Actual
- Progress
- Completion %

Show progress on the dashboard.

---

# 26. SETTINGS

Include:

- Profile/preferences
- Theme
- Timezone
- Default daily goal
- Data import/export
- Reset/clear data if appropriate
- Application preferences

If authentication exists, ensure account/session handling is production-safe.

---

# 27. DATA IMPORT / EXPORT

Provide a safe way to export application data.

Potential formats:

- JSON
- CSV

Export should include important user-created records.

This protects against vendor/database dependency.

Also provide a way to import exported application data if practical.

---

# 28. UI/UX QUALITY

Make the interface feel like a polished modern productivity application.

Use:

- consistent spacing
- clear typography
- hierarchy
- meaningful empty states
- loading states
- skeletons where useful
- success notifications
- error notifications
- confirmation dialogs
- accessible controls
- keyboard accessibility where appropriate

Do not overdesign it.

Prioritize:

> clarity > decoration

The application should feel professional enough that I could confidently show it to someone.

---

# 29. EMPTY STATES

Every section should have useful empty states.

Examples:

DSA:

> "No DSA problems yet. Upload your first problem set to get started."

System Design:

> "Start your System Design journey by adding your first topic."

Projects:

> "No active projects. Add a project to start tracking your work."

Daily Journal:

> "No activity logged today."

Do not leave blank screens.

---

# 30. ERROR HANDLING

Audit the entire application for failures.

Handle:

- API failures
- database failures
- invalid uploads
- malformed spreadsheet data
- duplicate records
- network failures
- failed deletes
- failed updates
- authentication errors
- invalid form values

Errors should be understandable to a normal user.

Do not expose raw stack traces in the UI.

---

# 31. SECURITY

Before deployment:

- Do not expose secrets in frontend code.
- Validate server-side input.
- Validate uploaded files.
- Protect API routes where necessary.
- Sanitize user-generated content where appropriate.
- Do not trust client-provided timestamps blindly.
- Do not expose database credentials.

Review environment variables and deployment configuration.

---

# 32. DEPLOYMENT (VERCEL + NETLIFY)

The final application must be deployable to **both Vercel and Netlify**.

I may not know how to deploy, so the application must include:

1. A clear `netlify.toml` configuration file in the repository root
2. A clear `vercel.json` configuration file if needed (or work without one)
3. Step-by-step deployment instructions for both platforms in the README

Audit:

- build command
- start command
- environment variables
- API routes (must work as serverless functions on both platforms)
- database connection
- CORS if applicable
- production URLs
- asset paths
- routing
- SPA fallback behavior
- serverless compatibility
- Netlify adapter/plugin for Next.js (if using Next.js)

## Netlify-Specific Requirements

- Include `@netlify/plugin-nextjs` in the build plugins (handles Next.js SSR/API routes on Netlify)
- Create a `netlify.toml` file:

```toml
[build]
  command = "npm run build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

- Ensure API routes work as Netlify Functions (the plugin handles this automatically)
- Environment variables must be set in Netlify dashboard (Site settings → Environment variables)

## Vercel-Specific Requirements

- Next.js deploys natively to Vercel with zero configuration
- Environment variables must be set in Vercel dashboard (Settings → Environment Variables)

Run a production build locally before considering the project complete.

Fix every build error and warning that can reasonably be fixed.

---

# 33. DATA MODEL / ARCHITECTURE

Design the data model around the actual application rather than the spreadsheet.

Potential entities:

```text
User
DSAProblem
DSAReview
SystemDesignTopic
SystemDesignNote
SystemDesignCaseStudy
Project
ProjectLog
DailyJournal
TimeLog
Goal
Activity
```

Do not blindly create all of these if the existing architecture can represent them cleanly.

Avoid unnecessary duplication.

Use relationships where appropriate.

---

# 34. IMPORTANT: DO NOT BREAK EXISTING DATA

Before migrations or structural changes:

1. Understand the current data structure.
2. Preserve existing data wherever possible.
3. Provide migration logic if required.
4. Do not silently delete existing records.

If a breaking migration is unavoidable, document it clearly.

---

# 35. DSA SHEET WORKFLOW

The intended workflow is:

```text
Create/download DSA sheet
        ↓
Upload into DSA Tracker
        ↓
Preview & validate
        ↓
Import
        ↓
DSA problems become application records
        ↓
Track progress directly in application
        ↓
Complete the sheet/problem set
        ↓
Import the next DSA sheet
        ↓
Continue tracking everything in the same application
```

The dashboard should aggregate all imported DSA sets.

Do NOT create a separate application/sheet view for every upload unless useful.

The application should have one unified DSA tracker.

Optionally track:

- Dataset / Batch
- Sheet name
- Import date

This allows multiple DSA sheets without fragmenting the application.

---

# 36. MULTIPLE DSA SHEETS

I explicitly do NOT want the application limited to one sheet.

For example:

```text
DSA Batch 1
Blind 75
        ↓
DSA Batch 2
Striver A2Z
        ↓
DSA Batch 3
Company-specific problems
```

All should coexist.

The user should be able to:

- import multiple datasets
- filter by dataset
- see unified progress
- see individual dataset progress
- avoid duplicate problems
- continue from where they left off

---

# 37. SEARCH

Implement global search if practical.

Search across:

- DSA problems
- System Design topics
- System Design notes
- Projects
- Journal entries

Search results should clearly identify the section/type.

---

# 38. PERFORMANCE

The application should remain responsive with:

- 1,000+ DSA problems
- hundreds of journal entries
- hundreds of time logs
- multiple projects
- multiple notes

Avoid unnecessary re-renders.

Paginate or virtualize large datasets where appropriate.

Do not load everything unnecessarily on every page.

---

# 39. ACCESSIBILITY

Use:

- semantic HTML
- labels
- keyboard navigation
- accessible dialogs
- visible focus states
- appropriate ARIA where needed
- sufficient contrast

Do not sacrifice accessibility for visual styling.

---

# 40. TESTING

Before completion, test the important workflows.

## DSA

- Upload valid sheet
- Upload invalid sheet
- Duplicate import
- Edit problem
- Delete problem
- Search
- Filter
- Change status
- Add notes
- Refresh page
- Reopen application

## Time

- Start
- Pause
- Resume
- Stop
- Refresh during timer
- Manual entry
- Edit
- Delete
- Cross midnight if possible
- Verify totals

## System Design

- Add topic
- Edit topic
- Delete topic
- Add daily note
- Edit note
- Delete note
- Add case study
- Update progress

## Projects

- Create
- Edit
- Delete
- Add project log
- Track time

## Dashboard

Verify all metrics against underlying data.

## Mobile

Actually test responsive layouts.

---

# 41. IMPORTANT QUALITY BAR

Do not stop after "it works."

The final application should be:

- reliable
- responsive
- maintainable
- intuitive
- production-ready
- mobile-friendly
- persistent
- visually polished
- easy to extend

Avoid:

- fake functionality
- placeholder buttons
- hardcoded statistics
- dummy data presented as real data
- unnecessary animations
- unnecessary dependencies
- fragile client-side-only persistence
- duplicated logic
- silent failures

---

# 42. FINAL REVIEW

Before declaring the task complete:

1. Run lint.
2. Run tests.
3. Run production build.
4. Check browser console.
5. Check network errors.
6. Test desktop.
7. Test mobile.
8. Test refresh persistence.
9. Test delete persistence.
10. Test timer persistence.
11. Test multiple DSA imports.
12. Verify dashboard calculations.
13. Verify database persistence.
14. Verify environment variables.
15. Verify Vercel and Netlify deployment compatibility.

Fix issues rather than merely reporting them.

---

# 43. FINAL DELIVERABLE

When finished, provide:

## A. What was changed

Concise summary of major improvements.

## B. Architecture

Explain the final architecture and data flow.

## C. Database

Explain the entities/schema and relationships.

## D. Environment Variables

List required environment variables without exposing secrets.

## E. Deployment

Give exact step-by-step instructions to deploy to both Vercel and Netlify.
Include screenshots or detailed descriptions so a beginner can follow.
Assume the user has never deployed a web application before.

## F. Testing

Report what was tested and the results.

## G. Known limitations

Only mention genuine remaining limitations.

---

# 44. CURRENT PROJECT STATE — AUDIT REFERENCE

The existing project ("Focus Ledger") is a **local-first activity timer** built with:

## Current Architecture

```text
Backend:   Node.js v20+, Express 5, vanilla JavaScript (ES modules)
Frontend:  Vanilla HTML5, CSS3, vanilla JS (no framework, no bundler)
Storage:   Local JSON files on disk (data/state.json, data/history.json)
Cloud:     Google Sheets API v4 via a service account
Hosting:   Runs only on localhost:3000 (not deployed)
```

## Current Files

```text
src/
  server.js              — Express server with timer API routes + sessions API
  config.js              — env-based config (port, timezone, sheet IDs, keys)
  domain/
    categories.js        — 5 categories: DSA, System Design, Project, Extra Learning, Office Work
  lib/
    errors.js            — AppError, IntegrationUnavailableError
    time.js              — sheetDate, sheetTime, durationMinutes helpers
  services/
    sheets-service.js    — Google Sheets append + schema validation (577 lines)
    timer-service.js     — Single-timer start/stop/retry state machine
  storage/
    state-store.js       — Atomic JSON read/write for running timer state
    session-store.js     — Append-only local session history with filtering

public/
  index.html             — Timer page
  app.js                 — Timer frontend logic (vanilla JS)
  dashboard.html         — Dashboard page (Chart.js)
  dashboard.js           — Dashboard charting logic
  styles.css             — All styles (639 lines, dark theme, responsive)

data/
  state.json             — Current timer state (running/pending)
  history.json           — All completed sessions (local backup)

test/
  sheets-service.test.js
  state-store.test.js
  time.test.js
  timer-service.test.js
```

## Current Capabilities

- Start/stop a timer in one of 5 categories
- Persist timer state to local JSON (survives restart)
- Append completed sessions to Google Sheets
- Retry failed Sheets writes (idempotent)
- View today's sessions, daily summary, weekly breakdown, all-time charts
- Local session history backup in `data/history.json`

## Current Limitations (What Must Change)

1. **No DSA problem tracking** — only time tracking exists
2. **No spreadsheet import** — there's no upload/parsing functionality
3. **No System Design tracker** — just a timer category
4. **No Projects section** — just a timer category
5. **No Daily Journal** — no structured daily notes
6. **No Goals** — no goal setting or tracking
7. **No Analytics page** — only the basic dashboard charts
8. **No delete** — sessions cannot be deleted from the UI
9. **No edit** — sessions cannot be edited
10. **No pause/resume** — timer can only start and stop
11. **No manual time entry** — only live timer
12. **No global search** — no search at all
13. **localStorage not used** — all state is server-side JSON files
14. **Not deployable to Vercel/Netlify** — uses local filesystem for persistence
15. **No database** — just JSON files on disk
16. **No authentication** — single-user localhost only
17. **No PWA** — no manifest, no service worker
18. **Only 2 pages** — Timer and Dashboard, no sidebar navigation
19. **No mobile bottom nav** — just a top nav with 2 links

## What to Preserve

- The dark-mode visual design language and color palette
- The timer display and category chip UI patterns
- The Chart.js dashboard charting approach
- The session data model fields (category, startedAt, endedAt, durationMinutes, note)
- The Google Sheets integration as an optional sync feature (not the primary data store)
- The existing test structure

## What Must Be Replaced

- JSON file storage → proper database (see Section 45)
- Express localhost server → Next.js or similar Vercel/Netlify-compatible framework
- 2-page HTML site → multi-section SPA with sidebar navigation
- No DSA tracking → full DSA problem tracker with import
- No System Design → full study workspace
- No Projects → full project tracker
- No Journal → structured daily journal

---

# 45. TECHNOLOGY STACK FOR REBUILD

## Framework

Use **Next.js** (App Router) as the full-stack framework.

Rationale:

- Deploys natively to Vercel (zero config)
- Deploys to Netlify via `@netlify/plugin-nextjs` (minimal config)
- API routes become serverless functions on both platforms
- Server components for data-heavy pages
- Client components for interactive features
- Built-in routing, no manual SPA fallback needed
- TypeScript support
- Most widely supported framework across deployment platforms

## Database

Use one of the following (in order of preference for this use case):

1. **Supabase** (PostgreSQL) — free tier, real-time, auth built-in, works with any platform
2. **Neon** (PostgreSQL) — serverless-friendly, generous free tier, works with any platform
3. **PlanetScale** (MySQL) — serverless-friendly, free tier
4. **MongoDB Atlas** — free tier, flexible schema

Avoid platform-locked databases (e.g., Vercel Postgres) since the app should work on both Vercel and Netlify.

The choice should prioritize:

- Free tier sufficient for personal use
- Platform-agnostic (works on both Vercel and Netlify, no persistent filesystem dependency)
- Simple setup
- Relational if possible (for proper entity relationships)

If Supabase is chosen, use Supabase Auth for optional authentication.

## ORM / Database Client

- If SQL database: use **Prisma** or **Drizzle ORM**
- If MongoDB: use **Mongoose** or the native driver

## Styling

- Use **CSS Modules** or **Tailwind CSS** (confirm preference)
- Preserve the existing dark theme color palette
- Use Inter font family (already in use)

## Charts

- Continue using **Chart.js** or switch to **Recharts** (React-native charting)
- Recharts is recommended for React integration

## File Parsing

- Use **Papa Parse** for CSV parsing
- Use **SheetJS (xlsx)** for XLSX parsing

## State Management

- Use React state + Context for simple state
- Use **SWR** or **TanStack Query** for server state/data fetching
- Do not add Redux unless complexity genuinely warrants it

---

# 46. AUTHENTICATION STRATEGY

Since this is a personal tool deployed on Vercel or Netlify (accessible from any device):

## Minimum Viable Authentication

Implement simple authentication so that:

- Only I can access the application
- My data is not publicly accessible
- I can use it from my phone and desktop

## Options (in order of simplicity)

1. **Simple password/PIN protection** — a single environment-variable password with session cookies
2. **Supabase Auth** — if Supabase is the database, use its built-in email/password auth
3. **NextAuth.js** — supports Google OAuth, GitHub OAuth, or credentials
4. **Platform password protection** — Vercel Pro or Netlify password protection (paid features)

## Requirements

- Do not make the authentication flow heavy or annoying
- A simple login page with a password is acceptable for a personal tool
- Session should persist reasonably (do not require login on every page load)
- Protect all API routes
- Do not store passwords in source code

Choose the simplest option that provides adequate protection.

---

# 47. MIGRATION STRATEGY

## From Current Architecture to New Architecture

The migration should be **incremental, not destructive**.

### Phase 1: Scaffold

1. Initialize a new Next.js project in the repository
2. Set up the database and ORM
3. Create the database schema
4. Set up authentication

### Phase 2: Migrate Existing Data

1. Import existing `data/history.json` sessions into the database
2. Preserve the Google Sheets integration as an optional background sync
3. Do not break the existing `.env` variables where still used

### Phase 3: Build New Features

1. Build sections in order: Dashboard → DSA → Time Tracking → System Design → Projects → Journal → Goals → Analytics → Settings
2. Each section should be independently functional before moving to the next

### Phase 4: Clean Up

1. Remove old vanilla HTML/JS files once equivalent functionality exists
2. Remove local JSON file dependencies
3. Update README and documentation

## Data Migration Script

Provide a one-time migration script that:

1. Reads `data/history.json`
2. Transforms sessions into the new database schema
3. Inserts them into the database
4. Reports success/failure counts
5. Does not delete the original files (keep as backup)

---

# 48. API DESIGN FOR NEW SECTIONS

Design RESTful API routes for each section.

## DSA Problems API

```text
GET    /api/dsa/problems          — List problems (with filtering, pagination, sorting)
GET    /api/dsa/problems/:id      — Get single problem
POST   /api/dsa/problems          — Create problem manually
PUT    /api/dsa/problems/:id      — Update problem
DELETE /api/dsa/problems/:id      — Delete problem
POST   /api/dsa/import            — Import from CSV/XLSX
GET    /api/dsa/stats              — Aggregated statistics
GET    /api/dsa/reviews/due       — Problems due for review
POST   /api/dsa/problems/:id/review — Log a review attempt
```

## System Design API

```text
GET    /api/system-design/topics          — List topics
POST   /api/system-design/topics          — Create topic
PUT    /api/system-design/topics/:id      — Update topic
DELETE /api/system-design/topics/:id      — Delete topic
GET    /api/system-design/notes           — List notes (filtered by topic/date)
POST   /api/system-design/notes           — Create note
PUT    /api/system-design/notes/:id       — Update note
DELETE /api/system-design/notes/:id       — Delete note
GET    /api/system-design/case-studies    — List case studies
POST   /api/system-design/case-studies    — Create case study
PUT    /api/system-design/case-studies/:id — Update case study
DELETE /api/system-design/case-studies/:id — Delete case study
GET    /api/system-design/stats           — Aggregated statistics
```

## Projects API

```text
GET    /api/projects              — List projects
POST   /api/projects              — Create project
PUT    /api/projects/:id          — Update project
DELETE /api/projects/:id          — Delete project
GET    /api/projects/:id/logs     — List project logs
POST   /api/projects/:id/logs     — Create project log entry
PUT    /api/projects/:id/logs/:logId  — Update log entry
DELETE /api/projects/:id/logs/:logId  — Delete log entry
```

## Journal API

```text
GET    /api/journal               — List journal entries (paginated, filtered by date)
GET    /api/journal/:date         — Get journal entry for a specific date
POST   /api/journal               — Create or update journal entry
DELETE /api/journal/:id           — Delete journal entry
```

## Time Tracking API

```text
GET    /api/time/status           — Current timer status
POST   /api/time/start            — Start timer
POST   /api/time/pause            — Pause timer
POST   /api/time/resume           — Resume timer
POST   /api/time/stop             — Stop timer
GET    /api/time/logs             — List time logs (filtered, paginated)
POST   /api/time/logs             — Manual time entry
PUT    /api/time/logs/:id         — Edit time log
DELETE /api/time/logs/:id         — Delete time log
GET    /api/time/stats            — Aggregated time statistics
```

## Goals API

```text
GET    /api/goals                 — List goals
POST   /api/goals                 — Create goal
PUT    /api/goals/:id             — Update goal
DELETE /api/goals/:id             — Delete goal
GET    /api/goals/progress        — Current progress vs targets
```

## Search API

```text
GET    /api/search?q=term         — Global search across all entities
```

## Settings API

```text
GET    /api/settings              — Get user settings/preferences
PUT    /api/settings              — Update settings
POST   /api/settings/export       — Export all data
POST   /api/settings/import       — Import data backup
```

If using Next.js App Router, these should be implemented as Route Handlers under `app/api/`.

Use proper HTTP status codes, consistent error shapes, and input validation on every endpoint.

---

# 49. DATABASE SCHEMA DESIGN

Design the schema to support all features. Here is a reference schema (adjust based on chosen database):

```text
User
  id                  UUID PK
  email               string (optional, for auth)
  name                string (optional)
  timezone            string (default: "Asia/Kolkata")
  preferences         JSON
  createdAt           timestamp
  updatedAt           timestamp

DSABatch
  id                  UUID PK
  userId              UUID FK → User
  name                string (e.g., "Blind 75", "Striver A2Z")
  importedAt          timestamp
  source              string (e.g., "CSV", "XLSX", "manual")
  problemCount        integer

DSAProblem
  id                  UUID PK
  userId              UUID FK → User
  batchId             UUID FK → DSABatch (nullable)
  title               string
  platform            string (nullable)
  problemUrl          string (nullable)
  difficulty          enum (Easy, Medium, Hard)
  topic               string
  subTopic            string (nullable)
  pattern             string (nullable)
  status              enum (NotStarted, InProgress, Solved, NeedsReview, Revisit)
  notes               text (nullable)
  approach            text (nullable)
  mistakes            text (nullable)
  timeTaken           integer (minutes, nullable)
  attempts            integer (default: 0)
  confidence          integer (1-5, nullable)
  solvedAt            timestamp (nullable)
  reviewAt            timestamp (nullable)
  createdAt           timestamp
  updatedAt           timestamp

DSAReview
  id                  UUID PK
  problemId           UUID FK → DSAProblem
  userId              UUID FK → User
  reviewedAt          timestamp
  confidence          integer (1-5)
  notes               text (nullable)
  mistakes            text (nullable)
  timeTaken           integer (minutes, nullable)

SystemDesignTopic
  id                  UUID PK
  userId              UUID FK → User
  name                string
  status              enum (NotStarted, Learning, Practicing, Comfortable, NeedsReview)
  progress            integer (0-100)
  confidence          integer (1-5, nullable)
  notes               text (nullable)
  lastStudied         timestamp (nullable)
  nextReview          timestamp (nullable)
  timeInvested        integer (minutes, default: 0)
  createdAt           timestamp
  updatedAt           timestamp

SystemDesignNote
  id                  UUID PK
  userId              UUID FK → User
  topicId             UUID FK → SystemDesignTopic
  date                date
  whatLearned         text
  keyConcepts         text (nullable)
  questions           text (nullable)
  unclearPoints       text (nullable)
  architectureNotes   text (nullable)
  resources           text (nullable)
  confidence          integer (1-5, nullable)
  timeSpent           integer (minutes, nullable)
  nextSteps           text (nullable)
  createdAt           timestamp
  updatedAt           timestamp

SystemDesignCaseStudy
  id                  UUID PK
  userId              UUID FK → User
  title               string
  problemStatement    text (nullable)
  requirements        text (nullable)
  functionalReqs      text (nullable)
  nonFunctionalReqs   text (nullable)
  highLevelArch       text (nullable)
  components          text (nullable)
  databaseChoice      text (nullable)
  scalingNotes        text (nullable)
  bottlenecks         text (nullable)
  tradeoffs           text (nullable)
  finalNotes          text (nullable)
  confidence          integer (1-5, nullable)
  status              enum (NotStarted, InProgress, Completed, NeedsReview)
  timeSpent           integer (minutes, default: 0)
  createdAt           timestamp
  updatedAt           timestamp

Project
  id                  UUID PK
  userId              UUID FK → User
  name                string
  description         text (nullable)
  status              enum (Planned, Active, OnHold, Completed)
  priority            enum (Low, Medium, High)
  startDate           date (nullable)
  targetDate          date (nullable)
  progress            integer (0-100, default: 0)
  techStack           string (nullable)
  repoUrl             string (nullable)
  deployUrl           string (nullable)
  goals               text (nullable)
  notes               text (nullable)
  createdAt           timestamp
  updatedAt           timestamp

ProjectLog
  id                  UUID PK
  projectId           UUID FK → Project
  userId              UUID FK → User
  date                date
  timeSpent           integer (minutes)
  workedOn            text
  completed           text (nullable)
  blockers            text (nullable)
  nextSteps           text (nullable)
  createdAt           timestamp
  updatedAt           timestamp

DailyJournal
  id                  UUID PK
  userId              UUID FK → User
  date                date (unique per user)
  dsaActivity         text (nullable)
  systemDesignActivity text (nullable)
  projectActivity     text (nullable)
  generalLearning     text (nullable)
  notes               text (nullable)
  timeSpent           integer (minutes, nullable)
  wins                text (nullable)
  blockers            text (nullable)
  tomorrowPriorities  text (nullable)
  createdAt           timestamp
  updatedAt           timestamp

TimeLog
  id                  UUID PK
  userId              UUID FK → User
  category            string
  startedAt           timestamp
  endedAt             timestamp (nullable, null while running)
  durationMinutes     integer (nullable, computed on stop)
  note                text (nullable)
  linkedEntityType    string (nullable: "dsa_problem", "sd_topic", "sd_case_study", "project")
  linkedEntityId      UUID (nullable)
  createdAt           timestamp
  updatedAt           timestamp

Goal
  id                  UUID PK
  userId              UUID FK → User
  title               string
  type                enum (Daily, Weekly, Monthly)
  category            string (nullable: "DSA", "SystemDesign", "Project", etc.)
  targetValue         integer
  targetUnit          string (e.g., "problems", "hours", "case_studies")
  currentValue        integer (default: 0)
  startDate           date
  endDate             date
  isActive            boolean (default: true)
  createdAt           timestamp
  updatedAt           timestamp
```

Adjust or simplify based on the actual implementation. Do not over-normalize if it makes queries unnecessarily complex.

For text-heavy fields like `notes`, `approach`, `mistakes`, use plain text or markdown. Do not build a rich text editor unless it is trivial.

---

# 50. NOTIFICATION AND REVIEW REMINDERS

## In-App Notifications

Surface actionable reminders on the dashboard and relevant sections:

- "You have 5 DSA problems due for review today"
- "You haven't studied System Design in 3 days"
- "Your weekly goal: 15/21 problems solved (71%)"
- "Project 'Portfolio' has been on hold for 2 weeks"

## Implementation

- Calculate these server-side when loading the dashboard
- Show as dismissible cards/banners, not intrusive popups
- Prioritize relevance — do not show 10 notifications at once
- Show the top 3-5 most important insights

## Do NOT Build

- Push notifications (unnecessary complexity for a personal tool)
- Email notifications
- Browser notification API (unless trivially added for timer completion)
- Complex notification preferences

---

# 51. KEYBOARD SHORTCUTS

Implement a small set of useful keyboard shortcuts for power users:

```text
/         → Focus global search
n         → New item (context-dependent: new problem, new note, new project)
Escape    → Close modal/dialog
Ctrl+S    → Save current form (where applicable)
←  →      → Navigate between tabs/sections (where applicable)
```

Show a keyboard shortcut help overlay when pressing `?` (question mark).

Do not over-invest in keyboard shortcuts. Cover the most common actions only.

---

# 52. THEME SYSTEM

## Dark Theme (Default)

Preserve the existing dark theme as the default:

```text
Background:    #101728
Card BG:       rgba(27, 36, 60, 0.82)
Text Primary:  #f5f7ff
Text Secondary: #b8c2df
Text Muted:    #8793b7
Accent:        #aebaff / #9caaff
Success:       #9cead9 / #2bcaa8
Warning:       #ffd484
Error:         #ffb3bb / #ff9aa6
Border:        rgba(198, 208, 255, 0.16)
```

## Light Theme (Optional)

If time permits, offer a light theme toggle in settings.

Do not prioritize this over core functionality.

## System Theme

If adding theme support, respect `prefers-color-scheme` by default.

---

# 53. SIDEBAR NAVIGATION DESIGN

## Desktop (≥768px)

- Fixed left sidebar, approximately 240px wide
- Collapsible to icon-only mode (approximately 64px)
- Show section icons + labels
- Active section highlighted
- Timer status indicator visible at all times (small widget in sidebar or header)

## Sections in sidebar

```text
📊  Dashboard
💻  DSA Tracker
🏗  System Design
🚀  Projects
📓  Daily Journal
🎯  Goals
📈  Analytics
⚙️  Settings
```

## Mobile (<768px)

- No sidebar
- Bottom tab bar with the most important sections (5 max):
  - Dashboard
  - DSA
  - System Design
  - Projects
  - More (opens a menu for Journal, Goals, Analytics, Settings)
- The timer should be accessible from any page via a floating action button or persistent mini-timer

## Navigation Rules

- Current section should be clearly indicated
- Navigation should not require scrolling
- Transitions between sections should feel instant (client-side routing)
- Deep links should work (refreshing a page should return to the same section)

---

# 54. TIMER WIDGET

The timer should not be limited to a single page.

## Global Timer Behavior

- If a timer is running, show a **persistent mini-timer** visible from any section
- This could be:
  - A floating bar at the bottom of the screen
  - A small indicator in the sidebar
  - A header strip

## Mini-Timer Shows

- Current category
- Elapsed time (updating every second)
- Stop button

## On Click

- Expand to full timer view or navigate to the timer section

## Timer Accessibility

- The timer must be controllable from any page
- Starting a timer should not require navigating to a specific page
- A quick-start shortcut (floating action button on mobile) is ideal

---

# 55. DSA SPREADSHEET COLUMN MAPPING

When importing a DSA spreadsheet, intelligently map common column names:

```text
Common Input Columns          →  Application Field
─────────────────────────────────────────────────
Problem / Question / Title    →  title
Link / URL / Problem Link     →  problemUrl
Difficulty / Level            →  difficulty
Topic / Category / Tag        →  topic
Sub-Topic / Sub Topic         →  subTopic
Pattern                       →  pattern
Status / Progress             →  status
Platform / Source             →  platform
Notes / Comment               →  notes
Time / Time Taken             →  timeTaken
```

Rules:

1. Column matching should be case-insensitive
2. Support common variations (e.g., "Ques" → title, "Diff" → difficulty)
3. If columns cannot be automatically matched, show a manual mapping UI
4. Allow the user to preview and adjust before importing
5. Unknown columns should be ignorable, not cause import failure
6. If a row has no title, skip it (don't import blank rows)

---

# 56. BATCH OPERATIONS FOR DSA

Support batch operations for managing large problem sets:

- Select multiple problems (checkboxes)
- Bulk status change (e.g., mark 10 problems as "Solved")
- Bulk delete (with confirmation)
- Bulk mark for review
- Select all / deselect all

This is important for managing 500+ imported problems efficiently.

Do not make batch operations the primary UI. They should be available but not visually dominant.

---

# 57. RICH TEXT / MARKDOWN SUPPORT

For long-form text fields (notes, approach, architecture notes, case study sections):

- Support basic **Markdown** formatting
- At minimum: headings, bold, italic, bullet lists, code blocks
- Render stored markdown as formatted HTML when viewing
- Use a simple textarea with markdown preview toggle, not a full WYSIWYG editor
- Do not add a heavy rich text editor dependency

This is a nice-to-have, not a blocker. Plain text is acceptable if markdown adds significant complexity.

---

# 58. DATA BACKUP AND RECOVERY

## Automatic Backups

If the database supports it, enable automatic daily backups.

## Manual Export

The Settings page should allow exporting all data as:

- A single JSON file containing all entities
- Optionally, CSV exports for individual sections (DSA problems, time logs)

## Import from Backup

Allow re-importing a previously exported JSON backup.

Requirements:

- Validate the backup file format
- Show a preview of what will be imported
- Warn about potential duplicates
- Offer merge vs replace options
- Never silently overwrite existing data

## Google Sheets Sync (Optional, Preserved)

If practical, retain the existing Google Sheets sync as an optional background feature:

- Continue appending time logs to Sheets when configured
- Do not make Sheets a requirement — the database is the primary store
- Allow disabling Sheets sync in Settings

---

# 59. ENVIRONMENT VARIABLES FOR PRODUCTION

Document all required environment variables for deployment (same for both Vercel and Netlify):

```text
# Required
DATABASE_URL              — Connection string for the chosen database
NEXTAUTH_SECRET           — Secret for session encryption (if using NextAuth)
NEXTAUTH_URL              — Production URL (e.g., https://my-tracker.vercel.app or https://my-tracker.netlify.app)

# Authentication
AUTH_PASSWORD              — Simple password for login (if using password auth)
   — OR —
SUPABASE_URL              — Supabase project URL (if using Supabase)
SUPABASE_ANON_KEY         — Supabase anonymous key
SUPABASE_SERVICE_ROLE_KEY — Supabase service role key (server-side only)

# Optional (Google Sheets sync)
SPREADSHEET_ID            — Google Spreadsheet ID
GOOGLE_SERVICE_ACCOUNT_KEY — Service account key JSON (as a string env var, not a file path)
TIMER_SESSIONS_TAB        — Sheet tab name (default: "Timer Sessions")
DAILY_DASHBOARD_TAB       — Sheet tab name (default: "Daily Dashboard")

# Application
APP_TIME_ZONE             — IANA timezone (default: "Asia/Kolkata")
```

Important:

- On both Vercel and Netlify, file paths do not work for credentials. Convert the Google service account JSON key to an environment variable string.
- Never expose `SERVICE_ROLE_KEY` or `DATABASE_URL` to the frontend.
- Set environment variables via each platform's dashboard UI, not `.env` files in the repository:
  - **Vercel**: Settings → Environment Variables
  - **Netlify**: Site configuration → Environment variables

---

# 60. DEPLOYMENT CHECKLIST

## Pre-Deployment (Common)

1. [ ] Production build succeeds locally (`npm run build`)
2. [ ] No TypeScript errors
3. [ ] No ESLint errors that break the build
4. [ ] All API routes work correctly in production mode
5. [ ] Database is provisioned and accessible from the internet
6. [ ] Database schema is applied (migrations run)
7. [ ] Authentication works in production
8. [ ] Google Sheets credentials converted from file path to env var string (if used)
9. [ ] All pages load correctly
10. [ ] Timer works across page navigations
11. [ ] DSA import works with a test file
12. [ ] Data persists across deployments
13. [ ] Mobile layout is correct
14. [ ] Favicon and meta tags are set
15. [ ] No console errors in production
16. [ ] No exposed secrets in client-side bundles
17. [ ] `netlify.toml` exists in the repository root

## Step-by-Step: Deploy to Netlify (Recommended for Beginners)

Include these exact instructions in the README:

```text
### Deploy to Netlify (Free)

1. Push your code to a GitHub repository.

2. Go to https://app.netlify.com and sign up / log in with your GitHub account.

3. Click "Add new site" → "Import an existing project".

4. Select your GitHub repository.

5. Netlify will auto-detect the build settings from netlify.toml:
   - Build command: npm run build
   - Publish directory: .next

6. Click "Show advanced" → Add your environment variables:
   - DATABASE_URL = (your database connection string)
   - NEXTAUTH_SECRET = (any random 32+ character string)
   - NEXTAUTH_URL = (leave blank for now, fill after deploy)
   - AUTH_PASSWORD = (your chosen login password)
   - APP_TIME_ZONE = Asia/Kolkata
   (Add any other env vars from the .env.example file)

7. Click "Deploy site".

8. Wait for the build to complete (usually 2-5 minutes).

9. Netlify will give you a URL like: https://your-site-name.netlify.app

10. Go back to Site configuration → Environment variables:
    - Update NEXTAUTH_URL to your Netlify URL.
    - Trigger a redeploy (Deploys → Trigger deploy → Deploy site).

11. Open the URL on your phone and desktop. You're live!
```

## Step-by-Step: Deploy to Vercel (Alternative)

Include these exact instructions in the README:

```text
### Deploy to Vercel (Free)

1. Push your code to a GitHub repository.

2. Go to https://vercel.com and sign up / log in with your GitHub account.

3. Click "Add New..." → "Project".

4. Select your GitHub repository.

5. Vercel will auto-detect Next.js. Leave the defaults.

6. Expand "Environment Variables" and add:
   - DATABASE_URL = (your database connection string)
   - NEXTAUTH_SECRET = (any random 32+ character string)
   - NEXTAUTH_URL = (leave blank for now, fill after deploy)
   - AUTH_PASSWORD = (your chosen login password)
   - APP_TIME_ZONE = Asia/Kolkata
   (Add any other env vars from the .env.example file)

7. Click "Deploy".

8. Wait for the build to complete (usually 1-3 minutes).

9. Vercel will give you a URL like: https://your-project.vercel.app

10. Go to Settings → Environment Variables:
    - Update NEXTAUTH_URL to your Vercel URL.
    - Redeploy from the Deployments tab.

11. Open the URL on your phone and desktop. You're live!
```

## Post-Deployment (Both Platforms)

1. [ ] HTTPS works (automatic on both Vercel and Netlify)
2. [ ] Test from desktop browser
3. [ ] Test from phone browser
4. [ ] Test timer start/stop/persistence
5. [ ] Test DSA import
6. [ ] Test data persists after redeploy
7. [ ] Test login works from a different device
8. [ ] Verify no sensitive data in page source

## If Something Goes Wrong

- **Build fails**: Check the build log on the platform's dashboard. Common issues are missing env vars or TypeScript errors.
- **API routes return 500**: Check that all environment variables are set correctly.
- **Database connection fails**: Ensure the database allows connections from any IP (Supabase/Neon do this by default).
- **Pages show 404**: Ensure the Next.js build completed successfully and routing is correct.
- **Timer doesn't persist**: Check that the database connection is working (try creating a DSA problem first).

---

# APPENDIX A: PRIORITY ORDER

If implementing everything at once is not feasible, prioritize in this order:

```text
Priority 1 (Core — must have):
  1. Next.js scaffold + database + auth
  2. Dashboard (basic version)
  3. DSA Tracker with import
  4. Time Tracking (fixed, with pause/resume)
  5. Mobile-responsive layout with sidebar/bottom nav
  6. Deployment (Vercel or Netlify)

Priority 2 (Important — should have):
  7. System Design tracker
  8. Projects tracker
  9. Daily Journal
  10. DSA review system
  11. Goals
  12. Global search

Priority 3 (Nice to have):
  13. Analytics page (advanced charts)
  14. Data export/import
  15. PWA manifest
  16. Keyboard shortcuts
  17. Light theme
  18. Google Sheets background sync
  19. Markdown support
  20. Batch DSA operations
```

Do not skip Priority 1 items. Priority 2 items should be included unless time is severely constrained. Priority 3 items are enhancements.

---

# APPENDIX B: ANTI-PATTERNS TO AVOID

1. **Do not store data only in localStorage** — it does not sync across devices
2. **Do not use serverless filesystem for persistence** — both Vercel and Netlify filesystems are ephemeral
3. **Do not make Google Sheets the primary data store** — it is a sync target only
4. **Do not build features that only work on desktop** — test mobile
5. **Do not add heavy dependencies for simple tasks** — vanilla solutions where appropriate
6. **Do not create separate micro-apps** — one unified application with sections
7. **Do not hardcode data for demo purposes** — everything should use real data
8. **Do not skip error handling** — every API call should handle failures
9. **Do not ignore loading states** — every async operation should show feedback
10. **Do not create unreachable pages** — every page should be accessible from navigation

---

# APPENDIX C: INSPIRATION REFERENCES

The application should feel similar in polish and density to:

- **Notion** — for the workspace/notes feel
- **Linear** — for the clean, fast, keyboard-driven interface
- **WakaTime Dashboard** — for coding activity analytics
- **Todoist** — for goal tracking and daily review
- **Striver's A2Z DSA Sheet website** — for DSA progress tracking

Do not copy these products. Use them as quality benchmarks for polish, responsiveness, and data density.

---

# MOST IMPORTANT PRODUCT PRINCIPLE

Do not think of this as a spreadsheet tracker.

Think of it as:

> **My personal engineering interview preparation operating system.**

The spreadsheet is merely one way to import DSA problems.

The actual product should help me answer:

- What did I study today?
- How much time did I spend?
- What DSA problems have I solved?
- What topics am I weak in?
- What System Design concepts have I studied?
- What do I need to revise?
- What projects am I working on?
- What did I accomplish today?
- What should I work on next?
- Am I maintaining consistency?
- How close am I to my preparation goals?

Build the application around those questions.

Make sensible product decisions yourself when something is unspecified. Do not repeatedly stop for minor clarification; inspect the existing implementation, choose the cleanest maintainable approach, and continue.
