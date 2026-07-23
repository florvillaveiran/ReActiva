-- Sistema de Puntaje ReActiva.
--
-- Fuente de verdad: eventos inmutables y deduplicados en Supabase. El puntaje
-- semanal es 6 microentrenamientos (1 punto), 2 formularios diarios (1 punto)
-- y 1 formulario semanal (2 puntos), con un maximo de 10 por semana programada.

alter table public.profiles
  add column if not exists reactiva_score_started_at timestamptz;

update public.profiles
set reactiva_score_started_at = created_at
where role::text = 'usuario'
  and reactiva_score_started_at is null;

comment on column public.profiles.reactiva_score_started_at is
  'Fecha desde la que el usuario participa del Puntaje ReActiva. Define las semanas computables para su maximo mensual.';

create or replace function public.initialize_reactiva_score_start()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.role::text = 'usuario'
    and new.company_id is not null
    and new.reactiva_score_started_at is null then
    new.reactiva_score_started_at := now();
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_initialize_reactiva_score_start on public.profiles;
create trigger profiles_initialize_reactiva_score_start
before insert or update of company_id, role on public.profiles
for each row execute function public.initialize_reactiva_score_start();

create table if not exists public.reactiva_score_settings (
  company_id uuid primary key references public.companies(id) on delete cascade,
  enabled boolean not null default true,
  raffle_threshold_percent numeric(5,2) not null default 80
    check (raffle_threshold_percent between 0 and 100),
  monthly_close_day smallint not null default 1
    check (monthly_close_day between 1 and 28),
  prize_description text not null default '',
  show_score_to_users boolean not null default true,
  show_streak_to_users boolean not null default true,
  show_score_to_rrhh boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles(id) on delete set null
);

comment on table public.reactiva_score_settings is
  'Configuracion empresarial del Puntaje ReActiva. El maximo semanal estructural permanece fijo en 10.';

insert into public.reactiva_score_settings (company_id)
select id from public.companies
on conflict (company_id) do nothing;

create table if not exists public.reactiva_score_events (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  company_id uuid not null references public.companies(id) on delete cascade,
  activity_type text not null
    check (activity_type in ('MICROTRAINING', 'DAILY_FORM', 'WEEKLY_FORM')),
  activity_id text not null,
  points smallint not null check (points in (1, 2)),
  completed_at timestamptz not null,
  activity_date date not null,
  week_start date not null,
  month_reference date not null,
  source text not null default 'platform',
  created_at timestamptz not null default now(),
  constraint reactiva_score_events_month_first_day
    check (month_reference = date_trunc('month', month_reference)::date),
  constraint reactiva_score_events_week_monday
    check (extract(isodow from week_start) = 1),
  constraint reactiva_score_events_activity_unique
    unique (profile_id, activity_type, activity_id)
);

comment on table public.reactiva_score_events is
  'Eventos reconstruibles del Puntaje ReActiva. activity_id identifica de forma estable la actividad y evita puntos duplicados.';

create index if not exists reactiva_score_events_profile_month_idx
  on public.reactiva_score_events (profile_id, month_reference, activity_date);
create index if not exists reactiva_score_events_company_month_idx
  on public.reactiva_score_events (company_id, month_reference, profile_id);
create index if not exists reactiva_score_events_profile_week_idx
  on public.reactiva_score_events (profile_id, week_start, activity_type);

drop trigger if exists reactiva_score_settings_touch_updated_at on public.reactiva_score_settings;
create trigger reactiva_score_settings_touch_updated_at
before update on public.reactiva_score_settings
for each row execute function public.touch_updated_at();

create or replace function public.ensure_reactiva_score_settings()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.reactiva_score_settings (company_id)
  values (new.id)
  on conflict (company_id) do nothing;
  return new;
end;
$$;

drop trigger if exists companies_ensure_reactiva_score_settings on public.companies;
create trigger companies_ensure_reactiva_score_settings
after insert on public.companies
for each row execute function public.ensure_reactiva_score_settings();

alter table public.reactiva_score_settings enable row level security;
alter table public.reactiva_score_events enable row level security;

