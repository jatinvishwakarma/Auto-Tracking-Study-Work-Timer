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
