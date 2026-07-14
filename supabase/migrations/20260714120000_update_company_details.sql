-- Permite que un administrador actualice los datos de contacto de una empresa
-- sin modificar su id ni las relaciones con empleados, contenido y analiticas.

create or replace function public.update_company_details(
  target_company_id uuid,
  company_name text,
  company_location text,
  contact_name text,
  rrhh_email text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null or not public.is_platform_admin(auth.uid()) then
    raise exception 'No tenes permisos para editar empresas.';
  end if;
  if target_company_id is null then
    raise exception 'La empresa es obligatoria.';
  end if;
  if nullif(trim(company_name), '') is null
    or nullif(trim(company_location), '') is null
    or nullif(trim(contact_name), '') is null
    or nullif(trim(rrhh_email), '') is null then
    raise exception 'Completa todos los datos de la empresa.';
  end if;

  update public.companies
  set name = trim(company_name),
      location = trim(company_location),
      contact_name = trim(contact_name),
      rrhh_email = lower(trim(rrhh_email))
  where id = target_company_id;

  if not found then
    raise exception 'No encontramos la empresa seleccionada.';
  end if;
end;
$$;

revoke all on function public.update_company_details(uuid, text, text, text, text) from public;
grant execute on function public.update_company_details(uuid, text, text, text, text) to authenticated;

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'companies'
  ) then
    alter publication supabase_realtime add table public.companies;
  end if;
end $$;

notify pgrst, 'reload schema';
