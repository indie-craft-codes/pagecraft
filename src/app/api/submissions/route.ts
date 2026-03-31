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

  // Verify project exists and is published (prevents spam to arbitrary IDs)
  const { data: project } = await supabase
    .from("projects")
    .select("id, webhook_url")
    .eq("id", projectId)
    .eq("published", true)
    .single();

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

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

  // Fire webhook if configured
  if (project.webhook_url) {
    fetch(project.webhook_url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, data, source, projectId }),
    }).catch((err) => {
      console.error("Webhook delivery failed:", err);
    });
  }

  return NextResponse.json({ success: true });
}
