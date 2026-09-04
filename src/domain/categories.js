export const CATEGORIES = Object.freeze([
  "DSA",
  "System Design",
  "Project",
  "Extra Learning",
  "Office Work",
]);

const REQUIRED_NOTE_CATEGORIES = new Set(["System Design", "Extra Learning"]);
const OPTIONAL_NOTE_CATEGORIES = new Set(["DSA", "Project"]);

export function isCategory(value) {
  return CATEGORIES.includes(value);
}

export function requiresNote(category) {
  return REQUIRED_NOTE_CATEGORIES.has(category);
}

export function supportsNote(category) {
  return requiresNote(category) || OPTIONAL_NOTE_CATEGORIES.has(category);
}

export function validateNote(category, note) {
  const trimmed = typeof note === "string" ? note.trim() : "";

  if (requiresNote(category) && !trimmed) {
    return { valid: false, message: `A note is required for ${category} sessions.` };
  }

  if (!supportsNote(category) && trimmed) {
    return { valid: false, message: "Office Work sessions do not accept a manual note." };
  }

  if (trimmed.length > 2_000) {
    return { valid: false, message: "Manual notes must be 2,000 characters or fewer." };
  }

  return { valid: true, value: trimmed };
}
