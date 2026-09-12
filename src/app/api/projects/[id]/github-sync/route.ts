import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id } = await params;

    const project = await prisma.project.findFirst({ where: { id, userId: session.user.id } });
    if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });
    if (!project.githubRepo) return NextResponse.json({ error: "No GitHub repo configured for this project" }, { status: 400 });

    // Use user-level token or env fallback
    const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { githubToken: true } });
    const token = user?.githubToken || process.env.GITHUB_TOKEN;

    if (!token) return NextResponse.json({ error: "No GitHub token available. Add one in Settings." }, { status: 400 });

    const [owner, repo] = project.githubRepo.split("/");
    const headers: Record<string, string> = { "Accept": "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    // Fetch last 50 commits
    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/commits?per_page=50`, { headers });
    if (!res.ok) {
      const err = await res.json();
      return NextResponse.json({ error: err.message || "GitHub API error" }, { status: res.status });
    }

    const commits = await res.json() as Array<{
      sha: string;
      html_url: string;
      commit: { message: string; author: { date: string } };
    }>;

    // Create project logs for commits that don't already exist
    const existingShAs = new Set(
      (await prisma.projectLog.findMany({ where: { projectId: id, githubCommitSha: { not: null } }, select: { githubCommitSha: true } }))
        .map(l => l.githubCommitSha!)
    );

    const newLogs = commits
      .filter(c => !existingShAs.has(c.sha))
      .map(c => ({
        projectId: id,
        userId: session.user!.id as string,
        date: new Date(c.commit.author.date),
        timeSpent: 0,
        workedOn: c.commit.message.split("\n")[0].slice(0, 500),
        githubCommitSha: c.sha,
        githubCommitUrl: c.html_url,
      }));

    if (newLogs.length > 0) {
      await prisma.projectLog.createMany({ data: newLogs });
    }

    await prisma.project.update({ where: { id }, data: { lastSyncedAt: new Date() } });

    return NextResponse.json({ synced: newLogs.length, total: commits.length });
  } catch (error) {
    console.error("GitHub sync error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
