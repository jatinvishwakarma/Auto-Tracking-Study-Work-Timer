import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";

const EMPTY_STATE = Object.freeze({ schemaVersion: 1, running: null, pending: null });

function cloneEmptyState() {
  return structuredClone(EMPTY_STATE);
}

function validateState(state) {
  if (!state || state.schemaVersion !== 1 || !("running" in state) || !("pending" in state)) {
    throw new Error("Timer state file has an unsupported format.");
  }
  if (state.running && state.pending) {
    throw new Error("Timer state cannot contain both a running and pending session.");
  }
  return state;
}

export class StateStore {
  constructor(filePath) {
    this.filePath = filePath;
  }

  async read() {
    try {
      return validateState(JSON.parse(await readFile(this.filePath, "utf8")));
    } catch (error) {
      if (error.code === "ENOENT") return cloneEmptyState();
      throw error;
    }
  }

  async write(state) {
    validateState(state);
    const directory = path.dirname(this.filePath);
    await mkdir(directory, { recursive: true });

    const temporaryPath = path.join(
      directory,
      `.${path.basename(this.filePath)}.${process.pid}.${Date.now()}.tmp`,
    );
    await writeFile(temporaryPath, `${JSON.stringify(state, null, 2)}\n`, "utf8");
    await rename(temporaryPath, this.filePath);
  }
}
