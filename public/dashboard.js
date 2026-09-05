// ─── Constants ──────────────────────────────────────────────────────────────

const CATEGORY_COLORS = {
  "DSA":             { bg: "rgba(99, 132, 255, 0.75)", border: "#6384ff", light: "rgba(99, 132, 255, 0.18)" },
  "System Design":   { bg: "rgba(255, 159, 64, 0.75)",  border: "#ff9f40", light: "rgba(255, 159, 64, 0.18)" },
  "Project":         { bg: "rgba(75, 192, 192, 0.75)",  border: "#4bc0c0", light: "rgba(75, 192, 192, 0.18)" },
  "Extra Learning":  { bg: "rgba(153, 102, 255, 0.75)", border: "#9966ff", light: "rgba(153, 102, 255, 0.18)" },
  "Office Work":     { bg: "rgba(255, 99, 132, 0.75)",  border: "#ff6384", light: "rgba(255, 99, 132, 0.18)" },
};

const ALL_CATEGORIES = ["DSA", "System Design", "Project", "Extra Learning", "Office Work"];
const STUDY_CATEGORIES = new Set(["DSA", "System Design", "Project", "Extra Learning"]);

const el = {
  todayDate:         document.querySelector("#today-date"),
  todayTotalHours:   document.querySelector("#today-total-hours"),
  todayStudyHours:   document.querySelector("#today-study-hours"),
  todayOfficeHours:  document.querySelector("#today-office-hours"),
  todaySessionCount: document.querySelector("#today-session-count"),
  categoryEmpty:     document.querySelector("#category-empty"),
  sessionsCount:     document.querySelector("#sessions-count"),
  sessionsList:      document.querySelector("#sessions-list"),
  sessionsEmpty:     document.querySelector("#sessions-empty"),
  weeklyTotalHours:  document.querySelector("#weekly-total-hours"),
  weeklyBreakdown:   document.querySelector("#weekly-breakdown"),
  alltimeStats:      document.querySelector("#alltime-stats"),
  notice:            document.querySelector("#notice"),
};

let categoryPieChart = null;
let studyOfficeChart = null;
let weeklyBarChart   = null;
let alltimeBarChart  = null;

// ─── Helpers ────────────────────────────────────────────────────────────────

function showNotice(message = "", kind = "") {
  el.notice.textContent = message;
  el.notice.dataset.kind = kind;
}

