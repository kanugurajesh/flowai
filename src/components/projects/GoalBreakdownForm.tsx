"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { Badge } from "@/components/ui/Badge";
import { formatMinutes, priorityColor } from "@/lib/utils";
import type { AiTask } from "@/types";

interface GoalBreakdownFormProps {
  projectId: string;
  projectTitle: string;
  goal: string;
  onTasksAccepted: () => void;
}

export function GoalBreakdownForm({
  projectId,
  projectTitle,
  goal,
  onTasksAccepted,
}: GoalBreakdownFormProps) {
  const [goalText, setGoalText] = useState(goal);
  const [tasks, setTasks] = useState<AiTask[]>([]);
  const [selected, setSelected] = useState<boolean[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleBreakdown() {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/ai/breakdown", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goal: goalText, projectTitle }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Failed to generate tasks");
        return;
      }

      setTasks(data.tasks);
      setSelected(new Array(data.tasks.length).fill(true));
    } catch {
      setError("Something went wrong. Check your Gemini API key.");
    } finally {
      setLoading(false);
    }
  }

  async function handleAccept() {
    setSaving(true);
    try {
      const selectedTasks = tasks.filter((_, i) => selected[i]);

      await Promise.all(
        selectedTasks.map((task, i) =>
          fetch("/api/tasks", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...task,
              projectId,
              aiGenerated: true,
              status: "TODO",
              order: i,
            }),
          })
        )
      );

      onTasksAccepted();
    } catch {
      setError("Failed to save tasks");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <Textarea
        label="Project Goal"
        value={goalText}
        onChange={(e) => setGoalText(e.target.value)}
        placeholder="Describe what you want to achieve with this project..."
        rows={3}
      />

      {error && (
        <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">{error}</p>
      )}

      {tasks.length === 0 ? (
        <Button
          onClick={handleBreakdown}
          loading={loading}
          disabled={!goalText.trim()}
          className="w-full"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M13 3L4 14h7v7l9-11h-7V3z" />
          </svg>
          Generate Tasks with AI
        </Button>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-zinc-400">
            Select tasks to add to your project ({selected.filter(Boolean).length} of {tasks.length} selected)
          </p>
          <div className="space-y-2">
            {tasks.map((task, i) => (
              <div
                key={i}
                onClick={() => {
                  const next = [...selected];
                  next[i] = !next[i];
                  setSelected(next);
                }}
                className={`cursor-pointer rounded-lg border p-3 transition-all ${
                  selected[i]
                    ? "border-indigo-500/50 bg-indigo-500/10"
                    : "border-zinc-700 bg-zinc-800/30 opacity-50"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 h-4 w-4 flex-shrink-0 rounded border ${
                    selected[i] ? "border-indigo-500 bg-indigo-500" : "border-zinc-600"
                  } flex items-center justify-center`}>
                    {selected[i] && (
                      <svg className="h-2.5 w-2.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-zinc-200">
                        ✦ {task.title}
                      </span>
                      <Badge variant={priorityColor[task.priority] || "default"}>
                        {task.priority}
                      </Badge>
                      {task.estimateMin && (
                        <span className="text-xs text-zinc-500">
                          ~{formatMinutes(task.estimateMin)}
                        </span>
                      )}
                    </div>
                    {task.description && (
                      <p className="mt-1 text-xs text-zinc-500">{task.description}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-2 pt-1">
            <Button
              variant="ghost"
              onClick={() => { setTasks([]); setSelected([]); }}
              className="flex-1"
            >
              Regenerate
            </Button>
            <Button
              onClick={handleAccept}
              loading={saving}
              disabled={!selected.some(Boolean)}
              className="flex-1"
            >
              Add {selected.filter(Boolean).length} Tasks to Board
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
