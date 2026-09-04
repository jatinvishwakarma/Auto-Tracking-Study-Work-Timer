import { google } from "googleapis";

import { sheetsConfigurationStatus } from "../config.js";
import { AppError, IntegrationUnavailableError } from "../lib/errors.js";
import { sheetDate, sheetTime } from "../lib/time.js";

const SESSION_HEADERS = Object.freeze([
  "Date",
  "Category",
  "Start Time",
  "End Time",
  "Duration (min)",
  "Auto-Detected Summary",
  "Evidence Links",
  "Manual Note",
  "Verified",
]);

const DASHBOARD_HEADERS = Object.freeze([
  "Date",
  "Office Work (min)",
  "DSA (min)",
  "System Design (min)",
  "Project (min)",
  "Extra Learning (min)",
  "Total Working Time (min)",
  "Study Time (min)",
  "Study % of Total",
  "Verified Sessions",
  "Total Sessions",
]);

function quoteSheetName(name) {
  return `'${name.replaceAll("'", "''")}'`;
}

function sameHeaders(actual, expected) {
  return actual.length === expected.length && actual.every((value, index) => value === expected[index]);
}

function isBlankRow(row = []) {
  return row.every((cell) => String(cell ?? "").trim() === "");
}

function sessionRow(session, timeZone) {
  return [
    sheetDate(session.startedAt, timeZone),
    session.category,
    sheetTime(session.startedAt, timeZone),
    sheetTime(session.endedAt, timeZone),
    session.durationMinutes,
    session.autoDetectedSummary || "",
    session.evidenceLinks || "",
    session.note || "",
    session.verified ? "TRUE" : "FALSE",
  ];
}

function normaliseCell(value) {
  return String(value ?? "").trim();
}

function rowsMatch(existing, expected) {
  return expected.every((cell, index) => normaliseCell(existing[index]) === normaliseCell(cell));
}

function dashboardFormulas(timerSessionsTab) {
  const tab = quoteSheetName(timerSessionsTab);
  const categoryFormula = (category) =>
    `=ARRAYFORMULA(IF(A2:A="","",SUMIFS(${tab}!$E:$E,${tab}!$A:$A,A2:A,${tab}!$B:$B,"${category}")))`;

  return [
    `=IFERROR(SORT(UNIQUE(FILTER(${tab}!A2:A,${tab}!A2:A<>""))),"")`,
    categoryFormula("Office Work"),
    categoryFormula("DSA"),
    categoryFormula("System Design"),
    categoryFormula("Project"),
    categoryFormula("Extra Learning"),
    '=ARRAYFORMULA(IF(A2:A="","",B2:B+C2:C+D2:D+E2:E+F2:F))',
    '=ARRAYFORMULA(IF(A2:A="","",C2:C+D2:D+E2:E+F2:F))',
    '=ARRAYFORMULA(IF(A2:A="","",IF(G2:G=0,0,H2:H/G2:G)))',
    `=ARRAYFORMULA(IF(A2:A="","",COUNTIFS(${tab}!$A:$A,A2:A,${tab}!$I:$I,TRUE)))`,
    `=ARRAYFORMULA(IF(A2:A="","",COUNTIF(${tab}!$A:$A,A2:A)))`,
  ];
}

export class SheetsService {
  constructor({ config, sheetsApi } = {}) {
    this.config = config;
    this.sheetsApi = sheetsApi;
    this.client = null;
  }

  configurationStatus() {
    return sheetsConfigurationStatus(this.config);
  }

  async #getClient() {
    const status = this.configurationStatus();
    if (!status.configured) {
      throw new IntegrationUnavailableError(
        `Google Sheets is not configured. Add ${status.missing.join(" and ")} to .env, then retry.`,
      );
    }

    if (this.client) return this.client;
    if (this.sheetsApi) {
      this.client = this.sheetsApi;
      return this.client;
    }

