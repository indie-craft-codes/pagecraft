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
    await supabase.rpc("increment_variant_views", { variant_id: variantId });
  } else if (type === "conversion") {
    await supabase.rpc("increment_variant_conversions", {
      variant_id: variantId,
    });
  }

  return NextResponse.json({ ok: true });
}
