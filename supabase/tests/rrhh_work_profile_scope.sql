-- Verifica que RR. HH. solo pueda leer analiticas agregadas de su empresa y
-- que los filtros Administrativo/Operativo no amplien el conjunto de datos.
-- La prueba es transaccional y no modifica informacion persistente.

begin;

do $test$
declare
  rrhh_id uuid;
  own_company_id uuid;
  other_company_id uuid;
  all_count integer;
  administrative_count integer;
  operative_count integer;
  cross_company_blocked boolean := false;
begin
  select profile.id, profile.company_id
  into rrhh_id, own_company_id
  from public.profiles profile
  where profile.role::text = 'rrhh'
    and profile.company_id is not null
  limit 1;

  if rrhh_id is null then
    raise notice 'Prueba omitida: no hay un perfil RR. HH. asociado a una empresa.';
    return;
  end if;

  perform set_config('request.jwt.claim.sub', rrhh_id::text, true);
  perform set_config('request.jwt.claim.role', 'authenticated', true);

  select count(*) into all_count
  from public.get_analytics_pause_sessions(own_company_id, null, null, null);

  select count(*) into administrative_count
  from public.get_analytics_pause_sessions(own_company_id, 'ADMINISTRATIVO', null, null);

  select count(*) into operative_count
  from public.get_analytics_pause_sessions(own_company_id, 'OPERATIVO', null, null);

  if administrative_count > all_count or operative_count > all_count then
    raise exception 'Los segmentos laborales devolvieron mas sesiones que el total de la empresa.';
  end if;

  select company.id into other_company_id
  from public.companies company
  where company.id <> own_company_id
  limit 1;

  if other_company_id is not null then
    begin
      perform * from public.get_analytics_pause_sessions(other_company_id, null, null, null);
    exception
      when others then
        cross_company_blocked := sqlerrm = 'No tenes permisos para consultar otra empresa.';
    end;

    if not cross_company_blocked then
      raise exception 'RR. HH. pudo intentar consultar analiticas de otra empresa.';
    end if;
  end if;
end;
$test$;

rollback;