    const auth = new google.auth.GoogleAuth({
      keyFile: this.config.serviceAccountKeyFile,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });
    this.client = google.sheets({ version: "v4", auth });
    return this.client;
  }

  async appendSession(session) {
    const client = await this.#getClient();
    const row = sessionRow(session, this.config.timeZone);
    const range = `${quoteSheetName(this.config.timerSessionsTab)}!A2:I`;

    const existing = await client.spreadsheets.values.get({
      spreadsheetId: this.config.spreadsheetId,
      range,
      majorDimension: "ROWS",
    });
    const alreadySaved = (existing.data.values ?? []).some((candidate) => rowsMatch(candidate, row));

    if (!alreadySaved) {
      await client.spreadsheets.values.append({
        spreadsheetId: this.config.spreadsheetId,
        range: `${quoteSheetName(this.config.timerSessionsTab)}!A:I`,
        valueInputOption: "RAW",
        insertDataOption: "INSERT_ROWS",
        requestBody: { values: [row] },
      });
    }

    return { session, deduplicated: alreadySaved };
  }

  async ensureSchema() {
    const client = await this.#getClient();
    const spreadsheet = await client.spreadsheets.get({
      spreadsheetId: this.config.spreadsheetId,
      fields: "sheets.properties(sheetId,title)",
    });
    const sheets = spreadsheet.data.sheets ?? [];
    const existingByTitle = new Map(sheets.map((sheet) => [sheet.properties.title, sheet.properties]));
    const neededTabs = [this.config.timerSessionsTab, this.config.dailyDashboardTab];
    const missingTabs = neededTabs.filter((title) => !existingByTitle.has(title));

    if (missingTabs.length && this.config.sheetsSetupMode !== "create-or-repair") {
      throw new AppError(
        `Missing required Sheet tab(s): ${missingTabs.join(", ")}. Create them or set SHEETS_SETUP_MODE=create-or-repair.`,
        { code: "SHEET_SCHEMA_INVALID", status: 422 },
      );
    }

    if (missingTabs.length) {
      await client.spreadsheets.batchUpdate({
        spreadsheetId: this.config.spreadsheetId,
        requestBody: { requests: missingTabs.map((title) => ({ addSheet: { properties: { title } } })) },
      });
    }

    await this.#ensureHeaderRow(client, this.config.timerSessionsTab, SESSION_HEADERS);
    await this.#ensureHeaderRow(client, this.config.dailyDashboardTab, DASHBOARD_HEADERS);
    await this.#ensureDashboardFormulas(client);

    return {
      valid: true,
      timerSessionsTab: this.config.timerSessionsTab,
      dailyDashboardTab: this.config.dailyDashboardTab,
      mode: this.config.sheetsSetupMode,
    };
  }

  async #ensureHeaderRow(client, tab, headers) {
    const range = `${quoteSheetName(tab)}!A1:${String.fromCharCode(64 + headers.length)}1`;
    const response = await client.spreadsheets.values.get({
      spreadsheetId: this.config.spreadsheetId,
      range,
      valueRenderOption: "FORMULA",
    });
    const current = response.data.values?.[0] ?? [];

    if (sameHeaders(current, headers)) return;
    if (!isBlankRow(current)) {
      throw new AppError(`The ${tab} header row does not match the required schema. It was not changed.`, {
        code: "SHEET_SCHEMA_INVALID",
        status: 422,
      });
    }
    if (this.config.sheetsSetupMode !== "create-or-repair") {
      throw new AppError(
        `The ${tab} header row is missing. Add the required headers or set SHEETS_SETUP_MODE=create-or-repair.`,
        { code: "SHEET_SCHEMA_INVALID", status: 422 },
      );
    }

    await client.spreadsheets.values.update({
      spreadsheetId: this.config.spreadsheetId,
      range,
      valueInputOption: "RAW",
      requestBody: { values: [headers] },
    });
  }

  async #ensureDashboardFormulas(client) {
    const tab = this.config.dailyDashboardTab;
    const range = `${quoteSheetName(tab)}!A2:K2`;
    const response = await client.spreadsheets.values.get({
      spreadsheetId: this.config.spreadsheetId,
      range,
      valueRenderOption: "FORMULA",
    });
    const current = response.data.values?.[0] ?? [];
    if (!isBlankRow(current)) return;
    if (this.config.sheetsSetupMode !== "create-or-repair") {
      throw new AppError(
        `The ${tab} formulas are missing. Add them or set SHEETS_SETUP_MODE=create-or-repair.`,
        { code: "SHEET_SCHEMA_INVALID", status: 422 },
      );
    }

    await client.spreadsheets.values.update({
      spreadsheetId: this.config.spreadsheetId,
      range,
      valueInputOption: "USER_ENTERED",
      requestBody: { values: [dashboardFormulas(this.config.timerSessionsTab)] },
    });
    await client.spreadsheets.batchUpdate({
      spreadsheetId: this.config.spreadsheetId,
      requestBody: {
        requests: [
          {
            repeatCell: {
              range: { sheetId: await this.#getSheetId(client, tab), startRowIndex: 1, startColumnIndex: 8, endColumnIndex: 9 },
              cell: { userEnteredFormat: { numberFormat: { type: "PERCENT", pattern: "0.00%" } } },
              fields: "userEnteredFormat.numberFormat",
            },
          },
        ],
      },
    });
  }

  async #getSheetId(client, title) {
    const spreadsheet = await client.spreadsheets.get({
      spreadsheetId: this.config.spreadsheetId,
      fields: "sheets.properties(sheetId,title)",
    });
    const found = (spreadsheet.data.sheets ?? []).find((sheet) => sheet.properties.title === title);
    if (!found) throw new AppError(`Could not find the ${title} tab after validation.`, { status: 422 });
    return found.properties.sheetId;
  }
}