drop policy if exists reactiva_score_settings_read_scoped on public.reactiva_score_settings;
create policy reactiva_score_settings_read_scoped on public.reactiva_score_settings
for select to authenticated
using (
  public.is_platform_admin(auth.uid())
  or company_id = (select profile.company_id from public.profiles profile where profile.id = auth.uid())
);

drop policy if exists reactiva_score_events_read_scoped on public.reactiva_score_events;
create policy reactiva_score_events_read_scoped on public.reactiva_score_events
for select to authenticated
using (
  profile_id = auth.uid()
  or public.is_platform_admin(auth.uid())
  or (
    company_id = (select profile.company_id from public.profiles profile where profile.id = auth.uid())
    and (select profile.role::text from public.profiles profile where profile.id = auth.uid()) = 'rrhh'
  )
);

revoke all on public.reactiva_score_settings from anon, authenticated;
revoke all on public.reactiva_score_events from anon, authenticated;
grant select on public.reactiva_score_settings, public.reactiva_score_events to authenticated;

create or replace function public.set_reactiva_score_settings(
  target_company_id uuid,
  score_enabled boolean,
  threshold_percent numeric,
  close_day integer,
  prize_text text,
  users_can_see_score boolean,
  users_can_see_streak boolean,
  rrhh_can_see_score boolean
)
returns public.reactiva_score_settings
language plpgsql
security definer
set search_path = ''
as $$
declare
  saved public.reactiva_score_settings;
begin
  if auth.uid() is null or not public.is_platform_admin(auth.uid()) then
    raise exception 'No tenes permisos para configurar el Puntaje ReActiva.';
  end if;
  if target_company_id is null or not exists (select 1 from public.companies where id = target_company_id) then
    raise exception 'La empresa indicada no existe.';
  end if;
  if threshold_percent is null or threshold_percent < 0 or threshold_percent > 100 then
    raise exception 'El umbral debe estar entre 0 y 100.';
  end if;
  if close_day is null or close_day < 1 or close_day > 28 then
    raise exception 'El dia de cierre debe estar entre 1 y 28.';
  end if;

  insert into public.reactiva_score_settings (
    company_id, enabled, raffle_threshold_percent, monthly_close_day,
    prize_description, show_score_to_users, show_streak_to_users,
    show_score_to_rrhh, updated_by
  ) values (
    target_company_id, coalesce(score_enabled, true), threshold_percent, close_day,
    coalesce(prize_text, ''), coalesce(users_can_see_score, true),
    coalesce(users_can_see_streak, true), coalesce(rrhh_can_see_score, true), auth.uid()
  )
  on conflict (company_id) do update set
    enabled = excluded.enabled,
    raffle_threshold_percent = excluded.raffle_threshold_percent,
    monthly_close_day = excluded.monthly_close_day,
    prize_description = excluded.prize_description,
    show_score_to_users = excluded.show_score_to_users,
    show_streak_to_users = excluded.show_streak_to_users,
    show_score_to_rrhh = excluded.show_score_to_rrhh,
    updated_by = excluded.updated_by
  returning * into saved;

  return saved;
end;
$$;

create or replace function public.set_reactiva_score_start(
  target_profile_id uuid,
  started_at timestamptz
)
returns timestamptz
language plpgsql
security definer
set search_path = ''
as $$
declare
  saved timestamptz;
begin
  if auth.uid() is null or not public.is_platform_admin(auth.uid()) then
    raise exception 'No tenes permisos para modificar el inicio del puntaje.';
  end if;
  if started_at is null then
    raise exception 'La fecha de inicio es obligatoria.';
  end if;

  update public.profiles
  set reactiva_score_started_at = started_at
  where id = target_profile_id and role::text = 'usuario'
  returning reactiva_score_started_at into saved;

  if saved is null then
    raise exception 'El usuario indicado no existe.';
  end if;
  return saved;
end;
$$;

-- Registra una finalizacion solamente si ya existe la pausa real correspondiente.
-- La fecha siempre se obtiene del servidor y nunca de un valor enviado por el cliente.
create or replace function public.record_reactiva_score_event(
  target_activity_type text,
  target_content_item_id uuid default null
)
returns public.reactiva_score_events
language plpgsql
security definer
set search_path = ''
as $$
declare
  viewer public.profiles;
  resolved_type text := upper(trim(coalesce(target_activity_type, '')));
  local_date date := (now() at time zone 'America/Argentina/Buenos_Aires')::date;
  resolved_date date;
  resolved_week date;
  resolved_activity_id text;
  resolved_points smallint;
  scheduled_block text;
  saved public.reactiva_score_events;
