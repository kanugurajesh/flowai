"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/Button";
import { AISummaryPanel } from "@/components/notes/AISummaryPanel";
import { Spinner } from "@/components/ui/Spinner";
import { useDebounce } from "@/hooks/useDebounce";
import toast from "react-hot-toast";
import type { Note } from "@/types";

export default function NoteEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [note, setNote] = useState<Note | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const debouncedContent = useDebounce(content, 1500);
  const debouncedTitle = useDebounce(title, 1500);

  useEffect(() => {
    fetch(`/api/notes/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setNote(data);
        setTitle(data.title);
        setContent(data.content);
        setLoading(false);
      })
      .catch(() => {
        toast.error("Note not found");
        router.push("/notes");
      });
  }, [id, router]);

  // Auto-save
  useEffect(() => {
    if (!note || loading) return;
    if (debouncedTitle === note.title && debouncedContent === note.content) return;

    setSaving(true);
    fetch(`/api/notes/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: debouncedTitle, content: debouncedContent }),
    })
      .then((r) => r.json())
      .then((updated) => {
        setNote(updated);
      })
      .finally(() => setSaving(false));
  }, [debouncedTitle, debouncedContent, id, note, loading]);

  async function handleDelete() {
    if (!confirm("Delete this note?")) return;
    setDeleting(true);
    await fetch(`/api/notes/${id}`, { method: "DELETE" });
    toast.success("Note deleted");
    router.push("/notes");
  }

  function handleSummaryGenerated(summary: string, tags: string[]) {
    setNote((prev) => prev ? { ...prev, summary, tags: JSON.stringify(tags) } : prev);
    toast.success("Summary saved!");
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!note) return null;

  return (
    <div className="flex flex-col overflow-hidden h-full">
      <Header
        title="Edit Note"
        actions={
          <div className="flex items-center gap-2">
            {saving && (
              <span className="flex items-center gap-1.5 text-xs text-zinc-500">
                <Spinner size="sm" />
                Saving...
              </span>
            )}
            {!saving && <span className="text-xs text-zinc-600">Auto-saved</span>}
            <Button variant="danger" size="sm" onClick={handleDelete} loading={deleting}>
              Delete
            </Button>
            <Button variant="ghost" size="sm" onClick={() => router.push("/notes")}>
              ← Notes
            </Button>
          </div>
        }
      />
      <div className="flex flex-1 overflow-hidden">
        {/* Editor */}
        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="border-b border-zinc-800 px-6 py-3">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Note title..."
              className="w-full bg-transparent text-xl font-bold text-zinc-100 placeholder:text-zinc-600 focus:outline-none"
            />
          </div>
          <div className="flex-1 overflow-y-auto p-6">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Start writing... Markdown is supported for display."
              className="h-full w-full resize-none bg-transparent text-sm text-zinc-300 placeholder:text-zinc-600 focus:outline-none leading-relaxed"
            />
          </div>
          <div className="border-t border-zinc-800 px-6 py-2">
            <p className="text-xs text-zinc-600">
              {content.length} characters · {content.split(/\s+/).filter(Boolean).length} words
            </p>
          </div>
        </div>

        {/* AI Panel */}
        <div className="w-72 flex-shrink-0 border-l border-zinc-800 overflow-y-auto p-4">
          <AISummaryPanel
            noteId={id}
            content={content}
            initialSummary={note.summary}
            initialTags={note.tags}
            onSummaryGenerated={handleSummaryGenerated}
          />
        </div>
      </div>
    </div>
  );
}
