import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { ChatMessage as ChatMessageType } from "@/types";

interface ChatMessageProps {
  message: ChatMessageType | { role: string; content: string; id: string; createdAt: Date };
  isStreaming?: boolean;
}

const markdownComponents = {
  p: ({ children }: { children: React.ReactNode }) => <p className="mb-2 last:mb-0">{children}</p>,
  h1: ({ children }: { children: React.ReactNode }) => <h1 className="text-xl font-bold text-zinc-100 mt-3 mb-1">{children}</h1>,
  h2: ({ children }: { children: React.ReactNode }) => <h2 className="text-lg font-bold text-zinc-100 mt-3 mb-1">{children}</h2>,
  h3: ({ children }: { children: React.ReactNode }) => <h3 className="text-base font-bold text-zinc-100 mt-3 mb-1">{children}</h3>,
  ul: ({ children }: { children: React.ReactNode }) => <ul className="list-disc pl-4 mb-2 space-y-0.5">{children}</ul>,
  ol: ({ children }: { children: React.ReactNode }) => <ol className="list-decimal pl-4 mb-2 space-y-0.5">{children}</ol>,
  li: ({ children }: { children: React.ReactNode }) => <li className="text-zinc-200">{children}</li>,
  code: ({ inline, children }: { inline?: boolean; children: React.ReactNode }) =>
    inline
      ? <code className="bg-zinc-900 text-indigo-300 rounded px-1 py-0.5 text-xs font-mono">{children}</code>
      : <code>{children}</code>,
  pre: ({ children }: { children: React.ReactNode }) => <pre className="bg-zinc-900 rounded-lg p-3 my-2 overflow-x-auto text-xs font-mono">{children}</pre>,
  blockquote: ({ children }: { children: React.ReactNode }) => <blockquote className="border-l-2 border-zinc-600 pl-3 text-zinc-400 italic my-2">{children}</blockquote>,
  strong: ({ children }: { children: React.ReactNode }) => <strong className="font-semibold text-zinc-100">{children}</strong>,
  em: ({ children }: { children: React.ReactNode }) => <em className="italic text-zinc-300">{children}</em>,
  a: ({ href, children }: { href?: string; children: React.ReactNode }) => <a href={href} className="text-indigo-400 underline hover:text-indigo-300">{children}</a>,
  hr: () => <hr className="border-zinc-700 my-3" />,
};

export function ChatMessage({ message, isStreaming }: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      {/* Avatar */}
      <div className={`flex-shrink-0 flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
        isUser ? "bg-indigo-600 text-white" : "bg-zinc-700 text-zinc-300"
      }`}>
        {isUser ? "U" : (
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M13 3L4 14h7v7l9-11h-7V3z" />
          </svg>
        )}
      </div>

      {/* Bubble */}
      <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
        isUser
          ? "rounded-tr-sm bg-indigo-600 text-white"
          : "rounded-tl-sm bg-zinc-800 text-zinc-200"
      }`}>
        {isUser ? (
          message.content
        ) : (
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
            {message.content}
          </ReactMarkdown>
        )}
        {isStreaming && (
          <span className="inline-block ml-1 h-4 w-0.5 bg-zinc-400 animate-pulse" />
        )}
      </div>
    </div>
  );
}
