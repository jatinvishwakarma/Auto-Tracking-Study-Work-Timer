import assert from "node:assert/strict";
import test from "node:test";

import { TimerService } from "../src/services/timer-service.js";

class MemoryStateStore {
  constructor() {
    this.state = { schemaVersion: 1, running: null, pending: null };
  }

  async read() {
    return structuredClone(this.state);
  }

  async write(state) {
    this.state = structuredClone(state);
  }
}

function mutableClock(initial) {
  let current = new Date(initial);
  return {
    now: () => new Date(current),
    set(value) {
      current = new Date(value);
    },
  };
}

test("a timer is persisted on start and staged before its sheet append", async () => {
  const store = new MemoryStateStore();
  const clock = mutableClock("2026-09-04T04:30:00.000Z");
  const appended = [];
  const service = new TimerService({
    stateStore: store,
    clock: clock.now,
    appendSession: async (session) => {
      appended.push(session);
      return { session, deduplicated: false };
    },
  });

  await service.start("Office Work");
  assert.equal(store.state.running.category, "Office Work");
  assert.equal(store.state.pending, null);

  clock.set("2026-09-04T05:01:15.000Z");
  const pending = await service.stop("");
  assert.equal(pending.durationMinutes, 31);
  assert.equal(store.state.running, null);
  assert.equal(store.state.pending.category, "Office Work");

  const saved = await service.retryPending();
  assert.equal(saved.saved, true);
  assert.equal(store.state.pending, null);
  assert.equal(appended.length, 1);
  assert.equal(appended[0].durationMinutes, 31);
});

test("a required note keeps the timer running until it is supplied", async () => {
  const store = new MemoryStateStore();
  const service = new TimerService({
    stateStore: store,
    clock: () => new Date("2026-09-04T04:30:00.000Z"),
    appendSession: async () => ({ deduplicated: false }),
  });

  await service.start("System Design");
  await assert.rejects(() => service.stop("  "), { code: "INVALID_NOTE" });
  assert.equal(store.state.running.category, "System Design");
  assert.equal(store.state.pending, null);
});

test("a failed append retains the exact pending session for a later retry", async () => {
  const store = new MemoryStateStore();
  const clock = mutableClock("2026-09-04T04:30:00.000Z");
  let appendAttempts = 0;
  const service = new TimerService({
    stateStore: store,
    clock: clock.now,
    appendSession: async (session) => {
      appendAttempts += 1;
      if (appendAttempts === 1) throw new Error("Google Sheets is unavailable.");
      return { session, deduplicated: false };
    },
  });

  await service.start("DSA");
  clock.set("2026-09-04T05:30:00.000Z");
  const staged = await service.stop("Reviewed stack problems");
  const firstAttempt = await service.retryPending();

  assert.equal(firstAttempt.saved, false);
  assert.equal(store.state.pending.id, staged.id);
  assert.equal(store.state.pending.note, "Reviewed stack problems");
  assert.equal(store.state.pending.attempts, 1);
  assert.match(store.state.pending.lastError, /unavailable/i);

  const retry = await service.retryPending();
  assert.equal(retry.saved, true);
  assert.equal(store.state.pending, null);
  assert.equal(appendAttempts, 2);
});
