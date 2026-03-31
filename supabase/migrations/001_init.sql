-- ============================================
-- PageCraft Database Schema
-- ============================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================
-- Profiles table (extends Supabase auth.users)
-- ============================================
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null,
  full_name text,
  avatar_url text,
  plan text not null default 'free' check (plan in ('free', 'pro', 'team')),
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  pages_created_this_month integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Enable RLS
alter table public.profiles enable row level security;

-- Users can read and update their own profile
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- ============================================
-- Projects table
-- ============================================
create table public.projects (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  slug text unique not null,
  description text not null default '',
  html_content text not null default '',
  meta_title text,
  meta_description text,
  published boolean not null default false,
  custom_domain text unique,
  thumbnail_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Enable RLS
alter table public.projects enable row level security;

-- Users can CRUD their own projects
create policy "Users can view own projects"
  on public.projects for select
  using (auth.uid() = user_id);

create policy "Users can create projects"
  on public.projects for insert
  with check (auth.uid() = user_id);

create policy "Users can update own projects"
  on public.projects for update
  using (auth.uid() = user_id);

create policy "Users can delete own projects"
  on public.projects for delete
  using (auth.uid() = user_id);

-- Public can view published projects (for /p/[slug] pages)
create policy "Anyone can view published projects"
  on public.projects for select
  using (published = true);

-- ============================================
-- Indexes
-- ============================================
create index idx_projects_user_id on public.projects(user_id);
create index idx_projects_slug on public.projects(slug);
create index idx_projects_published on public.projects(published) where published = true;

-- ============================================
-- Auto-create profile on user signup
-- ============================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'avatar_url', '')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================
-- Reset monthly page count (run via cron)
-- ============================================
create or replace function public.reset_monthly_page_count()
returns void
language plpgsql
security definer
as $$
begin
  update public.profiles set pages_created_this_month = 0;
end;
$$;

-- ============================================
-- Auto-update updated_at timestamp
-- ============================================
create or replace function public.update_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.update_updated_at();

create trigger set_projects_updated_at
  before update on public.projects
  for each row execute procedure public.update_updated_at();
