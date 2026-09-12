import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Get active timer
    const active = await prisma.timeLog.findFirst({
      where: { userId, isRunning: true },
    });

    // Get recent completed logs
    const recent = await prisma.timeLog.findMany({
      where: { userId, isRunning: false, durationMinutes: { not: null } },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    return NextResponse.json({ active, recent });
  } catch (error) {
    console.error("Timer GET error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const { category, linkedType, linkedId } = await req.json();

    if (!category) {
      return NextResponse.json({ error: "Category is required" }, { status: 400 });
    }

    // Check for existing running timer
    const existing = await prisma.timeLog.findFirst({
      where: { userId, isRunning: true },
    });

    if (existing) {
      return NextResponse.json(
        { error: "A timer is already running. Stop it first." },
        { status: 409 }
      );
    }

    const timer = await prisma.timeLog.create({
      data: {
        userId,
        category,
        startedAt: new Date(),
        isRunning: true,
        linkedType: linkedType || null,
        linkedId: linkedId || null,
      },
    });

    return NextResponse.json({ data: timer }, { status: 201 });
  } catch (error) {
    console.error("Timer POST error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const { action, note } = await req.json();

    const active = await prisma.timeLog.findFirst({
      where: { userId, isRunning: true },
    });

    if (!active) {
      return NextResponse.json({ error: "No active timer found" }, { status: 404 });
    }

    if (action === "pause") {
      if (active.pausedAt) {
        return NextResponse.json({ error: "Timer is already paused" }, { status: 400 });
      }
      const updated = await prisma.timeLog.update({
        where: { id: active.id },
        data: { pausedAt: new Date() },
      });
      return NextResponse.json({ data: updated });
    }

    if (action === "resume") {
      if (!active.pausedAt) {
        return NextResponse.json({ error: "Timer is not paused" }, { status: 400 });
      }
      const pauseElapsed = Math.floor(
        (Date.now() - new Date(active.pausedAt).getTime()) / 1000
      );
      const updated = await prisma.timeLog.update({
        where: { id: active.id },
        data: {
          pausedAt: null,
          pausedDuration: active.pausedDuration + pauseElapsed,
        },
      });
      return NextResponse.json({ data: updated });
    }

    if (action === "stop") {
      const now = new Date();
      let totalSeconds = Math.floor(
        (now.getTime() - new Date(active.startedAt).getTime()) / 1000
      );

      // Subtract paused duration
      let pausedSecs = active.pausedDuration;
      if (active.pausedAt) {
        pausedSecs += Math.floor(
          (now.getTime() - new Date(active.pausedAt).getTime()) / 1000
        );
      }
      totalSeconds -= pausedSecs;

      const durationMinutes = Math.max(1, Math.round(totalSeconds / 60));

      const updated = await prisma.timeLog.update({
        where: { id: active.id },
        data: {
          endedAt: now,
          isRunning: false,
          pausedAt: null,
          pausedDuration: pausedSecs,
          durationMinutes,
          note: note || null,
        },
      });
      return NextResponse.json({ data: updated });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Timer PATCH error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
