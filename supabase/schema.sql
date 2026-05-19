-- DuoLove — Schema SQL completo
-- Execute este arquivo no SQL Editor do Supabase Dashboard

-- =============================================
-- EXTENSIONS
-- =============================================
create extension if not exists "uuid-ossp";

-- =============================================
-- TABELAS
-- =============================================

-- Tabela de perfis de usuários (extende auth.users do Supabase)
create table if not exists public.users (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null,
  name text not null,
  avatar_url text,
  created_at timestamptz default now() not null
);

-- Tabela de casais
create table if not exists public.couples (
  id uuid default uuid_generate_v4() primary key,
  user1_id uuid references public.users(id) on delete cascade not null,
  user2_id uuid references public.users(id) on delete set null,
  start_date date,
  theme text default 'rose' check (theme in ('rose', 'lilac', 'wine')),
  plan text default 'free' check (plan in ('free', 'premium')),
  created_at timestamptz default now() not null
);

-- Tabela de convites de casal
create table if not exists public.couple_invites (
  id uuid default uuid_generate_v4() primary key,
  couple_id uuid references public.couples(id) on delete cascade not null,
  inviter_id uuid references public.users(id) on delete cascade not null,
  token text unique not null,
  expires_at timestamptz not null,
  accepted_at timestamptz,
  created_at timestamptz default now() not null
);

-- Tabela de eventos
create table if not exists public.events (
  id uuid default uuid_generate_v4() primary key,
  couple_id uuid references public.couples(id) on delete cascade not null,
  creator_id uuid references public.users(id) on delete cascade not null,
  title text not null,
  description text,
  start_at timestamptz not null,
  end_at timestamptz not null,
  type text default 'couple' check (type in ('personal', 'couple', 'anniversary', 'travel')),
  color text default '#E91E8C',
  visibility text default 'shared' check (visibility in ('private', 'shared')),
  created_at timestamptz default now() not null
);

-- Tabela de memórias
create table if not exists public.memories (
  id uuid default uuid_generate_v4() primary key,
  couple_id uuid references public.couples(id) on delete cascade not null,
  creator_id uuid references public.users(id) on delete cascade not null,
  title text not null,
  description text,
  photo_url text,
  date date not null,
  tags text[] default '{}',
  created_at timestamptz default now() not null
);

-- Tabela de cápsulas do tempo
create table if not exists public.capsules (
  id uuid default uuid_generate_v4() primary key,
  couple_id uuid references public.couples(id) on delete cascade not null,
  creator_id uuid references public.users(id) on delete cascade not null,
  message text not null,
  reveal_at timestamptz not null,
  revealed_at timestamptz,
  created_at timestamptz default now() not null
);

-- Tabela de mensagens
create table if not exists public.messages (
  id uuid default uuid_generate_v4() primary key,
  couple_id uuid references public.couples(id) on delete cascade not null,
  sender_id uuid references public.users(id) on delete cascade not null,
  event_id uuid references public.events(id) on delete set null,
  content text not null,
  created_at timestamptz default now() not null
);

-- Tabela de reações
create table if not exists public.message_reactions (
  id uuid default uuid_generate_v4() primary key,
  message_id uuid references public.messages(id) on delete cascade not null,
  user_id uuid references public.users(id) on delete cascade not null,
  emoji text not null,
  created_at timestamptz default now() not null,
  unique(message_id, user_id, emoji)
);

-- Tabela de push tokens (Expo Push Notifications)
create table if not exists public.push_tokens (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  token text not null,
  notify_events boolean default true not null,
  notify_messages boolean default true not null,
  notify_capsules boolean default true not null,
  notify_invites boolean default true not null,
  created_at timestamptz default now() not null,
  unique(user_id, token)
);

-- Tabela de assinaturas
create table if not exists public.subscriptions (
  id uuid default uuid_generate_v4() primary key,
  couple_id uuid references public.couples(id) on delete cascade not null unique,
  stripe_customer_id text,
  stripe_subscription_id text,
  plan text default 'free' check (plan in ('free', 'premium')),
  status text default 'active' check (status in ('active', 'canceled', 'past_due', 'trialing')),
  current_period_end timestamptz,
  created_at timestamptz default now() not null
);

