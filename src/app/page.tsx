import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function RootPage() {
  const session = await auth();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Navbar */}
      <nav className="flex items-center justify-between border-b border-zinc-800 px-6 py-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-600">
            <svg className="h-4 w-4 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M13 3L4 14h7v7l9-11h-7V3z" />
            </svg>
          </div>
          <span className="text-base font-bold tracking-tight">FlowAI</span>
        </div>
        <Link
          href="/login"
          className="text-sm font-medium text-zinc-400 hover:text-zinc-100 transition-colors"
        >
          Sign in
        </Link>
      </nav>

      {/* Hero */}
      <section className="mx-auto max-w-4xl px-6 py-28 text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-400">
          <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
          AI-Powered Smart Workspace
        </div>
        <h1 className="mt-6 text-5xl font-bold tracking-tight text-zinc-100 sm:text-6xl">
          Your work, supercharged
          <br />
          <span className="text-indigo-400">by AI</span>
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg text-zinc-400">
          FlowAI turns your goals into structured projects, tracks tasks intelligently, and keeps your notes organized — with AI built in at every step.
        </p>
        <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/register"
            className="inline-flex h-11 items-center justify-center rounded-lg bg-indigo-600 px-6 text-sm font-semibold text-white transition-colors hover:bg-indigo-500"
          >
            Get started free
          </Link>
          <Link
            href="/login"
            className="inline-flex h-11 items-center justify-center rounded-lg border border-zinc-700 px-6 text-sm font-semibold text-zinc-300 transition-colors hover:border-zinc-600 hover:text-zinc-100"
          >
            Sign in
          </Link>
        </div>
      </section>

      {/* Features grid */}
      <section className="mx-auto max-w-4xl px-6 pb-24">
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            {
              title: "Projects",
              desc: "Describe a goal and let AI break it down into structured milestones and sub-tasks automatically.",
              icon: (
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
                </svg>
              ),
              color: "text-indigo-400 bg-indigo-500/20",
            },
            {
              title: "Tasks",
              desc: "Smart task management that prioritizes what matters and surfaces what needs your attention.",
              icon: (
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 11l3 3L22 4" />
                  <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
                </svg>
              ),
              color: "text-blue-400 bg-blue-500/20",
            },
            {
              title: "Notes",
              desc: "Write freely and let AI summarize, extract insights, and link ideas across your knowledge base.",
              icon: (
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                  <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
                </svg>
              ),
              color: "text-purple-400 bg-purple-500/20",
            },
            {
              title: "AI Chat",
              desc: "Ask anything about your projects, tasks, and notes. Your AI assistant knows your full context.",
              icon: (
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                </svg>
              ),
              color: "text-green-400 bg-green-500/20",
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6"
            >
              <div className={`mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg ${feature.color}`}>
                {feature.icon}
              </div>
              <h3 className="mb-2 text-base font-semibold text-zinc-100">{feature.title}</h3>
              <p className="text-sm text-zinc-400">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800 py-6 text-center">
        <p className="text-xs text-zinc-600">FlowAI v1.0 · AI-Powered Smart Workspace</p>
      </footer>
    </div>
  );
}
