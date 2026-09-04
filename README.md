# Auto-Tracking Study/Work Timer

A localhost timer for DSA, System Design, Project, Extra Learning, and Office Work. Phase 1 logs sessions to a Google Sheet while keeping an in-flight or unsaved session safely on disk.

## Run locally

1. Copy `.env.example` to `.env` and fill in the Google Sheets settings when they are ready.
2. Install dependencies: `npm install`.
3. Start the app: `npm run dev`.
4. Visit `http://localhost:3000`.

Until Sheets credentials are configured, the app still persists a running or stopped-but-unsaved session locally. Configure the integration, then press **Retry save** to append the pending session.

## Google Sheets setup

Create a Google Cloud service account, enable Google Sheets API, download the JSON key to a safe local path, and share the target spreadsheet with the service account's email as an Editor. Put the spreadsheet ID and the key-file path in `.env`.

By default `SHEETS_SETUP_MODE=validate`: the app only validates pre-created `Timer Sessions` and `Daily Dashboard` tabs. Set it to `create-or-repair` only if you want the app's setup action to create missing app tabs/headers, dashboard formulas, readable total-time columns, summary tables, and charts. Existing session rows are not overwritten.

## Safety model

- Only one timer can run at a time.
- Running state is persisted immediately.
- A stopped session stays locally pending until its sheet write succeeds.
- A retry checks the session tab for the same row before appending, reducing the chance of duplicate rows after an ambiguous network failure.
- No credentials are exposed to browser JavaScript or committed to source control.

For comprehensive architecture, setup, and usage documentation, see [the complete project guide](docs/PROJECT_GUIDE.md).
For endpoint details, see [the local API contract](docs/API.md).
