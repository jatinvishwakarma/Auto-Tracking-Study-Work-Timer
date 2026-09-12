import * as XLSX from "xlsx";

const wb = XLSX.readFile('Interview/DSA_Patterns_Tracker (1).xlsx');
console.log('Sheet names:', wb.SheetNames);
wb.SheetNames.forEach(name => {
  const ws = wb.Sheets[name];
  const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
  console.log('\n--- Sheet:', name, '---');
  console.log('Headers:', data[0]);
  console.log('First 3 rows:', data.slice(1, 4));
});