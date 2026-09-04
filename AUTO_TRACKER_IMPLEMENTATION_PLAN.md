# Auto-Tracking Study/Work Timer — Implementation Plan

## Purpose and delivery strategy

Build a local-only timer that logs five types of work to Google Sheets. Ship and use the reliable core first, then layer in external evidence collection without ever allowing an integration failure to lose a completed session.

The build specification is the product reference. This plan is the delivery checklist for the current request; no implementation work has started.

## Scope boundaries

### MVP (Phase 1)

- Five timer categories: DSA, System Design, Project, Extra Learning, and Office Work.
- One active timer at a time, persisted locally across restart, browser close, and laptop sleep.
- Google Sheets session-row append to the `Timer Sessions` tab.
- `Daily Dashboard` formulas based on the raw session tab.
- Required note before saving System Design and Extra Learning; optional note for DSA and Project; no note prompt for Office Work.
- Clear success, retry, and recoverable-error states in the UI.

### Explicitly deferred

- GitHub verification (Phase 2).
- LeetCode verification and tracker status matching (Phase 3).
- GFG count-delta experiment (Phase 4, one-day limit, only if requested).
- Google Takeout import (Phase 5, only if requested).
- Hosted deployment, cron jobs, a database, authentication, and a desktop/tray wrapper.

## Decisions and prerequisites

These must be resolved before the affected tasks can close. They are not blockers for designing the local UI and state layer.

| ID | Decision or prerequisite | Owner | Needed by |
|---|---|---|---|
| P-01 | Choose GitHub scope: a named repository or all repositories. | Jatin | Phase 2 |
| P-02 | Provide a fine-grained GitHub token with read-only repository metadata/contents access. | Jatin | Phase 2 |
| P-03 | Provide public LeetCode username; confirm public submissions are visible. | Jatin | Phase 3 |
| P-04 | Create a Google Cloud service account, enable Sheets API, download its key locally, and share the target sheet with the service-account email as Editor. | Jatin | Phase 1 integration test |
| P-05 | Provide the Google Spreadsheet ID and confirm the local `.env` file location. | Jatin | Phase 1 integration test |
| P-06 | Confirm whether the app should create/repair the two Sheets tabs or only validate pre-created tabs. | Jatin | Phase 1 setup task |
| P-07 | Supply the existing tracker tab name and exact `Question`/`Status` column headers if Phase 3 matching is desired. | Jatin | Phase 3 |
| P-08 | Locate or provide the existing “Grind Log” UI/artifact to reuse; it is not in the current workspace. | Jatin / implementation | UI build |
| P-09 | Confirm local time zone for Sheet values (default: `Asia/Kolkata`) and whether durations spanning midnight should be attributed by start date (recommended). | Jatin | Phase 1 finish |

## Definition of done

A task is complete only when its acceptance checks pass. A phase is ready to ship when all of its required tasks are complete, secrets are excluded from version control, and the stated end-to-end scenario has been run against a real test sheet.

## Ordered task list

### Milestone 0 — Project foundation and safeguards

- [x] **M0.1 — Initialize the local Node.js project.**
  - Set up the Express server, static frontend structure, npm scripts, and a documented local start command.
  - Acceptance: a clean checkout installs dependencies and serves a basic localhost health route.

- [x] **M0.2 — Establish secret and configuration handling.**
  - Add `.env.example`, input validation at startup, `.gitignore` coverage for `.env`, service-account JSON files, `data/`, and generated logs.
  - Use configuration keys for port, spreadsheet ID, tab names, time zone, configurable verification buffer, and later integration credentials.
  - Acceptance: startup reports missing configuration by variable name only; no credential value appears in UI, logs, or committed files.

- [x] **M0.3 — Define the session state and recovery contract.**
  - Model a single running session plus a recoverable “stopped but not yet written” session.
  - Persist local state atomically before reporting Start success, and retain unsaved rows for retry if Google Sheets is unreachable.
  - Decide/implement the handling of a clock change, browser refresh, and a new Start while another timer runs.
  - Acceptance: restart during a running timer restores the correct elapsed time; an append failure preserves the completed session and offers retry without duplicating rows.

