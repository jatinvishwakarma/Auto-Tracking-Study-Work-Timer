import fs from 'fs/promises';
import path from 'path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const DATA_DIR = path.join(process.cwd(), 'data');

const DSA_PATTERNS = [
  { name: 'Array', category: 'Array' },
  { name: 'String', category: 'String' },
  { name: 'Tree', category: 'Tree' },
  { name: 'Graph', category: 'Graph' },
  { name: 'Dynamic Programming', category: 'DP' },
  { name: 'Backtracking', category: 'Backtracking' },
  { name: 'Sliding Window', category: 'Sliding Window' },
  { name: 'Two Pointers', category: 'Two Pointers' },
  { name: 'Linked List', category: 'Linked List' },
  { name: 'Greedy', category: 'Greedy' },
  { name: 'Matrix', category: 'Matrix' },
  { name: 'Heap', category: 'Heap' },
  { name: 'Trie', category: 'Trie' },
  { name: 'Bit Manipulation', category: 'Bit Manipulation' },
  { name: 'Math', category: 'Math' },
  { name: 'General', category: 'General' },
];

function getPatternId(title: string, topic: string = '', patternsMap: Record<string, string>): string {
  const text = `${title} ${topic}`.toLowerCase();
  if (text.includes('array')) return patternsMap['Array'];
  if (text.includes('string')) return patternsMap['String'];
  if (text.includes('tree')) return patternsMap['Tree'];
  if (text.includes('graph')) return patternsMap['Graph'];
  if (text.includes('dp') || text.includes('dynamic')) return patternsMap['Dynamic Programming'];
  if (text.includes('backtrack')) return patternsMap['Backtracking'];
  if (text.includes('window')) return patternsMap['Sliding Window'];
  if (text.includes('pointer')) return patternsMap['Two Pointers'];
  if (text.includes('linked list') || text.includes('list')) return patternsMap['Linked List'];
  if (text.includes('greedy')) return patternsMap['Greedy'];
  if (text.includes('matrix') || text.includes('grid')) return patternsMap['Matrix'];
  if (text.includes('heap') || text.includes('priority')) return patternsMap['Heap'];
  if (text.includes('trie')) return patternsMap['Trie'];
  if (text.includes('bit')) return patternsMap['Bit Manipulation'];
  if (text.includes('math')) return patternsMap['Math'];
  return patternsMap['General'];
}

