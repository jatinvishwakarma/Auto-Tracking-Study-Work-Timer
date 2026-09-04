import "dotenv/config";
import path from "node:path";

function readString(name, fallback = "") {
  return (process.env[name] ?? fallback).trim();
}

function resolveLocalPath(value, fallback) {
  return path.resolve(process.cwd(), value || fallback);
}

function validateTimeZone(timeZone) {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone }).format();
    return timeZone;
  } catch {
    throw new Error(`APP_TIME_ZONE is not a valid IANA time zone: ${timeZone}`);
  }
}

const setupMode = readString("SHEETS_SETUP_MODE", "validate");
if (!new Set(["validate", "create-or-repair"]).has(setupMode)) {
  throw new Error("SHEETS_SETUP_MODE must be validate or create-or-repair.");
}

export const config = Object.freeze({
  port: Number.parseInt(readString("PORT", "3000"), 10) || 3000,
  timeZone: validateTimeZone(readString("APP_TIME_ZONE", "Asia/Kolkata")),
  stateFile: resolveLocalPath(readString("STATE_FILE"), "data/state.json"),
  spreadsheetId: readString("SPREADSHEET_ID"),
  serviceAccountKeyFile: readString("GOOGLE_SERVICE_ACCOUNT_KEY_FILE"),
  timerSessionsTab: readString("TIMER_SESSIONS_TAB", "Timer Sessions"),
  dailyDashboardTab: readString("DAILY_DASHBOARD_TAB", "Daily Dashboard"),
  sheetsSetupMode: setupMode,
  evidenceBufferMinutes: Number.parseInt(readString("EVIDENCE_BUFFER_MINUTES", "10"), 10) || 10,
});

export function sheetsConfigurationStatus(currentConfig = config) {
  const missing = [];
  if (!currentConfig.spreadsheetId) missing.push("SPREADSHEET_ID");
  if (!currentConfig.serviceAccountKeyFile) missing.push("GOOGLE_SERVICE_ACCOUNT_KEY_FILE");

  return {
    configured: missing.length === 0,
    missing,
    setupMode: currentConfig.sheetsSetupMode,
  };
}
