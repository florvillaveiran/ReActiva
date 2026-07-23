-- Personalizacion opcional de Racha ReActiva para el recordatorio previo.
-- El valor se guarda junto a la plantilla compartida y nace desactivado.

alter table public.email_automation_templates
  add column if not exists include_reactiva_streak boolean not null default false;

comment on column public.email_automation_templates.include_reactiva_streak is
  'Agrega al recordatorio previo un mensaje individual basado en la Racha ReActiva real.';

drop function if exists public.save_email_automation_settings(text, text, text, boolean, integer);

create or replace function public.save_email_automation_settings(
  template_id text,
  template_subject text,
  template_body text,
  template_active boolean,
  template_delay_minutes integer,
  template_include_reactiva_streak boolean default false
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null or not public.is_platform_admin(auth.uid()) then
    raise exception 'No tenes permisos para administrar automatizaciones de email.';
  end if;
  if template_id not in ('pause-reminder', 'missed-pause-reminder') then
    raise exception 'La automatizacion indicada no puede modificarse desde este panel.';
  end if;
  if nullif(trim(template_subject), '') is null or nullif(trim(template_body), '') is null then
    raise exception 'Completa el asunto y el cuerpo del email.';
  end if;
  if template_delay_minutes < 0 or template_delay_minutes > 1440 then
    raise exception 'El tiempo debe estar entre 0 y 1440 minutos.';
  end if;

  insert into public.email_automation_templates (
    id, subject, body, active, delay_minutes, include_reactiva_streak, updated_by
  ) values (
    template_id,
    trim(template_subject),
    trim(template_body),
    coalesce(template_active, true),
    template_delay_minutes,
    template_id = 'pause-reminder' and coalesce(template_include_reactiva_streak, false),
    auth.uid()
  )
  on conflict (id) do update set
    subject = excluded.subject,
    body = excluded.body,
    active = excluded.active,
    delay_minutes = excluded.delay_minutes,
    include_reactiva_streak = excluded.include_reactiva_streak,
    updated_by = excluded.updated_by;
end;
$$;

revoke all on function public.save_email_automation_settings(text, text, text, boolean, integer, boolean) from public;
grant execute on function public.save_email_automation_settings(text, text, text, boolean, integer, boolean) to authenticated;

-- Punto de lectura exclusivo para el cron con service_role. Centraliza la
-- definicion vigente de racha y devuelve solo los datos necesarios para el mail.
create or replace function public.get_reactiva_email_streak_state(
  target_profile_id uuid,
  as_of_date date default current_date
)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  resolved_date date := coalesce(as_of_date, current_date);
  resolved_week date := date_trunc('week', coalesce(as_of_date, current_date))::date;
  current_points integer := 0;
  completed_activities integer := 0;
  current_streak integer := 0;
begin
  if coalesce(auth.role(), '') <> 'service_role' then
    raise exception 'Esta consulta es exclusiva del servicio de recordatorios.';
  end if;
  if not exists (
    select 1 from public.profiles profile
    where profile.id = target_profile_id
      and profile.role::text = 'usuario'
      and profile.company_id is not null
  ) then
    raise exception 'El destinatario indicado no es un usuario valido.';
  end if;

  select
    coalesce(sum(event.points), 0)::integer,
    count(*)::integer
  into current_points, completed_activities
  from public.reactiva_score_events event
  where event.profile_id = target_profile_id
    and event.week_start = resolved_week;

  current_streak := public.reactiva_user_streak(target_profile_id, resolved_date);

  return jsonb_build_object(
    'streak', current_streak,
    'week_points', current_points,
    'completed_activities', completed_activities,
    'week_complete', current_points = 10,
    'one_activity_remaining', current_points < 10 and completed_activities = 8
  );
end;
$$;

revoke all on function public.get_reactiva_email_streak_state(uuid, date) from public;
grant execute on function public.get_reactiva_email_streak_state(uuid, date) to service_role;

notify pgrst, 'reload schema';
