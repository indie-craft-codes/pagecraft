import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import dns from "dns/promises";

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

  if (!profile || profile.plan === "free") {
    return NextResponse.json(
      { error: "Custom domains require a Pro or Team plan" },
      { status: 403 }
    );
  }

  const { domain, projectId } = await request.json();

  if (!domain || !projectId) {
    return NextResponse.json(
      { error: "Domain and project ID required" },
      { status: 400 }
    );
  }

  // Verify CNAME points to our domain
  const appDomain = new URL(
    process.env.NEXT_PUBLIC_APP_URL || "https://pagecraft.ai"
  ).hostname;

  try {
    const records = await dns.resolveCname(domain);
    const isValid = records.some(
      (r) => r === appDomain || r === `cname.${appDomain}`
    );

    if (!isValid) {
      return NextResponse.json({
        verified: false,
        message: `CNAME record must point to cname.${appDomain}`,
        currentRecords: records,
      });
    }

    // Update project with custom domain
    const { error } = await supabase
      .from("projects")
      .update({ custom_domain: domain })
      .eq("id", projectId)
      .eq("user_id", user.id);

    if (error) throw error;

    return NextResponse.json({ verified: true, domain });
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENODATA") {
      return NextResponse.json({
        verified: false,
        message: `No CNAME record found. Add a CNAME record for ${domain} pointing to cname.${appDomain}`,
      });
    }
    return NextResponse.json(
      { error: "Failed to verify domain" },
      { status: 500 }
    );
  }
}
