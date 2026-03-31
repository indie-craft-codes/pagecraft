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

  const { teamId, email, role } = await request.json();

  // Verify user is admin of the team
  const { data: membership } = await supabase
    .from("team_members")
    .select("role")
    .eq("team_id", teamId)
    .eq("user_id", user.id)
    .single();

  if (!membership || membership.role !== "admin") {
    return NextResponse.json(
      { error: "Only admins can invite members" },
      { status: 403 }
    );
  }

  // Check if user exists
  const { data: invitedUser } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", email)
    .single();

  const { error } = await supabase.from("team_members").insert({
    team_id: teamId,
    user_id: invitedUser?.id || user.id, // placeholder if user doesn't exist yet
    role: role || "editor",
    invited_email: email,
    accepted: false,
  });

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json(
        { error: "User already invited" },
        { status: 409 }
      );
    }
    throw error;
  }

  return NextResponse.json({ invited: true, email });
}
