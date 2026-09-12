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
    const isActive = searchParams.get("active");

    const where: Record<string, unknown> = { userId: session.user.id };
    if (isActive === "true") where.isActive = true;
    if (isActive === "false") where.isActive = false;

    const goals = await prisma.goal.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ data: goals });
  } catch (error) {
    console.error("Goals GET error:", error);
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
    if (!body.title || !body.targetValue || !body.targetUnit) {
      return NextResponse.json(
        { error: "title, targetValue, and targetUnit are required" },
        { status: 400 }
      );
    }

    const now = new Date();
    const endDate = new Date();

    if (body.type === "Daily") {
      endDate.setHours(23, 59, 59, 999);
    } else if (body.type === "Weekly") {
      endDate.setDate(endDate.getDate() + 7);
    } else {
      endDate.setMonth(endDate.getMonth() + 1);
    }

    const goal = await prisma.goal.create({
      data: {
        userId: session.user.id,
        title: body.title,
        type: body.type || "Daily",
        category: body.category || null,
        targetValue: body.targetValue,
        targetUnit: body.targetUnit,
        startDate: body.startDate ? new Date(body.startDate) : now,
        endDate: body.endDate ? new Date(body.endDate) : endDate,
      },
    });

    return NextResponse.json({ data: goal }, { status: 201 });
  } catch (error) {
    console.error("Goals POST error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
