-- ============================================
-- API Keys
-- ============================================
create table public.api_keys (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null default 'Default',
  key_hash text unique not null,
  key_prefix text not null, -- first 8 chars for display
  last_used_at timestamptz,
  requests_this_month integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.api_keys enable row level security;

create policy "Users can manage own API keys"
  on public.api_keys for all
  using (auth.uid() = user_id);

create index idx_api_keys_hash on public.api_keys(key_hash);

-- ============================================
-- Teams
-- ============================================
create table public.teams (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  owner_id uuid references auth.users(id) on delete cascade not null,
  created_at timestamptz not null default now()
);

alter table public.teams enable row level security;

create table public.team_members (
  id uuid default uuid_generate_v4() primary key,
  team_id uuid references public.teams(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  role text not null default 'editor' check (role in ('admin', 'editor', 'viewer')),
  invited_email text,
  accepted boolean not null default false,
  created_at timestamptz not null default now(),
  unique(team_id, user_id)
);

alter table public.team_members enable row level security;

-- Team members can see their own teams
create policy "Team members can view team"
  on public.teams for select
  using (
    id in (select team_id from public.team_members where user_id = auth.uid())
    or owner_id = auth.uid()
  );

create policy "Owners can update team"
  on public.teams for update
  using (owner_id = auth.uid());

create policy "Users can create teams"
  on public.teams for insert
  with check (auth.uid() = owner_id);

create policy "Team members can view members"
  on public.team_members for select
  using (
    team_id in (select team_id from public.team_members where user_id = auth.uid())
  );

create policy "Admins can manage members"
  on public.team_members for all
  using (
    team_id in (
      select team_id from public.team_members
      where user_id = auth.uid() and role = 'admin'
    )
  );

-- ============================================
-- Brand Kit
-- ============================================
create table public.brand_kits (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  team_id uuid references public.teams(id) on delete cascade,
  name text not null default 'Default',
  logo_url text,
  primary_color text default '#4f46e5',
  secondary_color text default '#7c3aed',
  accent_color text default '#06b6d4',
  font_heading text default 'Inter',
  font_body text default 'Inter',
  tone text default 'professional',
  tagline text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.brand_kits enable row level security;

create policy "Users can manage own brand kits"
  on public.brand_kits for all
  using (auth.uid() = user_id);

-- ============================================
-- Page Analytics Events
-- ============================================
create table public.page_events (
  id uuid default uuid_generate_v4() primary key,
  project_id uuid references public.projects(id) on delete cascade not null,
  event_type text not null check (event_type in ('view', 'click', 'conversion')),
  visitor_id text, -- anonymous hash
  country text,
  device text,
  referrer text,
  created_at timestamptz not null default now()
);

alter table public.page_events enable row level security;

create policy "Users can view events for own projects"
  on public.page_events for select
  using (
    project_id in (select id from public.projects where user_id = auth.uid())
  );

-- Allow anonymous inserts for tracking
create policy "Anyone can insert events for published projects"
  on public.page_events for insert
  with check (
    project_id in (select id from public.projects where published = true)
  );

create index idx_page_events_project on public.page_events(project_id);
create index idx_page_events_created on public.page_events(created_at);

-- Add webhook_url column to projects
alter table public.projects add column if not exists webhook_url text;