-- =============================================
-- FUNÇÃO: criar perfil ao cadastrar usuário
-- =============================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.users (id, email, name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

-- Trigger que dispara handle_new_user ao criar auth.user
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================

alter table public.users enable row level security;
alter table public.push_tokens enable row level security;
alter table public.couples enable row level security;
alter table public.couple_invites enable row level security;
alter table public.events enable row level security;
alter table public.memories enable row level security;
alter table public.capsules enable row level security;
alter table public.messages enable row level security;
alter table public.message_reactions enable row level security;
alter table public.subscriptions enable row level security;

-- Função helper: retorna o couple_id do usuário autenticado
create or replace function public.get_user_couple_id()
returns uuid
language sql
security definer
as $$
  select id from public.couples
  where user1_id = auth.uid() or user2_id = auth.uid()
  limit 1;
$$;

-- push_tokens: cada usuário gerencia seus próprios tokens
create policy "push_tokens: select own" on public.push_tokens
  for select using (user_id = auth.uid());

create policy "push_tokens: insert own" on public.push_tokens
  for insert with check (user_id = auth.uid());

create policy "push_tokens: update own" on public.push_tokens
  for update using (user_id = auth.uid());

create policy "push_tokens: delete own" on public.push_tokens
  for delete using (user_id = auth.uid());

-- users: cada usuário vê e edita apenas o próprio perfil
create policy "users: select own" on public.users
  for select using (id = auth.uid());

create policy "users: update own" on public.users
  for update using (id = auth.uid());

-- couples: membros do casal podem ver e editar
create policy "couples: select own" on public.couples
  for select using (user1_id = auth.uid() or user2_id = auth.uid());

create policy "couples: insert own" on public.couples
  for insert with check (user1_id = auth.uid());

create policy "couples: update own" on public.couples
  for update using (user1_id = auth.uid() or user2_id = auth.uid());

-- couple_invites: apenas o casal envolvido acessa
create policy "invites: select" on public.couple_invites
  for select using (couple_id = get_user_couple_id());

create policy "invites: insert" on public.couple_invites
  for insert with check (inviter_id = auth.uid());

create policy "invites: update" on public.couple_invites
  for update using (couple_id = get_user_couple_id());

-- events: membros do casal acessam eventos do casal
-- eventos privados só são visíveis pelo criador
create policy "events: select" on public.events
  for select using (
    couple_id = get_user_couple_id()
    and (visibility = 'shared' or creator_id = auth.uid())
  );

create policy "events: insert" on public.events
  for insert with check (
    couple_id = get_user_couple_id()
    and creator_id = auth.uid()
  );

create policy "events: update" on public.events
  for update using (creator_id = auth.uid());

create policy "events: delete" on public.events
  for delete using (creator_id = auth.uid());

-- memories
create policy "memories: select" on public.memories
  for select using (couple_id = get_user_couple_id());

create policy "memories: insert" on public.memories
  for insert with check (
    couple_id = get_user_couple_id()
    and creator_id = auth.uid()
  );

create policy "memories: delete" on public.memories
  for delete using (creator_id = auth.uid());

-- capsules: membros veem, cápsulas não reveladas ficam "fechadas" (app controla)
create policy "capsules: select" on public.capsules
  for select using (couple_id = get_user_couple_id());

create policy "capsules: insert" on public.capsules
  for insert with check (
    couple_id = get_user_couple_id()
    and creator_id = auth.uid()
  );

-- messages
create policy "messages: select" on public.messages
  for select using (couple_id = get_user_couple_id());

create policy "messages: insert" on public.messages
  for insert with check (
    couple_id = get_user_couple_id()
    and sender_id = auth.uid()
  );

-- message_reactions
create policy "reactions: select" on public.message_reactions
  for select using (
    message_id in (
      select id from public.messages where couple_id = get_user_couple_id()
    )
  );

create policy "reactions: insert" on public.message_reactions
  for insert with check (user_id = auth.uid());

create policy "reactions: delete" on public.message_reactions
  for delete using (user_id = auth.uid());

-- subscriptions
create policy "subscriptions: select" on public.subscriptions
  for select using (couple_id = get_user_couple_id());

-- =============================================
-- ÍNDICES para performance
-- =============================================
create index if not exists idx_events_couple_id on public.events(couple_id);
create index if not exists idx_events_start_at on public.events(start_at);
create index if not exists idx_messages_couple_id on public.messages(couple_id);
create index if not exists idx_messages_created_at on public.messages(created_at);
create index if not exists idx_memories_couple_id on public.memories(couple_id);
create index if not exists idx_memories_date on public.memories(date);
create index if not exists idx_couple_invites_token on public.couple_invites(token);
create index if not exists idx_capsules_couple_id on public.capsules(couple_id);
create index if not exists idx_push_tokens_user_id on public.push_tokens(user_id);
create index if not exists idx_message_reactions_message_id on public.message_reactions(message_id);

-- =============================================
-- STORAGE — bucket 'memories'
-- =============================================
-- Execute no Supabase Dashboard > Storage > New Bucket:
-- Nome: memories, Public: true

-- Políticas RLS do bucket (executar no SQL Editor):
insert into storage.buckets (id, name, public)
values ('memories', 'memories', true)
on conflict (id) do nothing;

create policy "memories storage: select"
  on storage.objects for select
  using (bucket_id = 'memories' and auth.uid() is not null);

create policy "memories storage: insert"
  on storage.objects for insert
  with check (
    bucket_id = 'memories'
    and auth.uid() is not null
    and (storage.foldername(name))[1] = (get_user_couple_id())::text
  );

create policy "memories storage: delete"
  on storage.objects for delete
  using (
    bucket_id = 'memories'
    and auth.uid() is not null
    and (storage.foldername(name))[1] = (get_user_couple_id())::text
  );
