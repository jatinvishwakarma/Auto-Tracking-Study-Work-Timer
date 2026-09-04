import { randomUUID } from "node:crypto";

import { isCategory, validateNote } from "../domain/categories.js";
import { AppError } from "../lib/errors.js";
import { durationMinutes } from "../lib/time.js";

function publicPendingSession(session) {
  if (!session) return null;
  return {
    id: session.id,
    category: session.category,
    startedAt: session.startedAt,
    endedAt: session.endedAt,
    durationMinutes: session.durationMinutes,
    note: session.note,
    attempts: session.attempts,
    lastError: session.lastError ?? null,
  };
}

export class TimerService {
  constructor({ stateStore, clock = () => new Date(), appendSession }) {
    this.stateStore = stateStore;
    this.clock = clock;
    this.appendSession = appendSession;
    this.queue = Promise.resolve();
  }

  async #exclusive(work) {
    const result = this.queue.then(work, work);
    this.queue = result.catch(() => undefined);
    return result;
  }

  async getStatus() {
    const state = await this.stateStore.read();
    const now = this.clock().toISOString();
    return {
      running: state.running,
      pending: publicPendingSession(state.pending),
      now,
    };
  }

  async start(category) {
    return this.#exclusive(async () => {
      if (!isCategory(category)) {
        throw new AppError("Choose one of the supported timer categories.", { code: "INVALID_CATEGORY" });
      }

      const state = await this.stateStore.read();
      if (state.running) {
        throw new AppError("A timer is already running. Stop it before starting another.", {
          code: "TIMER_ALREADY_RUNNING",
          status: 409,
        });
      }
      if (state.pending) {
        throw new AppError("A completed session is waiting to be saved. Retry it before starting another.", {
          code: "PENDING_SESSION_EXISTS",
          status: 409,
        });
      }

      state.running = { id: randomUUID(), category, startedAt: this.clock().toISOString() };
      await this.stateStore.write(state);
      return this.getStatus();
    });
  }

  async stop(note) {
    return this.#exclusive(async () => {
      const state = await this.stateStore.read();
      if (!state.running) {
        throw new AppError("There is no running timer to stop.", { code: "NO_RUNNING_TIMER", status: 409 });
      }

      const noteResult = validateNote(state.running.category, note);
      if (!noteResult.valid) {
        throw new AppError(noteResult.message, { code: "INVALID_NOTE" });
      }

      const endedAt = this.clock().toISOString();
      const session = {
        id: state.running.id,
        category: state.running.category,
        startedAt: state.running.startedAt,
        endedAt,
        durationMinutes: durationMinutes(state.running.startedAt, endedAt),
        note: noteResult.value,
        autoDetectedSummary: "",
        evidenceLinks: "",
        verified: false,
        attempts: 0,
        lastError: null,
      };

      state.running = null;
      state.pending = session;
      await this.stateStore.write(state);
      return publicPendingSession(session);
    });
  }

  async retryPending() {
    return this.#exclusive(async () => {
      const state = await this.stateStore.read();
      if (!state.pending) {
        throw new AppError("There is no pending session to save.", { code: "NO_PENDING_SESSION", status: 409 });
      }

      try {
        const result = await this.appendSession(state.pending);
        state.pending = null;
        await this.stateStore.write(state);
        return { saved: true, deduplicated: result.deduplicated === true, session: result.session };
      } catch (error) {
        state.pending.attempts += 1;
        state.pending.lastError = error instanceof Error ? error.message : "Unable to save the session.";
        await this.stateStore.write(state);
        return { saved: false, pending: publicPendingSession(state.pending) };
      }
    });
  }
}
