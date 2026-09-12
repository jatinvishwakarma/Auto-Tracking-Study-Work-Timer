import * as XLSX from "xlsx";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function testImport() {
  // Read the XLSX file
  const wb = XLSX.readFile('Interview/DSA_Patterns_Tracker (1).xlsx');
  const ws = wb.Sheets['Tracker'];
  const data = XLSX.utils.sheet_to_json<Record<string, string>>(ws);
  
  console.log(`Found ${data.length} rows in Tracker sheet`);
  console.log('First 3 rows:', data.slice(0, 3));
  
  // Transform data to match import API format
  const mappedData = data.map((row, idx) => ({
    title: row['Question'] || `Problem ${idx + 1}`,
    topic: 'General',
    difficulty: 'Medium',
    status: row['Status'] || 'NotStarted',
    pattern: row['Pattern'],
    subTopic: undefined,
    problemUrl: row['Link 1'] && row['Link 1'].startsWith('http') ? row['Link 1'] : undefined,
    notes: row['Notes'],
  })).filter(p => p.title && p.title !== "Untitled");
  
  console.log(`Mapped ${mappedData.length} valid problems`);
  console.log('First 3 mapped:', mappedData.slice(0, 3));
  
  // Test the import API by calling it directly
  // We need a user session - let's find or create a test user
  const users = await prisma.user.findMany({ take: 1 });
  if (users.length === 0) {
    console.log('No users found in database');
    return;
  }
  
  const userId = users[0].id;
  console.log(`Using user: ${userId}`);
  
  // Create batch and problems directly via Prisma to test
  const batch = await prisma.dSABatch.create({
    data: {
      userId,
      name: `Test Import ${new Date().toLocaleDateString()}`,
      source: "Test Script",
      problemCount: mappedData.length,
    },
  });
  
  console.log(`Created batch: ${batch.id}`);
  
  const validProblems = mappedData.map(p => ({
    userId,
    batchId: batch.id,
    title: p.title,
    topic: p.topic,
    subTopic: p.subTopic || null,
    pattern: p.pattern || null,
    difficulty: p.difficulty as any,
    status: p.status as any,
    problemUrl: p.problemUrl || null,
    notes: p.notes || null,
  }));
  
  const result = await prisma.dSAProblem.createMany({
    data: validProblems,
    skipDuplicates: true,
  });
  
  console.log(`Imported ${result.count} problems`);
  
  // Verify
  const imported = await prisma.dSAProblem.findMany({
    where: { batchId: batch.id },
    take: 5,
  });
  console.log('Sample imported problems:', imported);
  
  await prisma.$disconnect();
}

testImport().catch(console.error);