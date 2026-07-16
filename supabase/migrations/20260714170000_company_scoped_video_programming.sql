-- Programacion multiempresa de microentrenamientos.
-- Los registros con company_id null siguen siendo globales y funcionan como respaldo.

alter table public.content_items
  add column if not exists company_id uuid references public.companies(id) on delete cascade;

-- Versiones anteriores exigían un único horario por día y bloque para toda la
-- plataforma. La unicidad con alcance por empresa ya queda cubierta por
-- video_unlock_schedule_scope_idx.
alter table public.video_unlock_schedule
  drop constraint if exists video_unlock_schedule_day_label_block_key;

create index if not exists content_items_company_schedule_idx
  on public.content_items (company_id, kind, active, created_at);

-- Recupera el alcance de videos creados por versiones que guardaban solamente
-- el nombre de la empresa dentro de metadata.
update public.content_items item
set company_id = company.id,
    metadata = jsonb_set(coalesce(item.metadata, '{}'::jsonb), '{companyId}', to_jsonb(company.id::text), true)
from public.companies company
where item.kind = 'video'
  and item.company_id is null
  and coalesce(item.metadata->>'companyName', 'Global') not in ('Global', 'Global (todas)')
  and lower(trim(company.name)) = lower(trim(item.metadata->>'companyName'));

create or replace function public.save_scheduled_video(
  item_id uuid,
  target_company_id uuid,
  item_title text,
  item_url text,
  item_thumbnail_url text,
  scheduled_day text,
  scheduled_date date,
  scheduled_block text,
  scheduled_time time,
  company_name text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  saved_id uuid := coalesce(item_id, gen_random_uuid());
  resolved_company_name text := 'Global';
begin
  if not public.is_platform_admin(auth.uid()) then
    raise exception 'No tenes permisos para programar videos.';
  end if;
  if nullif(trim(item_title), '') is null or nullif(trim(item_url), '') is null then
    raise exception 'Completa el titulo y el video.';
  end if;
  if scheduled_day not in ('Lunes', 'Miércoles', 'Viernes') then
    raise exception 'El dia indicado no pertenece al programa.';
  end if;
  if scheduled_block not in ('morning', 'afternoon') then
    raise exception 'El turno indicado no es valido.';
  end if;

  if target_company_id is not null then
    select name into resolved_company_name
    from public.companies
    where id = target_company_id;
    if not found then
      raise exception 'No encontramos la empresa seleccionada.';
    end if;
  end if;

  insert into public.content_items (
    id, company_id, kind, title, description, category, tags, url,
    thumbnail_url, active, featured, sort_order, metadata
  ) values (
    saved_id, target_company_id, 'video', trim(item_title),
    'Video programado de pausa activa', 'Microentrenamientos',
    array['microentrenamiento', scheduled_day, scheduled_date::text, scheduled_block],
    trim(item_url), nullif(trim(item_thumbnail_url), ''), true, false, 0,
    jsonb_build_object(
      'day', scheduled_day,
      'scheduledDate', scheduled_date::text,
      'block', scheduled_block,
      'time', to_char(scheduled_time, 'HH24:MI'),
      'companyId', target_company_id,
      'companyName', coalesce(nullif(trim(company_name), ''), resolved_company_name),
      'thumbnailUrl', nullif(trim(item_thumbnail_url), '')
    )
  )
  on conflict (id) do update set
    company_id = excluded.company_id,
    title = excluded.title,
    tags = excluded.tags,
    url = excluded.url,
    thumbnail_url = excluded.thumbnail_url,
    active = true,
    metadata = excluded.metadata;

  return saved_id;
end;
$$;

drop policy if exists content_items_read_authenticated on public.content_items;
create policy content_items_read_authenticated on public.content_items
for select to authenticated using (
  public.is_platform_admin(auth.uid())
  or company_id is null
  or company_id = (select profile.company_id from public.profiles profile where profile.id = auth.uid())
  or not (kind = 'video' and metadata ? 'day' and metadata ? 'block')
);

drop policy if exists video_unlock_schedule_read_authenticated on public.video_unlock_schedule;
create policy video_unlock_schedule_read_authenticated on public.video_unlock_schedule
for select to authenticated using (
  public.is_platform_admin(auth.uid())
  or company_id is null
  or company_id = (select profile.company_id from public.profiles profile where profile.id = auth.uid())
);

revoke all on function public.save_scheduled_video(uuid, uuid, text, text, text, text, date, text, time, text) from public;
grant execute on function public.save_scheduled_video(uuid, uuid, text, text, text, text, date, text, time, text) to authenticated;

notify pgrst, 'reload schema';
