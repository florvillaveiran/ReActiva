-- Etapa 2: el perfil laboral nace en el onboarding del empleado y se conserva
-- al activar su cuenta. La firma publica de las RPC no cambia.

create or replace function public.complete_user_onboarding(
  invitation_token text,
  user_email text,
  user_full_name text,
  onboarding_data jsonb
)
returns public.onboarding_responses
language plpgsql
security definer
set search_path = ''
as $$
declare
  inv public.invitations%rowtype;
  saved_response public.onboarding_responses%rowtype;
  normalized_email text;
  submitted_work_profile public.work_profile;
  normalized_onboarding_data jsonb;
begin
  normalized_email := lower(trim(user_email));
  normalized_onboarding_data := coalesce(onboarding_data, '{}'::jsonb);

  if normalized_email = '' or trim(user_full_name) = '' then
    raise exception 'El nombre y el email son obligatorios.';
  end if;

  begin
    submitted_work_profile := upper(
      nullif(trim(normalized_onboarding_data->>'workProfile'), '')
    )::public.work_profile;
  exception
    when invalid_text_representation then
      raise exception 'El perfil laboral debe ser ADMINISTRATIVO u OPERATIVO.';
  end;

  if submitted_work_profile is null then
    raise exception 'Selecciona que tipo de trabajo realizas principalmente.';
  end if;

  select invitation.* into inv
  from public.invitations invitation
  where invitation.token = invitation_token
    and invitation.type = 'user_activation'
    and invitation.status in ('pending', 'completed')
    and (invitation.expires_at is null or invitation.expires_at > now())
  order by invitation.created_at desc
  limit 1;

  if inv.id is null then
    raise exception 'La invitacion es invalida o esta vencida.';
  end if;

  if inv.email is not null and lower(inv.email) <> normalized_email then
    raise exception 'El email no coincide con la invitacion.';
  end if;

  delete from public.onboarding_responses response
  where response.invitation_id = inv.id
    and lower(coalesce(response.responses->>'email', '')) = normalized_email
    and response.profile_id is null;

  insert into public.onboarding_responses (
    company_id,
    invitation_id,
    type,
    responses,
    work_profile,
    completed_at
  ) values (
    inv.company_id,
    inv.id,
    'user_activation',
    normalized_onboarding_data
      || jsonb_build_object(
        'email', normalized_email,
        'nombre', trim(user_full_name),
        'workProfile', submitted_work_profile::text
      ),
    submitted_work_profile,
    now()
  )
  returning * into saved_response;

  return saved_response;
end;
$$;

create or replace function public.activate_invitation(invitation_token text)
returns public.profiles
language plpgsql
security definer
set search_path = ''
as $$
declare
  inv public.invitations%rowtype;
  current_email text;
  current_profile_role public.app_role;
  employee_onboarding jsonb;
  employee_work_profile public.work_profile;
  updated_profile public.profiles%rowtype;
  is_reusable_demo boolean;
begin
  select invitation.* into inv
  from public.invitations invitation
  where invitation.token = invitation_token
    and invitation.status in ('pending', 'completed')
    and (invitation.expires_at is null or invitation.expires_at > now())
  order by invitation.created_at desc
  limit 1;

  if inv.id is null then
    raise exception 'Invalid or expired invitation';
  end if;

  select auth_user.email into current_email
  from auth.users auth_user
  where auth_user.id = auth.uid();

  if current_email is null then
    raise exception 'Authentication required';
  end if;
  if inv.email is not null and lower(inv.email) <> lower(current_email) then
    raise exception 'Invitation email does not match authenticated user';
  end if;

  select profile.role into current_profile_role
  from public.profiles profile
  where profile.id = auth.uid();

  if current_profile_role in ('admin', 'rrhh') and inv.role = 'usuario' then
    raise exception 'A privileged account cannot activate an employee invitation';
  end if;

  select
    coalesce(response.responses, '{}'::jsonb),
    response.work_profile
  into employee_onboarding, employee_work_profile
  from public.onboarding_responses response
  where response.invitation_id = inv.id
    and lower(coalesce(response.responses->>'email', '')) = lower(current_email)
  order by response.completed_at desc
  limit 1;

  employee_onboarding := coalesce(employee_onboarding, '{}'::jsonb);

  -- Compatibilidad con respuestas creadas antes de agregar la columna.
  if employee_work_profile is null and nullif(employee_onboarding->>'workProfile', '') is not null then
    begin
      employee_work_profile := upper(employee_onboarding->>'workProfile')::public.work_profile;
    exception
      when invalid_text_representation then
        employee_work_profile := null;
    end;
  end if;

  update public.profiles profile
  set company_id = inv.company_id,
      role = coalesce(inv.role, profile.role),
      full_name = coalesce(nullif(employee_onboarding->>'nombre', ''), profile.full_name),
      work_profile = coalesce(employee_work_profile, profile.work_profile),
      onboarding_data = coalesce(profile.onboarding_data, '{}'::jsonb)
        || employee_onboarding
        || jsonb_build_object('invitation_token', inv.token, 'invitation_type', inv.type),
      updated_at = now()
  where profile.id = auth.uid()
  returning profile.* into updated_profile;

  if updated_profile.id is null then
    insert into public.profiles (
      id,
      company_id,
      email,
      full_name,
      role,
      work_profile,
      onboarding_data
    ) values (
      auth.uid(),
      inv.company_id,
      current_email,
      coalesce(nullif(employee_onboarding->>'nombre', ''), split_part(current_email, '@', 1)),
      coalesce(inv.role, 'usuario'::public.app_role),
      employee_work_profile,
      employee_onboarding || jsonb_build_object('invitation_token', inv.token, 'invitation_type', inv.type)
    )
    returning * into updated_profile;
  end if;

  update public.onboarding_responses response
  set profile_id = auth.uid(),
      work_profile = coalesce(response.work_profile, employee_work_profile)
  where response.invitation_id = inv.id
    and lower(coalesce(response.responses->>'email', '')) = lower(current_email)
    and response.profile_id is null;

  is_reusable_demo := coalesce((inv.metadata->>'demo')::boolean, false)
    or coalesce((inv.metadata->>'accepts_any_email')::boolean, false);
  if not is_reusable_demo then
    update public.invitations invitation
    set status = 'completed', completed_at = coalesce(invitation.completed_at, now())
    where invitation.id = inv.id;
  end if;

  return updated_profile;
end;
$$;

notify pgrst, 'reload schema';
