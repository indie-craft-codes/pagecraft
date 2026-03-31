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

  const { data } = await supabase
    .from("brand_kits")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

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

  const { data: profile } = await supabase
    .from("profiles")
    .select("plan")
    .eq("id", user.id)
    .single();

  if (!profile || profile.plan === "free") {
    return NextResponse.json(
      { error: "Brand kit requires a Pro or Team plan" },
      { status: 403 }
    );
  }

  const body = await request.json();

  const { data, error } = await supabase
    .from("brand_kits")
    .upsert({
      user_id: user.id,
      name: body.name || "Default",
      logo_url: body.logoUrl,
      primary_color: body.primaryColor || "#4f46e5",
      secondary_color: body.secondaryColor || "#7c3aed",
      accent_color: body.accentColor || "#06b6d4",
      font_heading: body.fontHeading || "Inter",
      font_body: body.fontBody || "Inter",
      tone: body.tone || "professional",
      tagline: body.tagline,
    })
    .select()
    .single();

  if (error) throw error;

  return NextResponse.json(data);
}
