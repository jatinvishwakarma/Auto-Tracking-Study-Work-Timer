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
    const difficulty = searchParams.get("difficulty");
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "100");
    const skip = (page - 1) * limit;

    const where: any = {
      OR: [
        { userId: session.user.id },
        { isFromBank: true },
        { userId: "BANK" }
      ]
    };

    if (difficulty) where.difficulty = difficulty;
    if (status) where.status = status;
    if (search) {
      where.AND = [
        {
          OR: [
            { title: { contains: search, mode: "insensitive" } },
            { topic: { contains: search, mode: "insensitive" } },
            { pattern: { contains: search, mode: "insensitive" } },
          ]
        }
      ];
    }

    const problems = await prisma.dSAProblem.findMany({
      where,
      skip,
      take: limit,
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json({ data: problems });
  } catch (error) {
    console.error("Error fetching DSA problems:", error);
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
    // Basic validation
    if (!body.title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const problem = await prisma.dSAProblem.create({
      data: {
        ...body,
        userId: session.user.id,
      },
    });

    return NextResponse.json({ data: problem }, { status: 201 });
  } catch (error) {
    console.error("Error creating DSA problem:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