function hoursLabel(minutes) {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

function hoursDecimal(minutes) {
  return (minutes / 60).toFixed(1);
}

function formatDate(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

function formatTime(timestamp) {
  return new Date(timestamp).toLocaleTimeString("en-US", {
    hour: "2-digit", minute: "2-digit", hour12: true,
  });
}

function getWeekDates() {
  const dates = [];
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    dates.push(d.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" }));
  }
  return dates;
}

function todayStr() {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
}

async function fetchData(url) {
  const response = await fetch(url);
  return response.json();
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

Chart.defaults.color = "#b8c2df";
Chart.defaults.borderColor = "rgba(198, 208, 255, 0.1)";
Chart.defaults.font.family = "Inter, ui-sans-serif, system-ui, -apple-system, sans-serif";


// ─── Render: Today's Summary ────────────────────────────────────────────────

function renderTodaySummary(todaySessions) {
  el.todayDate.textContent = formatDate(todayStr());
  let totalMin = 0, studyMin = 0, officeMin = 0;
  for (const s of todaySessions) {
    totalMin += s.durationMinutes;
    if (STUDY_CATEGORIES.has(s.category)) studyMin += s.durationMinutes;
    else officeMin += s.durationMinutes;
  }
  el.todayTotalHours.textContent = `${hoursDecimal(totalMin)}h`;
  el.todayStudyHours.textContent = `${hoursDecimal(studyMin)}h`;
  el.todayOfficeHours.textContent = `${hoursDecimal(officeMin)}h`;
  el.todaySessionCount.textContent = String(todaySessions.length);
}

// ─── Render: Category Pie Chart ─────────────────────────────────────────────

function renderCategoryPieChart(todaySessions) {
  const catMin = {};
  for (const s of todaySessions) catMin[s.category] = (catMin[s.category] || 0) + s.durationMinutes;
  const labels = [], data = [], bg = [], bd = [];
  for (const cat of ALL_CATEGORIES) {
    if (catMin[cat]) { labels.push(cat); data.push(catMin[cat]); bg.push(CATEGORY_COLORS[cat].bg); bd.push(CATEGORY_COLORS[cat].border); }
  }
  if (categoryPieChart) categoryPieChart.destroy();
  el.categoryEmpty.hidden = data.length > 0;
  if (!data.length) return;
  categoryPieChart = new Chart(document.querySelector("#category-pie-chart"), {
    type: "doughnut",
    data: { labels, datasets: [{ data, backgroundColor: bg, borderColor: bd, borderWidth: 2, hoverOffset: 8 }] },
    options: {
      responsive: true, maintainAspectRatio: true, cutout: "55%",
      plugins: {
        legend: { position: "bottom", labels: { padding: 16, usePointStyle: true, pointStyleWidth: 12, font: { size: 12, weight: "600" } } },
        tooltip: {
          backgroundColor: "rgba(16,23,40,0.95)", titleColor: "#f5f7ff", bodyColor: "#b8c2df",
          borderColor: "rgba(198,208,255,0.2)", borderWidth: 1, cornerRadius: 10, padding: 12,
          callbacks: { label: (ctx) => { const t = ctx.dataset.data.reduce((a, b) => a + b, 0); return ` ${hoursLabel(ctx.parsed)} (${((ctx.parsed / t) * 100).toFixed(1)}%)`; } },
        },
      },
    },
  });
}

// ─── Render: Study vs Office Doughnut ───────────────────────────────────────

function renderStudyOfficeChart(todaySessions) {
  let studyMin = 0, officeMin = 0;
  for (const s of todaySessions) {
    if (STUDY_CATEGORIES.has(s.category)) studyMin += s.durationMinutes;
    else officeMin += s.durationMinutes;
  }
  if (studyOfficeChart) studyOfficeChart.destroy();
  studyOfficeChart = new Chart(document.querySelector("#study-office-chart"), {
    type: "doughnut",
    data: {
      labels: ["Study", "Office Work"],
      datasets: [{ data: [studyMin || 0, officeMin || 0], backgroundColor: ["rgba(75,192,192,0.75)", "rgba(255,99,132,0.75)"], borderColor: ["#4bc0c0", "#ff6384"], borderWidth: 2, hoverOffset: 8 }],
    },
    options: {
      responsive: true, maintainAspectRatio: true, cutout: "55%",
      plugins: {
        legend: { position: "bottom", labels: { padding: 16, usePointStyle: true, pointStyleWidth: 12, font: { size: 12, weight: "600" } } },
        tooltip: {
          backgroundColor: "rgba(16,23,40,0.95)", titleColor: "#f5f7ff", bodyColor: "#b8c2df",
          borderColor: "rgba(198,208,255,0.2)", borderWidth: 1, cornerRadius: 10, padding: 12,
          callbacks: { label: (ctx) => { const t = ctx.dataset.data.reduce((a, b) => a + b, 0); const pct = t > 0 ? ((ctx.parsed / t) * 100).toFixed(1) : "0.0"; return ` ${hoursLabel(ctx.parsed)} (${pct}%)`; } },
        },
      },
    },
  });
}

// ─── Render: Sessions List ──────────────────────────────────────────────────

function renderSessionsList(todaySessions) {
  const count = todaySessions.length;
  el.sessionsCount.textContent = `${count} session${count !== 1 ? "s" : ""}`;
  el.sessionsEmpty.hidden = count > 0;
  el.sessionsList.querySelectorAll(".session-item").forEach((i) => i.remove());
  const sorted = [...todaySessions].sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());
  for (const session of sorted) {
    const colors = CATEGORY_COLORS[session.category] || CATEGORY_COLORS["DSA"];
    const item = document.createElement("div");
    item.className = "session-item";
    item.style.borderLeftColor = colors.border;
    const timeRange = `${formatTime(session.startedAt)} – ${formatTime(session.endedAt)}`;
    const dur = hoursLabel(session.durationMinutes);
    const noteHtml = session.note ? `<p class="session-item__note">${escapeHtml(session.note)}</p>` : "";
    item.innerHTML = `
      <div class="session-item__top">
        <span class="session-item__category" style="background:${colors.light};color:${colors.border}">${escapeHtml(session.category)}</span>
        <span class="session-item__duration">${dur}</span>
      </div>
      <p class="session-item__time">${timeRange}</p>
      ${noteHtml}`;
    el.sessionsList.appendChild(item);
  }
}

// ─── Render: Weekly Bar Chart ───────────────────────────────────────────────

function renderWeeklyChart(summary) {
  const weekDates = getWeekDates();
  const weekData = weekDates.map((date) => summary.find((s) => s.date === date) || { date, categories: {}, totalMinutes: 0, sessionCount: 0 });
  let weeklyTotal = weekData.reduce((sum, day) => sum + day.totalMinutes, 0);
  el.weeklyTotalHours.textContent = `${hoursDecimal(weeklyTotal)}h`;

  const datasets = ALL_CATEGORIES.map((cat) => ({
    label: cat,
    data: weekData.map((day) => day.categories[cat] || 0),
    backgroundColor: CATEGORY_COLORS[cat].bg,
    borderColor: CATEGORY_COLORS[cat].border,
    borderWidth: 1,
    borderRadius: 4,
  }));

  if (weeklyBarChart) weeklyBarChart.destroy();
  weeklyBarChart = new Chart(document.querySelector("#weekly-bar-chart"), {
    type: "bar",
    data: { labels: weekDates.map((d) => formatDate(d)), datasets },
    options: {
      responsive: true, maintainAspectRatio: true,
      scales: {
        x: { stacked: true, grid: { display: false }, ticks: { font: { size: 11, weight: "600" } } },
        y: { stacked: true, beginAtZero: true, title: { display: true, text: "Minutes", font: { size: 11, weight: "600" } }, ticks: { font: { size: 11 }, callback: (v) => `${Math.round(v / 60)}h` } },
      },
      plugins: {
        legend: { position: "bottom", labels: { padding: 12, usePointStyle: true, pointStyleWidth: 10, font: { size: 11, weight: "600" } } },
        tooltip: {
          backgroundColor: "rgba(16,23,40,0.95)", titleColor: "#f5f7ff", bodyColor: "#b8c2df",
          borderColor: "rgba(198,208,255,0.2)", borderWidth: 1, cornerRadius: 10, padding: 12,
          callbacks: { label: (ctx) => ` ${ctx.dataset.label}: ${hoursLabel(ctx.parsed.y)}` },
        },
      },
    },
  });

  el.weeklyBreakdown.replaceChildren();
  for (const day of weekData) {
    if (day.totalMinutes === 0) continue;
    const card = document.createElement("div");
    card.className = "weekly-day-card";
    const cats = Object.entries(day.categories).filter(([, m]) => m > 0).map(([cat, m]) => {
      const c = CATEGORY_COLORS[cat] || CATEGORY_COLORS["DSA"];
      return `<span class="weekly-day-cat" style="background:${c.light};color:${c.border}">${cat} ${hoursLabel(m)}</span>`;
    }).join("");
    card.innerHTML = `<div class="weekly-day-date">${formatDate(day.date)}</div><div class="weekly-day-total">${hoursLabel(day.totalMinutes)}</div><div class="weekly-day-cats">${cats}</div>`;
    el.weeklyBreakdown.appendChild(card);
  }
}

// ─── Render: All-Time Bar Chart ─────────────────────────────────────────────

function renderAllTimeChart(summary) {
  const totals = {};
  for (const cat of ALL_CATEGORIES) totals[cat] = 0;
  for (const day of summary) { for (const cat of ALL_CATEGORIES) totals[cat] += day.categories[cat] || 0; }
  const labels = ALL_CATEGORIES.filter((cat) => totals[cat] > 0);
  const data = labels.map((cat) => totals[cat]);
  const bgC = labels.map((cat) => CATEGORY_COLORS[cat].bg);
  const bdC = labels.map((cat) => CATEGORY_COLORS[cat].border);

  if (alltimeBarChart) alltimeBarChart.destroy();
  alltimeBarChart = new Chart(document.querySelector("#alltime-bar-chart"), {
    type: "bar",
    data: { labels, datasets: [{ label: "Total Minutes", data, backgroundColor: bgC, borderColor: bdC, borderWidth: 1, borderRadius: 6, barThickness: 48 }] },
    options: {
      responsive: true, maintainAspectRatio: true, indexAxis: "y",
      scales: {
        x: { beginAtZero: true, ticks: { font: { size: 11 }, callback: (v) => `${Math.round(v / 60)}h` }, title: { display: true, text: "Hours", font: { size: 11, weight: "600" } } },
        y: { grid: { display: false }, ticks: { font: { size: 12, weight: "600" } } },
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: "rgba(16,23,40,0.95)", titleColor: "#f5f7ff", bodyColor: "#b8c2df",
          borderColor: "rgba(198,208,255,0.2)", borderWidth: 1, cornerRadius: 10, padding: 12,
          callbacks: { label: (ctx) => ` ${hoursLabel(ctx.parsed.x)}` },
        },
      },
    },
  });

  const grandTotal = data.reduce((a, b) => a + b, 0);
  el.alltimeStats.replaceChildren();
  for (const cat of labels) {
    const min = totals[cat];
    const pct = grandTotal > 0 ? ((min / grandTotal) * 100).toFixed(1) : "0.0";
    const c = CATEGORY_COLORS[cat];
    const stat = document.createElement("div");
    stat.className = "alltime-stat";
    stat.innerHTML = `<span class="alltime-stat__dot" style="background:${c.border}"></span><span class="alltime-stat__name">${cat}</span><span class="alltime-stat__hours">${hoursLabel(min)}</span><span class="alltime-stat__pct">${pct}%</span>`;
    el.alltimeStats.appendChild(stat);
  }
}

// ─── Init ───────────────────────────────────────────────────────────────────

async function init() {
  try {
    const [todayData, allData] = await Promise.all([fetchData("/api/sessions/today"), fetchData("/api/sessions/daily-summary")]);
    const todaySessions = todayData.sessions || [];
    const summary = allData.summary || [];
    renderTodaySummary(todaySessions);
    renderCategoryPieChart(todaySessions);
    renderStudyOfficeChart(todaySessions);
    renderSessionsList(todaySessions);
    renderWeeklyChart(summary);
    renderAllTimeChart(summary);
  } catch (error) {
    showNotice(error.message || "Failed to load dashboard data.", "error");
  }
}

init();

