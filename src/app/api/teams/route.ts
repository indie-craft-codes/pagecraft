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

  if (error) throw error;

  // Add owner as admin member
  await supabase.from("team_members").insert({
    team_id: team.id,
    user_id: user.id,
    role: "admin",
    accepted: true,
  });

  return NextResponse.json(team);
}
