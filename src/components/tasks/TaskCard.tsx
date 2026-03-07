"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatMinutes, priorityColor } from "@/lib/utils";
import type { Task } from "@/types";

interface TaskCardProps {
  task: Task;
  onDelete: (id: string) => void;
}

export function TaskCard({ task, onDelete }: TaskCardProps) {
  const [deleting, setDeleting] = useState(false);

  async function handleDelete(e: React.MouseEvent) {
    e.stopPropagation();
    setDeleting(true);
    await fetch(`/api/tasks/${task.id}`, { method: "DELETE" });
    onDelete(task.id);
  }

  return (
    <div className="group rounded-lg border border-zinc-700 bg-zinc-800/80 p-3 hover:border-zinc-600 transition-all cursor-grab active:cursor-grabbing">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium text-zinc-200 leading-snug flex-1">
          {task.aiGenerated && (
            <span className="mr-1 text-indigo-400" title="AI-generated task">✦</span>
          )}
          {task.title}
        </p>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={handleDelete}
          loading={deleting}
          className="opacity-0 group-hover:opacity-100 h-6 w-6 flex-shrink-0"
        >
          <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </Button>
      </div>

      {task.description && (
        <p className="mt-1.5 text-xs text-zinc-500 line-clamp-2">{task.description}</p>
      )}

      <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
        <Badge variant={priorityColor[task.priority as keyof typeof priorityColor] || "default"}>
          {task.priority}
        </Badge>
        {task.estimateMin && (
          <span className="text-[10px] text-zinc-600">~{formatMinutes(task.estimateMin)}</span>
        )}
      </div>
    </div>
  );
}
