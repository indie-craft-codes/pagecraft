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

  const { sectionHtml, instruction, fullPageContext } = await request.json();

  if (!sectionHtml || !instruction) {
    return NextResponse.json(
      { error: "Section HTML and instruction are required" },
      { status: 400 }
    );
  }

  try {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4000,
      messages: [
        {
          role: "user",
          content: `You are an expert web designer and copywriter. You need to modify a specific section of a landing page based on the user's instruction.

Here is the FULL PAGE for context (do not modify anything outside the target section):
${fullPageContext ? `\n${fullPageContext}\n` : "(not provided)"}

Here is the SPECIFIC SECTION to modify:
\`\`\`html
${sectionHtml}
\`\`\`

User instruction: "${instruction}"

Requirements:
1. Return ONLY the modified HTML for this section
2. Keep the same general structure (tag hierarchy) unless the instruction says otherwise
3. Maintain Tailwind CSS classes and responsive design
4. Keep it consistent with the rest of the page
5. Return ONLY the HTML, no explanations or markdown code blocks`,
        },
      ],
    });

    const content = message.content[0];
    if (content.type !== "text") {
      throw new Error("Unexpected response type");
    }

    return NextResponse.json({ html: content.text.trim() });
  } catch (err) {
    console.error("Section regeneration error:", err);
    return NextResponse.json(
      { error: "Failed to regenerate section" },
      { status: 500 }
    );
  }
}
