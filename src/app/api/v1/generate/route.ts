import { NextResponse } from "next/server";
import { validateApiKey } from "@/lib/api-auth";
import { generateLandingPage } from "@/lib/ai";
import { generateSlug } from "@/lib/utils";
import { createClient } from "@supabase/supabase-js";

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(request: Request) {
  // Validate API key
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json(
      { error: "Missing API key. Use: Authorization: Bearer pc_xxx" },
      { status: 401 }
    );
  }

  const apiKey = authHeader.slice(7);
  const auth = await validateApiKey(apiKey);

  if (!auth) {
    return NextResponse.json(
      { error: "Invalid API key or insufficient permissions. API access requires Team plan." },
      { status: 403 }
    );
  }

  const body = await request.json();
  const { productName, productDescription, targetAudience, tone, language } =
    body;

  if (!productName || !productDescription) {
    return NextResponse.json(
      { error: "productName and productDescription are required" },
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
    const supabase = getSupabaseAdmin();

    const { data: project, error } = await supabase
      .from("projects")
      .insert({
        user_id: auth.userId,
        name: productName,
        slug,
        description: productDescription,
        html_content: html,
        meta_title: title,
        meta_description: description,
        published: false,
      })
      .select("id, slug, name, meta_title, meta_description, created_at")
      .single();

    if (error) throw error;

    return NextResponse.json({
      ...project,
      html,
      publishUrl: `${process.env.NEXT_PUBLIC_APP_URL}/p/${slug}`,
    });
  } catch (err) {
    console.error("API generation error:", err);
    return NextResponse.json(
      { error: "Failed to generate page" },
      { status: 500 }
    );
  }
}
