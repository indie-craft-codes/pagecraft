-- ============================================
-- Project Integrations
-- ============================================

create table public.integrations (
  id uuid default uuid_generate_v4() primary key,
  project_id uuid references public.projects(id) on delete cascade not null,
  type text not null check (type in (
    'google_analytics', 'google_tag_manager',
    'facebook_pixel', 'tiktok_pixel',
    'zapier_webhook', 'custom_webhook',
    'mailchimp', 'convertkit'
  )),
  config jsonb not null default '{}'::jsonb,
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  unique(project_id, type)
);

alter table public.integrations enable row level security;

create policy "Users can manage integrations of own projects"
  on public.integrations for all
  using (
    project_id in (select id from public.projects where user_id = auth.uid())
  );

create index idx_integrations_project on public.integrations(project_id);
