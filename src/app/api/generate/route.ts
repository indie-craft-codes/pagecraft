import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateLandingPage } from "@/lib/ai";
import { generateSlug } from "@/lib/utils";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check plan limits
  const { data: profile } = await supabase
    .from("profiles")
    .select("plan, pages_created_this_month")
    .eq("id", user.id)
    .single();

  if (profile?.plan === "free" && profile.pages_created_this_month >= 1) {
    return NextResponse.json(
      { error: "Free plan limit reached. Upgrade to create more pages." },
      { status: 403 }
    );
  }

  const body = await request.json();
  const { productName, productDescription, targetAudience, tone, language } = body;

  if (!productName || !productDescription) {
    return NextResponse.json(
      { error: "Product name and description are required" },
      { status: 400 }
    );
  }

  try {
    const { html, title, description } = await generateLandingPage({
      productName,
      productDescription,
      targetAudience,
      tone,
      language,
    });

    const slug = generateSlug(productName);

    const { data: project, error } = await supabase
      .from("projects")
      .insert({
        user_id: user.id,
        name: productName,
        slug,
        description: productDescription,
        html_content: html,
        meta_title: title,
        meta_description: description,
        published: false,
      })
      .select()
      .single();

    if (error) throw error;

    // Increment pages created count
    await supabase
      .from("profiles")
      .update({
        pages_created_this_month: (profile?.pages_created_this_month || 0) + 1,
      })
      .eq("id", user.id);

    return NextResponse.json(project);
  } catch (err) {
    console.error("Generation error:", err);
    return NextResponse.json(
      { error: "Failed to generate page" },
      { status: 500 }
    );
  }
}
