import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get teams where user is a member
  const { data: memberships } = await supabase
    .from("team_members")
    .select("team_id, role, teams(id, name, owner_id)")
    .eq("user_id", user.id)
    .eq("accepted", true);

  return NextResponse.json(memberships || []);
}

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

  if (!profile || profile.plan !== "team") {
    return NextResponse.json(
      { error: "Team workspaces require a Team plan" },
      { status: 403 }
    );
  }

  const { name } = await request.json();

  const { data: team, error } = await supabase
    .from("teams")
    .insert({ name, owner_id: user.id })
    .select()
    .single();

  if (error) {
    console.error("Team creation error:", error);
    return NextResponse.json({ error: "Failed to create team" }, { status: 500 });
  }

  // Add owner as admin member
  const { error: memberError } = await supabase.from("team_members").insert({
    team_id: team.id,
    user_id: user.id,
    role: "admin",
    accepted: true,
  });

  if (memberError) {
    console.error("Team member creation error:", memberError);
    // Clean up: delete the team if we can't add the owner
    await supabase.from("teams").delete().eq("id", team.id);
    return NextResponse.json({ error: "Failed to set up team" }, { status: 500 });
  }

  return NextResponse.json(team);
}