begin
  if auth.uid() is null then
    raise exception 'Inicia sesion para registrar el Puntaje ReActiva.';
  end if;

  select * into viewer from public.profiles where id = auth.uid();
  if viewer.id is null or viewer.role::text <> 'usuario' or viewer.company_id is null then
    raise exception 'Solo un usuario activo de una empresa puede registrar actividades.';
  end if;
  if exists (
    select 1 from public.reactiva_score_settings settings
    where settings.company_id = viewer.company_id and not settings.enabled
  ) then
    raise exception 'El Puntaje ReActiva no esta activo para esta empresa.';
  end if;

  if resolved_type = 'MICROTRAINING' then
    if target_content_item_id is null then
      raise exception 'El microentrenamiento es obligatorio.';
    end if;

    select nullif(item.metadata->>'scheduledDate', '')::date, item.metadata->>'block'
    into resolved_date, scheduled_block
    from public.content_items item
    where item.id = target_content_item_id
      and item.kind = 'video'
      and item.active = true
      and (item.company_id is null or item.company_id = viewer.company_id)
      and (item.target_work_profile is null or item.target_work_profile = viewer.work_profile)
      and item.id in (select scheduled.id from public.get_my_scheduled_videos(array[local_date]) scheduled);

    if resolved_date is null or scheduled_block is null or scheduled_block not in ('morning', 'afternoon') then
      raise exception 'El microentrenamiento no corresponde a este usuario.';
    end if;
    if resolved_date <> local_date then
      raise exception 'El microentrenamiento no corresponde al dia actual.';
    end if;
    if not exists (
      select 1 from public.pause_sessions session
      where session.profile_id = viewer.id
        and (session.occurred_at at time zone 'America/Argentina/Buenos_Aires')::date = resolved_date
        and session.block = scheduled_block
    ) then
      raise exception 'Primero completa la pausa correspondiente.';
    end if;

    resolved_activity_id := target_content_item_id::text;
    resolved_points := 1;
  elsif resolved_type = 'DAILY_FORM' then
    resolved_date := local_date;
    if extract(isodow from resolved_date) not in (1, 3) then
      raise exception 'El formulario diario solo corresponde a lunes o miercoles.';
    end if;
    if not exists (
      select 1 from public.pause_sessions session
      where session.profile_id = viewer.id
        and (session.occurred_at at time zone 'America/Argentina/Buenos_Aires')::date = resolved_date
        and session.block = 'afternoon'
        and session.answers->>'tipo' = 'diario'
    ) then
      raise exception 'Primero completa el formulario diario.';
    end if;
    resolved_activity_id := 'daily-form:' || resolved_date::text;
    resolved_points := 1;
  elsif resolved_type = 'WEEKLY_FORM' then
    resolved_date := local_date;
    if extract(isodow from resolved_date) <> 5 then
      raise exception 'El formulario semanal corresponde al viernes.';
    end if;
    if not exists (
      select 1 from public.pause_sessions session
      where session.profile_id = viewer.id
        and (session.occurred_at at time zone 'America/Argentina/Buenos_Aires')::date = resolved_date
        and session.answers->>'tipo' = 'semanal-completo'
    ) then
      raise exception 'Primero completa el formulario semanal.';
    end if;
    resolved_activity_id := 'weekly-form:' || date_trunc('week', resolved_date)::date::text;
    resolved_points := 2;
  else
    raise exception 'Tipo de actividad invalido.';
  end if;

  resolved_week := date_trunc('week', resolved_date)::date;

  insert into public.reactiva_score_events (
    profile_id, company_id, activity_type, activity_id, points,
    completed_at, activity_date, week_start, month_reference
  ) values (
    viewer.id, viewer.company_id, resolved_type, resolved_activity_id, resolved_points,
    now(), resolved_date, resolved_week, date_trunc('month', resolved_date)::date
  )
  on conflict (profile_id, activity_type, activity_id) do update
    set activity_id = excluded.activity_id
  returning * into saved;

  return saved;
