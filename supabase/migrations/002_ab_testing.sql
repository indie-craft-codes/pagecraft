-- ============================================
-- A/B Testing Support
-- ============================================

-- Variants table
create table public.variants (
  id uuid default uuid_generate_v4() primary key,
  project_id uuid references public.projects(id) on delete cascade not null,
  name text not null default 'Variant A',
  html_content text not null default '',
  traffic_weight integer not null default 50 check (traffic_weight >= 0 and traffic_weight <= 100),
  views integer not null default 0,
  conversions integer not null default 0,
  is_winner boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.variants enable row level security;

create policy "Users can view variants of own projects"
  on public.variants for select
  using (
    project_id in (select id from public.projects where user_id = auth.uid())
  );

create policy "Users can create variants for own projects"
  on public.variants for insert
  with check (
    project_id in (select id from public.projects where user_id = auth.uid())
  );

create policy "Users can update variants of own projects"
  on public.variants for update
  using (
    project_id in (select id from public.projects where user_id = auth.uid())
  );

create policy "Users can delete variants of own projects"
  on public.variants for delete
  using (
    project_id in (select id from public.projects where user_id = auth.uid())
  );

-- Public access for published variants (for A/B split)
create policy "Anyone can view variants of published projects"
  on public.variants for select
  using (
    project_id in (select id from public.projects where published = true)
  );

create index idx_variants_project_id on public.variants(project_id);

-- Lead submissions table
create table public.submissions (
  id uuid default uuid_generate_v4() primary key,
  project_id uuid references public.projects(id) on delete cascade not null,
  email text not null,
  data jsonb default '{}'::jsonb,
  source text, -- 'form', 'popup', etc
  created_at timestamptz not null default now()
);

alter table public.submissions enable row level security;

create policy "Users can view submissions of own projects"
  on public.submissions for select
  using (
    project_id in (select id from public.projects where user_id = auth.uid())
  );

-- Allow anonymous inserts for lead capture
create policy "Anyone can submit to published projects"
  on public.submissions for insert
  with check (
    project_id in (select id from public.projects where published = true)
  );

create index idx_submissions_project_id on public.submissions(project_id);

-- Referrals table
create table public.referrals (
  id uuid default uuid_generate_v4() primary key,
  referrer_id uuid references auth.users(id) on delete cascade not null,
  referred_id uuid references auth.users(id) on delete set null,
  referral_code text unique not null,
  status text not null default 'pending' check (status in ('pending', 'signed_up', 'converted', 'rewarded')),
  created_at timestamptz not null default now()
);

alter table public.referrals enable row level security;

create policy "Users can view own referrals"
  on public.referrals for select
  using (auth.uid() = referrer_id);

create policy "Users can create referrals"
  on public.referrals for insert
  with check (auth.uid() = referrer_id);

create index idx_referrals_referrer on public.referrals(referrer_id);
create index idx_referrals_code on public.referrals(referral_code);
