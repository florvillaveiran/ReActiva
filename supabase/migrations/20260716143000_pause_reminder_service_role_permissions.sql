-- Permisos mínimos para que la Edge Function pause-reminder-cron pueda
-- consultar la programación y registrar el resultado de cada recordatorio.
-- RLS continúa activa para los usuarios de la plataforma.

grant select on table
  public.video_unlock_schedule,
  public.content_items,
  public.companies,
  public.profiles,
  public.email_automation_templates
to service_role;

grant select, insert on table public.email_events to service_role;

