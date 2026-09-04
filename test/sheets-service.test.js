import assert from "node:assert/strict";
import test from "node:test";

import { SheetsService } from "../src/services/sheets-service.js";

const serviceConfig = {
  spreadsheetId: "test-spreadsheet",
  serviceAccountKeyFile: "C:/safe/test-key.json",
  timeZone: "Asia/Kolkata",
  timerSessionsTab: "Timer Sessions",
  dailyDashboardTab: "Daily Dashboard",
  sheetsSetupMode: "validate",
};

function createFakeSheets(existingRows = []) {
  const calls = { appends: [] };
  return {
    calls,
    api: {
      spreadsheets: {
        values: {
          get: async () => ({ data: { values: existingRows } }),
          append: async (request) => calls.appends.push(request),
        },
      },
    },
  };
}

function createFakeSchemaSheets() {
  const calls = { updates: [], batchUpdates: [], gets: [] };
  const sheets = [
    { properties: { sheetId: 101, title: "Timer Sessions" } },
    { properties: { sheetId: 202, title: "Daily Dashboard" }, charts: [] },
  ];

  return {
    calls,
    api: {
      spreadsheets: {
        get: async (request) => {
          calls.gets.push(request);
          return { data: { sheets } };
        },
        batchUpdate: async (request) => {
          calls.batchUpdates.push(request);
          return { data: {} };
        },
        values: {
          get: async () => ({ data: { values: [] } }),
          update: async (request) => {
            calls.updates.push(request);
            return { data: {} };
          },
        },
      },
    },
  };
}

const sampleSession = Object.freeze({
  id: "session-1",
  category: "DSA",
  startedAt: "2026-09-04T18:45:00.000Z",
  endedAt: "2026-09-04T19:15:00.000Z",
  durationMinutes: 30,
  note: "Reviewed arrays",
  autoDetectedSummary: "",
  evidenceLinks: "",
  verified: false,
});

test("appendSession writes the expected raw Session row", async () => {
  const fake = createFakeSheets();
  const service = new SheetsService({ config: serviceConfig, sheetsApi: fake.api });

  const result = await service.appendSession(sampleSession);

  assert.equal(result.deduplicated, false);
  assert.equal(fake.calls.appends.length, 1);
  assert.equal(fake.calls.appends[0].range, "'Timer Sessions'!A:I");
  assert.deepEqual(fake.calls.appends[0].requestBody.values, [
    ["2026-09-05", "DSA", "00:15", "00:45", 30, "", "", "Reviewed arrays", "FALSE"],
  ]);
});

test("appendSession finds an existing matching row before retrying an ambiguous write", async () => {
  const fake = createFakeSheets([
    ["2026-09-05", "DSA", "00:15", "00:45", "30", "", "", "Reviewed arrays", "FALSE"],
  ]);
  const service = new SheetsService({ config: serviceConfig, sheetsApi: fake.api });

  const result = await service.appendSession(sampleSession);

  assert.equal(result.deduplicated, true);
  assert.equal(fake.calls.appends.length, 0);
});

test("ensureSchema prepares readable dashboard totals, summaries, and charts", async () => {
  const fake = createFakeSchemaSheets();
  const service = new SheetsService({
    config: { ...serviceConfig, sheetsSetupMode: "create-or-repair" },
    sheetsApi: fake.api,
  });

  const result = await service.ensureSchema();

  assert.equal(result.valid, true);
  assert.deepEqual(fake.calls.updates.map((request) => request.range), [
    "'Timer Sessions'!A1:I1",
    "'Daily Dashboard'!A1:M1",
    "'Daily Dashboard'!A2:M2",
    "'Daily Dashboard'!O1:Q10",
  ]);
  assert.deepEqual(fake.calls.updates[1].requestBody.values[0].slice(6, 11), [
    "Total Working Time (min)",
    "Total Time",
    "Study Time (min)",
    "Study Time",
    "Study % of Total",
  ]);

  const chartRequests = fake.calls.batchUpdates
    .flatMap((request) => request.requestBody.requests)
    .filter((request) => request.addChart);

  assert.deepEqual(
    chartRequests.map((request) => request.addChart.chart.spec.title),
    ["Time by Category", "Study vs Office Work", "Daily Total vs Study Time"],
  );
});
