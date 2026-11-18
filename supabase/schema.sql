-- One row per user holding the whole app state as JSON.
create table public.user_state (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
alter table public.user_state enable row level security;

-- Each signed-in user can only see and change their own row.
create policy "read own state" on public.user_state for select to authenticated using ((select auth.uid()) = user_id);
create policy "insert own state" on public.user_state for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "update own state" on public.user_state for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "delete own state" on public.user_state for delete to authenticated using ((select auth.uid()) = user_id);

-- Live updates between a user's devices.
alter publication supabase_realtime add table public.user_state;
