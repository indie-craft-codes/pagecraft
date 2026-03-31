import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export async function POST(request: Request) {
  const { variantId, type } = await request.json();

  if (!variantId || !type) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const supabase = getSupabase();

  if (type === "view") {
    const { error } = await supabase.rpc("increment_variant_views", {
      variant_id: variantId,
    });
    if (error) {
      console.error("Failed to track view:", error);
      return NextResponse.json({ error: "Failed to track" }, { status: 500 });
    }
  } else if (type === "conversion") {
    const { error } = await supabase.rpc("increment_variant_conversions", {
      variant_id: variantId,
    });
    if (error) {
      console.error("Failed to track conversion:", error);
      return NextResponse.json({ error: "Failed to track" }, { status: 500 });
    }
  } else {
    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
