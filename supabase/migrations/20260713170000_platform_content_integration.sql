-- Integracion completa del contenido administrable de ReActiva con Supabase.
-- Es idempotente: conserva las filas existentes y solo agrega estructura faltante.

create extension if not exists pgcrypto;

create or replace function public.is_platform_admin(user_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles
    where id = user_id
      and role::text in ('admin', 'superadmin')
  );
$$;

revoke all on function public.is_platform_admin(uuid) from public;
grant execute on function public.is_platform_admin(uuid) to authenticated;

create table if not exists public.content_items (
  id uuid primary key default gen_random_uuid(),
  kind text not null,
  title text not null,
  description text not null default '',
  category text not null default 'General',
  tags text[] not null default '{}',
  url text,
  thumbnail_url text,
  active boolean not null default false,
  featured boolean not null default false,
  sort_order integer not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.content_items add column if not exists kind text;
alter table public.content_items add column if not exists title text;
alter table public.content_items add column if not exists description text default '';
alter table public.content_items add column if not exists category text default 'General';
alter table public.content_items add column if not exists tags text[] default '{}';
alter table public.content_items add column if not exists url text;
alter table public.content_items add column if not exists thumbnail_url text;
alter table public.content_items add column if not exists active boolean default false;
alter table public.content_items add column if not exists featured boolean default false;
alter table public.content_items add column if not exists sort_order integer default 0;
alter table public.content_items add column if not exists metadata jsonb default '{}'::jsonb;
alter table public.content_items add column if not exists created_at timestamptz default now();
alter table public.content_items add column if not exists updated_at timestamptz default now();

-- Algunas instalaciones anteriores crearon kind con el enum public.content_kind.
-- La aplicacion y la RPC actuales trabajan con texto; normalizamos la columna para
-- evitar errores al guardar contenido nuevo o tipos agregados en el futuro.
alter table public.content_items
  alter column kind drop default;
alter table public.content_items
  alter column kind type text using kind::text;

create index if not exists content_items_kind_active_idx
  on public.content_items (kind, active, sort_order, created_at);

create table if not exists public.content_item_tombstones (
  source_id text not null,
  kind text not null,
  deleted_at timestamptz not null default now(),
  primary key (source_id, kind)
);

create table if not exists public.content_categories (
  id uuid primary key default gen_random_uuid(),
  kind text not null default 'academy',
  name text not null,
  normalized_name text generated always as (lower(trim(name))) stored,
  sort_order integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (kind, normalized_name)
);

create table if not exists public.video_unlock_schedule (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references public.companies(id) on delete cascade,
  day_label text not null,
  block text not null,
  enabled boolean not null default false,
  unlock_time time not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_content_progress (
  profile_id uuid not null references public.profiles(id) on delete cascade,
  content_key text not null,
  viewed_at timestamptz not null default now(),
  primary key (profile_id, content_key)
);

create table if not exists public.email_automation_templates (
  id text primary key,
  subject text not null,
  body text not null,
  updated_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists video_unlock_schedule_scope_idx
  on public.video_unlock_schedule (coalesce(company_id, '00000000-0000-0000-0000-000000000000'::uuid), day_label, block);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists content_items_touch_updated_at on public.content_items;
create trigger content_items_touch_updated_at
before update on public.content_items
for each row execute function public.touch_updated_at();

drop trigger if exists content_categories_touch_updated_at on public.content_categories;
create trigger content_categories_touch_updated_at
before update on public.content_categories
for each row execute function public.touch_updated_at();

drop trigger if exists video_unlock_schedule_touch_updated_at on public.video_unlock_schedule;
create trigger video_unlock_schedule_touch_updated_at
before update on public.video_unlock_schedule
for each row execute function public.touch_updated_at();

drop trigger if exists email_automation_templates_touch_updated_at on public.email_automation_templates;
create trigger email_automation_templates_touch_updated_at
before update on public.email_automation_templates
for each row execute function public.touch_updated_at();

-- Elimina versiones antiguas de esta RPC cuyo segundo parametro usaba un enum
-- (por ejemplo public.content_kind). PostgREST no puede elegir entre ese overload
-- y la version text cuando recibe los argumentos como JSON.
do $$
declare
  legacy_function record;
begin
  for legacy_function in
    select p.oid::regprocedure as signature
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname = 'save_content_item'
      and coalesce(p.proargtypes[1], 0::oid) <> 'text'::regtype
  loop
    execute format('drop function if exists %s', legacy_function.signature);
  end loop;
end $$;

create or replace function public.save_content_item(
  item_id uuid,
  item_kind text,
  item_title text,
  item_description text,
  item_category text,
  item_tags text[],
  item_url text,
  item_thumbnail_url text,
  item_active boolean,
  item_featured boolean,
  item_sort_order integer,
  item_metadata jsonb
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  saved_id uuid := coalesce(item_id, gen_random_uuid());
begin
  if not public.is_platform_admin(auth.uid()) then
    raise exception 'No tenes permisos para administrar contenido.';
  end if;

  insert into public.content_items (
    id, kind, title, description, category, tags, url, thumbnail_url,
    active, featured, sort_order, metadata
  ) values (
    saved_id, item_kind, trim(item_title), coalesce(item_description, ''),
    coalesce(nullif(trim(item_category), ''), 'General'), coalesce(item_tags, '{}'),
    nullif(trim(item_url), ''), nullif(trim(item_thumbnail_url), ''),
    coalesce(item_active, false), coalesce(item_featured, false),
    coalesce(item_sort_order, 0), coalesce(item_metadata, '{}'::jsonb)
  )
  on conflict (id) do update set
    kind = excluded.kind,
    title = excluded.title,
    description = excluded.description,
    category = excluded.category,
    tags = excluded.tags,
    url = excluded.url,
    thumbnail_url = excluded.thumbnail_url,
    active = excluded.active,
    featured = excluded.featured,
    sort_order = excluded.sort_order,
    metadata = excluded.metadata;

  delete from public.content_item_tombstones
  where source_id = coalesce(item_metadata->>'sourceId', saved_id::text)
    and kind = item_kind;

  return saved_id;
end;
$$;

create or replace function public.delete_content_item(item_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_platform_admin(auth.uid()) then
    raise exception 'No tenes permisos para eliminar contenido.';
  end if;
  insert into public.content_item_tombstones (source_id, kind)
  select coalesce(metadata->>'sourceId', id::text), kind
  from public.content_items
  where id = item_id
  on conflict (source_id, kind) do update set deleted_at = now();

  delete from public.content_items where id = item_id;
end;
$$;

create or replace function public.save_content_category(category_name text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare saved_id uuid;
begin
  if not public.is_platform_admin(auth.uid()) then
    raise exception 'No tenes permisos para administrar categorias.';
  end if;
  if nullif(trim(category_name), '') is null then
    raise exception 'La categoria no puede estar vacia.';
  end if;

  insert into public.content_categories (kind, name)
  values ('academy', trim(category_name))
  on conflict (kind, normalized_name) do update set active = true, name = excluded.name
  returning id into saved_id;
  return saved_id;
end;
$$;

create or replace function public.rename_content_category(old_name text, new_name text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_platform_admin(auth.uid()) then
    raise exception 'No tenes permisos para administrar categorias.';
  end if;
  if nullif(trim(new_name), '') is null then
    raise exception 'La categoria no puede estar vacia.';
  end if;

  update public.content_items
  set category = trim(new_name)
  where kind = 'workshop' and lower(trim(category)) = lower(trim(old_name));

  delete from public.content_categories
  where kind = 'academy' and lower(trim(name)) = lower(trim(new_name));

  update public.content_categories
  set name = trim(new_name), active = true
  where kind = 'academy' and lower(trim(name)) = lower(trim(old_name));

  if not found then
    insert into public.content_categories (kind, name) values ('academy', trim(new_name));
  end if;
end;
$$;

create or replace function public.delete_content_category(
  category_name text,
  replacement_name text default 'Sin categoria'
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_platform_admin(auth.uid()) then
    raise exception 'No tenes permisos para administrar categorias.';
  end if;

  update public.content_items
  set category = replacement_name
  where kind = 'workshop' and lower(trim(category)) = lower(trim(category_name));

  delete from public.content_categories
  where kind = 'academy' and lower(trim(name)) = lower(trim(category_name));

  if exists (select 1 from public.content_items where kind = 'workshop' and category = replacement_name) then
    insert into public.content_categories (kind, name)
    values ('academy', replacement_name)
    on conflict (kind, normalized_name) do update set active = true;
  end if;
end;
$$;

create or replace function public.save_video_unlock_schedule(schedule jsonb)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare entry jsonb;
declare entry_company uuid;
begin
  if not public.is_platform_admin(auth.uid()) then
    raise exception 'No tenes permisos para programar videos.';
  end if;

  for entry in select value from jsonb_array_elements(coalesce(schedule, '[]'::jsonb)) loop
    entry_company := nullif(entry->>'company_id', '')::uuid;
    insert into public.video_unlock_schedule (company_id, day_label, block, enabled, unlock_time)
    values (
      entry_company,
      entry->>'day_label',
      entry->>'block',
      coalesce((entry->>'enabled')::boolean, false),
      (entry->>'unlock_time')::time
    )
    on conflict ((coalesce(company_id, '00000000-0000-0000-0000-000000000000'::uuid)), day_label, block)
    do update set enabled = excluded.enabled, unlock_time = excluded.unlock_time;
  end loop;
end;
$$;

create or replace function public.record_content_view(content_key text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'Inicia sesion para guardar el progreso.';
  end if;
  if nullif(trim(content_key), '') is null then
    raise exception 'El contenido no puede estar vacio.';
  end if;

  insert into public.user_content_progress (profile_id, content_key, viewed_at)
  values (auth.uid(), trim(content_key), now())
  on conflict (profile_id, content_key) do update set viewed_at = excluded.viewed_at;
end;
$$;

create or replace function public.save_email_automation_template(
  template_id text,
  template_subject text,
  template_body text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null or not public.is_platform_admin(auth.uid()) then
    raise exception 'No tenes permisos para administrar plantillas de email.';
  end if;
  if template_id <> 'pause-reminder' then
    raise exception 'La plantilla indicada no puede modificarse desde este panel.';
  end if;
  if nullif(trim(template_subject), '') is null or nullif(trim(template_body), '') is null then
    raise exception 'Completa el asunto y el cuerpo del email.';
  end if;

  insert into public.email_automation_templates (id, subject, body, updated_by)
  values (template_id, trim(template_subject), trim(template_body), auth.uid())
  on conflict (id) do update set
    subject = excluded.subject,
    body = excluded.body,
    updated_by = excluded.updated_by;
end;
$$;

alter table public.content_items enable row level security;
alter table public.content_item_tombstones enable row level security;
alter table public.content_categories enable row level security;
alter table public.video_unlock_schedule enable row level security;
alter table public.user_content_progress enable row level security;
alter table public.email_automation_templates enable row level security;

drop policy if exists content_items_read_authenticated on public.content_items;
create policy content_items_read_authenticated on public.content_items
for select to authenticated using (true);

drop policy if exists content_item_tombstones_read_authenticated on public.content_item_tombstones;
create policy content_item_tombstones_read_authenticated on public.content_item_tombstones
for select to authenticated using (true);

drop policy if exists content_categories_read_authenticated on public.content_categories;
create policy content_categories_read_authenticated on public.content_categories
for select to authenticated using (active = true);

drop policy if exists video_unlock_schedule_read_authenticated on public.video_unlock_schedule;
create policy video_unlock_schedule_read_authenticated on public.video_unlock_schedule
for select to authenticated using (true);

drop policy if exists user_content_progress_read_own on public.user_content_progress;
create policy user_content_progress_read_own on public.user_content_progress
for select to authenticated using (profile_id = auth.uid() or public.is_platform_admin(auth.uid()));

drop policy if exists email_automation_templates_read_authenticated on public.email_automation_templates;
create policy email_automation_templates_read_authenticated on public.email_automation_templates
for select to authenticated using (true);

revoke all on public.content_items from anon;
revoke all on public.content_item_tombstones from anon;
revoke all on public.content_categories from anon;
revoke all on public.video_unlock_schedule from anon;
revoke all on public.user_content_progress from anon;
revoke all on public.email_automation_templates from anon;
grant select on public.content_items, public.content_item_tombstones, public.content_categories, public.video_unlock_schedule, public.user_content_progress, public.email_automation_templates to authenticated;

revoke all on function public.save_content_item(uuid, text, text, text, text, text[], text, text, boolean, boolean, integer, jsonb) from public;
revoke all on function public.delete_content_item(uuid) from public;
revoke all on function public.save_content_category(text) from public;
revoke all on function public.rename_content_category(text, text) from public;
revoke all on function public.delete_content_category(text, text) from public;
revoke all on function public.save_video_unlock_schedule(jsonb) from public;
revoke all on function public.record_content_view(text) from public;
revoke all on function public.save_email_automation_template(text, text, text) from public;
grant execute on function public.save_content_item(uuid, text, text, text, text, text[], text, text, boolean, boolean, integer, jsonb) to authenticated;
grant execute on function public.delete_content_item(uuid) to authenticated;
grant execute on function public.save_content_category(text) to authenticated;
grant execute on function public.rename_content_category(text, text) to authenticated;
grant execute on function public.delete_content_category(text, text) to authenticated;
grant execute on function public.save_video_unlock_schedule(jsonb) to authenticated;
grant execute on function public.record_content_view(text) to authenticated;
grant execute on function public.save_email_automation_template(text, text, text) to authenticated;

create or replace function public.update_company_details(
  target_company_id uuid,
  company_name text,
  company_location text,
  contact_name text,
  rrhh_email text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null or not public.is_platform_admin(auth.uid()) then
    raise exception 'No tenes permisos para editar empresas.';
  end if;
  if target_company_id is null then
    raise exception 'La empresa es obligatoria.';
  end if;
  if nullif(trim(company_name), '') is null
    or nullif(trim(company_location), '') is null
    or nullif(trim(contact_name), '') is null
    or nullif(trim(rrhh_email), '') is null then
    raise exception 'Completa todos los datos de la empresa.';
  end if;

  update public.companies
  set name = trim(company_name),
      location = trim(company_location),
      contact_name = trim(contact_name),
      rrhh_email = lower(trim(rrhh_email))
  where id = target_company_id;

  if not found then
    raise exception 'No encontramos la empresa seleccionada.';
  end if;
end;
$$;

revoke all on function public.update_company_details(uuid, text, text, text, text) from public;
grant execute on function public.update_company_details(uuid, text, text, text, text) to authenticated;

drop function if exists public.delete_platform_user(uuid, uuid);
create function public.delete_platform_user(
  target_invitation_id uuid default null,
  target_profile_id uuid default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null or not public.is_platform_admin(auth.uid()) then
    raise exception 'No tenes permisos para eliminar usuarios.';
  end if;
  if target_profile_id is null and target_invitation_id is null then
    raise exception 'Indica un usuario o una invitacion para eliminar.';
  end if;

  if target_profile_id is not null then
    if target_profile_id = auth.uid() then
      raise exception 'No podes eliminar tu propia cuenta de administrador.';
    end if;
    delete from public.onboarding_responses where profile_id = target_profile_id;
    delete from public.profiles where id = target_profile_id;
    delete from auth.users where id = target_profile_id;
  end if;

  if target_invitation_id is not null then
    delete from public.onboarding_responses
    where id = target_invitation_id
      and profile_id is null
      and type = 'user_activation';
  end if;
end;
$$;

revoke all on function public.delete_platform_user(uuid, uuid) from public;
grant execute on function public.delete_platform_user(uuid, uuid) to authenticated;

insert into public.email_automation_templates (id, subject, body)
values (
  'pause-reminder',
  'Tu pausa activa estará disponible en {{minutos}} minutos',
  E'Hola {{nombre}},\n\nTu pausa activa de {{empresa}} estará disponible en {{minutos}} minutos. Horario programado: {{hora}} hs.\n\nIngresá a ReActiva para comenzar.'
)
on conflict (id) do nothing;

insert into public.content_categories (kind, name, sort_order)
select 'academy', category_name, row_number() over ()
from unnest(array[
  'Dolor musculoesqueletico', 'Ergonomia', 'Sueno', 'Hidratacion',
  'Salud visual', 'Entorno saludable', 'Estres', 'Respiracion',
  'Organizacion del trabajo'
]) as category_name
on conflict (kind, normalized_name) do nothing;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'reactiva-media',
  'reactiva-media',
  true,
  1073741824,
  array['video/mp4', 'video/webm', 'video/quicktime', 'image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = true,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists reactiva_media_public_read on storage.objects;
create policy reactiva_media_public_read on storage.objects
for select using (bucket_id = 'reactiva-media');

drop policy if exists reactiva_media_admin_insert on storage.objects;
create policy reactiva_media_admin_insert on storage.objects
for insert to authenticated
with check (bucket_id = 'reactiva-media' and public.is_platform_admin(auth.uid()));

drop policy if exists reactiva_media_admin_update on storage.objects;
create policy reactiva_media_admin_update on storage.objects
for update to authenticated
using (bucket_id = 'reactiva-media' and public.is_platform_admin(auth.uid()))
with check (bucket_id = 'reactiva-media' and public.is_platform_admin(auth.uid()));

drop policy if exists reactiva_media_admin_delete on storage.objects;
create policy reactiva_media_admin_delete on storage.objects
for delete to authenticated
using (bucket_id = 'reactiva-media' and public.is_platform_admin(auth.uid()));

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'companies'
  ) then
    alter publication supabase_realtime add table public.companies;
  end if;
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'content_items'
  ) then
    alter publication supabase_realtime add table public.content_items;
  end if;
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'content_categories'
  ) then
    alter publication supabase_realtime add table public.content_categories;
  end if;
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'video_unlock_schedule'
  ) then
    alter publication supabase_realtime add table public.video_unlock_schedule;
  end if;
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'user_content_progress'
  ) then
    alter publication supabase_realtime add table public.user_content_progress;
  end if;
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'email_automation_templates'
  ) then
    alter publication supabase_realtime add table public.email_automation_templates;
  end if;
  if exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'pause_sessions'
  ) and not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'pause_sessions'
  ) then
    alter publication supabase_realtime add table public.pause_sessions;
  end if;
end $$;

notify pgrst, 'reload schema';
