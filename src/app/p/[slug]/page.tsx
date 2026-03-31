import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PageWithBadge } from "./page-with-badge";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { data: project } = await getSupabase()
    .from("projects")
    .select("meta_title, meta_description")
    .eq("slug", slug)
    .eq("published", true)
    .single();

  if (!project) return {};

  return {
    title: project.meta_title,
    description: project.meta_description,
  };
}

export default async function PublicPage({ params }: Props) {
  const { slug } = await params;
  const { data: project } = await getSupabase()
    .from("projects")
    .select("html_content, published, user_id")
    .eq("slug", slug)
    .eq("published", true)
    .single();

  if (!project) notFound();

  // Check user plan to decide badge visibility
  const { data: profile } = await getSupabase()
    .from("profiles")
    .select("plan")
    .eq("id", project.user_id)
    .single();

  const showBadge = !profile || profile.plan === "free";

  return (
    <PageWithBadge
      htmlContent={project.html_content}
      showBadge={showBadge}
      slug={slug}
    />
  );
}
