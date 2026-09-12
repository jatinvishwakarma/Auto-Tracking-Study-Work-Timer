import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id } = await params;
    const body = await req.json();

    const existing = await prisma.interviewQuestion.findFirst({ where: { id, userId: session.user.id } });
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const daysMap: Record<number, number> = { 1: 1, 2: 3, 3: 7, 4: 14, 5: 30 };
    let reviewAt = existing.reviewAt;
    if (body.confidence) {
      const days = daysMap[body.confidence] || 7;
      reviewAt = new Date();
      reviewAt.setDate(reviewAt.getDate() + days);
    }

    const updated = await prisma.interviewQuestion.update({
      where: { id },
      data: {
        ...(body.answer !== undefined && { answer: body.answer }),
        ...(body.confidence !== undefined && { confidence: body.confidence, reviewAt }),
        ...(body.question !== undefined && { question: body.question }),
        ...(body.difficulty !== undefined && { difficulty: body.difficulty }),
        ...(body.tags !== undefined && { tags: body.tags }),
      },
    });

    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id } = await params;

    const existing = await prisma.interviewQuestion.findFirst({ where: { id, userId: session.user.id } });
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

    await prisma.interviewQuestion.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
