import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import type { Difficulty, DSAStatus } from "@prisma/client";

const VALID_DIFFICULTIES: readonly Difficulty[] = ["Easy", "Medium", "Hard"];
const VALID_STATUSES: readonly DSAStatus[] = ["NotStarted", "InProgress", "Solved", "NeedsReview", "Revisit"];

function parseDifficulty(val: unknown): Difficulty {
  if (!val) return "Medium";
  const str = String(val).toLowerCase().trim();
  if (str === "easy" || str === "e") return "Easy";
  if (str === "hard" || str === "h") return "Hard";
  if (VALID_DIFFICULTIES.includes(str as Difficulty)) return str as Difficulty;
  return "Medium";
}

function parseStatus(val: unknown): DSAStatus {
  if (!val) return "NotStarted";
  const str = String(val).trim();
  if (VALID_STATUSES.includes(str as DSAStatus)) return str as DSAStatus;
  
  const low = str.toLowerCase();
  if (low.includes("solve") || low === "done" || low === "yes" || low === "complete") return "Solved";
  if (low.includes("progress") || low === "doing" || low === "wip" || low === "in progress") return "InProgress";
  if (low.includes("review") || low === "revise" || low === "revisit") return "NeedsReview";
  return "NotStarted";
}

function parseOptionalString(val: unknown): string | null {
  if (!val) return null;
  const str = String(val).trim();
  return str || null;
}

function extractUrls(row: Record<string, unknown>): string | null {
  const urls: string[] = [];
  for (const [key, value] of Object.entries(row)) {
    if (key.toLowerCase().includes("link") || key.toLowerCase().includes("url")) {
      const str = String(value || "").trim();
      if (str && str !== "Open ↗" && str.startsWith("http")) {
        urls.push(str);
      }
    }
  }
  return urls[0] || null;
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const { problems, batchName } = await req.json();

    if (!Array.isArray(problems) || problems.length === 0) {
      return NextResponse.json({ error: "No valid problems provided" }, { status: 400 });
    }

    const errors: string[] = [];
    const validProblems: Array<{
      userId: string;
      batchId: string;
      title: string;
      topic: string;
      subTopic: string | null;
      pattern: string | null;
      difficulty: Difficulty;
      status: DSAStatus;
      problemUrl: string | null;
      notes: string | null;
    }> = [];

    // Create batch first
    const batch = await prisma.dSABatch.create({
      data: {
        userId,
        name: batchName || `Import ${new Date().toLocaleDateString()}`,
        source: "CSV/XLSX",
        problemCount: problems.length,
      },
    });

    // Validate and transform each problem
    for (let i = 0; i < problems.length; i++) {
      const p = problems[i] as Record<string, unknown>;
      
      let title = parseOptionalString(p.title) || "Untitled";
      
      // Try to extract difficulty from title (e.g., "Two Sum (easy)")
      const diffMatch = title.match(/\((easy|medium|hard)\)$/i);
      if (diffMatch) {
        title = title.replace(/\((easy|medium|hard)\)$/i, "").trim();
      }

      const difficulty = parseDifficulty(p.difficulty ?? diffMatch?.[1]);
      const topic = parseOptionalString(p.topic) || "General";
      const subTopic = parseOptionalString(p.subTopic ?? p.subtopic ?? p["sub-topic"] ?? p["Sub-Topic"]);
      const pattern = parseOptionalString(p.pattern ?? p.Pattern);
      const status = parseStatus(p.status);
      const problemUrl = parseOptionalString(p.problemUrl ?? p.url ?? p.link ?? extractUrls(p));
      const notes = parseOptionalString(p.notes ?? p.note);

      if (!title || title === "Untitled") {
        errors.push(`Row ${i + 1}: Missing or invalid title`);
        continue;
      }

      validProblems.push({
        userId,
        batchId: batch.id,
        title,
        topic,
        subTopic,
        pattern,
        difficulty,
        status,
        problemUrl,
        notes,
      });
    }

    if (validProblems.length === 0) {
      await prisma.dSABatch.delete({ where: { id: batch.id } });
      return NextResponse.json({ 
        error: "No valid problems to import", 
        details: errors 
      }, { status: 400 });
    }

    // Insert all problems in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const created = await tx.dSAProblem.createMany({
        data: validProblems,
        skipDuplicates: true,
      });
      
      // Update batch with actual count
      await tx.dSABatch.update({
        where: { id: batch.id },
        data: { problemCount: created.count },
      });
      
      return created;
    });

    return NextResponse.json({
      success: true,
      count: result.count,
      batchId: batch.id,
      skipped: problems.length - validProblems.length - errors.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error("Error importing DSA problems:", error);
    
    if (error instanceof Error) {
      // Prisma specific errors
      if (error.message.includes("Foreign key constraint")) {
        return NextResponse.json({ error: "Invalid batch or user reference" }, { status: 400 });
      }
      if (error.message.includes("Unique constraint")) {
        return NextResponse.json({ error: "Duplicate entry detected" }, { status: 400 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
