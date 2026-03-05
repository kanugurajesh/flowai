import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { gemini } from "@/lib/gemini";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const messages = await prisma.chatMessage.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "asc" },
    take: 100,
  });

  return NextResponse.json(messages);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { message } = await req.json();

    if (!message?.trim()) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    // Save user message
    await prisma.chatMessage.create({
      data: {
        role: "user",
        content: message,
        userId: session.user.id,
      },
    });

    // Get recent history (last 20 messages) for context
    const history = await prisma.chatMessage.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "asc" },
      take: 20,
    });

    // Format history for Gemini multi-turn chat
    const chatHistory = history.slice(0, -1).map((msg) => ({
      role: msg.role === "user" ? "user" as const : "model" as const,
      parts: [{ text: msg.content }],
    }));

    const chat = gemini.startChat({
      history: chatHistory,
      generationConfig: {
        maxOutputTokens: 1000,
      },
      systemInstruction: {
        role: "user",
        parts: [{ text: "You are FlowAI, a helpful productivity assistant. Help users with task planning, project management, goal setting, productivity tips, and general questions. Be concise, actionable, and friendly." }],
      },
    });

    // Stream the response
    const streamResult = await chat.sendMessageStream(message);

    let fullResponse = "";

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of streamResult.stream) {
            const text = chunk.text();
            if (text) {
              fullResponse += text;
              controller.enqueue(new TextEncoder().encode(text));
            }
          }

          // Save assistant message after streaming completes
          await prisma.chatMessage.create({
            data: {
              role: "assistant",
              content: fullResponse,
              userId: session.user.id,
            },
          });

          controller.close();
        } catch (error) {
          console.error("Stream error:", error);
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("Chat error:", error);
    return NextResponse.json({ error: "Failed to process message" }, { status: 500 });
  }
}

export async function DELETE() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await prisma.chatMessage.deleteMany({
    where: { userId: session.user.id },
  });

  return NextResponse.json({ success: true });
}
