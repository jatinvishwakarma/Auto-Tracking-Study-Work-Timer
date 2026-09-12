import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id } = await params;
    const body = await req.json();

    const problem = await prisma.dSAProblem.findFirst({ where: { id, userId: session.user.id } });
    if (!problem) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const confidence = Math.max(1, Math.min(5, body.confidence || 3));

    // Spaced repetition: schedule next review based on confidence
    const daysUntilReview = confidence === 1 ? 1 : confidence === 2 ? 3 : confidence === 3 ? 7 : confidence === 4 ? 14 : 30;
    const nextReviewAt = new Date();
    nextReviewAt.setDate(nextReviewAt.getDate() + daysUntilReview);

    const [review] = await prisma.$transaction([
      prisma.dSAReview.create({
        data: {
          problemId: id,
          userId: session.user.id,
          confidence,
          notes: body.notes || null,
          mistakes: body.mistakes || null,
          timeTaken: body.timeTaken || null,
        },
      }),
      prisma.dSAProblem.update({
        where: { id },
        data: {
          confidence,
          reviewAt: nextReviewAt,
          attempts: { increment: 1 },
          status: confidence >= 4 ? "Solved" : confidence === 1 ? "NeedsReview" : problem.status,
        },
      }),
    ]);

    return NextResponse.json({ data: review, nextReviewAt });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
