function partsFor(timestamp, timeZone) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(timestamp));

  return Object.fromEntries(
    parts.filter((part) => part.type !== "literal").map((part) => [part.type, part.value]),
  );
}

export function sheetDate(timestamp, timeZone) {
  const parts = partsFor(timestamp, timeZone);
  return `${parts.year}-${parts.month}-${parts.day}`;
}

export function sheetTime(timestamp, timeZone) {
  const parts = partsFor(timestamp, timeZone);
  return `${parts.hour}:${parts.minute}`;
}

export function durationMinutes(startedAt, endedAt) {
  const difference = new Date(endedAt).getTime() - new Date(startedAt).getTime();
  if (!Number.isFinite(difference) || difference < 0) {
    throw new Error("The session end time must be after its start time.");
  }

  return Math.max(1, Math.round(difference / 60_000));
}
