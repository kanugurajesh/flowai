# FlowAI — AI-Powered Smart Workspace

A full-stack SaaS productivity application demonstrating modern web development practices with AI integration.

## Features

- **AI Goal Breakdown** — Paste a project goal; Gemini AI generates 4–8 actionable tasks with priority and time estimates
- **Kanban Board** — Drag-and-drop task management (TODO / IN_PROGRESS / DONE) per project
- **Smart Notes** — Markdown notes with one-click AI summarization, tag generation, and key-point extraction
- **Streaming AI Chat** — Real-time streaming chat assistant with conversation history (typewriter effect)
- **Auth** — Email/password registration and login with JWT sessions

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Database | SQLite via Prisma ORM v5 |
| Auth | NextAuth.js v5 (beta) |
| AI | Google Gemini 2.0 Flash |
| Drag & Drop | @hello-pangea/dnd |
| Validation | Zod v4 |
| Toasts | react-hot-toast |

## Getting Started

### 1. Install dependencies

```bash
pnpm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env`:
```bash
DATABASE_URL="file:./dev.db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET=""   # generate: openssl rand -base64 32
GEMINI_API_KEY=""    # get from: aistudio.google.com/app/apikey
```

### 3. Set up database

```bash
pnpm exec prisma migrate dev
```

### 4. Run development server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── app/
│   ├── (auth)/           # Login + Register pages
│   ├── (dashboard)/      # Protected app pages
│   │   ├── page.tsx      # Overview dashboard
│   │   ├── projects/     # Projects + Kanban board
│   │   ├── tasks/        # All tasks view
│   │   ├── notes/        # Notes + AI summarization
│   │   └── chat/         # Streaming AI chat
│   └── api/              # REST API routes + AI endpoints
├── components/           # React components by feature
├── lib/                  # Prisma client, auth, Gemini, utils
├── hooks/                # useDebounce
└── types/                # TypeScript types
```

## Key Architecture Decisions

- **API Routes for AI** — Streaming chat requires `ReadableStream` response (not Server Actions)
- **JWT sessions** — No DB lookup on every request, ideal for fast Kanban drag-and-drop
- **SQLite** — Zero-config for demo; swap to PostgreSQL by changing `DATABASE_URL` and Prisma provider
- **Optimistic updates** — Kanban status changes update UI immediately before API confirmation

## AI Integration Details

### Goal Breakdown (`/api/ai/breakdown`)
Uses `gemini.generateContent()` with a structured prompt requesting JSON array of tasks.

### Note Summarization (`/api/ai/summarize`)
Returns `{summary, tags[], keyPoints[]}` JSON and persists to DB.

### Streaming Chat (`/api/ai/chat`)
Uses `gemini.startChat({ history })` + `sendMessageStream()`, pipes chunks into a `ReadableStream` response. Client reads with `response.body.getReader()` for real-time typewriter effect.

## Verification Checklist

1. `pnpm dev` → app loads at `http://localhost:3000`
2. Register → redirected to dashboard
3. Create project with goal → AI generates task list → accept → Kanban board shows tasks
4. Drag task between columns → status persists on refresh
5. Create note → write content → click AI Summarize → summary + tags appear
6. Open Chat → send message → streaming typewriter response
7. Refresh → session and data persist
