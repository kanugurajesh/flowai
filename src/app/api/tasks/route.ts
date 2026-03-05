import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { taskSchema } from "@/lib/validations";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get("projectId");

  const where = projectId
    ? { projectId, project: { userId: session.user.id } }
    : { project: { userId: session.user.id } };

  const tasks = await prisma.task.findMany({
    where,
    include: { project: { select: { id: true, title: true, color: true } } },
    orderBy: [{ status: "asc" }, { order: "asc" }],
  });

  return NextResponse.json(tasks);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = taskSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    // Verify project belongs to user
    const project = await prisma.project.findFirst({
      where: { id: parsed.data.projectId, userId: session.user.id },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Get next order value
    const lastTask = await prisma.task.findFirst({
      where: { projectId: parsed.data.projectId, status: parsed.data.status || "TODO" },
      orderBy: { order: "desc" },
    });

    const task = await prisma.task.create({
      data: {
        ...parsed.data,
        userId: session.user.id,
        order: (lastTask?.order ?? -1) + 1,
        aiGenerated: body.aiGenerated ?? false,
      },
    });

    return NextResponse.json(task, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
