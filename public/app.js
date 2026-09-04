const elements = {
  categoryPicker: document.querySelector("#category-picker"),
  connectionBadge: document.querySelector("#connection-badge"),
  elapsedTime: document.querySelector("#elapsed-time"),
  notice: document.querySelector("#notice"),
  noteHint: document.querySelector("#note-hint"),
  noteLabel: document.querySelector("#note-label"),
  noteSection: document.querySelector("#note-section"),
  pendingCard: document.querySelector("#pending-card"),
  pendingDescription: document.querySelector("#pending-description"),
  pendingTitle: document.querySelector("#pending-title"),
  retryButton: document.querySelector("#retry-button"),
  sessionCategory: document.querySelector("#session-category"),
  sessionDetail: document.querySelector("#session-detail"),
  sessionNote: document.querySelector("#session-note"),
  setupButton: document.querySelector("#setup-button"),
  setupDescription: document.querySelector("#setup-description"),
  startButton: document.querySelector("#start-button"),
  stopButton: document.querySelector("#stop-button"),
};

const model = {
  categories: [],
  selectedCategory: "DSA",
  status: { running: null, pending: null },
  saving: false,
};

function showNotice(message = "", kind = "") {
  elements.notice.textContent = message;
  elements.notice.dataset.kind = kind;
}

function secondsSince(startedAt) {
  return Math.max(0, Math.floor((Date.now() - new Date(startedAt).getTime()) / 1_000));
}

function displayDuration(totalSeconds) {
  const hours = Math.floor(totalSeconds / 3_600);
  const minutes = Math.floor((totalSeconds % 3_600) / 60);
  const seconds = totalSeconds % 60;
  return [hours, minutes, seconds].map((value) => String(value).padStart(2, "0")).join(":");
}

function selectedCategoryDetails() {
  return model.categories.find((category) => category.name === model.selectedCategory) ?? null;
}

function setBusy(button, isBusy, busyLabel) {
  if (isBusy) {
    button.dataset.previousLabel = button.textContent;
    button.textContent = busyLabel;
  } else if (button.dataset.previousLabel) {
    button.textContent = button.dataset.previousLabel;
  }
  button.disabled = isBusy;
}

async function request(url, options = {}) {
  const response = await fetch(url, {
    headers: { "Content-Type": "application/json", ...(options.headers ?? {}) },
    ...options,
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error?.message || "Something went wrong. Please try again.");
  return payload;
}

function renderPicker() {
  const running = Boolean(model.status.running);
  const pending = Boolean(model.status.pending);
  elements.categoryPicker.replaceChildren(
    ...model.categories.map((category) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "chip";
      button.textContent = category.name;
      button.setAttribute("aria-pressed", String(category.name === model.selectedCategory));
      button.disabled = running || pending || model.saving;
      button.addEventListener("click", () => {
        model.selectedCategory = category.name;
        render();
      });
      return button;
    }),
  );
}

function renderNoteSection() {
  const category = model.status.running ? model.status.running.category : model.selectedCategory;
  const categoryDetails = model.categories.find((item) => item.name === category);
  const show = Boolean(model.status.running && categoryDetails?.supportsNote);
  elements.noteSection.hidden = !show;
  if (!show) {
    elements.sessionNote.value = "";
    return;
  }

  const required = categoryDetails.requiresNote;
  elements.noteLabel.textContent = required ? "What did you cover?" : "Session note (optional)";
  elements.noteHint.textContent = required
    ? "A short note is required before this session can be saved."
    : "Add context now if it will help you review this session later.";
  elements.sessionNote.required = required;
}

function renderConnection() {
  const sheets = model.status.sheets;
  const configured = sheets?.configured;
  elements.connectionBadge.textContent = configured ? "Sheets configured" : "Sheets setup needed";
  elements.connectionBadge.className = `badge ${configured ? "badge-ready" : "badge-warning"}`;
  elements.setupDescription.textContent = configured
    ? `Ready to validate ${sheets.setupMode === "create-or-repair" ? "or prepare" : "the schema in"} your configured spreadsheet.`
    : `Add ${sheets?.missing?.join(" and ") || "the Google Sheets settings"} to .env. Completed sessions remain safely queued here until then.`;
  elements.setupButton.disabled = !configured || model.saving;
  elements.setupButton.textContent = sheets?.setupMode === "create-or-repair" ? "Prepare sheet" : "Validate sheet";
}