async function importAll() {
  console.log("Starting full import of extracted interview questions...");
  const BANK_USER = "BANK";
  
  await prisma.user.upsert({
    where: { id: BANK_USER },
    update: {},
    create: { id: BANK_USER, email: "bank@system.internal", name: "Question Bank" },
  });

  console.log("Clearing previously imported BANK data...");
  await prisma.dSAProblem.deleteMany({ where: { userId: BANK_USER } });
  await prisma.systemDesignTopic.deleteMany({ where: { userId: BANK_USER } });
  await prisma.systemDesignCaseStudy.deleteMany({ where: { userId: BANK_USER } });
  await prisma.interviewQuestion.deleteMany({ where: { userId: BANK_USER } });
  await prisma.dSAPattern.deleteMany({}); // Delete all patterns (re-seed)

  console.log("Seeding DSA Patterns...");
  const patternIds: Record<string, string> = {};
  for (const p of DSA_PATTERNS) {
    const created = await prisma.dSAPattern.create({
      data: { name: p.name, category: p.category }
    });
    patternIds[p.name] = created.id;
  }

  const files = await fs.readdir(DATA_DIR);
  let totalQuestions = 0;
  let totalDSA = 0;
  let totalSDTopics = 0;
  let totalSDCases = 0;

  for (const file of files) {
    if (!file.endsWith('.json')) continue;
    
    const filePath = path.join(DATA_DIR, file);
    const data = JSON.parse(await fs.readFile(filePath, 'utf-8'));
    const lowerFile = file.toLowerCase();
    
    if (lowerFile.includes('dsa') || lowerFile.includes('leetcode') || lowerFile.includes('graph') || lowerFile.includes('problem solving')) {
      console.log(`Importing DSA Problems from ${file}...`);
      const batch = [];
      for (const p of data) {
        const title = p.title || p.question;
        if (!title) continue;
        
        let difficulty = p.difficulty || 'Medium';
        if (!p.difficulty && lowerFile.includes('pdf')) {
            if (title.toLowerCase().includes('easy')) difficulty = 'Easy';
            if (title.toLowerCase().includes('hard')) difficulty = 'Hard';
        }

        const patternId = getPatternId(title, p.topic || p.category, patternIds);

        batch.push({
          userId: BANK_USER,
          patternId: patternId,
          title: title.substring(0, 200),
          topic: p.topic || p.category || 'General',
          difficulty: difficulty,
          pattern: p.pattern || null,
          problemUrl: p.problemUrl || null,
          leetcodeUrl: p.leetcodeUrl || null,
          isFromBank: true,
          bankSource: file,
          status: 'NotStarted' as const,
          approach: p.answer || null 
        });
      }
      
      const chunkSize = 1000;
      for (let i = 0; i < batch.length; i += chunkSize) {
        const res = await prisma.dSAProblem.createMany({
          data: batch.slice(i, i + chunkSize),
          skipDuplicates: true
        });
        totalDSA += res.count;
      }
      console.log(`✅ Inserted DSA problems from ${file}.`);
    } else if (lowerFile.includes('system design')) {
      console.log(`Importing System Design from ${file}...`);
      const topicsBatch = [];
      const casesBatch = [];
      
      for (const p of data) {
        const title = p.question || p.title;
        if (!title) continue;
        
        // Clean title (remove "1. ", "2. ", etc)
        const cleanTitle = title.replace(/^\d+\.\s*/, '').trim();
        const lowerTitle = cleanTitle.toLowerCase();
        
        const isCaseStudy = lowerTitle.startsWith('design ') || lowerTitle.includes('whatsapp') || lowerTitle.includes('twitter') || lowerTitle.includes('instagram') || lowerTitle.includes('uber') || lowerTitle.includes('netflix') || lowerTitle.includes('url shortener');
        
        if (isCaseStudy) {
          casesBatch.push({
            userId: BANK_USER,
            title: cleanTitle.substring(0, 200),
            problemStatement: p.answer || null,
            status: 'NotStarted' as const
          });
        } else {
          topicsBatch.push({
            userId: BANK_USER,
            name: cleanTitle.substring(0, 200),
            keyConcepts: p.answer || null,
            status: 'NotStarted' as const,
            progress: 0
          });
        }
      }
      
      if (topicsBatch.length > 0) {
        const res1 = await prisma.systemDesignTopic.createMany({ data: topicsBatch, skipDuplicates: true });
        totalSDTopics += res1.count;
      }
      if (casesBatch.length > 0) {
        const res2 = await prisma.systemDesignCaseStudy.createMany({ data: casesBatch, skipDuplicates: true });
        totalSDCases += res2.count;
      }
      console.log(`✅ Inserted System Design items from ${file}.`);
    } else {
      console.log(`Importing Interview Questions from ${file}...`);
      if (!Array.isArray(data)) continue;
      
      const batch = [];
      for (const q of data) {
        if (!q.question) continue;
        batch.push({
          userId: BANK_USER,
          category: q.category || 'General',
          question: q.question,
          answer: q.answer || null,
          source: q.source || file,
          difficulty: q.difficulty || 'Medium',
          isFromBank: true,
        });
      }
      
      const chunkSize = 1000;
      for (let i = 0; i < batch.length; i += chunkSize) {
        const res = await prisma.interviewQuestion.createMany({
          data: batch.slice(i, i + chunkSize),
          skipDuplicates: true
        });
        totalQuestions += res.count;
      }
      console.log(`✅ Inserted questions from ${file}.`);
    }
  }

  console.log(`\n🎉 Import Complete!`);
  console.log(`Total DSA Problems Added: ${totalDSA}`);
  console.log(`Total System Design Topics Added: ${totalSDTopics}`);
  console.log(`Total System Design Case Studies Added: ${totalSDCases}`);
  console.log(`Total Interview Questions Added: ${totalQuestions}`);
}

importAll().catch(e => {
  console.error("Import failed:", e);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});