end;
$$;

create or replace function public.reactiva_programmed_weeks_for_user(
  target_profile_id uuid,
  target_month date
)
returns table (week_start date)
language sql
stable
security definer
set search_path = ''
as $$
  with target as (
    select profile.company_id, profile.work_profile,
      coalesce(profile.reactiva_score_started_at, profile.created_at)::date as started_on
    from public.profiles profile
    where profile.id = target_profile_id and profile.role::text = 'usuario'
  ), scheduled_items as (
    select item.*,
      case
        when item.metadata->>'scheduledDate' ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$'
          then (item.metadata->>'scheduledDate')::date
        else null
      end as scheduled_date
    from public.content_items item
  ), candidate_weeks as (
    select distinct date_trunc('week', item.scheduled_date)::date as week_start
    from scheduled_items item
    cross join target
    where item.kind = 'video'
      and item.scheduled_date is not null
      and (item.company_id is null or item.company_id = target.company_id)
      and (item.target_work_profile is null or item.target_work_profile = target.work_profile)
      and item.scheduled_date >= date_trunc('month', target_month)::date
      and item.scheduled_date < (date_trunc('month', target_month) + interval '1 month')::date
    union
    select distinct event.week_start
    from public.reactiva_score_events event
    where event.profile_id = target_profile_id
      and event.month_reference = date_trunc('month', target_month)::date
  )
  select candidate_weeks.week_start
  from candidate_weeks
  cross join target
  where candidate_weeks.week_start >= date_trunc('week', target.started_on)::date
  order by candidate_weeks.week_start;
$$;

create or replace function public.reactiva_user_streak(
  target_profile_id uuid,
  as_of_date date default current_date
)
returns integer
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  programmed_week date;
  week_points integer;
  streak integer := 0;
begin
  for programmed_week in
    with months as (
      select generate_series(
        date_trunc('month', (select coalesce(profile.reactiva_score_started_at, profile.created_at) from public.profiles profile where profile.id = target_profile_id)),
        date_trunc('month', as_of_date),
        interval '1 month'
      )::date as month_reference
    ), weeks as (
      select programmed.week_start
      from months
      cross join lateral public.reactiva_programmed_weeks_for_user(target_profile_id, months.month_reference) programmed
      where programmed.week_start <= date_trunc('week', as_of_date)::date
    )
    select weeks.week_start from weeks order by weeks.week_start desc
  loop
    select coalesce(sum(event.points), 0) into week_points
    from public.reactiva_score_events event
    where event.profile_id = target_profile_id and event.week_start = programmed_week;
    if week_points <> 10 then
      -- La semana actual todavía está en curso y no rompe la racha obtenida
      -- en semanas cerradas. Si llega a 10/10 se incorpora inmediatamente.
      if as_of_date = current_date
        and programmed_week = date_trunc('week', current_date)::date then
        continue;
      end if;
      exit;
    end if;
    streak := streak + 1;
  end loop;
  return streak;
end;
$$;

create or replace function public.reactiva_user_best_streak(
  target_profile_id uuid,
  as_of_date date default current_date
)
returns integer
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  programmed_week date;
  week_points integer;
  running_streak integer := 0;
  best_streak integer := 0;
begin
  for programmed_week in
    with months as (
      select generate_series(
        date_trunc('month', (select coalesce(profile.reactiva_score_started_at, profile.created_at) from public.profiles profile where profile.id = target_profile_id)),
        date_trunc('month', as_of_date),
        interval '1 month'
      )::date as month_reference
    ), weeks as (
      select programmed.week_start
      from months
      cross join lateral public.reactiva_programmed_weeks_for_user(target_profile_id, months.month_reference) programmed
      where programmed.week_start <= date_trunc('week', as_of_date)::date
    )
    select weeks.week_start from weeks order by weeks.week_start
  loop
    select coalesce(sum(event.points), 0) into week_points
    from public.reactiva_score_events event
    where event.profile_id = target_profile_id and event.week_start = programmed_week;
    if week_points = 10 then
      running_streak := running_streak + 1;
      best_streak := greatest(best_streak, running_streak);
    else
      running_streak := 0;
    end if;
  end loop;
  return best_streak;
