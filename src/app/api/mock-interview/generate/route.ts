import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const count = body.count || 5;

    // We use Prisma's raw query to get random questions since findMany doesn't support RAND() well
    // OR we can just fetch IDs and shuffle in memory if the table is not huge (it's ~3k rows, so it's fine)
    
    const allQuestions = await prisma.interviewQuestion.findMany({
      where: {
        OR: [
          { userId: session.user.id },
          { isFromBank: true },
          { userId: "BANK" }
        ]
      },
      select: { id: true, category: true }
    });

    // Shuffle and pick
    const shuffled = allQuestions.sort(() => 0.5 - Math.random());
    
    // Try to get a mix of categories
    const selectedIds = new Set<string>();
    const selectedCategories = new Set<string>();
    
    for (const q of shuffled) {
      if (selectedIds.size >= count) break;
      // prioritize unique categories for a varied interview
      if (!selectedCategories.has(q.category)) {
        selectedIds.add(q.id);
        selectedCategories.add(q.category);
      }
    }
    
    // Fill the rest if we didn't reach count
    for (const q of shuffled) {
      if (selectedIds.size >= count) break;
      selectedIds.add(q.id);
    }

    const selectedQuestions = await prisma.interviewQuestion.findMany({
      where: { id: { in: Array.from(selectedIds) } }
    });

    return NextResponse.json({ data: selectedQuestions });
  } catch (error) {
    console.error("Generate Mock Interview error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
