import assert from "node:assert/strict";
import test from "node:test";

import { durationMinutes, sheetDate, sheetTime } from "../src/lib/time.js";

test("sheet values use the configured time zone rather than the server locale", () => {
  const timestamp = "2026-09-04T18:45:00.000Z";
  assert.equal(sheetDate(timestamp, "Asia/Kolkata"), "2026-09-05");
  assert.equal(sheetTime(timestamp, "Asia/Kolkata"), "00:15");
});

test("durations round to the nearest minute and never become zero", () => {
  assert.equal(durationMinutes("2026-09-04T00:00:00.000Z", "2026-09-04T00:00:20.000Z"), 1);
  assert.equal(durationMinutes("2026-09-04T00:00:00.000Z", "2026-09-04T00:01:31.000Z"), 2);
});
