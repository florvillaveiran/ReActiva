// @ts-nocheck
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import {
  getMissedReminderWindowStatus,
  getReminderWindowStatus,
} from './reminder-window.ts';
import { reactivaStreakEmailMessage } from '../_shared/reactiva-streak-message.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-cron-secret',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const appUrl = Deno.env.get('PUBLIC_APP_URL') ?? 'https://metodoreactiva.com/plataforma/login';
const unlockLeadMinutes = Number(Deno.env.get('VIDEO_UNLOCK_LEAD_MINUTES') ?? '1');
const reminderBeforeUnlockMinutes = Number(Deno.env.get('PAUSE_REMINDER_BEFORE_UNLOCK_MINUTES') ?? '5');
const reminderRecoveryWindowMinutes = Number(
  Deno.env.get('PAUSE_REMINDER_RECOVERY_WINDOW_MINUTES') ?? String(reminderBeforeUnlockMinutes),
);
const missedReminderRecoveryWindowMinutes = Number(
  Deno.env.get('MISSED_PAUSE_REMINDER_RECOVERY_WINDOW_MINUTES') ?? '10',
);
const fallbackTemplate = {
  subject: 'Tu pausa activa estara disponible en {{minutos}} minutos',
  body: 'Hola {{nombre}},\n\nTu pausa activa de {{empresa}} estara disponible en {{minutos}} minutos. Horario programado: {{hora}} hs.\n\nIngresa a ReActiva para comenzar.',
  include_reactiva_streak: false,
};
const fallbackMissedTemplate = {
  subject: 'Tu pausa activa sigue disponible',
  body: 'Hola {{nombre}},\n\nNotamos que todavia no realizaste la pausa de {{empresa}} programada para las {{hora}} hs. Tomate unos minutos para hacerla cuando puedas.\n\nIngresa a ReActiva para comenzar.',
  active: true,
  delay_minutes: 40,
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

const dateForBuenosAires = (date: Date) => new Intl.DateTimeFormat('en-CA', {
  timeZone: 'America/Argentina/Buenos_Aires',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
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

const renderHtml = (subject: string, body: string, streakMessage = '') => `
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
              ${streakMessage ? `
              <tr>
                <td style="padding:14px 32px 2px;">
                  <div style="padding:14px 16px;border:1px solid #99f6e4;border-radius:14px;background:#f0fdfa;color:#115e59;font-size:15px;line-height:1.5;font-weight:700;">
                    ${escapeHtml(streakMessage)}
                  </div>
                </td>
              </tr>
              ` : ''}
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
  const now = new Date();
  const targetDay = dayLabelForBuenosAires(now);
  const currentTime = timeForBuenosAires(now);
  const reminderDate = dateForBuenosAires(now);

  const { data: scheduledRows, error: scheduleError } = await admin
    .from('content_items')
    .select('id, company_id, metadata, created_at')
    .eq('kind', 'video')
    .eq('active', true)
    .eq('metadata->>scheduledDate', reminderDate)
    .order('created_at', { ascending: true });

  if (scheduleError) return jsonResponse({ error: scheduleError.message }, 500);

  // Cada video programado es la unica fuente de verdad para empresa, fecha,
  // turno y horario. Si quedo una version anterior del mismo bloque, gana la
  // mas reciente y nunca se generan dos recordatorios para el mismo turno.
  const scheduleByScope = new Map<string, Record<string, unknown>>();
  for (const row of scheduledRows ?? []) {
    const metadata = row.metadata ?? {};
    if (metadata.day !== targetDay || !['morning', 'afternoon'].includes(metadata.block) || !metadata.time) continue;
    scheduleByScope.set(`${row.company_id ?? 'global'}:${metadata.block}`, {
      id: row.id,
      company_id: row.company_id,
      day_label: metadata.day,
      block: metadata.block,
      enabled: true,
      unlock_time: metadata.time,
    });
  }
  const schedules = Array.from(scheduleByScope.values());
  const companyOverridesFor = (block: string) => Array.from(new Set(
    schedules
      .filter(schedule => schedule.company_id && schedule.block === block)
      .map(schedule => schedule.company_id as string),
  ));
  const { data: templateRows, error: templatesError } = await admin
    .from('email_automation_templates')
    .select('id, subject, body, active, delay_minutes, include_reactiva_streak')
    .in('id', ['pause-reminder', 'missed-pause-reminder']);

  if (templatesError) return jsonResponse({ error: templatesError.message }, 500);

  const pauseTemplate = templateRows?.find(row => row.id === 'pause-reminder') ?? fallbackTemplate;
  const missedTemplate = templateRows?.find(row => row.id === 'missed-pause-reminder') ?? fallbackMissedTemplate;
  const missedDelayMinutes = Number(missedTemplate.delay_minutes ?? 40);
  const dueSchedules = pauseTemplate.active === false ? [] : schedules.map((schedule) => ({
    ...schedule,
    ...getReminderWindowStatus({
      unlockTime: schedule.unlock_time,
      currentTime,
      unlockLeadMinutes,
      reminderBeforeUnlockMinutes,
      recoveryWindowMinutes: reminderRecoveryWindowMinutes,
    }),
  })).filter((schedule) => schedule.due);

  const dueMissedSchedules = missedTemplate.active === false ? [] : schedules.map((schedule) => ({
    ...schedule,
    ...getMissedReminderWindowStatus({
      unlockTime: schedule.unlock_time,
      currentTime,
      unlockLeadMinutes,
      delayMinutes: missedDelayMinutes,
      recoveryWindowMinutes: missedReminderRecoveryWindowMinutes,
    }),
  })).filter((schedule) => schedule.due);

  if (!dueSchedules.length && !dueMissedSchedules.length) {
    return jsonResponse({
      ok: true,
      checked: `${targetDay} ${currentTime}`,
      schedules: schedules.length,
      dueSchedules: 0,
      dueMissedSchedules: 0,
      sentBeforePause: 0,
      sentMissedPause: 0,
    });
  }

  let sentBeforePause = 0;
  let sentMissedPause = 0;
  let skippedWithoutContent = 0;
  let skippedCompleted = 0;
  const errors: string[] = [];

  for (const schedule of dueSchedules) {
    const targetTime = schedule.targetTime;
    const excludedCompanyIds = schedule.company_id ? [] : companyOverridesFor(schedule.block);

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
      const { data: scheduledContent, error: contentError } = await admin
        .from('content_items')
        .select('id, company_id')
        .eq('kind', 'video')
        .eq('active', true)
        .eq('metadata->>scheduledDate', reminderDate)
        .eq('metadata->>block', schedule.block)
        .or(`company_id.eq.${company.id},company_id.is.null`)
        .limit(1);

      if (contentError) {
        errors.push(`Contenido ${company.name}: ${contentError.message}`);
        continue;
      }
      if (!scheduledContent?.length) {
        skippedWithoutContent += 1;
        continue;
      }

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
          let streakMessage = '';
          if (pauseTemplate.include_reactiva_streak === true) {
            const { data: streakState, error: streakError } = await admin.rpc(
              'get_reactiva_email_streak_state',
              { target_profile_id: profile.id, as_of_date: reminderDate },
            );
            if (streakError) throw new Error(`No se pudo resolver la racha: ${streakError.message}`);
            streakMessage = reactivaStreakEmailMessage(streakState);
          }
          const templateValues = {
            nombre: profile.full_name || profile.email.split('@')[0],
            empresa: company.name,
            hora: targetTime,
            minutos: String(Math.max(0, schedule.minutesUntilUnlock)),
          };
          const subject = renderTemplate(pauseTemplate.subject, templateValues);
          const body = renderTemplate(pauseTemplate.body, templateValues);
          const providerResponse = await sendEmail({
            from: Deno.env.get('EMAIL_FROM') ?? 'ReActiva <onboarding@metodoreactiva.com>',
            to: [profile.email],
            subject,
            html: renderHtml(subject, body, streakMessage),
          });

          await admin.from('email_events').insert({
            company_id: company.id,
            profile_id: profile.id,
            event_type: 'pause_reminder_sent',
            template_id: 'pause-reminder',
            subject,
            recipient_email: profile.email,
            sent_at: new Date().toISOString(),
            provider_message_id: providerResponse?.id ?? null,
            status: 'sent',
            metadata: {
              dedupeKey,
              scheduleId: schedule.id,
              day: targetDay,
              block: schedule.block,
              time: targetTime,
              reminderBeforeUnlockMinutes: schedule.minutesUntilUnlock,
              includedReactivaStreak: pauseTemplate.include_reactiva_streak === true,
              provider: 'resend',
            },
          });
          sentBeforePause += 1;
        } catch (error) {
          errors.push(`${profile.email}: ${error.message}`);
          await admin.from('email_events').insert({
            company_id: company.id,
            profile_id: profile.id,
            event_type: 'pause_reminder_failed',
            template_id: 'pause-reminder',
            recipient_email: profile.email,
            status: 'failed',
            error_message: error.message,
            metadata: {
              dedupeKey,
              scheduleId: schedule.id,
              day: targetDay,
              block: schedule.block,
              time: targetTime,
            },
          });
        }
      }
    }
  }

  const dayStart = new Date(`${reminderDate}T00:00:00-03:00`).toISOString();
  const dayEnd = new Date(new Date(dayStart).getTime() + 24 * 60 * 60 * 1000).toISOString();

  for (const schedule of dueMissedSchedules) {
    const targetTime = schedule.targetTime;
    const excludedCompanyIds = schedule.company_id ? [] : companyOverridesFor(schedule.block);

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
      const { data: scheduledContent, error: contentError } = await admin
        .from('content_items')
        .select('id, company_id')
        .eq('kind', 'video')
        .eq('active', true)
        .eq('metadata->>scheduledDate', reminderDate)
        .eq('metadata->>block', schedule.block)
        .or(`company_id.eq.${company.id},company_id.is.null`)
        .limit(1);

      if (contentError) {
        errors.push(`Contenido ${company.name}: ${contentError.message}`);
        continue;
      }
      if (!scheduledContent?.length) {
        skippedWithoutContent += 1;
        continue;
      }

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

      const profileIds = (profiles ?? []).map(profile => profile.id);
      let completedProfileIds = new Set<string>();
      if (profileIds.length) {
        const { data: completedSessions, error: sessionsError } = await admin
          .from('pause_sessions')
          .select('profile_id')
          .eq('company_id', company.id)
          .eq('day_label', schedule.day_label)
          .eq('block', schedule.block)
          .gte('occurred_at', dayStart)
          .lt('occurred_at', dayEnd)
          .in('profile_id', profileIds);

        if (sessionsError) {
          errors.push(`Pausas ${company.name}: ${sessionsError.message}`);
          continue;
        }
        completedProfileIds = new Set((completedSessions ?? []).map(session => session.profile_id));
      }

      for (const profile of profiles ?? []) {
        if (!profile.email) continue;
        if (completedProfileIds.has(profile.id)) {
          skippedCompleted += 1;
          continue;
        }

        const dedupeKey = `${reminderDate}:${schedule.id}:${company.id}:${profile.id}:${targetTime}`;
        const { data: existing, error: existingError } = await admin
          .from('email_events')
          .select('id')
          .eq('event_type', 'missed_pause_reminder_sent')
          .eq('profile_id', profile.id)
          .contains('metadata', { dedupeKey })
          .limit(1);

        if (existingError) {
          errors.push(`${profile.email}: ${existingError.message}`);
          continue;
        }
        if (existing?.length) continue;

        try {
          const templateValues = {
            nombre: profile.full_name || profile.email.split('@')[0],
            empresa: company.name,
            hora: targetTime,
            minutos: String(missedDelayMinutes),
          };
          const subject = renderTemplate(missedTemplate.subject, templateValues);
          const body = renderTemplate(missedTemplate.body, templateValues);
          const providerResponse = await sendEmail({
            from: Deno.env.get('EMAIL_FROM') ?? 'ReActiva <onboarding@metodoreactiva.com>',
            to: [profile.email],
            subject,
            html: renderHtml(subject, body),
          });

          await admin.from('email_events').insert({
            company_id: company.id,
            profile_id: profile.id,
            event_type: 'missed_pause_reminder_sent',
            template_id: 'missed-pause-reminder',
            subject,
            recipient_email: profile.email,
            sent_at: new Date().toISOString(),
            provider_message_id: providerResponse?.id ?? null,
            status: 'sent',
            metadata: {
              dedupeKey,
              scheduleId: schedule.id,
              day: targetDay,
              block: schedule.block,
              time: targetTime,
              delayMinutes: missedDelayMinutes,
              provider: 'resend',
            },
          });
          sentMissedPause += 1;
        } catch (error) {
          errors.push(`${profile.email}: ${error.message}`);
          await admin.from('email_events').insert({
            company_id: company.id,
            profile_id: profile.id,
            event_type: 'missed_pause_reminder_failed',
            template_id: 'missed-pause-reminder',
            recipient_email: profile.email,
            status: 'failed',
            error_message: error.message,
            metadata: {
              dedupeKey,
              scheduleId: schedule.id,
              day: targetDay,
              block: schedule.block,
              time: targetTime,
              delayMinutes: missedDelayMinutes,
            },
          });
        }
      }
    }
  }

  return jsonResponse({
    ok: errors.length === 0,
    checked: `${targetDay} ${currentTime}`,
    dueSchedules: dueSchedules.length,
    dueMissedSchedules: dueMissedSchedules.length,
    skippedWithoutContent,
    skippedCompleted,
    sentBeforePause,
    sentMissedPause,
    errors,
  });
});
