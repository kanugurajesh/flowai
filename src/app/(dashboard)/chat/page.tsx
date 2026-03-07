"use client";

import { useState, useEffect, useRef } from "react";
import { Header } from "@/components/layout/Header";
import { ChatMessage } from "@/components/chat/ChatMessage";
import { ChatInput } from "@/components/chat/ChatInput";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import toast from "react-hot-toast";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: Date;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [streaming, setStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [clearing, setClearing] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/ai/chat")
      .then((r) => r.json())
      .then((data) => {
        setMessages(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingContent]);

  async function handleSend(message: string) {
    const userMsg: Message = {
      id: `tmp-${Date.now()}`,
      role: "user",
      content: message,
      createdAt: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setStreaming(true);
    setStreamingContent("");

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });

      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error ?? "Failed to get response");
        setStreaming(false);
        return;
      }

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let full = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        full += chunk;
        setStreamingContent(full);
      }

      const assistantMsg: Message = {
        id: `ai-${Date.now()}`,
        role: "assistant",
        content: full,
        createdAt: new Date(),
      };

      setMessages((prev) => [...prev, assistantMsg]);
      setStreamingContent("");
    } catch {
      toast.error("Something went wrong");
    } finally {
      setStreaming(false);
    }
  }

  async function handleClear() {
    if (!confirm("Clear all chat history?")) return;
    setClearing(true);
    await fetch("/api/ai/chat", { method: "DELETE" });
    setMessages([]);
    setClearing(false);
    toast.success("Chat cleared");
  }

  return (
    <div className="flex flex-col overflow-hidden h-full">
      <Header
        title="AI Chat"
        subtitle="Powered by Gemini 2.5 Flash"
        actions={
          messages.length > 0 ? (
            <Button variant="ghost" size="sm" onClick={handleClear} loading={clearing}>
              Clear chat
            </Button>
          ) : undefined
        }
      />
      <div className="flex-1 overflow-y-auto px-4 py-6">
        {loading ? (
          <div className="flex justify-center py-20">
            <Spinner />
          </div>
        ) : messages.length === 0 && !streaming ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-600/20">
              <svg className="h-8 w-8 text-indigo-400" viewBox="0 0 24 24" fill="currentColor">
                <path d="M13 3L4 14h7v7l9-11h-7V3z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-zinc-200">FlowAI Assistant</h2>
            <p className="mt-2 max-w-sm text-sm text-zinc-500">
              Ask me anything about productivity, project planning, task prioritization, or any topic you need help with.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {[
                "Break down my project goal",
                "Help me prioritize tasks",
                "Suggest a daily schedule",
                "Tips for staying focused",
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => handleSend(suggestion)}
                  className="rounded-full border border-zinc-700 bg-zinc-800 px-4 py-1.5 text-sm text-zinc-400 hover:border-indigo-500/50 hover:text-zinc-200 transition-all"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="mx-auto max-w-2xl space-y-4">
            {messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} />
            ))}
            {streaming && streamingContent && (
              <ChatMessage
                message={{
                  id: "streaming",
                  role: "assistant",
                  content: streamingContent,
                  createdAt: new Date(),
                }}
                isStreaming
              />
            )}
            {streaming && !streamingContent && (
              <div className="flex gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-700">
                  <svg className="h-4 w-4 text-zinc-300" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M13 3L4 14h7v7l9-11h-7V3z" />
                  </svg>
                </div>
                <div className="rounded-2xl rounded-tl-sm bg-zinc-800 px-4 py-3">
                  <div className="flex gap-1">
                    {[0, 150, 300].map((delay) => (
                      <div
                        key={delay}
                        className="h-2 w-2 rounded-full bg-zinc-500 animate-bounce"
                        style={{ animationDelay: `${delay}ms` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        )}
      </div>
      <div className="border-t border-zinc-800 bg-zinc-950/80 backdrop-blur-sm px-4 py-4">
        <div className="mx-auto max-w-2xl">
          <ChatInput onSend={handleSend} disabled={streaming} />
          <p className="mt-2 text-center text-xs text-zinc-600">
            FlowAI may make mistakes. Verify important information.
          </p>
        </div>
      </div>
    </div>
  );
}
