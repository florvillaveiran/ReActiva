-- La programacion queda definida por cada video: empresa, fecha, turno y hora.
-- Conserva un unico video activo por empresa/fecha/turno sin mezclar empresas.

with ranked as (
  select id,
         row_number() over (
           partition by company_id, metadata->>'scheduledDate', metadata->>'block'
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

  -- Un nuevo video reemplaza solamente el mismo turno de la misma empresa.
  -- La programacion de otras empresas queda intacta aunque coincida el horario.
  update public.content_items
  set active = false
  where kind = 'video'
    and active = true
    and id <> saved_id
    and company_id is not distinct from target_company_id
    and metadata->>'scheduledDate' = scheduled_date::text
    and metadata->>'block' = scheduled_block;

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

revoke all on function public.save_scheduled_video(uuid, uuid, text, text, text, text, date, text, time, text) from public;
grant execute on function public.save_scheduled_video(uuid, uuid, text, text, text, text, date, text, time, text) to authenticated;

notify pgrst, 'reload schema';
