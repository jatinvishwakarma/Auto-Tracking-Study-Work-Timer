import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const caseStudies = await prisma.systemDesignCaseStudy.findMany({
      where: { userId: session.user.id },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json({ data: caseStudies });
  } catch (error) {
    console.error("SD Case Studies GET error:", error);
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
    if (!body.title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const caseStudy = await prisma.systemDesignCaseStudy.create({
      data: {
        userId: session.user.id,
        title: body.title,
        problemStatement: body.problemStatement || null,
        status: body.status || "NotStarted",
      },
    });

    return NextResponse.json({ data: caseStudy }, { status: 201 });
  } catch (error) {
    console.error("SD Case Studies POST error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
