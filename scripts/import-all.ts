import fs from 'fs/promises';
import path from 'path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const DATA_DIR = path.join(process.cwd(), 'data');

async function importAll() {
  console.log("Starting full import of extracted interview questions...");
  const BANK_USER = "BANK";
  
  await prisma.user.upsert({
    where: { id: BANK_USER },
    update: {},
    create: { id: BANK_USER, email: "bank@system.internal", name: "Question Bank" },
  });

  const files = await fs.readdir(DATA_DIR);
  let totalQuestions = 0;
  let totalDSA = 0;

  for (const file of files) {
    if (!file.endsWith('.json')) continue;
    
    const filePath = path.join(DATA_DIR, file);
    const data = JSON.parse(await fs.readFile(filePath, 'utf-8'));
    
    if (file === 'dsa_parsed_excel.json') {
      // Import as DSAProblems
      console.log(`Importing DSA Problems from ${file}...`);
      let batch = [];
      
      // Batch inserts
      for (const p of data) {
        batch.push({
          userId: BANK_USER,
          title: p.title,
          topic: p.topic || 'General',
          difficulty: p.difficulty || 'Medium',
          pattern: p.pattern,
          problemUrl: p.problemUrl,
          leetcodeUrl: p.leetcodeUrl,
          isFromBank: true,
          bankSource: 'DSA Tracker Excel',
          status: 'NotStarted' as const
        });
      }
      
      const res = await prisma.dSAProblem.createMany({
        data: batch,
        skipDuplicates: true
      });
      totalDSA += res.count;
      console.log(`✅ Inserted ${res.count} DSA problems.`);
    } else {
      // Import as InterviewQuestions
      console.log(`Importing Interview Questions from ${file}...`);
      if (!Array.isArray(data)) {
        console.log(`Skipping ${file} - not an array.`);
        continue;
      }
      
      let batch = [];
      for (const q of data) {
        batch.push({
          userId: BANK_USER,
          category: q.category || 'General',
          question: q.question,
          answer: q.answer || null,
          source: q.source,
          difficulty: 'Medium',
          isFromBank: true,
        });
      }
      
      // Split into chunks of 1000 to avoid query size limits
      const chunkSize = 1000;
      let inserted = 0;
      for (let i = 0; i < batch.length; i += chunkSize) {
        const chunk = batch.slice(i, i + chunkSize);
        const res = await prisma.interviewQuestion.createMany({
          data: chunk,
          skipDuplicates: true
        });
        inserted += res.count;
      }
      totalQuestions += inserted;
      console.log(`✅ Inserted ${inserted} questions from ${file}.`);
    }
  }

  console.log(`\n🎉 Import Complete!`);
  console.log(`Total Interview Questions Added: ${totalQuestions}`);
  console.log(`Total DSA Problems Added: ${totalDSA}`);
}

importAll().catch(e => {
  console.error("Import failed:", e);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});