end;
$$;

create or replace function public.get_reactiva_user_score(
  target_profile_id uuid default null,
  target_month date default current_date
)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  viewer_role text;
  viewer_company uuid;
  subject_id uuid := coalesce(target_profile_id, auth.uid());
  subject_company uuid;
  month_start date := date_trunc('month', coalesce(target_month, current_date))::date;
  score integer;
  maximum integer;
  threshold numeric;
  config public.reactiva_score_settings;
  result jsonb;
begin
  if auth.uid() is null then raise exception 'Inicia sesion para consultar el puntaje.'; end if;

  select role::text, company_id into viewer_role, viewer_company
  from public.profiles where id = auth.uid();
  select company_id into subject_company
  from public.profiles where id = subject_id and role::text = 'usuario';
  if subject_company is null then raise exception 'El usuario indicado no existe.'; end if;

  if subject_id <> auth.uid()
    and not public.is_platform_admin(auth.uid())
    and not (viewer_role = 'rrhh' and viewer_company = subject_company) then
    raise exception 'No tenes permisos para consultar este puntaje.';
  end if;

  select * into config from public.reactiva_score_settings where company_id = subject_company;
  threshold := coalesce(config.raffle_threshold_percent, 80);
  select coalesce(sum(event.points), 0) into score
  from public.reactiva_score_events event
  join public.reactiva_programmed_weeks_for_user(subject_id, month_start) eligible_week
    on eligible_week.week_start = event.week_start
  where event.profile_id = subject_id and event.month_reference = month_start;
  select count(*) * 10 into maximum
  from public.reactiva_programmed_weeks_for_user(subject_id, month_start);

  select jsonb_build_object(
    'profile_id', subject_id,
    'company_id', subject_company,
    'month', month_start,
    'score', score,
    'maximum', maximum,
    'percent', case when maximum > 0 then round(least(score, maximum)::numeric * 100 / maximum, 2) else 0 end,
    'eligible', coalesce(config.enabled, true) and maximum > 0 and (score::numeric * 100 / maximum) >= threshold,
    'threshold_percent', threshold,
    'streak', public.reactiva_user_streak(subject_id, least(current_date, (month_start + interval '1 month - 1 day')::date)),
    'best_streak', public.reactiva_user_best_streak(subject_id, least(current_date, (month_start + interval '1 month - 1 day')::date)),
    'settings', jsonb_build_object(
      'enabled', coalesce(config.enabled, true),
      'monthly_close_day', coalesce(config.monthly_close_day, 1),
      'prize_description', coalesce(config.prize_description, ''),
      'show_score_to_users', coalesce(config.show_score_to_users, true),
      'show_streak_to_users', coalesce(config.show_streak_to_users, true),
      'show_score_to_rrhh', coalesce(config.show_score_to_rrhh, true)
    ),
    'breakdown', jsonb_build_object(
      'microtrainings', coalesce(sum(event.points) filter (where event.activity_type = 'MICROTRAINING'), 0),
      'daily_forms', coalesce(sum(event.points) filter (where event.activity_type = 'DAILY_FORM'), 0),
      'weekly_forms', coalesce(sum(event.points) filter (where event.activity_type = 'WEEKLY_FORM'), 0)
    ),
    'weeks', coalesce((
      select jsonb_agg(jsonb_build_object(
        'week_start', weeks.week_start,
        'score', coalesce(events.points, 0),
        'maximum', 10,
        'complete', coalesce(events.points, 0) = 10,
        'microtrainings', coalesce(events.microtrainings, 0),
        'daily_forms', coalesce(events.daily_forms, 0),
        'weekly_forms', coalesce(events.weekly_forms, 0)
      ) order by weeks.week_start)
      from public.reactiva_programmed_weeks_for_user(subject_id, month_start) weeks
      left join (
        select event.week_start,
          sum(event.points)::integer as points,
          coalesce(sum(event.points) filter (where event.activity_type = 'MICROTRAINING'), 0)::integer as microtrainings,
          coalesce(sum(event.points) filter (where event.activity_type = 'DAILY_FORM'), 0)::integer as daily_forms,
          coalesce(sum(event.points) filter (where event.activity_type = 'WEEKLY_FORM'), 0)::integer as weekly_forms
        from public.reactiva_score_events event
        where event.profile_id = subject_id and event.month_reference = month_start
        group by event.week_start
      ) events using (week_start)
    ), '[]'::jsonb)
  ) into result
  from public.reactiva_score_events event
  join public.reactiva_programmed_weeks_for_user(subject_id, month_start) eligible_week
    on eligible_week.week_start = event.week_start
  where event.profile_id = subject_id and event.month_reference = month_start;

  return result;
