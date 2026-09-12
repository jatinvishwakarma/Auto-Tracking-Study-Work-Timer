import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();

    // Verify ownership
    const existing = await prisma.systemDesignTopic.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Topic not found" }, { status: 404 });
    }

    const updated = await prisma.systemDesignTopic.update({
      where: { id },
      data: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.status !== undefined && { status: body.status }),
        ...(body.progress !== undefined && { progress: body.progress }),
        ...(body.confidence !== undefined && { confidence: body.confidence }),
        ...(body.notes !== undefined && { notes: body.notes }),
        ...(body.lastStudied !== undefined && { lastStudied: new Date(body.lastStudied) }),
        ...(body.nextReview !== undefined && { nextReview: new Date(body.nextReview) }),
        ...(body.timeInvested !== undefined && { timeInvested: body.timeInvested }),
      },
    });

    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error("SD Topic PATCH error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const existing = await prisma.systemDesignTopic.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Topic not found" }, { status: 404 });
    }

    await prisma.systemDesignTopic.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("SD Topic DELETE error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
