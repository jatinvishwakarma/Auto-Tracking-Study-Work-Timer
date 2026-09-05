import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";

const EMPTY_HISTORY = Object.freeze({ schemaVersion: 1, sessions: [] });

function cloneEmptyHistory() {
  return structuredClone(EMPTY_HISTORY);
}

function validateHistory(history) {
  if (!history || history.schemaVersion !== 1 || !Array.isArray(history.sessions)) {
    throw new Error("Session history file has an unsupported format.");
  }
  return history;
}

export class SessionStore {
  constructor(filePath) {
    this.filePath = filePath;
  }

  async read() {
    try {
      return validateHistory(JSON.parse(await readFile(this.filePath, "utf8")));
    } catch (error) {
      if (error.code === "ENOENT") return cloneEmptyHistory();
      throw error;
    }
  }

  async write(history) {
    validateHistory(history);
    const directory = path.dirname(this.filePath);
    await mkdir(directory, { recursive: true });

    const temporaryPath = path.join(
      directory,
      `.history.${process.pid}.${Date.now()}.tmp`,
    );
    await writeFile(temporaryPath, `${JSON.stringify(history, null, 2)}\n`, "utf8");
    await rename(temporaryPath, this.filePath);
  }

  async appendSession(session) {
    const history = await this.read();

    // Deduplicate by session ID
    if (history.sessions.some((s) => s.id === session.id)) {
      return session;
    }

    history.sessions.push({
      id: session.id,
      category: session.category,
      startedAt: session.startedAt,
      endedAt: session.endedAt,
      durationMinutes: session.durationMinutes,
      note: session.note || "",
      autoDetectedSummary: session.autoDetectedSummary || "",
      evidenceLinks: session.evidenceLinks || "",
      verified: session.verified ?? false,
      date: session.date || "",
    });
    await this.write(history);
    return session;
  }

  async getSessions({ from, to, category } = {}) {
    const history = await this.read();
    let sessions = history.sessions;

    if (from) {
      sessions = sessions.filter((s) => s.date >= from);
    }
    if (to) {
      sessions = sessions.filter((s) => s.date <= to);
    }
    if (category) {
      sessions = sessions.filter((s) => s.category === category);
    }

    return sessions;
  }

  async getTodaySessions(timeZone) {
    const today = new Date().toLocaleDateString("en-CA", { timeZone });
    const history = await this.read();
    return history.sessions.filter((s) => s.date === today);
  }

  async getDailySummary(timeZone) {
    const history = await this.read();
    const summaryMap = {};

    for (const session of history.sessions) {
      const date = session.date;
      if (!summaryMap[date]) {
        summaryMap[date] = {
          date,
          categories: {},
          totalMinutes: 0,
          sessionCount: 0,
        };
      }
      const entry = summaryMap[date];
      if (!entry.categories[session.category]) {
        entry.categories[session.category] = 0;
      }
      entry.categories[session.category] += session.durationMinutes;
      entry.totalMinutes += session.durationMinutes;
      entry.sessionCount += 1;
    }

    return Object.values(summaryMap).sort((a, b) => b.date.localeCompare(a.date));
  }
}
