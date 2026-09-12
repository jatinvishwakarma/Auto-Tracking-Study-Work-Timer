import * as XLSX from "xlsx";

const wb = XLSX.readFile('Interview/DSA_Patterns_Tracker (1).xlsx');
const ws = wb.Sheets['Tracker'];
const data = XLSX.utils.sheet_to_json<Record<string, string>>(ws);

// Check link columns
const links = data.slice(0, 10).map(row => ({
  link1: row['Link 1'],
  link2: row['Link 2'],
  link3: row['Link 3'],
}));
console.log('Links:', links);

// Check if any links are real URLs
const realLinks = data.filter(row => row['Link 1'] && row['Link 1'].startsWith('http'));
console.log('Real links count:', realLinks.length);
if (realLinks.length > 0) {
  console.log('First real link:', realLinks[0]);
}