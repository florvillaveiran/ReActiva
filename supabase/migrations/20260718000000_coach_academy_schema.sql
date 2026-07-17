-- Migracion aditiva para Etapa 11: Coach y Academia ReActiva
-- Reutiliza tablas existentes y extiende funcionalidad sin romper compatibilidad.

-- 1. Extender content_items
alter table public.content_items
  add column if not exists target_work_profile text check (target_work_profile in ('ALL', 'ADMINISTRATIVO', 'OPERATIVO')) default 'ALL',
  add column if not exists recommended_work_profile text check (recommended_work_profile in ('ALL', 'ADMINISTRATIVO', 'OPERATIVO')) default 'ALL';

-- 2. Extender user_content_progress para soportar tracking real de video y estado
alter table public.user_content_progress
  add column if not exists status text check (status in ('started', 'in_progress', 'completed')) default 'started',
  add column if not exists progress_percent integer default 0,
  add column if not exists last_position_seconds integer default 0,
  add column if not exists total_watch_time_seconds integer default 0,
  add column if not exists completed_at timestamptz;

-- 3. Nueva tabla content_relations para vincular Coach <-> Academia
create table if not exists public.content_relations (
  item_a_id uuid references public.content_items(id) on delete cascade,
  item_b_id uuid references public.content_items(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (item_a_id, item_b_id)
);

alter table public.content_relations enable row level security;

-- Politica de lectura para relaciones (todos los autenticados pueden ver las relaciones)
drop policy if exists content_relations_read_authenticated on public.content_relations;
create policy content_relations_read_authenticated on public.content_relations
for select to authenticated using (true);

-- Politica de insercion/borrado para admins
drop policy if exists content_relations_write_admin on public.content_relations;
create policy content_relations_write_admin on public.content_relations
for all to authenticated using (public.is_platform_admin(auth.uid()));

grant select on public.content_relations to authenticated;

-- 4. Actualizar funcion save_content_item para recibir los nuevos campos de segmentacion
-- Usamos DROP FUNCTION para evitar conflictos de firmas
drop function if exists public.save_content_item(uuid, text, text, text, text, text[], text, text, boolean, boolean, integer, jsonb);

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
  item_metadata jsonb,
  item_company_id uuid default null,
  item_target_work_profile text default 'ALL',
  item_recommended_work_profile text default 'ALL'
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
    active, featured, sort_order, metadata, company_id, target_work_profile, recommended_work_profile
  ) values (
    saved_id, item_kind, trim(item_title), coalesce(item_description, ''),
    coalesce(nullif(trim(item_category), ''), 'General'), coalesce(item_tags, '{}'),
    nullif(trim(item_url), ''), nullif(trim(item_thumbnail_url), ''),
    coalesce(item_active, false), coalesce(item_featured, false),
    coalesce(item_sort_order, 0), coalesce(item_metadata, '{}'::jsonb),
    item_company_id, coalesce(item_target_work_profile, 'ALL'), coalesce(item_recommended_work_profile, 'ALL')
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
    metadata = excluded.metadata,
    company_id = excluded.company_id,
    target_work_profile = excluded.target_work_profile,
    recommended_work_profile = excluded.recommended_work_profile;

  delete from public.content_item_tombstones
  where source_id = coalesce(item_metadata->>'sourceId', saved_id::text)
    and kind = item_kind;

  return saved_id;
end;
$$;

revoke all on function public.save_content_item(uuid, text, text, text, text, text[], text, text, boolean, boolean, integer, jsonb, uuid, text, text) from public;
grant execute on function public.save_content_item(uuid, text, text, text, text, text[], text, text, boolean, boolean, integer, jsonb, uuid, text, text) to authenticated;

-- Notify pgrst
notify pgrst, 'reload schema';
