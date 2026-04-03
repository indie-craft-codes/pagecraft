import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

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
    // Dynamic import to use the adapter
    const { default: generateVariant } = await import("@/lib/ai-variant");
    const variantHtml = await generateVariant(originalHtml, variantInstruction);

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
