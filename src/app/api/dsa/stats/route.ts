import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const userId = session.user.id;

    const [total, byDifficulty, byStatus, byTopic, recentSolved, reviewsDue] = await Promise.all([
      prisma.dSAProblem.count({ where: { userId } }),
      prisma.dSAProblem.groupBy({ by: ["difficulty"], where: { userId }, _count: true }),
      prisma.dSAProblem.groupBy({ by: ["status"], where: { userId }, _count: true }),
      prisma.dSAProblem.groupBy({ by: ["topic"], where: { userId }, _count: true, orderBy: { _count: { topic: "desc" } }, take: 10 }),
      prisma.dSAProblem.count({ where: { userId, status: "Solved" } }),
      prisma.dSAProblem.count({ where: { userId, reviewAt: { lte: new Date() }, status: { not: "NotStarted" } } }),
    ]);

    return NextResponse.json({
      total,
      solved: recentSolved,
      reviewsDue,
      byDifficulty: byDifficulty.reduce((acc, d) => ({ ...acc, [d.difficulty]: d._count }), {}),
      byStatus: byStatus.reduce((acc, s) => ({ ...acc, [s.status]: s._count }), {}),
      topTopics: byTopic.map(t => ({ topic: t.topic, count: t._count })),
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
