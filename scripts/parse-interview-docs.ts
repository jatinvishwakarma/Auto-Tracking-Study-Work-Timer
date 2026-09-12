import fs from "fs/promises";
import path from "path";
import * as xlsx from "xlsx";
const pdfParse = require("pdf-parse");

const INTERVIEW_DIR = path.join(process.cwd(), "Interview");
const DATA_DIR = path.join(process.cwd(), "data");

async function parseExcel(filePath: string) {
  console.log(`Parsing Excel: ${path.basename(filePath)}`);
  try {
    const fileBuffer = await fs.readFile(filePath);
    const workbook = xlsx.read(fileBuffer, { type: "buffer" });
    const problems = [];
    
    for (const sheetName of workbook.SheetNames) {
      const sheet = workbook.Sheets[sheetName];
      const data = xlsx.utils.sheet_to_json(sheet) as any[];
      
      for (const row of data) {
        // Try to find common columns
        const title = row.Problem || row.Title || row.Question || row["Problem Name"];
        if (!title) continue;

        const url = row.Link || row.URL || row.ProblemUrl || row["Problem Link"];
        const topic = row.Topic || row.Category || sheetName;
        const difficulty = row.Difficulty || row.Level || "Medium";
        const pattern = row.Pattern || row["Problem Pattern"];

        problems.push({
          title,
          problemUrl: url,
          topic,
          difficulty,
          pattern,
          source: path.basename(filePath)
        });
      }
    }
    
    if (problems.length > 0) {
      await fs.writeFile(
        path.join(DATA_DIR, "dsa_parsed_excel.json"),
        JSON.stringify(problems, null, 2)
      );
      console.log(`✅ Extracted ${problems.length} problems from Excel.`);
    }
  } catch (error) {
    console.error(`❌ Error parsing Excel ${filePath}:`, error);
  }
}

async function parsePdf(filePath: string) {
  const fileName = path.basename(filePath);
  console.log(`Parsing PDF: ${fileName}`);
  try {
    const dataBuffer = await fs.readFile(filePath);
    const data = await pdfParse(dataBuffer);
    const text = data.text;
    
    // Simple heuristic to extract questions
    // Look for lines that end with ? or start with a number like "1. ", "Q1:"
    const lines = text.split('\n').map((l: string) => l.trim()).filter((l: string) => l.length > 0);
    const questions = [];
    
    let currentQuestion = null;
    let currentAnswer = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const isQuestion = line.endsWith('?') || /^(Q\d+:|\d+\.)/i.test(line);
      
      if (isQuestion) {
        if (currentQuestion) {
          questions.push({
            question: currentQuestion,
            answer: currentAnswer.join('\n').slice(0, 1500), // limit answer length
            category: determineCategory(fileName),
            source: fileName
          });
        }
        currentQuestion = line;
        currentAnswer = [];
      } else if (currentQuestion) {
        currentAnswer.push(line);
      }
    }
    
    // push last
    if (currentQuestion) {
      questions.push({
        question: currentQuestion,
        answer: currentAnswer.join('\n').slice(0, 1500),
        category: determineCategory(fileName),
        source: fileName
      });
    }

    if (questions.length > 0) {
      const outName = fileName.replace('.pdf', '') + '.json';
      await fs.writeFile(
        path.join(DATA_DIR, outName),
        JSON.stringify(questions, null, 2)
      );
      console.log(`✅ Extracted ${questions.length} questions from ${fileName}.`);
    } else {
      console.log(`⚠️ No structured questions found in ${fileName}. Text length: ${text.length}`);
    }
    
  } catch (error: any) {
    console.error(`❌ Error parsing PDF ${fileName}:`, error.message);
  }
}

function determineCategory(fileName: string) {
  const lower = fileName.toLowerCase();
  if (lower.includes('java')) return 'Java Core';
  if (lower.includes('spring')) return 'SpringBoot';
  if (lower.includes('sql')) return 'SQL';
  if (lower.includes('dsa') || lower.includes('graph')) return 'DSA Concepts';
  if (lower.includes('system design')) return 'System Design';
  if (lower.includes('leetcode')) return 'DSA Problems';
  return 'General';
}

async function main() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  
  try {
    const files = await fs.readdir(INTERVIEW_DIR);
    
    for (const file of files) {
      const fullPath = path.join(INTERVIEW_DIR, file);
      if (file.endsWith('.xlsx')) {
        await parseExcel(fullPath);
      } else if (file.endsWith('.pdf')) {
        await parsePdf(fullPath);
      }
    }
    console.log("🎉 Parsing complete! Check the /data directory.");
  } catch (error) {
    console.error("Error reading Interview directory:", error);
  }
}

main();
