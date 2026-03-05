import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { gemini } from "@/lib/gemini";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { goal, projectTitle } = await req.json();

    if (!goal || !projectTitle) {
      return NextResponse.json({ error: "Goal and project title are required" }, { status: 400 });
    }

    const prompt = `You are a project planning assistant. Break down the following project goal into 4-8 actionable tasks.

Project: "${projectTitle}"
Goal: "${goal}"

Respond ONLY with a valid JSON array (no markdown, no explanation). Each task must have:
- title: string (concise, action-oriented, max 80 chars)
- description: string (1-2 sentences explaining the task)
- priority: "LOW" | "MEDIUM" | "HIGH"
- estimateMin: number (realistic time estimate in minutes)

Example format:
[{"title":"Set up project structure","description":"Initialize the repository and configure build tools.","priority":"HIGH","estimateMin":30}]`;

    const result = await gemini.generateContent(prompt);
    const text = result.response.text();

    // Extract JSON from response
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error("Invalid AI response format");
    }

    const tasks = JSON.parse(jsonMatch[0]);

    if (!Array.isArray(tasks)) {
      throw new Error("AI did not return an array");
    }

    return NextResponse.json({ tasks });
  } catch (error) {
    console.error("AI breakdown error:", error);
    return NextResponse.json(
      { error: "Failed to generate task breakdown" },
      { status: 500 }
    );
  }
}