end;
$$;

create or replace function public.get_reactiva_team_scores(
  target_company_id uuid default null,
  target_month date default current_date
)
returns setof jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  viewer_role text;
  viewer_company uuid;
  scoped_company uuid;
  rrhh_visible boolean;
begin
  if auth.uid() is null then raise exception 'Inicia sesion para consultar puntajes.'; end if;
  select role::text, company_id into viewer_role, viewer_company from public.profiles where id = auth.uid();

  if public.is_platform_admin(auth.uid()) then
    scoped_company := target_company_id;
  elsif viewer_role = 'rrhh' and viewer_company is not null then
    if target_company_id is not null and target_company_id <> viewer_company then
      raise exception 'No tenes permisos para consultar otra empresa.';
    end if;
    scoped_company := viewer_company;
    select coalesce(show_score_to_rrhh, true) into rrhh_visible
    from public.reactiva_score_settings where company_id = viewer_company;
    if not coalesce(rrhh_visible, true) then raise exception 'La visualizacion para RRHH esta desactivada.'; end if;
  else
    raise exception 'No tenes permisos para consultar puntajes de equipo.';
  end if;

  return query
  select public.get_reactiva_user_score(profile.id, target_month)
    || jsonb_build_object('name', profile.full_name, 'email', profile.email, 'work_profile', profile.work_profile)
  from public.profiles profile
  where profile.role::text = 'usuario'
    and profile.status is distinct from 'inactive'
    and (scoped_company is null or profile.company_id = scoped_company)
  order by profile.full_name;
end;
$$;

create or replace function public.get_reactiva_score_summary(
  target_company_id uuid default null,
  target_month date default current_date
)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  rows jsonb;
  company_average numeric;
  global_average numeric;
begin
  -- get_reactiva_team_scores aplica el alcance de administrador/RRHH.
  select coalesce(jsonb_agg(score), '[]'::jsonb),
    coalesce(round(avg((score->>'percent')::numeric) filter (where (score->>'maximum')::numeric > 0), 2), 0)
  into rows, company_average
  from public.get_reactiva_team_scores(target_company_id, target_month) score;

  if public.is_platform_admin(auth.uid()) then
    select coalesce(round(avg((user_score.value->>'percent')::numeric) filter (where (user_score.value->>'maximum')::numeric > 0), 2), 0)
    into global_average
    from public.profiles profile
    cross join lateral (select public.get_reactiva_user_score(profile.id, target_month) as value) user_score
    where profile.role::text = 'usuario' and profile.status is distinct from 'inactive';
  else
    global_average := null;
  end if;

  return jsonb_build_object(
    'month', date_trunc('month', coalesce(target_month, current_date))::date,
    'company_id', target_company_id,
    'average_percent', company_average,
    'global_average_percent', global_average,
    'users', rows
  );
end;
$$;

-- Reconstruccion inicial desde las pausas existentes. Los videos se resuelven
-- con la misma prioridad empresa/perfil que usa la entrega al usuario.
insert into public.reactiva_score_events (
  profile_id, company_id, activity_type, activity_id, points,
  completed_at, activity_date, week_start, month_reference, source
)
select distinct on (session.profile_id, item.id)
  session.profile_id,
  session.company_id,
  'MICROTRAINING',
  item.id::text,
  1,
  session.occurred_at,
  (session.occurred_at at time zone 'America/Argentina/Buenos_Aires')::date,
  date_trunc('week', (session.occurred_at at time zone 'America/Argentina/Buenos_Aires')::date)::date,
  date_trunc('month', (session.occurred_at at time zone 'America/Argentina/Buenos_Aires')::date)::date,
  'backfill'
