-- Automatizacion editable para recordar una pausa que sigue pendiente.
-- Se ejecuta sobre la misma programacion por empresa, dia y turno de Contenidos.

alter table public.email_automation_templates
  add column if not exists active boolean not null default true;

alter table public.email_automation_templates
  add column if not exists delay_minutes integer not null default 0;

alter table public.email_automation_templates
  drop constraint if exists email_automation_templates_delay_minutes_check;

alter table public.email_automation_templates
  add constraint email_automation_templates_delay_minutes_check
  check (delay_minutes between 0 and 1440);

update public.email_automation_templates
set active = true,
    delay_minutes = 5
where id = 'pause-reminder';

insert into public.email_automation_templates (
  id,
  subject,
  body,
  active,
  delay_minutes
)
values (
  'missed-pause-reminder',
  'Tu pausa activa sigue disponible',
  E'Hola {{nombre}},\n\nNotamos que todavia no realizaste la pausa de {{empresa}} programada para las {{hora}} hs. Tomate unos minutos para hacerla cuando puedas.\n\nIngresa a ReActiva para comenzar.',
  true,
  40
)
on conflict (id) do update set
  active = coalesce(public.email_automation_templates.active, excluded.active),
  delay_minutes = case
    when public.email_automation_templates.delay_minutes = 0 then excluded.delay_minutes
    else public.email_automation_templates.delay_minutes
  end;

create or replace function public.save_email_automation_settings(
  template_id text,
  template_subject text,
  template_body text,
  template_active boolean,
  template_delay_minutes integer
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null or not public.is_platform_admin(auth.uid()) then
    raise exception 'No tenes permisos para administrar automatizaciones de email.';
  end if;
  if template_id not in ('pause-reminder', 'missed-pause-reminder') then
    raise exception 'La automatizacion indicada no puede modificarse desde este panel.';
  end if;
  if nullif(trim(template_subject), '') is null or nullif(trim(template_body), '') is null then
    raise exception 'Completa el asunto y el cuerpo del email.';
  end if;
  if template_delay_minutes < 0 or template_delay_minutes > 1440 then
    raise exception 'El tiempo debe estar entre 0 y 1440 minutos.';
  end if;

  insert into public.email_automation_templates (
    id, subject, body, active, delay_minutes, updated_by
  ) values (
    template_id,
    trim(template_subject),
    trim(template_body),
    coalesce(template_active, true),
    template_delay_minutes,
    auth.uid()
  )
  on conflict (id) do update set
    subject = excluded.subject,
    body = excluded.body,
    active = excluded.active,
    delay_minutes = excluded.delay_minutes,
    updated_by = excluded.updated_by;
end;
$$;

revoke all on function public.save_email_automation_settings(text, text, text, boolean, integer) from public;
grant execute on function public.save_email_automation_settings(text, text, text, boolean, integer) to authenticated;

grant select on table public.pause_sessions to service_role;

notify pgrst, 'reload schema';
