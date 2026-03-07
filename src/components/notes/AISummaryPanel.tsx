"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import type { AiSummary } from "@/types";

interface AISummaryPanelProps {
  noteId: string;
  content: string;
  initialSummary?: string | null;
  initialTags?: string;
  onSummaryGenerated: (summary: string, tags: string[]) => void;
}

export function AISummaryPanel({
  noteId,
  content,
  initialSummary,
  initialTags,
  onSummaryGenerated,
}: AISummaryPanelProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<AiSummary | null>(() => {
    if (initialSummary) {
      let tags: string[] = [];
      try { tags = JSON.parse(initialTags || "[]"); } catch { tags = []; }
      return { summary: initialSummary, tags, keyPoints: [] };
    }
    return null;
  });

  async function handleSummarize() {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/ai/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ noteId, content }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Failed to summarize");
        return;
      }

      setResult(data);
      onSummaryGenerated(data.summary, data.tags);
    } catch {
      setError("Something went wrong. Check your Gemini API key.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-zinc-100">AI Summary</span>
          <span className="rounded bg-indigo-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-400">GEMINI</span>
        </div>
        <Button
          size="sm"
          variant={result ? "outline" : "default"}
          onClick={handleSummarize}
          loading={loading}
          disabled={!content.trim() || content.length < 20}
        >
          {result ? "Re-summarize" : "✦ Summarize"}
        </Button>
      </div>

      {error && (
        <p className="text-xs text-red-400">{error}</p>
      )}

      {result ? (
        <div className="space-y-3">
          <div>
            <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide mb-1">Summary</p>
            <p className="text-sm text-zinc-300 leading-relaxed">{result.summary}</p>
          </div>

          {result.keyPoints.length > 0 && (
            <div>
              <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide mb-1.5">Key Points</p>
              <ul className="space-y-1">
                {result.keyPoints.map((point, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-zinc-400">
                    <span className="mt-0.5 text-indigo-400 flex-shrink-0">•</span>
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {result.tags.length > 0 && (
            <div>
              <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide mb-1.5">Tags</p>
              <div className="flex flex-wrap gap-1.5">
                {result.tags.map((tag) => (
                  <Badge key={tag} variant="indigo">#{tag}</Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <p className="text-xs text-zinc-600">
          {content.length < 20
            ? "Write at least a few sentences to enable AI summarization."
            : "Click to generate an AI summary with tags and key points."}
        </p>
      )}
    </div>
  );
}
