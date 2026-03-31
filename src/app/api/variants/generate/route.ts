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

  const { data: profile } = await supabase
    .from("profiles")
    .select("plan")
    .eq("id", user.id)
    .single();

  if (!profile || profile.plan === "free") {
    return NextResponse.json(
      { error: "A/B testing requires a Pro or Team plan" },
      { status: 403 }
    );
  }

  const { projectId, originalHtml, variantInstruction } = await request.json();

  if (!projectId || !originalHtml) {
    return NextResponse.json(
      { error: "Project ID and original HTML required" },
      { status: 400 }
    );
  }

  try {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 8000,
      messages: [
        {
          role: "user",
          content: `You are an expert at A/B testing and conversion rate optimization.

Here is the original landing page:
\`\`\`html
${originalHtml}
\`\`\`

${variantInstruction ? `Specific changes requested: "${variantInstruction}"` : "Create a meaningfully different variant that tests a different conversion hypothesis."}

Create a VARIANT of this page that:
1. Tests a different approach to converting visitors (different headline angle, different CTA, different layout, different social proof approach)
2. Maintains the same product information and branding
3. Is a complete, valid HTML document
4. Uses Tailwind CSS via CDN
5. Is meaningfully different, not just cosmetic changes

Return ONLY the complete HTML. No explanations.`,
        },
      ],
    });

    const content = message.content[0];
    if (content.type !== "text") throw new Error("Unexpected response");

    const variantHtml = content.text.trim();

    // Get existing variant count for naming
    const { count } = await supabase
      .from("variants")
      .select("*", { count: "exact", head: true })
      .eq("project_id", projectId);

    const variantName = `Variant ${String.fromCharCode(65 + (count || 0))}`;

    const { data: variant, error } = await supabase
      .from("variants")
      .insert({
        project_id: projectId,
        name: variantName,
        html_content: variantHtml,
        traffic_weight: 50,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(variant);
  } catch (err) {
    console.error("Variant generation error:", err);
    return NextResponse.json(
      { error: "Failed to generate variant" },
      { status: 500 }
    );
  }
}
