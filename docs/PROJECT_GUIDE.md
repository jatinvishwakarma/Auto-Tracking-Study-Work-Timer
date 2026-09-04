# Focus Ledger — Complete Project & Architecture Guide

Welcome to **Focus Ledger** (*Auto-Tracking Study/Work Timer*). This document provides an end-to-end explanation of what this project is for, how it works, how data is saved and persisted across restarts, how Google Sheets is configured, and how to use it in your daily routine.

---

## 1. What This Project Is For

Focus Ledger is a local-first activity and productivity tracker built specifically for software engineers. Balancing day-to-day office responsibilities with continuous technical preparation (DSA, system design, portfolio projects, reading documentation) is challenging. Most generic timers lack engineering context or risk losing data when networks fail.

Focus Ledger solves this by providing:
1. **Clear focus categories**: Tailored specifically to developer workflows.
2. **Local-first resilience**: Your timer and completed sessions are stored on your machine first. Even if your internet disconnects, computer sleeps, or the browser crashes, **no session is ever lost**.
3. **Automated Google Sheets ledger**: Every completed session logs into your personal Google Sheet with a raw session ledger and an aggregated daily analytics dashboard.
4. **Future auto-verification**: Scaffolding in place to automatically verify coding sessions using GitHub commit history (Phase 2) and LeetCode submissions (Phase 3).

### The Five Activity Categories

| Category | What it's for | Note Policy | Why this rule? |
| :--- | :--- | :--- | :--- |
| **DSA** | Data Structures & Algorithms practice (LeetCode, GFG, contests). | Optional | Focus on solving problems without forced friction. |
| **System Design** | High-level (HLD) or low-level (LLD) architecture study, whitepapers, distributed systems. | **Required** | Ensures you log what concepts, diagrams, or trade-offs you reviewed for future recall. |
| **Project** | Hands-on coding, building side projects, feature development. | Optional | You can save notes or rely on git commits for context. |
| **Extra Learning** | Reading technical books, articles, official docs, tutorials, upskilling. | **Required** | Keeps you accountable to capture takeaways from what you read. |
| **Office Work** | Professional job tasks, meetings, sprint work, code reviews. | **Not accepted** | High-efficiency, zero-friction logging. Starts and stops cleanly with no prompts. |

---

## 2. Architecture & How Things Work

Focus Ledger runs as a lightweight local web service:

* **Backend**: Node.js (`v20+`) with Express running at `http://localhost:3000`.
* **Frontend**: Vanilla HTML5, CSS3, and JavaScript served statically from `public/`.
* **State Engine**: Local atomic JSON store (`data/state.json`).
* **Cloud Sync**: Google Sheets API (`v4`) using a Google Cloud Service Account.

```
┌─────────────────────────────────────────────────────────────┐
│                      Browser (Client)                       │
│                   http://localhost:3000                     │
└──────────────────────────────┬──────────────────────────────┘
                               │ Fetch API
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                     Local Express Server                    │
│                        (src/server.js)                      │
├──────────────────────────────┬──────────────────────────────┤
│  StateStore                  │  SheetsService               │
│  (Atomic disk writes)        │  (Google Sheets API v4)      │
└──────────────┬───────────────┴──────────────┬───────────────┘
               │                              │
               ▼                              ▼
      ┌─────────────────┐           ┌──────────────────┐
      │ data/state.json │           │  Google Sheets   │
      │  (Local disk)   │           │   (Cloud Sync)   │
      └─────────────────┘           └──────────────────┘
```

### The Single-Timer Model
To prevent multitasking illusions and preserve accurate data, **only one timer can run at any given time**. You cannot start a new timer while another is active, nor can you start one while an unsaved session is pending sync.

---

## 3. How Data Is Saved & What Happens Across Restarts

A critical feature of Focus Ledger is **Zero Data Loss**.

### How Session Data is Saved
1. **Starting a Timer**:
   When you click **Start timer**, the server records the start timestamp (`startedAt`) and category, writing it immediately to `data/state.json`.
2. **Stopping a Timer**:
   When you click **Stop & save**, the server calculates elapsed minutes, attaches your note (if applicable), and stores the session as `pending` in `data/state.json`.
3. **Writing to Google Sheets**:
   The server attempts to write the pending session to the `Timer Sessions` tab in your Google Sheet:
   * **If successful**: The local `pending` state is cleared (`pending: null`), and the UI displays a green success alert.
   * **If Sheets is offline/unreachable**: The session remains safely queued in `data/state.json`. The UI displays a **SAVE PENDING** banner with a **Retry save** button.
   * **Idempotency protection**: When you click **Retry save**, the server checks if that exact session timestamp already exists in the sheet before appending, preventing duplicate rows.

### What If I Start the Application Tomorrow Again?
Here is exactly what happens across days and restarts:

* **If you close the browser**:
  The timer runs on server time (`startedAt`). When you reopen `http://localhost:3000`, the frontend queries `/api/status` and resumes showing the correct elapsed time.
* **If your computer restarts or shuts down**:
  * If a timer was running, `data/state.json` retains the start time. When you start the app with `npm run dev`, it restores the in-progress session.
  * If a session was stopped but not yet synced to Google Sheets, it remains stored under `pending` and can be synced immediately with **Retry save**.
* **Starting fresh tomorrow**:
  1. Open your terminal in the project directory and run:
     ```bash
     npm run dev
     ```
  2. Open `http://localhost:3000` in your browser.
  3. All historical data from past days remains safely stored and organized in your Google Sheet.
  4. New sessions logged tomorrow will automatically record with tomorrow's date (based on `APP_TIME_ZONE=Asia/Kolkata`).
  5. The `Daily Dashboard` tab in Google Sheets will aggregate your sessions for each new date automatically.

