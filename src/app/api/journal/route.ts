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
    const dateStr = searchParams.get("date"); // YYYY-MM-DD

    const where: Record<string, unknown> = { userId: session.user.id };

    if (dateStr) {
      const date = new Date(dateStr + "T00:00:00");
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);
      where.date = { gte: date, lt: nextDay };
    }

    const journals = await prisma.dailyJournal.findMany({
      where,
      orderBy: { date: "desc" },
      take: dateStr ? 1 : 30,
    });

    return NextResponse.json({ data: journals });
  } catch (error) {
    console.error("Journal GET error:", error);
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
    const dateStr = body.date; // YYYY-MM-DD

    if (!dateStr) {
      return NextResponse.json({ error: "Date is required" }, { status: 400 });
    }

    const date = new Date(dateStr + "T00:00:00");

    // Upsert: create or update journal for this date
    const journal = await prisma.dailyJournal.upsert({
      where: {
        userId_date: {
          userId: session.user.id,
          date,
        },
      },
      update: {
        dsaActivity: body.dsaActivity ?? undefined,
        systemDesignActivity: body.systemDesignActivity ?? undefined,
        projectActivity: body.projectActivity ?? undefined,
        generalLearning: body.generalLearning ?? undefined,
        notes: body.notes ?? undefined,
        timeSpent: body.timeSpent ?? undefined,
        wins: body.wins ?? undefined,
        blockers: body.blockers ?? undefined,
        tomorrowPriorities: body.tomorrowPriorities ?? undefined,
      },
      create: {
        userId: session.user.id,
        date,
        dsaActivity: body.dsaActivity || null,
        systemDesignActivity: body.systemDesignActivity || null,
        projectActivity: body.projectActivity || null,
        generalLearning: body.generalLearning || null,
        notes: body.notes || null,
        timeSpent: body.timeSpent || null,
        wins: body.wins || null,
        blockers: body.blockers || null,
        tomorrowPriorities: body.tomorrowPriorities || null,
      },
    });

    return NextResponse.json({ data: journal }, { status: 201 });
  } catch (error) {
    console.error("Journal POST error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
