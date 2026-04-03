import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { regenerateSection } from "@/lib/ai";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { sectionHtml, instruction, fullPageContext } = await request.json();

  if (!sectionHtml || !instruction) {
    return NextResponse.json(
      { error: "Section HTML and instruction are required" },
      { status: 400 }
    );
  }

  try {
    const html = await regenerateSection(sectionHtml, instruction, fullPageContext);
    return NextResponse.json({ html: html.trim() });
  } catch (err) {
    console.error("Section regeneration error:", err);
    return NextResponse.json(
      { error: "Failed to regenerate section" },
      { status: 500 }
    );
  }
}
