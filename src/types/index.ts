export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH";
export type ChatRole = "user" | "assistant";

export interface Project {
  id: string;
  title: string;
  description: string | null;
  goal: string | null;
  color: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  tasks?: Task[];
  _count?: { tasks: number };
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  order: number;
  aiGenerated: boolean;
  estimateMin: number | null;
  projectId: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  project?: Project;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  summary: string | null;
  tags: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  userId: string;
  createdAt: Date;
}

export interface AiTask {
  title: string;
  description: string;
  priority: TaskPriority;
  estimateMin: number;
}

export interface AiSummary {
  summary: string;
  tags: string[];
  keyPoints: string[];
}

export interface DashboardStats {
  totalProjects: number;
  totalTasks: number;
  completedTasks: number;
  totalNotes: number;
}
