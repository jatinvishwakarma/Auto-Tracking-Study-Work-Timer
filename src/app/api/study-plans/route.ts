import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const plans = await prisma.studyPlan.findMany({
      where: { isActive: true },
      include: {
        phases: { orderBy: { order: "asc" } },
        userPlans: {
          where: { userId: session.user.id },
          include: { phaseProgress: true },
        },
      },
    });

    return NextResponse.json({ data: plans });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
