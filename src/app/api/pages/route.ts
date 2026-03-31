import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// List pages for a project
export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get("projectId");

  if (!projectId) {
    return NextResponse.json(
      { error: "projectId required" },
      { status: 400 }
    );
  }

  const { data } = await supabase
    .from("pages")
    .select("*")
    .eq("project_id", projectId)
    .order("sort_order", { ascending: true });

  return NextResponse.json(data || []);
}

// Create a new page
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
      { error: "Multi-page sites require a Pro or Team plan" },
      { status: 403 }
    );
  }

  const { projectId, title, slug } = await request.json();

  const { data, error } = await supabase
    .from("pages")
    .insert({
      project_id: projectId,
      title: title || "New Page",
      slug: slug || title?.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "page",
      html_content: "",
    })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json(
        { error: "A page with this slug already exists" },
        { status: 409 }
      );
    }
    throw error;
  }

  return NextResponse.json(data);
}

// Update page
export async function PUT(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, title, slug, html_content, sort_order } = await request.json();

  const { data, error } = await supabase
    .from("pages")
    .update({
      ...(title !== undefined && { title }),
      ...(slug !== undefined && { slug }),
      ...(html_content !== undefined && { html_content }),
      ...(sort_order !== undefined && { sort_order }),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;

  return NextResponse.json(data);
}

// Delete page
export async function DELETE(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await request.json();

  await supabase.from("pages").delete().eq("id", id);

  return NextResponse.json({ deleted: true });
}
