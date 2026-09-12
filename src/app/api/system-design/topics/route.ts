import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const where: Record<string, unknown> = { userId: session.user.id };
    if (status) where.status = status;

    const topics = await prisma.systemDesignTopic.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      include: { _count: { select: { studyNotes: true } } },
    });

    return NextResponse.json({ data: topics });
  } catch (error) {
    console.error("SD Topics GET error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    if (!body.name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const topic = await prisma.systemDesignTopic.create({
      data: {
        userId: session.user.id,
        name: body.name,
        status: body.status || "NotStarted",
        notes: body.notes || null,
      },
    });

    return NextResponse.json({ data: topic }, { status: 201 });
  } catch (error) {
    console.error("SD Topics POST error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
