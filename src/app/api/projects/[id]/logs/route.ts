import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const logs = await prisma.projectLog.findMany({
      where: { projectId: id, userId: session.user.id },
      orderBy: { date: "desc" },
    });

    return NextResponse.json({ data: logs });
  } catch (error) {
    console.error("Project Logs GET error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(
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

    if (!body.workedOn) {
      return NextResponse.json({ error: "workedOn is required" }, { status: 400 });
    }

    // Verify project ownership
    const project = await prisma.project.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const log = await prisma.projectLog.create({
      data: {
        projectId: id,
        userId: session.user.id,
        timeSpent: body.timeSpent || 0,
        workedOn: body.workedOn,
        completed: body.completed || null,
        blockers: body.blockers || null,
        nextSteps: body.nextSteps || null,
      },
    });

    return NextResponse.json({ data: log }, { status: 201 });
  } catch (error) {
    console.error("Project Logs POST error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
