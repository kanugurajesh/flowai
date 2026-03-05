import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  const [totalProjects, totalNotes, taskStats, recentTasks, recentNotes] = await Promise.all([
    prisma.project.count({ where: { userId } }),
    prisma.note.count({ where: { userId } }),
    prisma.task.groupBy({
      by: ["status"],
      where: { project: { userId } },
      _count: true,
    }),
    prisma.task.findMany({
      where: { project: { userId } },
      include: { project: { select: { title: true, color: true } } },
      orderBy: { updatedAt: "desc" },
      take: 5,
    }),
    prisma.note.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      take: 5,
    }),
  ]);

  const totalTasks = taskStats.reduce((sum, s) => sum + s._count, 0);
  const completedTasks = taskStats.find((s) => s.status === "DONE")?._count ?? 0;

  return NextResponse.json({
    stats: { totalProjects, totalTasks, completedTasks, totalNotes },
    recentTasks,
    recentNotes,
  });
}
