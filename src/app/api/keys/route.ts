import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateApiKey, hashApiKey } from "@/lib/api-auth";

// List API keys
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: keys } = await supabase
    .from("api_keys")
    .select("id, name, key_prefix, last_used_at, requests_this_month, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return NextResponse.json(keys || []);
}

// Create API key
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check plan
  const { data: profile } = await supabase
    .from("profiles")
    .select("plan")
    .eq("id", user.id)
    .single();

  if (!profile || profile.plan !== "team") {
    return NextResponse.json(
      { error: "API keys require a Team plan" },
      { status: 403 }
    );
  }

  const { name } = await request.json();
  const { key, prefix } = generateApiKey();
  const keyHash = hashApiKey(key);

  const { error } = await supabase.from("api_keys").insert({
    user_id: user.id,
    name: name || "Default",
    key_hash: keyHash,
    key_prefix: prefix,
  });

  if (error) {
    return NextResponse.json(
      { error: "Failed to create API key" },
      { status: 500 }
    );
  }

  // Return the full key ONLY on creation (never stored in plain text)
  return NextResponse.json({ key, prefix, name: name || "Default" });
}

// Delete API key
export async function DELETE(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await request.json();

  await supabase
    .from("api_keys")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  return NextResponse.json({ deleted: true });
}
