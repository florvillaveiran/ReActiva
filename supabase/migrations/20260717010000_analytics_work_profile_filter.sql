-- Etapa 6: una unica fuente de analiticas, segmentable por perfil laboral.
-- La funcion conserva las sesiones reales y solo limita el conjunto antes de
-- ejecutar los mismos calculos que ya usa la aplicacion.

create or replace function public.get_analytics_pause_sessions(
  target_company_id uuid default null,
  target_work_profile text default null,
  period_from timestamptz default null,
  period_to timestamptz default null
)
returns setof jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  viewer_role text;
  viewer_company_id uuid;
  scoped_company_id uuid;
  resolved_work_profile public.work_profile;
begin
  if auth.uid() is null then
    raise exception 'Inicia sesion para consultar analiticas.';
  end if;

  select role::text, company_id
  into viewer_role, viewer_company_id
  from public.profiles
  where id = auth.uid();

  if public.is_platform_admin(auth.uid()) then
    scoped_company_id := target_company_id;
  elsif viewer_role = 'rrhh' and viewer_company_id is not null then
    if target_company_id is not null and target_company_id <> viewer_company_id then
      raise exception 'No tenes permisos para consultar otra empresa.';
    end if;
    scoped_company_id := viewer_company_id;
  else
    raise exception 'No tenes permisos para consultar analiticas.';
  end if;

  if nullif(upper(trim(target_work_profile)), '') is not null then
    begin
      resolved_work_profile := upper(trim(target_work_profile))::public.work_profile;
    exception
      when invalid_text_representation then
        raise exception 'El perfil laboral debe ser ADMINISTRATIVO u OPERATIVO.';
    end;
  end if;

  return query
  select jsonb_build_object(
    'profile_id', session.profile_id,
    'day_label', session.day_label,
    'block', session.block,
    'occurred_at', session.occurred_at,
    'energy', session.energy,
    'feeling', session.feeling,
    'has_pain', session.has_pain,
    'pain_zone', session.pain_zone,
    'answers', session.answers
  )
  from public.pause_sessions session
  join public.profiles profile on profile.id = session.profile_id
  where (scoped_company_id is null or session.company_id = scoped_company_id)
    and (resolved_work_profile is null or profile.work_profile = resolved_work_profile)
    and (period_from is null or session.occurred_at >= period_from)
    and (period_to is null or session.occurred_at < period_to)
  order by session.occurred_at desc;
end;
$$;

revoke all on function public.get_analytics_pause_sessions(uuid, text, timestamptz, timestamptz) from public;
grant execute on function public.get_analytics_pause_sessions(uuid, text, timestamptz, timestamptz) to authenticated;

notify pgrst, 'reload schema';
