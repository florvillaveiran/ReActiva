-- Prueba transaccional de entrega al panel del usuario. No deja datos.
begin;

do $test$
declare
  admin_id uuid;
  viewer_id uuid;
  viewer_company_id uuid;
  company_all_id uuid;
  company_admin_id uuid;
  company_oper_id uuid;
  resolved_id uuid;
  resolved_count integer;
begin
  select id into admin_id
  from public.profiles
  where role::text in ('admin', 'superadmin')
  limit 1;

  select id, company_id into viewer_id, viewer_company_id
  from public.profiles
  where role::text = 'usuario'
    and company_id is not null
  limit 1;

  if admin_id is null or viewer_id is null or viewer_company_id is null then
    raise exception 'La prueba requiere un administrador y un usuario asociado a una empresa.';
  end if;

  delete from public.content_items
  where kind = 'video'
    and metadata->>'scheduledDate' = '2099-01-12';

  perform set_config('request.jwt.claim.sub', admin_id::text, true);

  perform public.save_scheduled_video(
    null, null, 'Test global todos', 'https://example.com/global-all', null,
    'Lunes', '2099-01-12', 'morning', '10:30', 'Global', null
  );
  perform public.save_scheduled_video(
    null, null, 'Test global administrativo', 'https://example.com/global-admin', null,
    'Lunes', '2099-01-12', 'morning', '10:30', 'Global', 'ADMINISTRATIVO'
  );
  perform public.save_scheduled_video(
    null, null, 'Test global operativo', 'https://example.com/global-oper', null,
    'Lunes', '2099-01-12', 'morning', '10:30', 'Global', 'OPERATIVO'
  );
  company_all_id := public.save_scheduled_video(
    null, viewer_company_id, 'Test empresa todos', 'https://example.com/company-all', null,
    'Lunes', '2099-01-12', 'morning', '10:30', 'Ignorado', null
  );
  company_admin_id := public.save_scheduled_video(
    null, viewer_company_id, 'Test empresa administrativo', 'https://example.com/company-admin', null,
    'Lunes', '2099-01-12', 'morning', '10:30', 'Ignorado', 'ADMINISTRATIVO'
  );
  company_oper_id := public.save_scheduled_video(
    null, viewer_company_id, 'Test empresa operativo', 'https://example.com/company-oper', null,
    'Lunes', '2099-01-12', 'morning', '10:30', 'Ignorado', 'OPERATIVO'
  );

  perform set_config('request.jwt.claim.sub', viewer_id::text, true);

  update public.profiles
  set work_profile = 'ADMINISTRATIVO'
  where id = viewer_id;

  select count(*), (array_agg(id))[1] into resolved_count, resolved_id
  from public.get_my_scheduled_videos(array['2099-01-12'::date]);
  if resolved_count <> 1 or resolved_id is distinct from company_admin_id then
    raise exception 'El usuario administrativo no recibio exclusivamente su video de empresa.';
  end if;

  update public.profiles
  set work_profile = 'OPERATIVO'
  where id = viewer_id;

  select count(*), (array_agg(id))[1] into resolved_count, resolved_id
  from public.get_my_scheduled_videos(array['2099-01-12'::date]);
  if resolved_count <> 1 or resolved_id is distinct from company_oper_id then
    raise exception 'El usuario operativo no recibio exclusivamente su video de empresa.';
  end if;

  update public.profiles
  set work_profile = null
  where id = viewer_id;

  select count(*), (array_agg(id))[1] into resolved_count, resolved_id
  from public.get_my_scheduled_videos(array['2099-01-12'::date]);
  if resolved_count <> 1 or resolved_id is distinct from company_all_id then
    raise exception 'El usuario sin clasificar no recibio el contenido general de respaldo.';
  end if;
end;
$test$;

rollback;
