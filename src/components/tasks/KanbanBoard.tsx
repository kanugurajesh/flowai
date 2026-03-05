"use client";

import { useState } from "react";
import { DragDropContext, Droppable, Draggable, type DropResult } from "@hello-pangea/dnd";
import { TaskCard } from "./TaskCard";
import { TaskForm } from "./TaskForm";
import { Button } from "@/components/ui/Button";
import type { Task, TaskStatus } from "@/types";

const COLUMNS: { id: TaskStatus; label: string; color: string }[] = [
  { id: "TODO", label: "To Do", color: "bg-zinc-500/20 text-zinc-400" },
  { id: "IN_PROGRESS", label: "In Progress", color: "bg-blue-500/20 text-blue-400" },
  { id: "DONE", label: "Done", color: "bg-green-500/20 text-green-400" },
];

interface KanbanBoardProps {
  initialTasks: Task[];
  projectId: string;
}

export function KanbanBoard({ initialTasks, projectId }: KanbanBoardProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [addingTo, setAddingTo] = useState<TaskStatus | null>(null);

  function getColumnTasks(status: TaskStatus) {
    return tasks
      .filter((t) => t.status === status)
      .sort((a, b) => a.order - b.order);
  }

  async function handleDragEnd(result: DropResult) {
    const { source, destination, draggableId } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const newStatus = destination.droppableId as TaskStatus;
    const taskId = draggableId;

    // Optimistic update
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId ? { ...t, status: newStatus, order: destination.index } : t
      )
    );

    // Persist
    await fetch(`/api/tasks/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus, order: destination.index }),
    });
  }

  function handleDelete(id: string) {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }

  function handleCreated(task: unknown) {
    setTasks((prev) => [...prev, task as Task]);
    setAddingTo(null);
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4 h-full">
        {COLUMNS.map((col) => {
          const colTasks = getColumnTasks(col.id);
          return (
            <div key={col.id} className="flex flex-col w-72 flex-shrink-0">
              {/* Column header */}
              <div className="mb-3 flex items-center gap-2">
                <span className={`rounded-md px-2 py-0.5 text-xs font-semibold ${col.color}`}>
                  {col.label}
                </span>
                <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-xs text-zinc-500">
                  {colTasks.length}
                </span>
              </div>

              {/* Droppable area */}
              <Droppable droppableId={col.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`flex-1 min-h-24 rounded-xl border p-2 space-y-2 transition-colors ${
                      snapshot.isDraggingOver
                        ? "border-indigo-500/50 bg-indigo-500/5"
                        : "border-zinc-800 bg-zinc-900/30"
                    }`}
                  >
                    {colTasks.map((task, index) => (
                      <Draggable key={task.id} draggableId={task.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={snapshot.isDragging ? "opacity-80 rotate-1" : ""}
                          >
                            <TaskCard task={task} onDelete={handleDelete} />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}

                    {/* Add task form or button */}
                    {addingTo === col.id ? (
                      <TaskForm
                        projectId={projectId}
                        status={col.id}
                        onCreated={handleCreated}
                        onCancel={() => setAddingTo(null)}
                      />
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setAddingTo(col.id)}
                        className="w-full justify-start text-zinc-600 hover:text-zinc-400"
                      >
                        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M12 5v14M5 12h14" />
                        </svg>
                        Add task
                      </Button>
                    )}
                  </div>
                )}
              </Droppable>
            </div>
          );
        })}
      </div>
    </DragDropContext>
  );
}
