import * as XLSX from "xlsx";

const wb = XLSX.readFile('Interview/DSA_Patterns_Tracker (1).xlsx');
const ws = wb.Sheets['Tracker'];
const data = XLSX.utils.sheet_to_json<Record<string, string>>(ws);

console.log(`Found ${data.length} rows in Tracker sheet`);

// Test the normalization functions
function normalizeStatus(val: string) {
  if (!val) return "NotStarted";
  const low = val.toLowerCase().trim();
  if (low.includes("solve") || low === "done" || low === "yes") return "Solved";
  if (low.includes("progress") || low === "doing") return "InProgress";
  if (low.includes("review") || low === "revise") return "NeedsReview";
  return "NotStarted";
}

function normalizeDifficulty(val: string) {
  if (!val) return "Medium";
  const low = val.toLowerCase().trim();
  if (low === "easy" || low === "e") return "Easy";
  if (low === "hard" || low === "h") return "Hard";
  return "Medium";
}

// Check unique status values in the data
const statusValues = new Set(data.map(row => row['Status']));
console.log('Unique status values:', Array.from(statusValues));

// Check unique pattern values
const patternValues = new Set(data.map(row => row['Pattern']).filter(Boolean));
console.log('Unique pattern values:', Array.from(patternValues));

// Test normalization
data.slice(0, 5).forEach(row => {
  console.log({
    originalStatus: row['Status'],
    normalizedStatus: normalizeStatus(row['Status'] || ''),
    pattern: row['Pattern'],
    question: row['Question'],
  });
});

// Count valid problems
const mappedData = data.map(row => ({
  title: row['Question'] || '',
  topic: 'General',
  difficulty: normalizeDifficulty(''),
  status: normalizeStatus(row['Status'] || ''),
  pattern: row['Pattern'] || undefined,
  subTopic: undefined,
  problemUrl: row['Link 1'] && row['Link 1'].startsWith('http') ? row['Link 1'] : undefined,
  notes: row['Notes'] || undefined,
})).filter(p => p.title && p.title !== "Untitled");

console.log(`Mapped ${mappedData.length} valid problems`);
console.log('First 5:', mappedData.slice(0, 5));