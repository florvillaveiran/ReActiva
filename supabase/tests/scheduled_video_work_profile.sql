-- Prueba transaccional de la programacion segmentada. No deja datos.
begin;

do $test$
declare
  admin_id uuid;
  company_id uuid;
  global_all_id uuid;
  global_admin_id uuid;
  company_all_id uuid;
  company_admin_id uuid;
  company_oper_id uuid;
  resolved_id uuid;
  conflict_blocked boolean := false;
begin
  select id into admin_id
  from public.profiles
  where role::text in ('admin', 'superadmin')
  limit 1;

  select id into company_id
  from public.companies
  limit 1;

  if admin_id is null or company_id is null then
    raise exception 'La prueba requiere al menos un administrador y una empresa.';
  end if;

  perform set_config('request.jwt.claim.sub', admin_id::text, true);

  global_all_id := public.save_scheduled_video(
    null, null, 'Test global todos', 'https://example.com/global-all', null,
    'Lunes', '2099-01-05', 'morning', '10:30', 'Global', null
  );
  global_admin_id := public.save_scheduled_video(
    null, null, 'Test global administrativo', 'https://example.com/global-admin', null,
    'Lunes', '2099-01-05', 'morning', '10:30', 'Global', 'ADMINISTRATIVO'
  );
  company_all_id := public.save_scheduled_video(
    null, company_id, 'Test empresa todos', 'https://example.com/company-all', null,
    'Lunes', '2099-01-05', 'morning', '10:30', 'Ignorado', null
  );
  company_admin_id := public.save_scheduled_video(
    null, company_id, 'Test empresa administrativo', 'https://example.com/company-admin', null,
    'Lunes', '2099-01-05', 'morning', '10:30', 'Ignorado', 'ADMINISTRATIVO'
  );
  company_oper_id := public.save_scheduled_video(
    null, company_id, 'Test empresa operativo', 'https://example.com/company-oper', null,
    'Lunes', '2099-01-05', 'morning', '10:30', 'Ignorado', 'OPERATIVO'
  );

  begin
    perform public.save_scheduled_video(
      null, company_id, 'Test duplicado', 'https://example.com/duplicate', null,
      'Lunes', '2099-01-05', 'morning', '10:30', 'Ignorado', 'ADMINISTRATIVO'
    );
  exception
    when others then
      if sqlerrm like 'Ya existe un video para esa empresa, perfil, fecha y turno.%' then
        conflict_blocked := true;
      else
        raise;
      end if;
  end;

  if not conflict_blocked then
    raise exception 'La programacion duplicada no fue bloqueada.';
  end if;

  select id into resolved_id
  from public.get_scheduled_video_for_profile(
    company_id, 'ADMINISTRATIVO', '2099-01-05', 'morning'
  );
  if resolved_id is distinct from company_admin_id then
    raise exception 'Fallo prioridad empresa + perfil administrativo.';
  end if;

  select id into resolved_id
  from public.get_scheduled_video_for_profile(
    company_id, 'OPERATIVO', '2099-01-05', 'morning'
  );
  if resolved_id is distinct from company_oper_id then
    raise exception 'Fallo prioridad empresa + perfil operativo.';
  end if;

  select id into resolved_id
  from public.get_scheduled_video_for_profile(
    company_id, null, '2099-01-05', 'morning'
  );
  if resolved_id is distinct from company_all_id then
    raise exception 'Fallo fallback empresa + todos los perfiles.';
  end if;

  if global_all_id is null or global_admin_id is null then
    raise exception 'No se crearon las combinaciones globales.';
  end if;
end;
$test$;

rollback;
