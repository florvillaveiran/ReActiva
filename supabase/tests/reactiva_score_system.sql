-- Prueba transaccional del motor de Puntaje ReActiva. No deja datos.
-- Cubre total semanal, duplicados, meses de 4/5 semanas, alta durante el mes,
-- elegibilidad y corte de rachas.

begin;

do $test$
declare
  admin_id uuid;
  subject_id uuid;
  subject_company uuid;
  week_dates date[] := array[
    date '2098-01-01',
    date '2098-01-06',
    date '2098-01-13',
    date '2098-01-20',
    date '2098-01-27'
  ];
  activity record;
  activity_date date;
  week_monday date;
  result jsonb;
  before_duplicate integer;
  after_duplicate integer;
begin
  select id into admin_id
  from public.profiles
  where role::text in ('admin', 'superadmin')
  order by created_at
  limit 1;

  select id, company_id into subject_id, subject_company
  from public.profiles
  where role::text = 'usuario' and company_id is not null
  order by created_at
  limit 1;

  if admin_id is null or subject_id is null or subject_company is null then
    raise exception 'La prueba requiere un administrador y un usuario asociado a una empresa.';
  end if;

  delete from public.reactiva_score_events
  where profile_id = subject_id and month_reference = date '2098-01-01';

  update public.profiles
  set reactiva_score_started_at = '2098-01-01 00:00:00+00'
  where id = subject_id;

  insert into public.reactiva_score_settings (company_id, enabled, raffle_threshold_percent)
  values (subject_company, true, 80)
  on conflict (company_id) do update set enabled = true, raffle_threshold_percent = 80;

  -- Cuatro semanas completas: 6x1 + 2x1 + 1x2 = 10 por semana.
  foreach activity_date in array week_dates[1:4]
  loop
    week_monday := date_trunc('week', activity_date)::date;
    for activity in
      select * from (values
        ('MICROTRAINING', 'micro-1', 1),
        ('MICROTRAINING', 'micro-2', 1),
        ('MICROTRAINING', 'micro-3', 1),
        ('MICROTRAINING', 'micro-4', 1),
        ('MICROTRAINING', 'micro-5', 1),
        ('MICROTRAINING', 'micro-6', 1),
        ('DAILY_FORM', 'daily-1', 1),
        ('DAILY_FORM', 'daily-2', 1),
        ('WEEKLY_FORM', 'weekly', 2)
      ) as expected(activity_type, suffix, points)
    loop
      insert into public.reactiva_score_events (
        profile_id, company_id, activity_type, activity_id, points,
        completed_at, activity_date, week_start, month_reference, source
      ) values (
        subject_id, subject_company, activity.activity_type,
        'test:' || activity_date::text || ':' || activity.suffix,
        activity.points, activity_date::timestamptz, activity_date,
        week_monday, date '2098-01-01', 'test'
      );
    end loop;
  end loop;

  perform set_config('request.jwt.claim.sub', admin_id::text, true);
  result := public.get_reactiva_user_score(subject_id, date '2098-01-01');
  if (result->>'score')::integer <> 40 or (result->>'maximum')::integer <> 40 then
    raise exception 'Un mes de cuatro semanas completas debe devolver 40/40: %', result;
  end if;
  if (result->>'percent')::numeric <> 100 or not (result->>'eligible')::boolean then
    raise exception 'El 40/40 debe equivaler a 100%% y ser elegible: %', result;
  end if;

  select count(*) into before_duplicate
  from public.reactiva_score_events
  where profile_id = subject_id and activity_id = 'test:2098-01-01:micro-1';
  insert into public.reactiva_score_events (
    profile_id, company_id, activity_type, activity_id, points,
    completed_at, activity_date, week_start, month_reference, source
  ) values (
    subject_id, subject_company, 'MICROTRAINING', 'test:2098-01-01:micro-1', 1,
    '2098-01-01 12:00:00+00', date '2098-01-01', date_trunc('week', date '2098-01-01')::date,
    date '2098-01-01', 'test'
  ) on conflict (profile_id, activity_type, activity_id) do nothing;
  select count(*) into after_duplicate
  from public.reactiva_score_events
  where profile_id = subject_id and activity_id = 'test:2098-01-01:micro-1';
  if before_duplicate <> 1 or after_duplicate <> 1 then
    raise exception 'La deduplicacion de actividades no funciona.';
  end if;

  -- Quinta semana completa: el maximo mensual debe crecer dinamicamente a 50.
  activity_date := week_dates[5];
  week_monday := date_trunc('week', activity_date)::date;
  for activity in
    select * from (values
      ('MICROTRAINING', 'micro-1', 1), ('MICROTRAINING', 'micro-2', 1),
      ('MICROTRAINING', 'micro-3', 1), ('MICROTRAINING', 'micro-4', 1),
      ('MICROTRAINING', 'micro-5', 1), ('MICROTRAINING', 'micro-6', 1),
      ('DAILY_FORM', 'daily-1', 1), ('DAILY_FORM', 'daily-2', 1),
      ('WEEKLY_FORM', 'weekly', 2)
    ) as expected(activity_type, suffix, points)
  loop
    insert into public.reactiva_score_events (
      profile_id, company_id, activity_type, activity_id, points,
      completed_at, activity_date, week_start, month_reference, source
    ) values (
      subject_id, subject_company, activity.activity_type,
      'test:' || activity_date::text || ':' || activity.suffix,
      activity.points, activity_date::timestamptz, activity_date,
      week_monday, date '2098-01-01', 'test'
    );
  end loop;

  result := public.get_reactiva_user_score(subject_id, date '2098-01-01');
  if (result->>'score')::integer <> 50 or (result->>'maximum')::integer <> 50 then
    raise exception 'Un mes de cinco semanas completas debe devolver 50/50: %', result;
  end if;
  if public.reactiva_user_streak(subject_id, date '2098-01-31') <> 5 then
    raise exception 'Cinco semanas de 10/10 deben formar una racha de 5.';
  end if;
  if public.reactiva_user_best_streak(subject_id, date '2098-01-31') <> 5 then
    raise exception 'La mejor racha historica debe conservar las cinco semanas completas.';
  end if;

  -- Alta durante el mes: solo se computan las semanas disponibles desde el alta.
  update public.profiles
  set reactiva_score_started_at = '2098-01-20 00:00:00+00'
  where id = subject_id;
  result := public.get_reactiva_user_score(subject_id, date '2098-01-01');
  if (result->>'score')::integer <> 20 or (result->>'maximum')::integer <> 20 then
    raise exception 'El alta a mitad de mes debe prorratear por semanas disponibles: %', result;
  end if;

  -- Una semana incompleta entre semanas completas corta la racha.
  update public.profiles
  set reactiva_score_started_at = '2098-01-01 00:00:00+00'
  where id = subject_id;
  delete from public.reactiva_score_events
  where profile_id = subject_id
    and activity_id = 'test:2098-01-20:micro-1';
  if public.reactiva_user_streak(subject_id, date '2098-01-31') <> 1 then
    raise exception 'La semana incompleta anterior a la ultima debe dejar una racha de 1.';
  end if;
  if public.reactiva_user_best_streak(subject_id, date '2098-01-31') <> 3 then
    raise exception 'La mejor racha debe conservar el mayor tramo previo de semanas completas.';
  end if;
end;
$test$;

rollback;
