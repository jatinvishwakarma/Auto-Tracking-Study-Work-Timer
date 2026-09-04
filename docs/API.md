# Local API contract

The server listens only on `127.0.0.1`. It returns JSON and never exposes credentials to the browser.

## Read state

`GET /api/status` returns the active timer (or `null`), a locally pending session (or `null`), the permitted categories with note rules, and non-sensitive Sheets configuration status.

`GET /api/health` returns `{ "ok": true }` plus the same non-sensitive configuration status.

## Start a session

`POST /api/timer/start`

```json
{ "category": "DSA" }
```

Allowed categories are `DSA`, `System Design`, `Project`, `Extra Learning`, and `Office Work`. The server rejects a second active timer or a new session while a completed session is pending save.

## Stop and save a session

`POST /api/timer/stop`

```json
{ "note": "Reviewed caching strategies" }
```

`note` is mandatory for System Design and Extra Learning, optional for DSA and Project, and must be empty for Office Work. The server persists the stopped session before trying Google Sheets. It returns `201` if the write succeeds, otherwise `202` with the stored pending session.

## Retry a pending save

`POST /api/timer/retry` retries the one locally pending session. The Sheets client first looks for an equivalent existing row before appending, to reduce duplicate rows after an ambiguous network failure.

## Validate or prepare the spreadsheet

`POST /api/sheets/setup` checks the required tab names, headers, and Dashboard formulas. With `SHEETS_SETUP_MODE=validate` it makes no spreadsheet changes; with `create-or-repair` it may create missing app tabs and blank headers/formulas, but never overwrites non-blank mismatched headers.

## Error shape

Expected failures use this form:

```json
{
  "error": {
    "code": "INVALID_NOTE",
    "message": "A note is required for System Design sessions."
  }
}
```

Errors for Google Sheets configuration report only missing environment-variable names, never the credential contents.
