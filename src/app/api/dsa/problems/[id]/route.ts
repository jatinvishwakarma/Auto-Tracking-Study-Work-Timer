import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import type { Difficulty, DSAStatus } from "@prisma/client";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id } = await params;

    const problem = await prisma.dSAProblem.findFirst({
      where: { id, userId: session.user.id },
      include: { reviews: { orderBy: { reviewedAt: "desc" }, take: 10 } },
    });

    if (!problem) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ data: problem });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id } = await params;
    const body = await req.json();

    const existing = await prisma.dSAProblem.findFirst({ where: { id, userId: session.user.id } });
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const updated = await prisma.dSAProblem.update({
      where: { id },
      data: {
        ...(body.title !== undefined && { title: body.title }),
        ...(body.status !== undefined && { status: body.status as DSAStatus }),
        ...(body.difficulty !== undefined && { difficulty: body.difficulty as Difficulty }),
        ...(body.topic !== undefined && { topic: body.topic }),
        ...(body.subTopic !== undefined && { subTopic: body.subTopic }),
        ...(body.pattern !== undefined && { pattern: body.pattern }),
        ...(body.notes !== undefined && { notes: body.notes }),
        ...(body.approach !== undefined && { approach: body.approach }),
        ...(body.mistakes !== undefined && { mistakes: body.mistakes }),
        ...(body.confidence !== undefined && { confidence: body.confidence }),
        ...(body.reviewAt !== undefined && { reviewAt: body.reviewAt ? new Date(body.reviewAt) : null }),
        ...(body.solvedAt !== undefined && { solvedAt: body.solvedAt ? new Date(body.solvedAt) : null }),
        ...(body.problemUrl !== undefined && { problemUrl: body.problemUrl }),
        ...(body.leetcodeUrl !== undefined && { leetcodeUrl: body.leetcodeUrl }),
        ...(body.companyTags !== undefined && { companyTags: body.companyTags }),
        ...(body.timeTaken !== undefined && { timeTaken: body.timeTaken }),
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

    const existing = await prisma.dSAProblem.findFirst({ where: { id, userId: session.user.id } });
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

    await prisma.dSAProblem.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
