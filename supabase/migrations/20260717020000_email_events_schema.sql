-- Auditoria y extension aditiva de email_events.
-- Idempotente: seguro en produccion (no destruye datos existentes).
-- Contexto: el DDL original nunca fue commiteado. Esta migracion
-- establece la tabla formalmente y agrega las columnas necesarias
-- para la Etapa 10 (historial de envios, segmentacion por perfil laboral
-- y panel de Rendimiento con datos reales).

-- 1. DDL base (para entornos nuevos o db reset)
create table if not exists public.email_events (
  id           uuid primary key default gen_random_uuid(),
  company_id   uuid references public.companies(id) on delete set null,
  profile_id   uuid references public.profiles(id) on delete set null,
  event_type   text not null,
  metadata     jsonb not null default '{}'::jsonb,
  created_at   timestamptz not null default now()
);

-- 2. Columnas nuevas (aditivas, no rompen produccion)
alter table public.email_events
  add column if not exists created_at          timestamptz not null default now(),
  add column if not exists automation_id       text,
  add column if not exists template_id         text,
  add column if not exists work_profile        text,
  add column if not exists subject             text,
  add column if not exists recipient_email     text,
  add column if not exists sent_at             timestamptz,
  add column if not exists provider_message_id text,
  add column if not exists status              text not null default 'sent',
  add column if not exists error_message       text;

-- 3. Constraint de status validos
alter table public.email_events
  drop constraint if exists email_events_status_check;
alter table public.email_events
  add constraint email_events_status_check
  check (status in ('sent', 'failed', 'opened', 'clicked', 'bounced'));

-- 4. Constraint de work_profile validos
alter table public.email_events
  drop constraint if exists email_events_work_profile_check;
alter table public.email_events
  add constraint email_events_work_profile_check
  check (work_profile is null or work_profile in ('ADMINISTRATIVO', 'OPERATIVO'));

-- 5. Indices para deduplicacion y rendimiento
-- Deduplica eventos por destinatario y tipo (patron usado en el cron)
create index if not exists email_events_profile_type_idx
  on public.email_events (profile_id, event_type);

-- Filtros del panel de Rendimiento por empresa y fecha
create index if not exists email_events_company_created_idx
  on public.email_events (company_id, created_at desc);

-- Filtro por automatizacion especifica
create index if not exists email_events_automation_idx
  on public.email_events (automation_id)
  where automation_id is not null;

-- Filtro por perfil laboral para el panel de Rendimiento segmentado
create index if not exists email_events_work_profile_idx
  on public.email_events (work_profile)
  where work_profile is not null;

-- GIN sobre metadata para que la deduplicacion por dedupeKey sea eficiente
-- (actualmente usa .contains('metadata', { dedupeKey }) en el cron)
create index if not exists email_events_metadata_gin_idx
  on public.email_events using gin (metadata);

-- 6. RLS
alter table public.email_events enable row level security;

-- Los admins pueden leer todos los eventos para el panel de Rendimiento
drop policy if exists email_events_admin_read on public.email_events;
create policy email_events_admin_read on public.email_events
  for select to authenticated
  using (public.is_platform_admin(auth.uid()));

-- 7. Grant de lectura para el panel de Rendimiento
-- (el grant de INSERT al service_role ya existe en 20260716143000)
grant select on public.email_events to authenticated;

notify pgrst, 'reload schema';
