import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { StateStore } from "../src/storage/state-store.js";

test("state survives a new store instance, as it would after a server restart", async (t) => {
  const directory = await mkdtemp(path.join(os.tmpdir(), "auto-tracker-test-"));
  t.after(() => rm(directory, { recursive: true, force: true }));

  const stateFile = path.join(directory, "state.json");
  const original = new StateStore(stateFile);
  await original.write({
    schemaVersion: 1,
    running: { id: "session-1", category: "Project", startedAt: "2026-09-04T04:30:00.000Z" },
    pending: null,
  });

  const afterRestart = new StateStore(stateFile);
  assert.deepEqual(await afterRestart.read(), {
    schemaVersion: 1,
    running: { id: "session-1", category: "Project", startedAt: "2026-09-04T04:30:00.000Z" },
    pending: null,
  });
});
