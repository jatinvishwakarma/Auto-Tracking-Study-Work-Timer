import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { planId } = await req.json();
    if (!planId) return NextResponse.json({ error: "planId required" }, { status: 400 });

    const plan = await prisma.studyPlan.findUnique({ where: { id: planId }, include: { phases: true } });
    if (!plan) return NextResponse.json({ error: "Plan not found" }, { status: 404 });

    const userPlan = await prisma.userStudyPlan.upsert({
      where: { userId_planId: { userId: session.user.id, planId } },
      create: { userId: session.user.id, planId },
      update: { startDate: new Date(), currentPhase: 0, completedAt: null },
    });

    return NextResponse.json({ data: userPlan }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
