import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { KanbanBoard } from "@/components/tasks/KanbanBoard";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import type { Task } from "@/types";

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  const { id } = await params;

  const project = await prisma.project.findFirst({
    where: { id, userId: session!.user!.id! },
    include: { tasks: { orderBy: [{ status: "asc" }, { order: "asc" }] } },
  });

  if (!project) notFound();

  return (
    <div className="flex flex-col overflow-hidden h-full">
      <Header
        title={project.title}
        subtitle={project.description ?? (project.goal ? "AI-powered project" : undefined)}
        user={session?.user ?? undefined}
        actions={
          <div className="flex items-center gap-2">
            <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: project.color }} />
            <Link href="/projects">
              <Button variant="ghost" size="sm">
                ← Back
              </Button>
            </Link>
          </div>
        }
      />
      <div className="flex-1 overflow-hidden p-6">
        <KanbanBoard
          initialTasks={project.tasks as Task[]}
          projectId={project.id}
        />
      </div>
    </div>
  );
}
