import Link from "next/link";
import { formatRelativeTime } from "@/lib/utils";
import type { Note } from "@/types";

interface NoteCardProps {
  note: Note;
}

export function NoteCard({ note }: NoteCardProps) {
  let tags: string[] = [];
  try { tags = JSON.parse(note.tags || "[]"); } catch { tags = []; }

  return (
    <Link
      href={`/notes/${note.id}`}
      className="group flex flex-col gap-3 rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 hover:border-zinc-600 hover:bg-zinc-900 transition-all"
    >
      <div>
        <h3 className="font-semibold text-zinc-100 group-hover:text-white line-clamp-1">
          {note.title}
        </h3>
        {note.summary ? (
          <p className="mt-1 text-sm text-zinc-400 line-clamp-2">{note.summary}</p>
        ) : (
          <p className="mt-1 text-sm text-zinc-600 line-clamp-2">
            {note.content || "Empty note"}
          </p>
        )}
      </div>

      {tags.length > 0 && (
        <div className="flex gap-1.5 flex-wrap">
          {tags.slice(0, 4).map((tag) => (
            <span
              key={tag}
              className="rounded bg-zinc-800 px-2 py-0.5 text-[10px] text-zinc-500"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      <p className="text-xs text-zinc-600">{formatRelativeTime(note.updatedAt)}</p>
    </Link>
  );
}
