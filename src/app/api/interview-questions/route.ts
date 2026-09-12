import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const difficulty = searchParams.get("difficulty");
    const search = searchParams.get("search");

    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "100");
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {
      OR: [
        { userId: session.user.id },
        { isFromBank: true },
        { userId: "BANK" }
      ]
    };

    if (category) where.category = category;
    if (difficulty) where.difficulty = difficulty;
    
    // If searching, we need to nest the search inside an AND to keep the OR for user/bank intact
    if (search) {
      where.AND = [
        {
          OR: [
            { question: { contains: search, mode: "insensitive" } },
            { answer: { contains: search, mode: "insensitive" } },
            { tags: { contains: search, mode: "insensitive" } },
          ]
        }
      ];
    }

    const questions = await prisma.interviewQuestion.findMany({
      where,
      skip,
      take: limit,
      orderBy: [{ category: "asc" }, { createdAt: "asc" }],
    });

    return NextResponse.json({ data: questions });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    if (!body.question || !body.category) {
      return NextResponse.json({ error: "question and category are required" }, { status: 400 });
    }

    const q = await prisma.interviewQuestion.create({
      data: {
        userId: session.user.id,
        category: body.category,
        subCategory: body.subCategory || null,
        question: body.question,
        answer: body.answer || null,
        difficulty: body.difficulty || "Medium",
        tags: body.tags || null,
        source: body.source || null,
        isFromBank: body.isFromBank || false,
      },
    });

    return NextResponse.json({ data: q }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