---

## 4. Google Sheets Configuration

Focus Ledger logs data directly to a Google Spreadsheet using a Google Cloud Service Account.

### Step 1: Google Cloud Service Account Setup
1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project (e.g. `jatin-activity-tracker`).
3. Navigate to **APIs & Services > Library**, search for **Google Sheets API**, and click **Enable**.
4. Navigate to **APIs & Services > Credentials** > **Create Credentials** > **Service Account**.
5. Name your service account (e.g. `auto-tracking-study-work-timer`).
6. After creating it, click on the service account > **Keys** tab > **Add Key** > **Create new key** > **JSON**.
7. Download the JSON key file to your project root (e.g., `jatin-activity-tracker-e5933bf9f3a2.json`).
   > [!CAUTION]
   > Never commit this JSON key file to Git. Ensure it is listed in `.gitignore`.

### Step 2: Share Your Google Spreadsheet
1. Open your target Google Spreadsheet in your browser.
2. Click the green **Share** button in the top right.
3. Add your Service Account email address:
   ```text
   auto-tracking-study-work-timer@jatin-activity-tracker.iam.gserviceaccount.com
   ```
4. Assign the role **Editor** and uncheck "Notify people", then click **Share**.

### Step 3: Configure `.env`
Create a `.env` file in the root directory (copied from `.env.example`):

```env
PORT=3000
APP_TIME_ZONE=Asia/Kolkata
STATE_FILE=data/state.json

# Paste the ID found in your Sheet URL: https://docs.google.com/spreadsheets/d/<ID>/edit
SPREADSHEET_ID=1HVjvRfokCIniA9gELZo5aSVBkSUTPMhoqjsR7yUhE8c

# Path to your downloaded service account JSON key
GOOGLE_SERVICE_ACCOUNT_KEY_FILE="C:\Jatin Activity Tracker\jatin-activity-tracker-e5933bf9f3a2.json"

TIMER_SESSIONS_TAB=Timer Sessions
DAILY_DASHBOARD_TAB=Daily Dashboard

# Set to "create-or-repair" to let the app automatically generate sheet headers and formulas
SHEETS_SETUP_MODE=create-or-repair

# Reserved for future phases
EVIDENCE_BUFFER_MINUTES=10
GITHUB_TOKEN=your_github_token
GITHUB_OWNER=jatinvishwakarma
GITHUB_REPOSITORY=Auto-Tracking-Study-Work-Timer
GITHUB_USERNAME=jatinvishwakarma
LEETCODE_USERNAME=jatinvish1307
```

### The Two Spreadsheet Tabs Explained

#### Tab 1: `Timer Sessions` (Raw Ledger)
Every stopped session appends a row with 9 columns:
1. **Date**: Formatted as `YYYY-MM-DD` according to `APP_TIME_ZONE`.
2. **Category**: `DSA`, `System Design`, `Project`, `Extra Learning`, or `Office Work`.
3. **Start Time**: e.g., `18:45:00`.
4. **End Time**: e.g., `19:30:00`.
5. **Duration (min)**: Duration rounded to the nearest whole minute.
6. **Auto-Detected Summary**: Blank in Phase 1 (reserved for GitHub/LeetCode commit/submission summaries).
7. **Evidence Links**: Blank in Phase 1 (commit URLs, problem links).
8. **Manual Note**: Notes entered upon stopping.
9. **Verified**: `FALSE` in Phase 1 (switches to `TRUE` when automated evidence is verified in Phase 2/3).

#### Tab 2: `Daily Dashboard` (Aggregated Metrics)
Summarizes your performance day-by-day with 11 columns:
1. **Date**
2. **Office Work (min)**
3. **DSA (min)**
4. **System Design (min)**
5. **Project (min)**
6. **Extra Learning (min)**
7. **Total Working Time (min)**: Sum of all 5 categories.
8. **Study Time (min)**: Sum of DSA + System Design + Project + Extra Learning.
9. **Study % of Total**: Percentage of your day dedicated to study vs work.
10. **Verified Sessions**: Number of sessions with automated proof.
11. **Total Sessions**: Count of all sessions completed that day.

---

## 5. Daily Usage Workflow

### 1. Launching the App
Run the following in your project folder:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser. Verify the status badge at top right displays **Sheets configured** in green.

### 2. Running a Session
1. **Select Category**: Click on `DSA`, `System Design`, `Project`, `Extra Learning`, or `Office Work`.
2. **Click "Start timer"**: The timer starts ticking.
3. **Work**: Minimize the browser or switch tabs. The timer continues running on the server.
4. **Provide Notes (if applicable)**:
   * For `System Design` and `Extra Learning`, the note box is required. Type what you studied.
   * For `DSA` and `Project`, notes are optional.
   * For `Office Work`, notes are not shown.
5. **Click "Stop & save"**: The session is immediately saved locally and pushed to your Google Sheet.

### 3. Handling Network Failures & Retries
If your internet is down when stopping a session:
1. The app saves the session to your local hard drive (`data/state.json`).
2. The UI displays **SAVE PENDING** and explains that your completed session is safe.
3. Once back online, simply click **Retry save**. The app pushes the session to Google Sheets and clears the pending state.

---

## 6. Security & Safe Practices

* **Never commit secrets**:
  * `.env` contains your private API keys and tokens.
  * `*.json` service account files contain private keys that allow Google Sheets modifications.
  * Both are excluded in `.gitignore`.
* **Testing without network**:
  Run automated tests anytime without touching Google Sheets or leaking secrets:
  ```bash
  npm test
  ```
