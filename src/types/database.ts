export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  plan: "free" | "pro" | "team";
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  pages_created_this_month: number;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  user_id: string;
  name: string;
  slug: string;
  description: string;
  html_content: string;
  meta_title: string | null;
  meta_description: string | null;
  published: boolean;
  custom_domain: string | null;
  thumbnail_url: string | null;
  webhook_url: string | null;
  site_settings: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface Page {
  id: string;
  project_id: string;
  title: string;
  slug: string;
  html_content: string;
  sort_order: number;
  is_home: boolean;
  created_at: string;
  updated_at: string;
}

export interface Variant {
  id: string;
  project_id: string;
  name: string;
  html_content: string;
  traffic_weight: number;
  views: number;
  conversions: number;
  is_winner: boolean;
  created_at: string;
}

export interface Submission {
  id: string;
  project_id: string;
  email: string;
  data: Record<string, unknown>;
  source: string | null;
  created_at: string;
}

export interface ApiKey {
  id: string;
  user_id: string;
  name: string;
  key_prefix: string;
  last_used_at: string | null;
  requests_this_month: number;
  created_at: string;
}

export interface BrandKit {
  id: string;
  user_id: string;
  team_id: string | null;
  name: string;
  logo_url: string | null;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  font_heading: string;
  font_body: string;
  tone: string;
  tagline: string | null;
  created_at: string;
  updated_at: string;
}

export interface Integration {
  id: string;
  project_id: string;
  type: string;
  config: Record<string, unknown>;
  enabled: boolean;
  created_at: string;
}