- [x] **M0.4 — Define API contracts and validation.**
  - Document API request/response shapes for status, start, stop, save/retry, and configuration validation.
  - Validate category names, note requirements, timestamp ordering, and single-active-session rules on the server (not just the UI).
  - Acceptance: invalid requests return safe, actionable errors and cannot corrupt local state.

- [x] **M0.5 — Plan and scaffold automated checks.**
  - Select unit/integration test tooling; provide mocked clock, file storage, and Sheets client utilities.
  - Acceptance: tests run with no external secrets or network calls.

### Milestone 1 — Google Sheets setup and Phase 1 backend

**Current status:** The local implementation is ready for a real-sheet acceptance test. P-04 and P-05 are required before this milestone can be marked complete.

- [ ] **M1.1 — Validate or provision the Sheet schema.**
  - Verify/create `Timer Sessions` with these nine headers in order: Date, Category, Start Time, End Time, Duration (min), Auto-Detected Summary, Evidence Links, Manual Note, Verified.
  - Verify/create `Daily Dashboard` and formulas referencing the exact tab name, with percentage formatting.
  - Preserve existing unrelated tracker tabs and never overwrite existing session data.
  - Acceptance: schema validation catches a renamed/missing tab before the first session is written; a sample row appears correctly in the dashboard.

- [ ] **M1.2 — Implement the Google Sheets append client.**
  - Authenticate with the local service-account key; use `spreadsheets.values.append` against `Timer Sessions`.
  - Convert dates/times using the configured time zone. Initial MVP rows leave auto-summary/evidence blank and set `Verified` to `FALSE`.
  - Make append behavior idempotent enough to prevent duplicate retries (for example, retain a local write ID and check the pending state before retrying).
  - Acceptance: each successful Stop appends exactly one correctly mapped row to a real test sheet.

- [ ] **M1.3 — Implement timer orchestration.**
  - Start records category/start timestamp/state; Stop fixes the end timestamp and duration, then routes the session through the category policy.
  - Office Work immediately queues an append with no note UI. System Design and Extra Learning cannot save without a non-empty note. DSA and Project can save in Phase 1 without a note.
  - Acceptance: all five categories meet their save policy; stopping twice never produces a second row.

- [ ] **M1.4 — Add graceful operational failure handling.**
  - Show whether a session is saving, saved, or pending retry. Preserve the time window and note if the backend or Sheets call fails.
  - Acceptance: disconnecting or misconfiguring Sheets does not discard a stopped session; reconnection and Retry result in one row.

### Milestone 2 — Phase 1 timer interface

**Current status:** The interface is implemented and verified locally in the no-credentials recovery state. End-to-end save verification awaits P-04 and P-05.

- [ ] **M2.1 — Adapt the Grind Log visual language or create an equivalent local design.**
  - Reuse the category-chip and timer interaction style once the referenced artifact is available. If it remains unavailable, create a simple accessible equivalent rather than blocking the MVP.
  - Acceptance: category state is visually unambiguous, keyboard-accessible, and usable at normal desktop widths.

- [ ] **M2.2 — Build the active timer workflow.**
  - Display active category, elapsed time, start time, Start/Stop controls, and recovery status after reload.
  - Prevent selecting a conflicting second session while one is active.
  - Acceptance: Start, refresh, Stop works without losing the current session or showing an incorrect elapsed duration.

- [ ] **M2.3 — Build the note and confirmation workflow.**
  - Require notes only where specified; allow optional DSA/Project notes; never interrupt Office Work with a note prompt.
  - Show the exact session details that will be/were saved, plus pending-retry feedback if needed.
  - Acceptance: representative category flows match the policy matrix below.

| Category | Phase 1 stop behavior | Note rule | Initial verification value |
|---|---|---|---|
| DSA | Save session | Optional | FALSE |
| System Design | Ask before save | Required | FALSE |
| Project | Save session | Optional | FALSE |
| Extra Learning | Ask before save | Required | FALSE |
| Office Work | Save immediately | Not shown | FALSE |

- [ ] **M2.4 — Run Phase 1 quality checks.**
  - Unit test duration/category/note validation, recovery/pending-write behavior, and row mapping.
  - Manually test all five flows and a browser/server restart against a test sheet.
  - Acceptance: no high-severity data-loss, duplicate-write, or secrets-exposure issue remains.

