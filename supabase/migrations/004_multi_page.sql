-- ============================================
-- Multi-page support: pages within a project
-- ============================================

create table public.pages (
  id uuid default uuid_generate_v4() primary key,
  project_id uuid references public.projects(id) on delete cascade not null,
  title text not null default 'Untitled',
  slug text not null default 'page',
  html_content text not null default '',
  sort_order integer not null default 0,
  is_home boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(project_id, slug)
);

alter table public.pages enable row level security;

create policy "Users can manage pages of own projects"
  on public.pages for all
  using (
    project_id in (select id from public.projects where user_id = auth.uid())
  );

create policy "Anyone can view pages of published projects"
  on public.pages for select
  using (
    project_id in (select id from public.projects where published = true)
  );

create index idx_pages_project on public.pages(project_id);

create trigger set_pages_updated_at
  before update on public.pages
  for each row execute procedure public.update_updated_at();

-- Add site-level settings to projects
alter table public.projects add column if not exists site_settings jsonb default '{}'::jsonb;
