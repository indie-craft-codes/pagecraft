import { createClient } from "@supabase/supabase-js";
import { createHash } from "crypto";

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export function hashApiKey(key: string): string {
  return createHash("sha256").update(key).digest("hex");
}

export function generateApiKey(): { key: string; prefix: string } {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let key = "pc_";
  for (let i = 0; i < 40; i++) {
    key += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return { key, prefix: key.slice(0, 11) };
}

export async function validateApiKey(
  key: string
): Promise<{ userId: string; plan: string } | null> {
  const hash = hashApiKey(key);
  const supabase = getSupabaseAdmin();

  const { data: apiKey } = await supabase
    .from("api_keys")
    .select("user_id")
    .eq("key_hash", hash)
    .single();

  if (!apiKey) return null;

  // Update last used
  await supabase
    .from("api_keys")
    .update({ last_used_at: new Date().toISOString() })
    .eq("key_hash", hash);

  // Get user plan
  const { data: profile } = await supabase
    .from("profiles")
    .select("plan")
    .eq("id", apiKey.user_id)
    .single();

  if (!profile || profile.plan !== "team") return null;

  return { userId: apiKey.user_id, plan: profile.plan };
}
