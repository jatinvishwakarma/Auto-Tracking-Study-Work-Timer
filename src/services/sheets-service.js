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
  "Total Time",
  "Study Time (min)",
  "Study Time",
  "Study % of Total",
  "Verified Sessions",
  "Total Sessions",
]);

const LEGACY_DASHBOARD_HEADERS = Object.freeze([
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

const CATEGORY_SUMMARY_RANGE = Object.freeze({
  startRowIndex: 1,
  endRowIndex: 6,
  labelColumnIndex: 14,
  valueColumnIndex: 15,
});

const STUDY_OFFICE_SUMMARY_RANGE = Object.freeze({
  startRowIndex: 8,
  endRowIndex: 10,
  labelColumnIndex: 14,
  valueColumnIndex: 15,
});

function quoteSheetName(name) {
  return `'${name.replaceAll("'", "''")}'`;
}

function sameHeaders(actual, expected) {
  return actual.length === expected.length && actual.every((value, index) => value === expected[index]);
}

function columnName(index) {
  let dividend = index;
  let label = "";
  while (dividend > 0) {
    const modulo = (dividend - 1) % 26;
    label = String.fromCharCode(65 + modulo) + label;
    dividend = Math.floor((dividend - modulo) / 26);
  }
  return label;
}

function isBlankRow(row = []) {
  return row.every((cell) => String(cell ?? "").trim() === "");
}

function isBlankGrid(rows = []) {
  return rows.every((row) => isBlankRow(row));
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
    `=IFERROR(SORT(UNIQUE(FILTER(INDIRECT("${timerSessionsTab.replaceAll('"', '""')}!A2:A"),INDIRECT("${timerSessionsTab.replaceAll('"', '""')}!A2:A")<>""))),"")`,
    categoryFormula("Office Work"),
    categoryFormula("DSA"),
    categoryFormula("System Design"),
    categoryFormula("Project"),
    categoryFormula("Extra Learning"),
    '=ARRAYFORMULA(IF(A2:A="","",B2:B+C2:C+D2:D+E2:E+F2:F))',
    '=ARRAYFORMULA(IF(A2:A="","",G2:G/1440))',
    '=ARRAYFORMULA(IF(A2:A="","",C2:C+D2:D+E2:E+F2:F))',
    '=ARRAYFORMULA(IF(A2:A="","",I2:I/1440))',
    '=ARRAYFORMULA(IF(A2:A="","",IF(G2:G=0,0,I2:I/G2:G)))',
    `=ARRAYFORMULA(IF(A2:A="","",COUNTIFS(${tab}!$A:$A,A2:A,${tab}!$I:$I,TRUE)))`,
    `=ARRAYFORMULA(IF(A2:A="","",COUNTIF(${tab}!$A:$A,A2:A)))`,
  ];
}

function summaryFormulas() {
  return [
    ["Category", "Total Minutes", "Total Time"],
    ["Office Work", "=SUM(B2:B)", "=P2/1440"],
    ["DSA", "=SUM(C2:C)", "=P3/1440"],
    ["System Design", "=SUM(D2:D)", "=P4/1440"],
    ["Project", "=SUM(E2:E)", "=P5/1440"],
    ["Extra Learning", "=SUM(F2:F)", "=P6/1440"],
    [],
    ["Focus Split", "Total Minutes", "Total Time"],
    ["Study", "=SUM(I2:I)", "=P9/1440"],
    ["Office Work", "=SUM(B2:B)", "=P10/1440"],
  ];
}

function rowsEqual(actual = [], expected = []) {
  if (actual.length !== expected.length) return false;
  return expected.every((row, rowIndex) => sameHeaders(actual[rowIndex] ?? [], row));
}

function source(sheetId, startRowIndex, endRowIndex, startColumnIndex, endColumnIndex) {
  return { sheetId, startRowIndex, endRowIndex, startColumnIndex, endColumnIndex };
}

function pieChart({ sheetId, title, startRowIndex, endRowIndex, labelColumnIndex, valueColumnIndex, columnIndex }) {
  return {
    addChart: {
      chart: {
        spec: {
          title,
          pieChart: {
            legendPosition: "RIGHT_LEGEND",
            pieHole: 0.35,
            domain: {
              sourceRange: {
                sources: [source(sheetId, startRowIndex, endRowIndex, labelColumnIndex, labelColumnIndex + 1)],
              },
            },
            series: {
              sourceRange: {
                sources: [source(sheetId, startRowIndex, endRowIndex, valueColumnIndex, valueColumnIndex + 1)],
              },
            },
          },
        },
        position: {
          overlayPosition: {
            anchorCell: { sheetId, rowIndex: 1, columnIndex },
            widthPixels: 520,
            heightPixels: 320,
          },
        },
      },
    },
  };
}

function dailyTrendChart(sheetId) {
  return {
    addChart: {
      chart: {
        spec: {
          title: "Daily Total vs Study Time",
          basicChart: {
            chartType: "COLUMN",
            legendPosition: "BOTTOM_LEGEND",
            headerCount: 1,
            axis: [
              { position: "BOTTOM_AXIS", title: "Date" },
              { position: "LEFT_AXIS", title: "Minutes" },
            ],
            domains: [
              {
                domain: {
                  sourceRange: {
                    sources: [source(sheetId, 0, 366, 0, 1)],
                  },
                },
              },
            ],
            series: [
              {
                series: {
                  sourceRange: {
                    sources: [source(sheetId, 0, 366, 6, 7)],
                  },
                },
                targetAxis: "LEFT_AXIS",
              },
              {
                series: {
                  sourceRange: {
                    sources: [source(sheetId, 0, 366, 8, 9)],
                  },
                },
                targetAxis: "LEFT_AXIS",
              },
            ],
          },
        },
        position: {
          overlayPosition: {
            anchorCell: { sheetId, rowIndex: 18, columnIndex: 18 },
            widthPixels: 720,
            heightPixels: 360,
          },
        },
      },
    },
  };
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
        insertDataOption: "OVERWRITE",
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
    await this.#ensureDashboard(client);

    return {
      valid: true,
      timerSessionsTab: this.config.timerSessionsTab,
      dailyDashboardTab: this.config.dailyDashboardTab,
      mode: this.config.sheetsSetupMode,
    };
  }

  async #ensureHeaderRow(client, tab, headers) {
    const range = `${quoteSheetName(tab)}!A1:${columnName(headers.length)}1`;
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

  async #ensureDashboard(client) {
    const tab = this.config.dailyDashboardTab;
    const range = `${quoteSheetName(tab)}!A1:${columnName(DASHBOARD_HEADERS.length)}1`;
    const response = await client.spreadsheets.values.get({
      spreadsheetId: this.config.spreadsheetId,
      range,
      valueRenderOption: "FORMULA",
    });
    const current = response.data.values?.[0] ?? [];
    const hasCurrentHeaders = sameHeaders(current, DASHBOARD_HEADERS);
    const hasLegacyHeaders = sameHeaders(current, LEGACY_DASHBOARD_HEADERS);
    const canCreate = this.config.sheetsSetupMode === "create-or-repair";

    if (!hasCurrentHeaders) {
      if (!isBlankRow(current) && !hasLegacyHeaders) {
        throw new AppError(`The ${tab} header row does not match the required schema. It was not changed.`, {
          code: "SHEET_SCHEMA_INVALID",
          status: 422,
        });
      }
      if (!canCreate) {
        throw new AppError(
          hasLegacyHeaders
            ? `The ${tab} header row needs the new total-time columns. Set SHEETS_SETUP_MODE=create-or-repair to upgrade it.`
            : `The ${tab} header row is missing. Add the required headers or set SHEETS_SETUP_MODE=create-or-repair.`,
          { code: "SHEET_SCHEMA_INVALID", status: 422 },
        );
      }

      await client.spreadsheets.values.update({
        spreadsheetId: this.config.spreadsheetId,
        range,
        valueInputOption: "RAW",
        requestBody: { values: [DASHBOARD_HEADERS] },
      });
    }

    await this.#ensureDashboardFormulas(client, !hasCurrentHeaders && hasLegacyHeaders);
    await this.#ensureDashboardSummary(client);

    const sheetId = await this.#getSheetId(client, tab);
    await this.#ensureDashboardFormatting(client, sheetId);
    await this.#ensureDashboardCharts(client, sheetId);
  }

  async #ensureDashboardFormulas(client, forceRepair = false) {
    const tab = this.config.dailyDashboardTab;
    const range = `${quoteSheetName(tab)}!A2:${columnName(DASHBOARD_HEADERS.length)}2`;
    const response = await client.spreadsheets.values.get({
      spreadsheetId: this.config.spreadsheetId,
      range,
      valueRenderOption: "FORMULA",
    });
    const current = response.data.values?.[0] ?? [];
    const formulas = dashboardFormulas(this.config.timerSessionsTab);
    if (!forceRepair && sameHeaders(current, formulas)) return;
    if (!forceRepair && !isBlankRow(current) && this.config.sheetsSetupMode !== "create-or-repair") {
      throw new AppError(
        `The ${tab} formulas need to be repaired. Set SHEETS_SETUP_MODE=create-or-repair to update them.`,
        { code: "SHEET_SCHEMA_INVALID", status: 422 },
      );
    }
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
      requestBody: { values: [formulas] },
    });
  }

  async #ensureDashboardSummary(client) {
    const tab = this.config.dailyDashboardTab;
    const range = `${quoteSheetName(tab)}!O1:Q10`;
    const response = await client.spreadsheets.values.get({
      spreadsheetId: this.config.spreadsheetId,
      range,
      valueRenderOption: "FORMULA",
    });
    const current = response.data.values ?? [];
    const summary = summaryFormulas();
    if (rowsEqual(current, summary)) return;
    if (!isBlankGrid(current) && this.config.sheetsSetupMode !== "create-or-repair") {
      throw new AppError(
        `The ${tab} visual summary is missing or outdated. Set SHEETS_SETUP_MODE=create-or-repair to update it.`,
        { code: "SHEET_SCHEMA_INVALID", status: 422 },
      );
    }
    if (this.config.sheetsSetupMode !== "create-or-repair") {
      throw new AppError(
        `The ${tab} visual summary is missing. Add it or set SHEETS_SETUP_MODE=create-or-repair.`,
        { code: "SHEET_SCHEMA_INVALID", status: 422 },
      );
    }

    await client.spreadsheets.values.update({
      spreadsheetId: this.config.spreadsheetId,
      range,
      valueInputOption: "USER_ENTERED",
      requestBody: { values: summary },
    });
  }

  async #ensureDashboardFormatting(client, sheetId) {
    await client.spreadsheets.batchUpdate({
      spreadsheetId: this.config.spreadsheetId,
      requestBody: {
        requests: [
          {
            repeatCell: {
              range: { sheetId, startRowIndex: 1, startColumnIndex: 7, endColumnIndex: 8 },
              cell: { userEnteredFormat: { numberFormat: { type: "NUMBER", pattern: "[h]:mm" } } },
              fields: "userEnteredFormat.numberFormat",
            },
          },
          {
            repeatCell: {
              range: { sheetId, startRowIndex: 1, startColumnIndex: 9, endColumnIndex: 10 },
              cell: { userEnteredFormat: { numberFormat: { type: "NUMBER", pattern: "[h]:mm" } } },
              fields: "userEnteredFormat.numberFormat",
            },
          },
          {
            repeatCell: {
              range: { sheetId, startRowIndex: 1, startColumnIndex: 10, endColumnIndex: 11 },
              cell: { userEnteredFormat: { numberFormat: { type: "PERCENT", pattern: "0.00%" } } },
              fields: "userEnteredFormat.numberFormat",
            },
          },
          {
            repeatCell: {
              range: { sheetId, startRowIndex: 1, startColumnIndex: 16, endColumnIndex: 17 },
              cell: { userEnteredFormat: { numberFormat: { type: "NUMBER", pattern: "[h]:mm" } } },
              fields: "userEnteredFormat.numberFormat",
            },
          },
        ],
      },
    });
  }

  async #ensureDashboardCharts(client, sheetId) {
    const chartTitles = new Set(["Time by Category", "Study vs Office Work", "Daily Total vs Study Time"]);
    const spreadsheet = await client.spreadsheets.get({
      spreadsheetId: this.config.spreadsheetId,
      fields: "sheets(properties(sheetId,title),charts(spec(title)))",
    });
    const sheet = (spreadsheet.data.sheets ?? []).find((candidate) => candidate.properties.title === this.config.dailyDashboardTab);
    const existingTitles = new Set((sheet?.charts ?? []).map((chart) => chart.spec?.title).filter(Boolean));
    const missingTitles = [...chartTitles].filter((title) => !existingTitles.has(title));

    if (!missingTitles.length) return;
    if (this.config.sheetsSetupMode !== "create-or-repair") {
      throw new AppError(
        `The ${this.config.dailyDashboardTab} charts are missing. Add them or set SHEETS_SETUP_MODE=create-or-repair.`,
        { code: "SHEET_SCHEMA_INVALID", status: 422 },
      );
    }

    const requests = [];
    if (missingTitles.includes("Time by Category")) {
      requests.push(
        pieChart({
          sheetId,
          title: "Time by Category",
          ...CATEGORY_SUMMARY_RANGE,
          columnIndex: 18,
        }),
      );
    }
    if (missingTitles.includes("Study vs Office Work")) {
      requests.push(
        pieChart({
          sheetId,
          title: "Study vs Office Work",
          ...STUDY_OFFICE_SUMMARY_RANGE,
          columnIndex: 25,
        }),
      );
    }
    if (missingTitles.includes("Daily Total vs Study Time")) {
      requests.push(dailyTrendChart(sheetId));
    }

    await client.spreadsheets.batchUpdate({
      spreadsheetId: this.config.spreadsheetId,
      requestBody: { requests },
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
