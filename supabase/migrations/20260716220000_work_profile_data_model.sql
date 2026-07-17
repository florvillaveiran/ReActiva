-- Etapa 1: modelo de datos para perfiles laborales.
--
-- La base usa snake_case de forma consistente. `work_profile` es la
-- representacion SQL del unico concepto `workProfile` usado por la aplicacion.
-- Los usuarios existentes permanecen en null y se muestran como "Sin clasificar"
-- en las etapas de interfaz posteriores.

do $$
begin
  if not exists (
    select 1
    from pg_type type
    join pg_namespace namespace on namespace.oid = type.typnamespace
    where namespace.nspname = 'public'
      and type.typname = 'work_profile'
  ) then
    create type public.work_profile as enum ('ADMINISTRATIVO', 'OPERATIVO');
  end if;
end $$;

alter table public.profiles
  add column if not exists work_profile public.work_profile;

alter table public.onboarding_responses
  add column if not exists work_profile public.work_profile;

alter table public.content_items
  add column if not exists target_work_profile public.work_profile,
  add column if not exists recommended_work_profile public.work_profile;

alter table public.email_automation_templates
  add column if not exists target_work_profile public.work_profile;

comment on column public.profiles.work_profile is
  'Perfil laboral estructural del usuario: ADMINISTRATIVO u OPERATIVO. Null significa Sin clasificar.';
comment on column public.onboarding_responses.work_profile is
  'Perfil laboral declarado al completar el onboarding; conserva el dato historico incluso antes de activar la cuenta.';
comment on column public.content_items.target_work_profile is
  'Perfil laboral exclusivo al que se dirige el contenido. Null significa todos los perfiles.';
comment on column public.content_items.recommended_work_profile is
  'Perfil laboral para el que se recomienda primero el contenido. No restringe visibilidad por si solo.';
comment on column public.email_automation_templates.target_work_profile is
  'Perfil laboral destinatario de la automatizacion. Null significa todos los perfiles.';

create index if not exists profiles_company_work_profile_status_idx
  on public.profiles (company_id, work_profile, status);

create index if not exists onboarding_responses_company_work_profile_idx
  on public.onboarding_responses (company_id, work_profile, completed_at)
  where type = 'user_activation';

create index if not exists content_items_target_work_profile_idx
  on public.content_items (kind, company_id, target_work_profile, active, created_at);

create table if not exists public.profile_work_profile_changes (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  company_id uuid references public.companies(id) on delete set null,
  previous_work_profile public.work_profile,
  new_work_profile public.work_profile,
  changed_by uuid references public.profiles(id) on delete set null,
  changed_at timestamptz not null default now()
);

create index if not exists profile_work_profile_changes_profile_date_idx
  on public.profile_work_profile_changes (profile_id, changed_at desc);

create or replace function public.audit_profile_work_profile_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if old.work_profile is distinct from new.work_profile then
    insert into public.profile_work_profile_changes (
      profile_id,
      company_id,
      previous_work_profile,
      new_work_profile,
      changed_by
    ) values (
      new.id,
      new.company_id,
      old.work_profile,
      new.work_profile,
      auth.uid()
    );
  end if;

  return new;
end;
$$;

drop trigger if exists profiles_audit_work_profile_change on public.profiles;
create trigger profiles_audit_work_profile_change
after update of work_profile on public.profiles
for each row execute function public.audit_profile_work_profile_change();

create or replace function public.set_user_work_profile(
  target_profile_id uuid,
  new_work_profile text
)
returns public.profiles
language plpgsql
security definer
set search_path = ''
as $$
declare
  resolved_work_profile public.work_profile;
  updated_profile public.profiles;
begin
  if auth.uid() is null or not public.is_platform_admin(auth.uid()) then
    raise exception 'No tenes permisos para modificar perfiles laborales.';
  end if;

  if target_profile_id is null then
    raise exception 'El usuario es obligatorio.';
  end if;

  begin
    resolved_work_profile := upper(nullif(trim(new_work_profile), ''))::public.work_profile;
  exception
    when invalid_text_representation then
      raise exception 'El perfil laboral debe ser ADMINISTRATIVO u OPERATIVO.';
  end;

  if resolved_work_profile is null then
    raise exception 'El perfil laboral es obligatorio.';
  end if;

  update public.profiles
  set work_profile = resolved_work_profile
  where id = target_profile_id
    and role::text = 'usuario'
  returning * into updated_profile;

  if not found then
    raise exception 'No encontramos el empleado seleccionado.';
  end if;

  return updated_profile;
end;
$$;

create or replace function public.set_company_users_work_profile(
  target_company_id uuid,
  new_work_profile text,
  only_unclassified boolean default true
)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  resolved_work_profile public.work_profile;
  updated_count integer;
begin
  if auth.uid() is null or not public.is_platform_admin(auth.uid()) then
    raise exception 'No tenes permisos para modificar perfiles laborales.';
  end if;

  if target_company_id is null or not exists (
    select 1 from public.companies where id = target_company_id
  ) then
    raise exception 'No encontramos la empresa seleccionada.';
  end if;

  begin
    resolved_work_profile := upper(nullif(trim(new_work_profile), ''))::public.work_profile;
  exception
    when invalid_text_representation then
      raise exception 'El perfil laboral debe ser ADMINISTRATIVO u OPERATIVO.';
  end;

  if resolved_work_profile is null then
    raise exception 'El perfil laboral es obligatorio.';
  end if;

  update public.profiles
  set work_profile = resolved_work_profile
  where company_id = target_company_id
    and role::text = 'usuario'
    and (not coalesce(only_unclassified, true) or work_profile is null);

  get diagnostics updated_count = row_count;
  return updated_count;
end;
$$;

alter table public.profile_work_profile_changes enable row level security;

drop policy if exists profile_work_profile_changes_admin_read on public.profile_work_profile_changes;
create policy profile_work_profile_changes_admin_read
on public.profile_work_profile_changes
for select
to authenticated
using (public.is_platform_admin(auth.uid()));

revoke all on public.profile_work_profile_changes from anon, authenticated;
grant select on public.profile_work_profile_changes to authenticated;

revoke all on function public.set_user_work_profile(uuid, text) from public;
revoke all on function public.set_company_users_work_profile(uuid, text, boolean) from public;
grant execute on function public.set_user_work_profile(uuid, text) to authenticated;
grant execute on function public.set_company_users_work_profile(uuid, text, boolean) to authenticated;

notify pgrst, 'reload schema';
