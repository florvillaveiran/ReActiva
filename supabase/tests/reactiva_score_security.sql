-- Prueba transaccional del alcance por rol del Puntaje ReActiva. No deja datos.

begin;

do $test$
declare
  subject_id uuid;
  subject_company uuid;
  foreign_subject_id uuid;
  rrhh_id uuid;
  returned_company uuid;
  denied boolean := false;
begin
  select id, company_id into subject_id, subject_company
  from public.profiles
  where role::text = 'usuario' and company_id is not null
  order by created_at
  limit 1;

  if subject_id is null then
    raise exception 'La prueba requiere al menos un usuario asociado a una empresa.';
  end if;

  select id into foreign_subject_id
  from public.profiles
  where role::text = 'usuario'
    and company_id is not null
    and company_id <> subject_company
  order by created_at
  limit 1;

  perform set_config('request.jwt.claim.sub', subject_id::text, true);
  returned_company := (public.get_reactiva_user_score(null, current_date)->>'company_id')::uuid;
  if returned_company <> subject_company then
    raise exception 'El usuario no pudo consultar correctamente su propio puntaje.';
  end if;

  if foreign_subject_id is not null then
    begin
      perform public.get_reactiva_user_score(foreign_subject_id, current_date);
    exception when others then
      denied := true;
    end;
    if not denied then
      raise exception 'Un usuario pudo consultar el puntaje de otra empresa.';
    end if;
  end if;

  select id into rrhh_id
  from public.profiles
  where role::text = 'rrhh' and company_id = subject_company
  order by created_at
  limit 1;

  if rrhh_id is not null then
    perform set_config('request.jwt.claim.sub', rrhh_id::text, true);
    if exists (
      select 1
      from public.get_reactiva_team_scores(null, current_date) score
      where (score->>'company_id')::uuid <> subject_company
    ) then
      raise exception 'RRHH recibio puntajes de otra empresa.';
    end if;
  end if;
end;
$test$;

rollback;