from public.pause_sessions session
join public.profiles profile on profile.id = session.profile_id
join lateral (
  select candidate.id
  from public.content_items candidate
  where candidate.kind = 'video'
    and candidate.metadata->>'scheduledDate' = (session.occurred_at at time zone 'America/Argentina/Buenos_Aires')::date::text
    and candidate.metadata->>'block' = session.block
    and (candidate.company_id is null or candidate.company_id = session.company_id)
    and (candidate.target_work_profile is null or candidate.target_work_profile = profile.work_profile)
  order by (candidate.company_id = session.company_id) desc,
    (candidate.target_work_profile = profile.work_profile) desc,
    candidate.created_at desc
  limit 1
) item on true
where session.company_id is not null
on conflict (profile_id, activity_type, activity_id) do nothing;

insert into public.reactiva_score_events (
  profile_id, company_id, activity_type, activity_id, points,
  completed_at, activity_date, week_start, month_reference, source
)
select distinct on (session.profile_id, (session.occurred_at at time zone 'America/Argentina/Buenos_Aires')::date)
  session.profile_id,
  session.company_id,
  'DAILY_FORM',
  'daily-form:' || (session.occurred_at at time zone 'America/Argentina/Buenos_Aires')::date::text,
  1,
  session.occurred_at,
  (session.occurred_at at time zone 'America/Argentina/Buenos_Aires')::date,
  date_trunc('week', (session.occurred_at at time zone 'America/Argentina/Buenos_Aires')::date)::date,
  date_trunc('month', (session.occurred_at at time zone 'America/Argentina/Buenos_Aires')::date)::date,
  'backfill'
from public.pause_sessions session
where session.company_id is not null and session.answers->>'tipo' = 'diario'
on conflict (profile_id, activity_type, activity_id) do nothing;

insert into public.reactiva_score_events (
  profile_id, company_id, activity_type, activity_id, points,
  completed_at, activity_date, week_start, month_reference, source
)
select distinct on (session.profile_id, date_trunc('week', (session.occurred_at at time zone 'America/Argentina/Buenos_Aires')::date)::date)
  session.profile_id,
  session.company_id,
  'WEEKLY_FORM',
  'weekly-form:' || date_trunc('week', (session.occurred_at at time zone 'America/Argentina/Buenos_Aires')::date)::date::text,
  2,
  session.occurred_at,
  (session.occurred_at at time zone 'America/Argentina/Buenos_Aires')::date,
  date_trunc('week', (session.occurred_at at time zone 'America/Argentina/Buenos_Aires')::date)::date,
  date_trunc('month', (session.occurred_at at time zone 'America/Argentina/Buenos_Aires')::date)::date,
  'backfill'
from public.pause_sessions session
where session.company_id is not null and session.answers->>'tipo' = 'semanal-completo'
on conflict (profile_id, activity_type, activity_id) do nothing;

revoke all on function public.set_reactiva_score_settings(uuid, boolean, numeric, integer, text, boolean, boolean, boolean) from public;
revoke all on function public.set_reactiva_score_start(uuid, timestamptz) from public;
revoke all on function public.record_reactiva_score_event(text, uuid) from public;
revoke all on function public.reactiva_programmed_weeks_for_user(uuid, date) from public;
revoke all on function public.reactiva_user_streak(uuid, date) from public;
revoke all on function public.reactiva_user_best_streak(uuid, date) from public;
revoke all on function public.get_reactiva_user_score(uuid, date) from public;
revoke all on function public.get_reactiva_team_scores(uuid, date) from public;
revoke all on function public.get_reactiva_score_summary(uuid, date) from public;

grant execute on function public.set_reactiva_score_settings(uuid, boolean, numeric, integer, text, boolean, boolean, boolean) to authenticated;
grant execute on function public.set_reactiva_score_start(uuid, timestamptz) to authenticated;
grant execute on function public.record_reactiva_score_event(text, uuid) to authenticated;
grant execute on function public.get_reactiva_user_score(uuid, date) to authenticated;
grant execute on function public.get_reactiva_team_scores(uuid, date) to authenticated;
grant execute on function public.get_reactiva_score_summary(uuid, date) to authenticated;

notify pgrst, 'reload schema';
