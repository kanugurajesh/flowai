"use client";

import Link from "next/link";
import { formatRelativeTime } from "@/lib/utils";
import type { Project } from "@/types";

interface ProjectCardProps {
  project: Project & { _count?: { tasks: number } };
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Link
      href={`/projects/${project.id}`}
      className="group flex flex-col gap-4 rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 hover:border-zinc-600 hover:bg-zinc-900 transition-all"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className="h-3 w-3 flex-shrink-0 rounded-full"
            style={{ backgroundColor: project.color }}
          />
          <h3 className="font-semibold text-zinc-100 group-hover:text-white line-clamp-1">
            {project.title}
          </h3>
        </div>
        <span className="flex-shrink-0 rounded-md bg-zinc-800 px-2 py-0.5 text-xs text-zinc-400">
          {project._count?.tasks ?? 0} tasks
        </span>
      </div>

      {project.description && (
        <p className="text-sm text-zinc-500 line-clamp-2">{project.description}</p>
      )}

      {project.goal && (
        <div className="rounded-lg bg-zinc-800/50 border border-zinc-700/50 px-3 py-2">
          <p className="text-xs text-zinc-500 line-clamp-2">
            <span className="text-indigo-400">Goal: </span>
            {project.goal}
          </p>
        </div>
      )}

      <p className="text-xs text-zinc-600">Updated {formatRelativeTime(project.updatedAt)}</p>
    </Link>
  );
}