function renderPending() {
  const pending = model.status.pending;
  elements.pendingCard.hidden = !pending;
  if (!pending) return;

  elements.pendingTitle.textContent = `${pending.category} is ready to save`;
  const previousFailure = pending.lastError ? ` Last attempt: ${pending.lastError}` : "";
  elements.pendingDescription.textContent = `${pending.durationMinutes} minute session from ${new Date(pending.startedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} is stored locally.${previousFailure}`;
  elements.retryButton.disabled = model.saving;
}

function renderTimer() {
  const running = model.status.running;
  const category = running?.category ?? model.selectedCategory;
  elements.sessionCategory.textContent = category;
  elements.elapsedTime.textContent = running ? displayDuration(secondsSince(running.startedAt)) : "00:00:00";
  elements.sessionDetail.textContent = running
    ? `Started at ${new Date(running.startedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}. State is saved locally.`
    : model.status.pending
      ? "Resolve the pending save to begin your next session."
      : "Pick a category, then start tracking.";
  elements.startButton.hidden = Boolean(running);
  elements.stopButton.hidden = !running;
  elements.startButton.disabled = Boolean(model.status.pending) || model.saving;
  elements.stopButton.disabled = model.saving;
}

function render() {
  renderPicker();
  renderTimer();
  renderNoteSection();
  renderPending();
  renderConnection();
}

async function refreshStatus() {
  const status = await request("/api/status");
  model.categories = status.categories;
  model.status = status;
  if (!model.categories.some((category) => category.name === model.selectedCategory)) {
    model.selectedCategory = model.categories[0]?.name;
  }
  render();
}

async function refreshStatusQuietly() {
  try {
    await refreshStatus();
  } catch {
    render();
  }
}

elements.startButton.addEventListener("click", async () => {
  try {
    model.saving = true;
    setBusy(elements.startButton, true, "Starting…");
    const status = await request("/api/timer/start", {
      method: "POST",
      body: JSON.stringify({ category: model.selectedCategory }),
    });
    model.status = { ...model.status, ...status };
    elements.sessionNote.value = "";
    showNotice(`${model.selectedCategory} timer started.`, "success");
  } catch (error) {
    showNotice(error.message, "error");
  } finally {
    model.saving = false;
    setBusy(elements.startButton, false);
    render();
  }
});

elements.stopButton.addEventListener("click", async () => {
  try {
    model.saving = true;
    setBusy(elements.stopButton, true, "Saving…");
    const result = await request("/api/timer/stop", {
      method: "POST",
      body: JSON.stringify({ note: elements.sessionNote.value }),
    });
    elements.sessionNote.value = "";
    model.status = {
      ...model.status,
      running: null,
      pending: result.saved ? null : (result.pending ?? result.session),
    };
    render();
    showNotice(
      result.saved ? "Session saved to Google Sheets." : "Session is saved locally and waiting for a retry.",
      result.saved ? "success" : "error",
    );
    await refreshStatusQuietly();
  } catch (error) {
    await refreshStatusQuietly();
    showNotice(
      model.status.pending ? "Session stopped locally. Retry the Google Sheets save when ready." : error.message,
      "error",
    );
  } finally {
    model.saving = false;
    setBusy(elements.stopButton, false);
    render();
  }
});

elements.retryButton.addEventListener("click", async () => {
  try {
    model.saving = true;
    setBusy(elements.retryButton, true, "Retrying…");
    const result = await request("/api/timer/retry", { method: "POST" });
    await refreshStatus();
    showNotice(result.saved ? "Pending session saved to Google Sheets." : "Still waiting to save. Your session remains safe locally.", result.saved ? "success" : "error");
  } catch (error) {
    showNotice(error.message, "error");
  } finally {
    model.saving = false;
    setBusy(elements.retryButton, false);
    render();
  }
});

elements.setupButton.addEventListener("click", async () => {
  try {
    model.saving = true;
    setBusy(elements.setupButton, true, "Checking…");
    const result = await request("/api/sheets/setup", { method: "POST" });
    showNotice(`${result.timerSessionsTab} and ${result.dailyDashboardTab} are ready.`, "success");
  } catch (error) {
    showNotice(error.message, "error");
  } finally {
    model.saving = false;
    setBusy(elements.setupButton, false);
    render();
  }
});

setInterval(() => {
  if (model.status.running) renderTimer();
}, 1_000);

refreshStatus().catch((error) => showNotice(error.message, "error"));
