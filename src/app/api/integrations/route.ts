import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

async function verifyProjectOwnership(
  supabase: Awaited<ReturnType<typeof createClient>>,
  projectId: string,
  userId: string
): Promise<boolean> {
  const { data } = await supabase
    .from("projects")
    .select("id")
    .eq("id", projectId)
    .eq("user_id", userId)
    .single();
  return !!data;
}

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

  if (!(await verifyProjectOwnership(supabase, projectId, user.id))) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { data } = await supabase
    .from("integrations")
    .select("*")
    .eq("project_id", projectId);

  return NextResponse.json(data || []);
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { projectId, type, config } = await request.json();

  if (!(await verifyProjectOwnership(supabase, projectId, user.id))) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { data, error } = await supabase
    .from("integrations")
    .upsert(
      {
        project_id: projectId,
        type,
        config: config || {},
        enabled: true,
      },
      { onConflict: "project_id,type" }
    )
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: "Failed to save integration" }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function DELETE(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await request.json();

  // Verify ownership via integration -> project -> user
  const { data: integration } = await supabase
    .from("integrations")
    .select("project_id")
    .eq("id", id)
    .single();

  if (
    !integration ||
    !(await verifyProjectOwnership(supabase, integration.project_id, user.id))
  ) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await supabase.from("integrations").delete().eq("id", id);

  return NextResponse.json({ deleted: true });
}
