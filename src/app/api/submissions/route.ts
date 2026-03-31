import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// Public endpoint — no auth required (for lead capture from published pages)
export async function POST(request: Request) {
  const { projectId, email, data, source } = await request.json();

  if (!projectId || !email) {
    return NextResponse.json(
      { error: "Project ID and email required" },
      { status: 400 }
    );
  }

  // Basic email validation
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json(
      { error: "Invalid email address" },
      { status: 400 }
    );
  }

  const supabase = getSupabase();

  const { error } = await supabase.from("submissions").insert({
    project_id: projectId,
    email,
    data: data || {},
    source: source || "form",
  });

  if (error) {
    console.error("Submission error:", error);
    return NextResponse.json(
      { error: "Failed to save submission" },
      { status: 500 }
    );
  }

  // If project has a webhook URL, fire it
  const { data: project } = await supabase
    .from("projects")
    .select("webhook_url")
    .eq("id", projectId)
    .single();

  if (project?.webhook_url) {
    fetch(project.webhook_url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, data, source, projectId }),
    }).catch(() => {}); // Fire and forget
  }

  return NextResponse.json({ success: true });
}
