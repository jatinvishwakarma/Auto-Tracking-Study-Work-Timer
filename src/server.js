import express from "express";
import path from "node:path";

import { config } from "./config.js";
import { CATEGORIES, requiresNote, supportsNote } from "./domain/categories.js";
import { AppError } from "./lib/errors.js";
import { SheetsService } from "./services/sheets-service.js";
import { TimerService } from "./services/timer-service.js";
import { StateStore } from "./storage/state-store.js";
import { SessionStore } from "./storage/session-store.js";

const sessionStorePath = path.resolve(process.cwd(), "data/history.json");
const sessionStore = new SessionStore(sessionStorePath);

const app = express();
const sheetsService = new SheetsService({ config });
const timerService = new TimerService({
  stateStore: new StateStore(config.stateFile),
  appendSession: async (session) => {
    // Save to local history first
    const dateParts = new Intl.DateTimeFormat("en-CA", {
      timeZone: config.timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(new Date(session.startedAt));
    const dateStr = dateParts
      .filter((p) => p.type !== "literal")
      .map((p) => p.value)
      .join("-");
    await sessionStore.appendSession({ ...session, date: dateStr });

    // Then try to save to Google Sheets
    return sheetsService.appendSession(session);
  },
});

app.disable("x-powered-by");
app.use(express.json({ limit: "16kb" }));
app.use(express.static("public"));

function asyncRoute(handler) {
  return (request, response, next) => Promise.resolve(handler(request, response, next)).catch(next);
}

app.get(
  "/api/health",
  asyncRoute(async (_request, response) => {
    response.json({ ok: true, sheets: sheetsService.configurationStatus() });
  }),
);

app.get(
  "/api/status",
  asyncRoute(async (_request, response) => {
    response.json({
      ...(await timerService.getStatus()),
      categories: CATEGORIES.map((name) => ({ name, requiresNote: requiresNote(name), supportsNote: supportsNote(name) })),
      sheets: sheetsService.configurationStatus(),
    });
  }),
);

app.post(
  "/api/timer/start",
  asyncRoute(async (request, response) => {
    const status = await timerService.start(request.body?.category);
    response.status(201).json(status);
  }),
);

app.post(
  "/api/timer/stop",
  asyncRoute(async (request, response) => {
    const session = await timerService.stop(request.body?.note);
    const saveResult = await timerService.retryPending();
    response.status(saveResult.saved ? 201 : 202).json({ session, ...saveResult });
  }),
);

app.post(
  "/api/timer/retry",
  asyncRoute(async (_request, response) => {
    const saveResult = await timerService.retryPending();
    response.status(saveResult.saved ? 201 : 202).json(saveResult);
  }),
);

app.post(
  "/api/sheets/setup",
  asyncRoute(async (_request, response) => {
    response.json(await sheetsService.ensureSchema());
  }),
);

// ─── Session History API ────────────────────────────────────────────────────

app.get(
  "/api/sessions",
  asyncRoute(async (request, response) => {
    const { from, to, category } = request.query;
    const sessions = await sessionStore.getSessions({ from, to, category });
    response.json({ sessions });
  }),
);

app.get(
  "/api/sessions/today",
  asyncRoute(async (_request, response) => {
    const sessions = await sessionStore.getTodaySessions(config.timeZone);
    response.json({ sessions });
  }),
);

app.get(
  "/api/sessions/daily-summary",
  asyncRoute(async (_request, response) => {
    const summary = await sessionStore.getDailySummary(config.timeZone);
    response.json({ summary });
  }),
);

app.use((request, _response, next) => {
  next(new AppError(`No route matches ${request.method} ${request.path}.`, { code: "NOT_FOUND", status: 404 }));
});

app.use((error, _request, response, _next) => {
  if (error instanceof AppError) {
    response.status(error.status).json({ error: { code: error.code, message: error.message } });
    return;
  }

  console.error("Unexpected server error", error);
  response.status(500).json({ error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred." } });
});

app.listen(config.port, "127.0.0.1", () => {
  console.log(`Auto Tracker is running at http://localhost:${config.port}`);
});
