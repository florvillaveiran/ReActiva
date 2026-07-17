-- Etapa 6: entrega de microentrenamientos al panel del usuario.
--
-- La identidad, empresa y perfil laboral se obtienen de auth.uid(). El cliente
-- no puede elegir otra empresa o perfil. Se devuelve como maximo un contenido
-- por fecha y turno siguiendo la prioridad definida en la etapa anterior.

create or replace function public.get_my_scheduled_videos(target_dates date[])
returns setof public.content_items
language sql
stable
security definer
set search_path = ''
as $$
  with viewer as (
    select profile.company_id, profile.work_profile
    from public.profiles profile
    where profile.id = auth.uid()
      and profile.role::text = 'usuario'
  ), requested_slots as (
    select requested.requested_date, block.requested_block
    from unnest(coalesce(target_dates, '{}'::date[])) as requested(requested_date)
    cross join (values ('morning'::text), ('afternoon'::text)) as block(requested_block)
  )
  select selected.*
  from requested_slots slot
  cross join viewer
  cross join lateral (
    select item.*
    from public.content_items item
    where item.kind = 'video'
      and item.active = true
      and item.metadata->>'scheduledDate' = slot.requested_date::text
      and item.metadata->>'block' = slot.requested_block
      and (item.company_id is null or item.company_id = viewer.company_id)
      and (
        item.target_work_profile is null
        or item.target_work_profile = viewer.work_profile
      )
    order by
      coalesce(item.company_id = viewer.company_id, false) desc,
      (item.target_work_profile is not null) desc,
      item.updated_at desc nulls last,
      item.created_at desc
    limit 1
  ) selected;
$$;

-- Los microentrenamientos programados tambien quedan protegidos en lecturas
-- directas. El resto del contenido conserva exactamente su acceso previo.
drop policy if exists content_items_read_authenticated on public.content_items;
create policy content_items_read_authenticated on public.content_items
for select to authenticated using (
  public.is_platform_admin(auth.uid())
  or not (kind = 'video' and metadata ? 'scheduledDate' and metadata ? 'block')
  or (
    active = true
    and (
      company_id is null
      or company_id = (
        select profile.company_id
        from public.profiles profile
        where profile.id = auth.uid()
      )
    )
    and (
      target_work_profile is null
      or target_work_profile = (
        select profile.work_profile
        from public.profiles profile
        where profile.id = auth.uid()
      )
    )
  )
);

revoke all on function public.get_my_scheduled_videos(date[]) from public;
grant execute on function public.get_my_scheduled_videos(date[]) to authenticated;

notify pgrst, 'reload schema';
