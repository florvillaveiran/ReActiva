-- Prueba transaccional de la segmentacion laboral de analiticas.
-- No modifica datos: todo queda dentro de una transaccion con rollback.

begin;

select set_config(
  'request.jwt.claim.sub',
  (
    select id::text
    from public.profiles
    where role::text in ('admin', 'superadmin')
    order by created_at
    limit 1
  ),
  true
);

set local role authenticated;

do $$
declare
  all_count integer;
  administrative_count integer;
  operative_count integer;
begin
  if auth.uid() is null then
    raise exception 'No hay un administrador disponible para ejecutar la prueba.';
  end if;

  select count(*) into all_count
  from public.get_analytics_pause_sessions(null, null, null, null);

  select count(*) into administrative_count
  from public.get_analytics_pause_sessions(null, 'ADMINISTRATIVO', null, null);

  select count(*) into operative_count
  from public.get_analytics_pause_sessions(null, 'OPERATIVO', null, null);

  if administrative_count > all_count or operative_count > all_count then
    raise exception 'Un segmento laboral devolvio mas sesiones que la vista total.';
  end if;
end;
$$;

rollback;
