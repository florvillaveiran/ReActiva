// @ts-nocheck
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-cron-secret',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const appUrl = Deno.env.get('PUBLIC_APP_URL') ?? 'https://metodoreactiva.com/plataforma/login';
const unlockLeadMinutes = Number(Deno.env.get('VIDEO_UNLOCK_LEAD_MINUTES') ?? '1');
const reminderBeforeUnlockMinutes = Number(Deno.env.get('PAUSE_REMINDER_BEFORE_UNLOCK_MINUTES') ?? '5');
const reminderLeadMinutes = unlockLeadMinutes + reminderBeforeUnlockMinutes;
const fallbackTemplate = {
  subject: 'Tu pausa activa estara disponible en {{minutos}} minutos',
  body: 'Hola {{nombre}},\n\nTu pausa activa de {{empresa}} estara disponible en {{minutos}} minutos. Horario programado: {{hora}} hs.\n\nIngresa a ReActiva para comenzar.',
};

const jsonResponse = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  });

const normalizeDay = (day: string) => {
  const value = day.toLowerCase();
  if (value.includes('mier')) return 'miercoles';
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
};

const databaseDayLabels: Record<string, string> = {
  lunes: 'Lunes',
  miercoles: 'Miércoles',
  viernes: 'Viernes',
};

const dayLabelForBuenosAires = (date: Date) => {
  const label = new Intl.DateTimeFormat('es-AR', {
    weekday: 'long',
    timeZone: 'America/Argentina/Buenos_Aires',
  }).format(date);
  return databaseDayLabels[normalizeDay(label)] ?? label;
};

const timeForBuenosAires = (date: Date) => new Intl.DateTimeFormat('en-GB', {
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
  timeZone: 'America/Argentina/Buenos_Aires',
}).format(date);

const sendEmail = async (payload: Record<string, unknown>) => {
  const resendApiKey = Deno.env.get('RESEND_API_KEY');
  if (!resendApiKey) throw new Error('RESEND_API_KEY no esta configurada.');

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data?.message ?? 'No pudimos enviar el email.');
  }
  return data;
};

const renderTemplate = (template: string, values: Record<string, string>) => (
  Object.entries(values).reduce(
    (result, [key, value]) => result.replaceAll(`{{${key}}}`, value),
    template,
  )
);

const escapeHtml = (value: string) => value
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;');

