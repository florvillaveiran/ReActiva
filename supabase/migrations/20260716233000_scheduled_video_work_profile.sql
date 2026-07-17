-- Etapa 5: programacion de microentrenamientos por empresa y perfil laboral.
--
-- `target_work_profile = null` conserva el comportamiento historico y significa
-- "Todos los perfiles". Los contenidos existentes no se modifican.

with ranked as (
  select id,
         row_number() over (
           partition by
             company_id,
             target_work_profile,
             metadata->>'scheduledDate',
             metadata->>'block'
           order by updated_at desc nulls last, created_at desc, id desc
         ) as position
  from public.content_items
  where kind = 'video'
    and active = true
    and metadata ? 'scheduledDate'
    and metadata ? 'block'
)
update public.content_items item
set active = false
from ranked
where item.id = ranked.id
  and ranked.position > 1;

create unique index if not exists content_items_scheduled_video_scope_idx
  on public.content_items (
    company_id,
    target_work_profile,
    (metadata->>'scheduledDate'),
    (metadata->>'block')
  )
  nulls not distinct
  where kind = 'video'
    and active = true
    and metadata ? 'scheduledDate'
    and metadata ? 'block';

drop function if exists public.save_scheduled_video(
  uuid, uuid, text, text, text, text, date, text, time, text
);

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
  company_name text,
  target_work_profile text default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  saved_id uuid := coalesce(item_id, gen_random_uuid());
  resolved_company_name text := 'Global';
  resolved_work_profile public.work_profile;
begin
  if auth.uid() is null or not public.is_platform_admin(auth.uid()) then
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

  if nullif(trim(target_work_profile), '') is not null then
    begin
      resolved_work_profile := upper(trim(target_work_profile))::public.work_profile;
    exception
      when invalid_text_representation then
        raise exception 'El perfil laboral debe ser ADMINISTRATIVO, OPERATIVO o Todos.';
    end;
  end if;

  if target_company_id is not null then
    select name into resolved_company_name
    from public.companies
    where id = target_company_id;
    if not found then
      raise exception 'No encontramos la empresa seleccionada.';
    end if;
  end if;

  if exists (
    select 1
    from public.content_items existing
    where existing.kind = 'video'
      and existing.active = true
      and existing.id <> saved_id
      and existing.company_id is not distinct from target_company_id
      and existing.target_work_profile is not distinct from resolved_work_profile
      and existing.metadata->>'scheduledDate' = scheduled_date::text
      and existing.metadata->>'block' = scheduled_block
  ) then
    raise exception 'Ya existe un video para esa empresa, perfil, fecha y turno. Editalo o elegi otra programacion.';
  end if;

  insert into public.content_items (
    id, company_id, target_work_profile, kind, title, description, category,
    tags, url, thumbnail_url, active, featured, sort_order, metadata
  ) values (
    saved_id, target_company_id, resolved_work_profile, 'video', trim(item_title),
    'Video programado de pausa activa', 'Microentrenamientos',
    array['microentrenamiento', scheduled_day, scheduled_date::text, scheduled_block],
    trim(item_url), nullif(trim(item_thumbnail_url), ''), true, false, 0,
    jsonb_build_object(
      'day', scheduled_day,
      'scheduledDate', scheduled_date::text,
      'block', scheduled_block,
      'time', to_char(scheduled_time, 'HH24:MI'),
      'companyId', target_company_id,
      'companyName', resolved_company_name,
      'targetWorkProfile', resolved_work_profile,
      'thumbnailUrl', nullif(trim(item_thumbnail_url), '')
    )
  )
  on conflict (id) do update set
    company_id = excluded.company_id,
    target_work_profile = excluded.target_work_profile,
    title = excluded.title,
    tags = excluded.tags,
    url = excluded.url,
    thumbnail_url = excluded.thumbnail_url,
    active = true,
    metadata = excluded.metadata;

  return saved_id;
exception
  when unique_violation then
    raise exception 'Ya existe un video para esa empresa, perfil, fecha y turno. Editalo o elegi otra programacion.';
end;
$$;

revoke all on function public.save_scheduled_video(
  uuid, uuid, text, text, text, text, date, text, time, text, text
) from public;
grant execute on function public.save_scheduled_video(
  uuid, uuid, text, text, text, text, date, text, time, text, text
) to authenticated;

create or replace function public.get_scheduled_video_for_profile(
  target_company_id uuid,
  viewer_work_profile text,
  target_date date,
  target_block text
)
returns setof public.content_items
language sql
stable
set search_path = ''
as $$
  select item.*
  from public.content_items item
  where item.kind = 'video'
    and item.active = true
    and item.metadata->>'scheduledDate' = target_date::text
    and item.metadata->>'block' = target_block
    and (item.company_id is null or item.company_id = target_company_id)
    and (
      item.target_work_profile is null
      or item.target_work_profile::text = upper(nullif(trim(viewer_work_profile), ''))
  )
  order by
    coalesce(item.company_id = target_company_id, false) desc,
    (item.target_work_profile is not null) desc,
    item.updated_at desc nulls last,
    item.created_at desc
  limit 1;
$$;

revoke all on function public.get_scheduled_video_for_profile(uuid, text, date, text) from public;
grant execute on function public.get_scheduled_video_for_profile(uuid, text, date, text) to authenticated;

notify pgrst, 'reload schema';
