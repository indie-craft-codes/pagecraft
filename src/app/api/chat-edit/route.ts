import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { currentHtml, userMessage, chatHistory } = await request.json();

  if (!currentHtml || !userMessage) {
    return NextResponse.json(
      { error: "Current HTML and message required" },
      { status: 400 }
    );
  }

  // Build conversation messages
  const messages: Anthropic.MessageParam[] = [];

  // Add chat history
  if (chatHistory && Array.isArray(chatHistory)) {
    for (const msg of chatHistory.slice(-6)) {
      messages.push({
        role: msg.role,
        content: msg.content,
      });
    }
  }

  // Add current request
  messages.push({
    role: "user",
    content: `Here is the current landing page HTML:
\`\`\`html
${currentHtml}
\`\`\`

User request: "${userMessage}"

Modify the HTML according to the user's request. Return ONLY the complete modified HTML document. No explanations, no markdown code blocks, just the raw HTML.

If the request is unclear, make your best interpretation and apply it. Always maintain valid HTML structure, Tailwind CSS classes, and responsive design.`,
  });

  try {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 8000,
      system:
        "You are an AI assistant that modifies landing page HTML based on natural language instructions. Always return complete, valid HTML documents with Tailwind CSS. Never include explanations or markdown — only raw HTML.",
      messages,
    });

    const content = response.content[0];
    if (content.type !== "text") throw new Error("Unexpected response");

    // Clean up the response (remove any markdown wrappers)
    let html = content.text.trim();
    if (html.startsWith("```")) {
      html = html.replace(/^```(?:html)?\n?/, "").replace(/\n?```$/, "");
    }

    return NextResponse.json({
      html,
      assistantMessage: `Done! I've ${userMessage.toLowerCase().startsWith("add") ? "added" : userMessage.toLowerCase().startsWith("remove") ? "removed" : userMessage.toLowerCase().startsWith("change") ? "changed" : "updated"} the page based on your request.`,
    });
  } catch (err) {
    console.error("Chat edit error:", err);
    return NextResponse.json(
      { error: "Failed to process edit" },
      { status: 500 }
    );
  }
}