const renderHtml = (subject: string, body: string) => `
  <!doctype html>
  <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>${escapeHtml(subject)}</title>
    </head>
    <body style="margin:0;padding:0;background:#f7fafc;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f7fafc;padding:32px 16px;">
        <tr>
          <td align="center">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border:1px solid #e2e8f0;border-radius:20px;overflow:hidden;">
              <tr>
                <td style="padding:32px 32px 8px;text-align:center;">
                  <div style="font-size:28px;font-weight:800;color:#0B1B3D;">ReActiva</div>
                </td>
              </tr>
              <tr>
                <td style="padding:18px 32px 8px;">
                  <h1 style="font-size:24px;line-height:1.25;margin:0 0 14px;color:#0f172a;">${escapeHtml(subject)}</h1>
                  <p style="font-size:16px;line-height:1.6;margin:0;color:#475569;">${escapeHtml(body).replaceAll('\n', '<br />')}</p>
                </td>
              </tr>
              <tr>
                <td style="padding:26px 32px 12px;text-align:center;">
                  <a href="${appUrl}" style="display:inline-block;background:#10bfa7;color:#ffffff;text-decoration:none;font-weight:700;font-size:16px;padding:15px 26px;border-radius:14px;">Ir a ReActiva</a>
                </td>
              </tr>
              <tr>
                <td style="padding:12px 32px 32px;">
                  <p style="font-size:13px;line-height:1.5;color:#64748b;margin:0;text-align:center;">Este recordatorio se envia automaticamente segun la programacion de tu empresa.</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
  </html>
`;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return jsonResponse({ error: 'Metodo no permitido.' }, 405);

  const cronSecret = Deno.env.get('CRON_SECRET');
  if (cronSecret && req.headers.get('x-cron-secret') !== cronSecret) {
    return jsonResponse({ error: 'No autorizado.' }, 401);
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!supabaseUrl || !serviceRoleKey) {
    return jsonResponse({ error: 'Supabase no esta configurado.' }, 500);
  }

  const admin = createClient(supabaseUrl, serviceRoleKey);
  const targetDate = new Date(Date.now() + reminderLeadMinutes * 60 * 1000);
  const targetDay = dayLabelForBuenosAires(targetDate);
  const targetTime = timeForBuenosAires(targetDate);
  const reminderDate = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Argentina/Buenos_Aires',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(targetDate);

  const { data: schedules, error: scheduleError } = await admin
    .from('video_unlock_schedule')
    .select('id, company_id, day_label, block, enabled, unlock_time')
    .eq('enabled', true)
    .eq('day_label', targetDay)
    .eq('unlock_time', targetTime);

  if (scheduleError) return jsonResponse({ error: scheduleError.message }, 500);
  if (!schedules?.length) return jsonResponse({ ok: true, checked: `${targetDay} ${targetTime}`, sent: 0 });

  const { data: savedTemplate, error: templateError } = await admin
    .from('email_automation_templates')
    .select('subject, body')
    .eq('id', 'pause-reminder')
    .maybeSingle();
  const emailTemplate = templateError || !savedTemplate ? fallbackTemplate : savedTemplate;

  let sent = 0;
  const errors: string[] = [];

  for (const schedule of schedules) {
    let excludedCompanyIds: string[] = [];
    if (!schedule.company_id) {
      const { data: companyOverrides, error: overridesError } = await admin
        .from('video_unlock_schedule')
        .select('company_id')
        .not('company_id', 'is', null)
        .eq('enabled', true)
        .eq('day_label', schedule.day_label)
        .eq('block', schedule.block);
      if (overridesError) {
        errors.push(overridesError.message);
        continue;
      }
      excludedCompanyIds = Array.from(new Set((companyOverrides ?? []).map(row => row.company_id).filter(Boolean)));
    }

    let companyQuery = schedule.company_id
      ? admin.from('companies').select('id, name').eq('id', schedule.company_id)
      : admin.from('companies').select('id, name').eq('status', 'active');
    if (excludedCompanyIds.length) {
      companyQuery = companyQuery.not('id', 'in', `(${excludedCompanyIds.join(',')})`);
    }
    const { data: companies, error: companiesError } = await companyQuery;
    if (companiesError) {
      errors.push(companiesError.message);
      continue;
    }

    for (const company of companies ?? []) {
      const { data: profiles, error: profilesError } = await admin
        .from('profiles')
        .select('id, email, full_name, status')
        .eq('company_id', company.id)
        .eq('role', 'usuario')
        .neq('status', 'inactive');

      if (profilesError) {
        errors.push(profilesError.message);
        continue;
      }

      for (const profile of profiles ?? []) {
        if (!profile.email) continue;
        const dedupeKey = `${reminderDate}:${schedule.id}:${company.id}:${profile.id}:${targetTime}`;
        const { data: existing } = await admin
          .from('email_events')
          .select('id')
          .eq('event_type', 'pause_reminder_sent')
          .eq('profile_id', profile.id)
          .contains('metadata', { dedupeKey })
          .limit(1);

        if (existing?.length) continue;

        try {
          const templateValues = {
            nombre: profile.full_name || profile.email.split('@')[0],
            empresa: company.name,
            hora: targetTime,
            minutos: String(reminderBeforeUnlockMinutes),
          };
          const subject = renderTemplate(emailTemplate.subject, templateValues);
          const body = renderTemplate(emailTemplate.body, templateValues);
          const providerResponse = await sendEmail({
            from: Deno.env.get('EMAIL_FROM') ?? 'ReActiva <onboarding@metodoreactiva.com>',
            to: [profile.email],
            subject,
            html: renderHtml(subject, body),
          });

          await admin.from('email_events').insert({
            company_id: company.id,
            profile_id: profile.id,
            event_type: 'pause_reminder_sent',
            metadata: {
              dedupeKey,
              scheduleId: schedule.id,
              day: targetDay,
              block: schedule.block,
              time: targetTime,
              reminderBeforeUnlockMinutes,
              provider: 'resend',
              providerResponse,
            },
          });
          sent += 1;
        } catch (error) {
          errors.push(`${profile.email}: ${error.message}`);
          await admin.from('email_events').insert({
            company_id: company.id,
            profile_id: profile.id,
            event_type: 'pause_reminder_failed',
            metadata: {
              dedupeKey,
              scheduleId: schedule.id,
              day: targetDay,
              block: schedule.block,
              time: targetTime,
              error: error.message,
            },
          });
        }
      }
    }
  }

  return jsonResponse({ ok: errors.length === 0, checked: `${targetDay} ${targetTime}`, sent, errors });
});
