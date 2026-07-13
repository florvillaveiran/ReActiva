-- Permite que un administrador elimine empleados registrados e invitaciones
-- pendientes sin exponer credenciales privilegiadas en el navegador.

drop function if exists public.delete_platform_user(uuid, uuid);

create function public.delete_platform_user(
  target_invitation_id uuid default null,
  target_profile_id uuid default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null or not exists (
    select 1
    from public.profiles
    where id = auth.uid() and role::text = 'admin'
  ) then
    raise exception 'No tenés permisos para eliminar usuarios.';
  end if;

  if target_profile_id is null and target_invitation_id is null then
    raise exception 'Indicá un usuario o una invitación para eliminar.';
  end if;

  if target_profile_id is not null then
    if target_profile_id = auth.uid() then
      raise exception 'No podés eliminar tu propia cuenta de administrador.';
    end if;

    delete from public.onboarding_responses
    where profile_id = target_profile_id;

    delete from public.profiles
    where id = target_profile_id;

    delete from auth.users
    where id = target_profile_id;
  end if;

  if target_invitation_id is not null then
    delete from public.onboarding_responses
    where id = target_invitation_id
      and profile_id is null
      and type = 'user_activation';
  end if;
end;
$$;

revoke all on function public.delete_platform_user(uuid, uuid) from public;
grant execute on function public.delete_platform_user(uuid, uuid) to authenticated;

notify pgrst, 'reload schema';
