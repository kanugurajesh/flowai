import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/layout/Header";
import { Badge } from "@/components/ui/Badge";
import { formatRelativeTime, formatMinutes } from "@/lib/utils";
import Link from "next/link";

const statusLabel = { TODO: "To Do", IN_PROGRESS: "In Progress", DONE: "Done" };
const statusColor = { TODO: "default" as const, IN_PROGRESS: "blue" as const, DONE: "green" as const };
const priorityColor = { HIGH: "red" as const, MEDIUM: "yellow" as const, LOW: "green" as const };

export default async function TasksPage() {
  const session = await auth();
  const tasks = await prisma.task.findMany({
    where: { project: { userId: session!.user!.id! } },
    include: { project: { select: { id: true, title: true, color: true } } },
    orderBy: [{ status: "asc" }, { updatedAt: "desc" }],
  });

  const grouped = {
    TODO: tasks.filter((t) => t.status === "TODO"),
    IN_PROGRESS: tasks.filter((t) => t.status === "IN_PROGRESS"),
    DONE: tasks.filter((t) => t.status === "DONE"),
  };

  return (
    <div className="flex flex-col overflow-hidden h-full">
      <Header
        title="All Tasks"
        subtitle={`${tasks.length} task${tasks.length !== 1 ? "s" : ""} across all projects`}
        user={session?.user ?? undefined}
      />
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-sm text-zinc-500">No tasks yet. Create a project to get started.</p>
            <Link href="/projects/new" className="mt-3 text-sm text-indigo-400 hover:text-indigo-300">
              Create a project →
            </Link>
          </div>
        ) : (
          (["IN_PROGRESS", "TODO", "DONE"] as const).map((status) => {
            const statusTasks = grouped[status];
            if (statusTasks.length === 0) return null;
            return (
              <div key={status}>
                <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-zinc-300">
                  <Badge variant={statusColor[status]}>{statusLabel[status]}</Badge>
                  <span className="text-zinc-600">{statusTasks.length}</span>
                </h2>
                <div className="space-y-2">
                  {statusTasks.map((task) => (
                    <Link
                      key={task.id}
                      href={`/projects/${task.project.id}`}
                      className="flex items-start gap-4 rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 py-3 hover:border-zinc-700 hover:bg-zinc-900 transition-all"
                    >
                      <div
                        className="mt-1 h-2.5 w-2.5 flex-shrink-0 rounded-full"
                        style={{ backgroundColor: task.project.color }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-zinc-200">
                          {task.aiGenerated && (
                            <span className="mr-1 text-indigo-400 text-xs">✦</span>
                          )}
                          {task.title}
                        </p>
                        {task.description && (
                          <p className="mt-0.5 text-xs text-zinc-500 line-clamp-1">{task.description}</p>
                        )}
                        <p className="mt-1 text-xs text-zinc-600">{task.project.title}</p>
                      </div>
                      <div className="flex flex-shrink-0 flex-col items-end gap-1.5">
                        <div className="flex items-center gap-1.5">
                          <Badge variant={priorityColor[task.priority as keyof typeof priorityColor]}>
                            {task.priority}
                          </Badge>
                          {task.estimateMin && (
                            <span className="text-xs text-zinc-600">{formatMinutes(task.estimateMin)}</span>
                          )}
                        </div>
                        <span className="text-xs text-zinc-600">{formatRelativeTime(task.updatedAt)}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
