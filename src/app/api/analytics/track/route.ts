import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export async function POST(request: Request) {
  const { projectId, eventType, visitorId, referrer } = await request.json();

  if (!projectId || !eventType) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  // Get country/device from headers
  const country = request.headers.get("cf-ipcountry") || "unknown";
  const userAgent = request.headers.get("user-agent") || "";
  const device = /mobile/i.test(userAgent)
    ? "mobile"
    : /tablet/i.test(userAgent)
      ? "tablet"
      : "desktop";

  const supabase = getSupabase();

  const { error } = await supabase.from("page_events").insert({
    project_id: projectId,
    event_type: eventType,
    visitor_id: visitorId,
    country,
    device,
    referrer: referrer || null,
  });

  if (error) {
    console.error("Analytics track error:", error);
    return NextResponse.json({ error: "Failed to track event" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
