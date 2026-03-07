import { auth } from "@/lib/auth";
import { Header } from "@/components/layout/Header";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { Badge } from "@/components/ui/Badge";
import { formatRelativeTime, priorityColor, statusColor } from "@/lib/utils";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await auth();

  // Fetch from DB directly for server component
  const { prisma } = await import("@/lib/prisma");
  const userId = session!.user!.id!;

  const [totalProjects, totalNotes, taskStats, recentTasks, recentNotes] =
    await Promise.all([
      prisma.project.count({ where: { userId } }),
      prisma.note.count({ where: { userId } }),
      prisma.task.groupBy({
        by: ["status"],
        where: { project: { userId } },
        _count: true,
      }),
      prisma.task.findMany({
        where: { project: { userId } },
        include: { project: { select: { title: true, color: true, id: true } } },
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

  return (
    <div className="flex flex-col overflow-hidden h-full">
      <Header
        title="Overview"
        subtitle={`Welcome back, ${session?.user?.name ?? "there"}!`}
        user={session?.user ?? undefined}
      />
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatsCard
            label="Projects"
            value={totalProjects}
            color="bg-indigo-500/20 text-indigo-400"
            icon={
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
              </svg>
            }
          />
          <StatsCard
            label="Total Tasks"
            value={totalTasks}
            color="bg-blue-500/20 text-blue-400"
            icon={
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 11l3 3L22 4" />
                <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
              </svg>
            }
          />
          <StatsCard
            label="Completed"
            value={completedTasks}
            sub={totalTasks > 0 ? `${Math.round((completedTasks / totalTasks) * 100)}% done` : undefined}
            color="bg-green-500/20 text-green-400"
            icon={
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                <path d="M22 4L12 14.01l-3-3" />
              </svg>
            }
          />
          <StatsCard
            label="Notes"
            value={totalNotes}
            color="bg-purple-500/20 text-purple-400"
            icon={
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
              </svg>
            }
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recent Tasks */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50">
            <div className="flex items-center justify-between border-b border-zinc-800 px-5 py-4">
              <h2 className="text-sm font-semibold text-zinc-100">Recent Tasks</h2>
              <Link href="/tasks" className="text-xs text-indigo-400 hover:text-indigo-300">
                View all →
              </Link>
            </div>
            <div className="divide-y divide-zinc-800">
              {recentTasks.length === 0 ? (
                <div className="px-5 py-8 text-center">
                  <p className="text-sm text-zinc-500">No tasks yet</p>
                  <Link href="/projects/new" className="mt-2 inline-block text-xs text-indigo-400 hover:text-indigo-300">
                    Create a project →
                  </Link>
                </div>
              ) : (
                recentTasks.map((task) => (
                  <div key={task.id} className="flex items-start gap-3 px-5 py-3">
                    <div
                      className="mt-0.5 h-2.5 w-2.5 flex-shrink-0 rounded-full"
                      style={{ backgroundColor: task.project.color }}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm text-zinc-200">{task.title}</p>
                      <p className="text-xs text-zinc-500">{task.project.title}</p>
                    </div>
                    <div className="flex flex-shrink-0 items-center gap-2">
                      <Badge variant={priorityColor[task.priority as keyof typeof priorityColor]}>
                        {task.priority}
                      </Badge>
                      <Badge variant={statusColor[task.status as keyof typeof statusColor]}>
                        {task.status.replace("_", " ")}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Notes */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50">
            <div className="flex items-center justify-between border-b border-zinc-800 px-5 py-4">
              <h2 className="text-sm font-semibold text-zinc-100">Recent Notes</h2>
              <Link href="/notes" className="text-xs text-indigo-400 hover:text-indigo-300">
                View all →
              </Link>
            </div>
            <div className="divide-y divide-zinc-800">
              {recentNotes.length === 0 ? (
                <div className="px-5 py-8 text-center">
                  <p className="text-sm text-zinc-500">No notes yet</p>
                  <Link href="/notes" className="mt-2 inline-block text-xs text-indigo-400 hover:text-indigo-300">
                    Create a note →
                  </Link>
                </div>
              ) : (
                recentNotes.map((note) => (
                  <Link
                    key={note.id}
                    href={`/notes/${note.id}`}
                    className="flex items-start gap-3 px-5 py-3 hover:bg-zinc-800/50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm text-zinc-200">{note.title}</p>
                      {note.summary ? (
                        <p className="mt-0.5 line-clamp-1 text-xs text-zinc-500">{note.summary}</p>
                      ) : (
                        <p className="mt-0.5 line-clamp-1 text-xs text-zinc-600">
                          {note.content || "Empty note"}
                        </p>
                      )}
                    </div>
                    <span className="flex-shrink-0 text-xs text-zinc-600">
                      {formatRelativeTime(note.updatedAt)}
                    </span>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
          <h2 className="mb-4 text-sm font-semibold text-zinc-100">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { href: "/projects/new", label: "New Project", icon: "⚡", desc: "AI goal breakdown" },
              { href: "/notes", label: "New Note", icon: "📝", desc: "Smart notes" },
              { href: "/chat", label: "AI Chat", icon: "✨", desc: "Ask anything" },
              { href: "/tasks", label: "All Tasks", icon: "✅", desc: "Manage tasks" },
            ].map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="flex flex-col gap-1 rounded-lg border border-zinc-700 bg-zinc-800/50 p-4 hover:border-indigo-500/50 hover:bg-zinc-800 transition-all"
              >
                <span className="text-xl">{action.icon}</span>
                <span className="text-sm font-medium text-zinc-200">{action.label}</span>
                <span className="text-xs text-zinc-500">{action.desc}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
