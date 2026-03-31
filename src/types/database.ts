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
  created_at: string;
  updated_at: string;
}
