-- Sincroniza la plantilla del recordatorio de pausa entre el panel de Emails
-- y la funcion automatica pause-reminder-cron.

create table if not exists public.email_automation_templates (
  id text primary key,
  subject text not null,
  body text not null,
  updated_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists email_automation_templates_touch_updated_at on public.email_automation_templates;
create trigger email_automation_templates_touch_updated_at
before update on public.email_automation_templates
for each row execute function public.touch_updated_at();

insert into public.email_automation_templates (id, subject, body)
values (
  'pause-reminder',
  'Tu pausa activa estara disponible en {{minutos}} minutos',
  E'Hola {{nombre}},\n\nTu pausa activa de {{empresa}} estara disponible en {{minutos}} minutos. Horario programado: {{hora}} hs.\n\nIngresa a ReActiva para comenzar.'
)
on conflict (id) do nothing;

create or replace function public.save_email_automation_template(
  template_id text,
  template_subject text,
  template_body text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null or not public.is_platform_admin(auth.uid()) then
    raise exception 'No tenes permisos para administrar plantillas de email.';
  end if;
  if template_id <> 'pause-reminder' then
    raise exception 'La plantilla indicada no puede modificarse desde este panel.';
  end if;
  if nullif(trim(template_subject), '') is null or nullif(trim(template_body), '') is null then
    raise exception 'Completa el asunto y el cuerpo del email.';
  end if;

  insert into public.email_automation_templates (id, subject, body, updated_by)
  values (template_id, trim(template_subject), trim(template_body), auth.uid())
  on conflict (id) do update set
    subject = excluded.subject,
    body = excluded.body,
    updated_by = excluded.updated_by;
end;
$$;

alter table public.email_automation_templates enable row level security;

drop policy if exists email_automation_templates_read_authenticated on public.email_automation_templates;
create policy email_automation_templates_read_authenticated on public.email_automation_templates
for select to authenticated using (true);

revoke all on public.email_automation_templates from anon;
grant select on public.email_automation_templates to authenticated;
revoke all on function public.save_email_automation_template(text, text, text) from public;
grant execute on function public.save_email_automation_template(text, text, text) to authenticated;

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'email_automation_templates'
  ) then
    alter publication supabase_realtime add table public.email_automation_templates;
  end if;
end $$;

notify pgrst, 'reload schema';
