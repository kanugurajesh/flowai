"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { PROJECT_COLORS } from "@/lib/utils";
import { GoalBreakdownForm } from "@/components/projects/GoalBreakdownForm";
import toast from "react-hot-toast";

type Step = "create" | "breakdown";

export default function NewProjectPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("create");
  const [projectId, setProjectId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [goal, setGoal] = useState("");
  const [color, setColor] = useState(PROJECT_COLORS[0]);
  const [loading, setLoading] = useState(false);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, goal, color }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "Failed to create project");
        return;
      }

      setProjectId(data.id);
      if (goal.trim()) {
        setStep("breakdown");
      } else {
        toast.success("Project created!");
        router.push(`/projects/${data.id}`);
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  if (step === "breakdown") {
    return (
      <div className="flex flex-col overflow-hidden h-full">
        <Header title="AI Goal Breakdown" subtitle="Let AI generate your task list" />
        <div className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto max-w-2xl">
            <Card>
              <CardContent>
                <div className="mb-4">
                  <h2 className="text-base font-semibold text-zinc-100">
                    Breaking down: <span className="text-indigo-400">{title}</span>
                  </h2>
                  <p className="text-sm text-zinc-500 mt-1">
                    Gemini AI will analyze your goal and suggest tasks. You can review and select which ones to add.
                  </p>
                </div>
                <GoalBreakdownForm
                  projectId={projectId}
                  projectTitle={title}
                  goal={goal}
                  onTasksAccepted={() => {
                    toast.success("Tasks added to project!");
                    router.push(`/projects/${projectId}`);
                  }}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col overflow-hidden h-full">
      <Header title="New Project" subtitle="Create a project with AI goal breakdown" />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-2xl">
          <Card>
            <CardContent>
              <form onSubmit={handleCreate} className="space-y-5">
                <Input
                  id="title"
                  label="Project Name"
                  placeholder="e.g. E-commerce Website"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />

                <Textarea
                  id="description"
                  label="Description (optional)"
                  placeholder="Brief overview of this project..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                />

                <Textarea
                  id="goal"
                  label="Project Goal (optional — triggers AI breakdown)"
                  placeholder="e.g. Build a full-stack e-commerce site with user auth, product catalog, and checkout..."
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  rows={3}
                />

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-zinc-300">Color</label>
                  <div className="flex gap-2 flex-wrap">
                    {PROJECT_COLORS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setColor(c)}
                        className={`h-7 w-7 rounded-full transition-all ${
                          color === c ? "ring-2 ring-white ring-offset-2 ring-offset-zinc-900 scale-110" : ""
                        }`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => router.back()}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" loading={loading} className="flex-1">
                    {goal.trim() ? "Create & Break Down Goal ✦" : "Create Project"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
