import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { gemini } from "@/lib/gemini";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { noteId, content } = await req.json();

    if (!content || content.trim().length < 10) {
      return NextResponse.json(
        { error: "Note content is too short to summarize" },
        { status: 400 }
      );
    }

    // Verify note belongs to user
    if (noteId) {
      const note = await prisma.note.findFirst({
        where: { id: noteId, userId: session.user.id },
      });
      if (!note) {
        return NextResponse.json({ error: "Note not found" }, { status: 404 });
      }
    }

    const prompt = `Analyze the following note and provide a structured summary.

Note content:
"""
${content}
"""

Respond ONLY with valid JSON (no markdown). Format:
{
  "summary": "2-3 sentence TL;DR of the main points",
  "tags": ["tag1", "tag2", "tag3"],
  "keyPoints": ["point1", "point2", "point3"]
}

Requirements:
- summary: 2-3 sentences max
- tags: 3-6 relevant lowercase tags
- keyPoints: 3-5 key takeaways as short bullet strings`;

    const result = await gemini.generateContent(prompt);
    const text = result.response.text();

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Invalid AI response format");
    }

    const aiResult = JSON.parse(jsonMatch[0]);

    // Persist to DB if noteId provided
    if (noteId) {
      await prisma.note.update({
        where: { id: noteId },
        data: {
          summary: aiResult.summary,
          tags: JSON.stringify(aiResult.tags || []),
        },
      });
    }

    return NextResponse.json(aiResult);
  } catch (error) {
    console.error("AI summarize error:", error);
    return NextResponse.json(
      { error: "Failed to summarize note" },
      { status: 500 }
    );
  }
}
