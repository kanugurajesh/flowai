# FlowAI — AI-Powered Smart Workspace

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript) ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8?logo=tailwindcss) ![Prisma](https://img.shields.io/badge/Prisma-5-2D3748?logo=prisma)

FlowAI is a full-stack productivity workspace that combines task management, note-taking, and a streaming AI assistant — all powered by Google Gemini 2.0 Flash. Built for developers and teams who want to move from goals to action quickly, with AI doing the heavy lifting on planning and summarisation.

---

## Features

- **AI Goal Breakdown** — Describe a project goal in plain English; Gemini 2.0 Flash decomposes it into 4–8 prioritised, time-estimated tasks and populates your Kanban board in one click.
- **Kanban Board** — Drag-and-drop columns (TODO / IN_PROGRESS / DONE) powered by `@hello-pangea/dnd`; column order and task positions are persisted to the database on every drop.
- **Smart Notes** — Create and edit Markdown notes with auto-save via debounce; a single button calls Gemini to generate a summary, tag list, and key bullet points, all written back to the DB.
- **Streaming AI Chat** — Real-time typewriter responses via `ReadableStream`; full conversation history is stored per user and replayed as context on each new message.
- **Auth** — Email/password registration and login; bcrypt password hashing; JWT sessions via NextAuth.js v5 with `user.id` injected into every session callback.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v4 (PostCSS, no config file) |
| Database | SQLite via Prisma ORM 5 |
| Auth | NextAuth.js v5 beta (JWT strategy) |
| AI | Google Gemini 2.0 Flash (`@google/generative-ai`) |
| Drag & Drop | @hello-pangea/dnd |
| Validation | Zod v4 |
| Password hashing | bcryptjs |
| Notifications | react-hot-toast |
| Markdown rendering | react-markdown + remark-gfm |

---

## Architecture

### High-Level Overview

```
Browser
  │
  ├── Next.js App Router (React Server Components + Client Components)
  │     ├── (auth) group      → /login, /register
  │     └── (dashboard) group → /dashboard, /projects, /projects/[id],
  │                             /projects/new, /notes, /notes/[id],
  │                             /tasks, /chat
  │
  ├── Next.js API Routes (/app/api/*)
  │     ├── Auth       → /api/auth/[...nextauth]
  │     ├── Register   → /api/register
  │     ├── Dashboard  → /api/dashboard
  │     ├── CRUD       → /api/projects, /api/projects/[id]
  │     │                /api/tasks,    /api/tasks/[id]
  │     │                /api/notes,    /api/notes/[id]
  │     └── AI         → /api/ai/breakdown
  │                       /api/ai/summarize
  │                       /api/ai/chat  (streaming)
  │
  ├── Prisma ORM  (src/lib/prisma.ts — singleton client)
  │     └── SQLite database  (dev.db)
  │
  └── Google Gemini API  (src/lib/gemini.ts)
```

### Data Model

```
User ──< Account       (1-to-many, onDelete: Cascade)
User ──< Session       (1-to-many, onDelete: Cascade)
User ──< Project       (1-to-many, onDelete: Cascade)
User ──< Task          (1-to-many, onDelete: Cascade)
User ──< Note          (1-to-many, onDelete: Cascade)
User ──< ChatMessage   (1-to-many, onDelete: Cascade)
Project ──< Task       (1-to-many, onDelete: Cascade)
```

| Model | Key Fields |
|---|---|
| `User` | `id`, `email` (unique), `password` (bcrypt), `name`, `createdAt` |
| `Account` | `userId`, `provider`, `providerAccountId` — NextAuth OAuth adapter |
| `Session` | `sessionToken` (unique), `userId`, `expires` |
| `Project` | `id`, `title`, `goal`, `color`, `userId` |
| `Task` | `id`, `title`, `status` (TODO/IN_PROGRESS/DONE), `priority`, `order`, `aiGenerated`, `estimateMin`, `projectId`, `userId` |
| `Note` | `id`, `title`, `content`, `summary`, `tags` (JSON string), `userId` |
| `ChatMessage` | `id`, `role` (user/model), `content`, `userId`, `createdAt` |

### Request Flow — AI Goal Breakdown

1. User fills in a project goal on the project page and clicks **Break Down Goal**.
2. `GoalBreakdownForm` POSTs `{ projectId, goal }` to `/api/ai/breakdown`.
3. The route handler verifies the session, then calls `gemini.generateContent()` with a structured prompt requesting a JSON array of tasks.
4. Gemini returns JSON; the handler parses it and bulk-creates `Task` records in the DB with `aiGenerated: true`.
5. The response sends the created tasks back to the client.
6. The Kanban board re-fetches and renders the new tasks.

### Auth Flow

1. User submits credentials on `/login`.
2. NextAuth `CredentialsProvider` queries the DB for the user by email.
3. `bcryptjs.compare()` validates the password.
4. On success, NextAuth issues a JWT; the `session` callback appends `user.id` from the token.
5. All protected API routes call `auth()` (NextAuth v5 helper) and return `401` if no session is present.

### Streaming Chat

1. Client POSTs `{ messages }` to `/api/ai/chat`.
2. The route fetches the user's full `ChatMessage` history from the DB to build Gemini's `history` array.
3. `gemini.startChat({ history })` opens a chat session; `sendMessageStream()` returns an async iterable of chunks.
4. The handler wraps the iterable in a `ReadableStream` and returns it with `Content-Type: text/plain`.
5. The browser reads chunks via `response.body.getReader()`, appending each decoded chunk to the displayed message for a typewriter effect.
6. After streaming completes, both the user message and the full assistant response are saved to the DB.

---

## Project Structure

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx        # Sign-in form
│   │   └── register/page.tsx     # Account creation form
│   ├── (dashboard)/
│   │   ├── layout.tsx            # Sidebar + header shell (auth guard)
│   │   ├── dashboard/page.tsx    # Stats overview
│   │   ├── projects/
│   │   │   ├── page.tsx          # Projects list
│   │   │   ├── new/page.tsx      # Create project form
│   │   │   └── [id]/page.tsx     # Kanban board + AI goal breakdown
│   │   ├── tasks/page.tsx        # All-tasks view across projects
│   │   ├── notes/
│   │   │   ├── page.tsx          # Notes list
│   │   │   └── [id]/page.tsx     # Note editor + AI summary panel
│   │   └── chat/page.tsx         # Streaming AI chat
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts   # NextAuth handler
│   │   ├── register/route.ts             # User registration
│   │   ├── dashboard/route.ts            # Aggregate stats
│   │   ├── projects/
│   │   │   ├── route.ts                  # GET list / POST create
│   │   │   └── [id]/route.ts             # GET / PATCH / DELETE
│   │   ├── tasks/
│   │   │   ├── route.ts                  # GET list / POST create
│   │   │   └── [id]/route.ts             # PATCH / DELETE
│   │   ├── notes/
│   │   │   ├── route.ts                  # GET list / POST create
│   │   │   └── [id]/route.ts             # GET / PATCH / DELETE
│   │   └── ai/
│   │       ├── breakdown/route.ts        # POST: task generation
│   │       ├── summarize/route.ts        # POST: note summarisation
│   │       └── chat/route.ts             # POST: streaming chat
│   ├── layout.tsx               # Root layout (SessionProvider, Toaster)
│   ├── page.tsx                 # Landing / redirect
│   └── globals.css              # Tailwind base styles
├── components/
│   ├── ui/                      # Button, Input, Textarea, Badge, Card, Modal, Spinner
│   ├── tasks/                   # KanbanBoard, TaskCard, TaskForm
│   ├── notes/                   # NoteCard, AISummaryPanel
│   ├── projects/                # ProjectCard, GoalBreakdownForm
│   ├── chat/                    # ChatInput, ChatMessage
│   ├── dashboard/               # StatsCard
│   └── layout/                  # Sidebar, Header
├── lib/
│   ├── auth.ts                  # NextAuth config (Prisma adapter, credentials provider)
│   ├── gemini.ts                # Gemini client singleton
│   ├── prisma.ts                # Prisma client singleton
│   ├── utils.ts                 # cn(), formatDate(), priority/status color maps
│   └── validations.ts           # Zod schemas for all API inputs
├── hooks/
│   └── useDebounce.ts           # Debounce hook for note auto-save
└── types/
    ├── index.ts                 # Shared domain types
    └── next-auth.d.ts           # Session type augmentation (user.id)
```

---

## API Reference

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/api/register` | No | Create a new user account |
| `GET/POST` | `/api/auth/[...nextauth]` | — | NextAuth signin / signout / session |
| `GET` | `/api/dashboard` | Yes | Aggregate stats (task counts, notes count) |
| `GET` | `/api/projects` | Yes | List all projects for the current user |
| `POST` | `/api/projects` | Yes | Create a new project |
| `GET/PATCH/DELETE` | `/api/projects/[id]` | Yes | Read, update, or delete a project |
| `GET` | `/api/tasks` | Yes | List tasks (optionally filtered by `projectId`) |
| `POST` | `/api/tasks` | Yes | Create a task |
| `PATCH/DELETE` | `/api/tasks/[id]` | Yes | Update (status, order, fields) or delete a task |
| `GET` | `/api/notes` | Yes | List all notes for the current user |
| `POST` | `/api/notes` | Yes | Create a note |
| `GET/PATCH/DELETE` | `/api/notes/[id]` | Yes | Read, update (auto-save), or delete a note |
| `POST` | `/api/ai/breakdown` | Yes | Generate tasks from a project goal via Gemini |
| `POST` | `/api/ai/summarize` | Yes | Summarise a note (summary + tags + key points) |
| `POST` | `/api/ai/chat` | Yes | Streaming chat message (returns `ReadableStream`) |

---

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm
- A Google AI Studio API key ([aistudio.google.com](https://aistudio.google.com/app/apikey))

### Installation

```bash
git clone <repo-url>
cd flowai
pnpm install
```

### Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your values:

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | SQLite path — `file:./dev.db` |
| `NEXTAUTH_URL` | Yes | App base URL — `http://localhost:3000` |
| `NEXTAUTH_SECRET` | Yes | Random secret: `openssl rand -base64 32` |
| `GEMINI_API_KEY` | Yes | From [aistudio.google.com](https://aistudio.google.com/app/apikey) |

### Database Setup

```bash
npx prisma migrate dev
```

### Run

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Database

- **Default:** SQLite — zero config, single file (`dev.db`), ideal for local development.
- **Switch to PostgreSQL:** Change `provider = "postgresql"` in `prisma/schema.prisma` and update `DATABASE_URL` to a Postgres connection string.
- **Run migrations:** `npx prisma migrate dev`
- **Browse data:** `npx prisma studio`

---

## Development Notes

- **AI features** require a valid `GEMINI_API_KEY`. The rest of the app functions normally without it; only `/api/ai/*` routes will error.
- **Lint:** `pnpm lint` (ESLint)
- **Type check:** `npx tsc --noEmit`
- **Tailwind v4** uses PostCSS integration only — no `tailwind.config.*` file is needed or used.
- **Optimistic updates** — Kanban drag-and-drop updates UI state immediately before the PATCH request completes, keeping interactions snappy.
- **JWT sessions** — No database lookup on each request; `user.id` is embedded in the token and extracted in the `session` callback.
