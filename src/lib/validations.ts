import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const projectSchema = z.object({
  title: z.string().min(1, "Title is required").max(100),
  description: z.string().max(500).optional(),
  goal: z.string().max(1000).optional(),
  color: z.string().optional(),
});

export const taskSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(1000).optional(),
  status: z.enum(["TODO", "IN_PROGRESS", "DONE"]).default("TODO"),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).default("MEDIUM"),
  estimateMin: z.number().optional(),
  projectId: z.string().min(1, "Project is required"),
});

export const noteSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  content: z.string().default(""),
});

export const chatSchema = z.object({
  message: z.string().min(1, "Message is required").max(4000),
});