**Phase 1 release gate:** Use the timer for one week before committing to verification integrations. Collect friction points: missed stops, note burden, sheet readability, and whether Office Work is fast enough.

### Milestone 3 — GitHub verification (Phase 2)

- [ ] **M3.1 — Finalize GitHub repository scope and configuration.**
  - Support the agreed named repository or all-repositories strategy, validating owner/repo/user config at startup.
  - Acceptance: configuration determines a predictable query scope, with least-privilege token use.

- [ ] **M3.2 — Implement Project-session evidence collection.**
  - Query commit activity inside the session window, with a configurable ±10-minute buffer and author filter where appropriate.
  - Produce human-readable summary and commit URLs, then append/write the result with `Verified = TRUE` only when matching activity was found.
  - Acceptance: known commits inside/outside the adjusted window are correctly included/excluded, and links resolve to the expected commits.

- [ ] **M3.3 — Add GitHub resilience and user review.**
  - Treat rate limits, invalid token, private-repository access, and no matches as non-fatal. Present detected evidence before/as the session saves and allow an optional manual note.
  - Acceptance: a failed request or no matching commits still saves the Project session with `Verified = FALSE` and an understandable UI message.

### Milestone 4 — LeetCode verification and tracker matching (Phase 3)

- [ ] **M4.1 — Implement defensive LeetCode submission lookup.**
  - Call only public-profile GraphQL data for recent accepted submissions; filter timestamp activity within the buffered DSA session window.
  - Create a summary and problem URLs. Never use session cookies or scraping authenticated data.
  - Acceptance: a known public accepted submission is linked to the correct session, with timezone boundary tests.

- [ ] **M4.2 — Implement the manual fallback.**
  - On endpoint/schema/network failure or no qualifying activity, offer a manual note and always allow the session to save.
  - Capture a diagnostic-safe status in logs without storing sensitive data.
  - Acceptance: simulated GraphQL failure never blocks DSA session logging; saved row has `Verified = FALSE` unless an actual match exists.

- [ ] **M4.3 — Add guarded tracker status matching (optional within Phase 3).**
  - Only after P-07 is available, fuzzy-match detected titles against the confirmed tracker question column.
  - Require a conservative threshold, report ambiguous/unmatched cases without edits, and update only the approved Status field for confident matches.
  - Acceptance: exact and clear fuzzy matches update expected rows; ambiguous titles do not modify the tracker.

### Milestone 5 — Optional experiments (only after approval)

- [ ] **M5.1 — GFG count-delta feasibility spike.**
  - Spend no more than one day on a count-before/count-after approach; document reliability and stop if timestamp-quality evidence is unavailable.
  - Exit criteria: either a tested, honest “count delta” design or an explicit decision not to ship it.

- [ ] **M5.2 — YouTube Takeout importer.**
  - Design a manual import for periodic review/backfill only; do not portray it as real-time watch tracking.
  - Acceptance: imported data is clearly labeled as historical/approximate and cannot corrupt timer sessions.

### Milestone 6 — Handoff and maintenance

- [ ] **M6.1 — Write local operating documentation.**
  - Include first-time setup, configuration fields, service-account sheet sharing, start command, recovery/retry behavior, and known limitations.
  - Acceptance: a new local machine can be configured without reading the source code.

- [ ] **M6.2 — Security and data review.**
  - Confirm secrets are ignored, logs are safe, localhost is not exposed to the network, and raw session data/backups are understandable.
  - Acceptance: a final repository scan finds no keys or service-account JSON committed.

## Progress update format

For each implementation update, report the milestone/task IDs, status, evidence, and blocker (if any):

`M1.3 — complete — Stop flow is persisted and category policies are unit-tested — next: M1.4`

Use these status labels: `not started`, `in progress`, `blocked`, `ready for review`, `complete`. A blocked item must name the missing prerequisite from the table above and the smallest action needed to unblock it.

## Initial execution order

1. Resolve P-04, P-05, P-06, P-08, and P-09 while M0.1–M0.5 are prepared.
2. Complete M1.1–M2.4 and conduct the one-week MVP trial.
3. Resolve P-01/P-02 and implement the GitHub milestone only if Phase 1 is proving useful.
4. Resolve P-03/P-07 and implement LeetCode plus the optional status matching defensively.
5. Consider GFG/Takeout only after the reliable workflows have been adopted.
