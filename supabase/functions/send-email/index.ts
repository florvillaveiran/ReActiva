// @ts-nocheck
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { reactivaStreakEmailMessage } from '../_shared/reactiva-streak-message.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

type EmailType = 'company_onboarding' | 'user_invitation' | 'automation_email';

type EmailPayload = {
  type?: EmailType;
  to?: string;
  recipientName?: string;
  companyName?: string;
  invitationUrl?: string;
  subject?: string;
  body?: string;
  automationId?: string;
  includeReactivaStreak?: boolean;
  recipientProfileId?: string;
  recipientCompanyId?: string;
  // Campo interno: siempre se recalcula en esta función y nunca se confía
  // en un valor recibido desde el navegador.
  streakMessage?: string;
};

const escapeHtml = (value = '') =>
  value.replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }[char] ?? char));

const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
const isUuid = (value?: string) => !!value && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);

const jsonResponse = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  });

const buildEmail = (payload: Required<Pick<EmailPayload, 'type' | 'to' | 'invitationUrl'>> & EmailPayload) => {
  const recipientName = escapeHtml(payload.recipientName?.trim() || 'Hola');
  const companyName = escapeHtml(payload.companyName?.trim() || 'tu empresa');
  const invitationUrl = escapeHtml(payload.invitationUrl);

  if (payload.type === 'automation_email') {
    return {
      subject: escapeHtml(payload.subject?.trim() || 'Mensaje de ReActiva'),
      preview: 'Nuevo mensaje de ReActiva.',
      title: escapeHtml(payload.subject?.trim() || 'Mensaje de ReActiva'),
      intro: escapeHtml(payload.body?.trim() || 'Te compartimos una novedad de ReActiva.').replace(/\n/g, '<br />'),
      streakMessage: escapeHtml(payload.streakMessage?.trim() || ''),
      cta: payload.invitationUrl ? 'Ingresar a ReActiva' : '',
      invitationUrl,
    };
  }

  if (payload.type === 'company_onboarding') {
    return {
      subject: `Configura ${companyName} en ReActiva`,
      preview: 'Completa el onboarding inicial de tu empresa.',
      title: 'Configura tu empresa en ReActiva',
      intro: `${recipientName}, te compartimos el enlace para completar la configuracion inicial de ${companyName}.`,
      cta: 'Completar onboarding',
      invitationUrl,
    };
  }

  return {
    subject: `Activa tu cuenta en ReActiva`,
    preview: 'Crea tu acceso individual a la plataforma.',
    title: 'Activa tu cuenta en ReActiva',
    intro: `${recipientName}, te compartimos el enlace para crear tu acceso a ReActiva y quedar asociado a ${companyName}.`,
    streakMessage: '',
    cta: 'Crear acceso',
    invitationUrl,
  };
};

const renderHtml = (email: ReturnType<typeof buildEmail>) => `
  <!doctype html>
  <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>${email.subject}</title>
    </head>
    <body style="margin:0;padding:0;background:#f7fafc;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
      <div style="display:none;max-height:0;overflow:hidden;">${email.preview}</div>
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
                  <h1 style="font-size:24px;line-height:1.25;margin:0 0 14px;color:#0f172a;">${email.title}</h1>
                  <p style="font-size:16px;line-height:1.6;margin:0;color:#475569;">${email.intro}</p>
                </td>
              </tr>
              ${email.streakMessage ? `
              <tr>
                <td style="padding:14px 32px 2px;">
                  <div style="padding:14px 16px;border:1px solid #99f6e4;border-radius:14px;background:#f0fdfa;color:#115e59;font-size:15px;line-height:1.5;font-weight:700;">
                    ${email.streakMessage}
                  </div>
                </td>
              </tr>
              ` : ''}
              ${email.cta ? `
              <tr>
                <td style="padding:26px 32px 12px;text-align:center;">
                  <a href="${email.invitationUrl}" style="display:inline-block;background:#10bfa7;color:#ffffff;text-decoration:none;font-weight:700;font-size:16px;padding:15px 26px;border-radius:14px;">${email.cta}</a>
                </td>
              </tr>
              ` : ''}
              <tr>
                <td style="padding:12px 32px 32px;">
                  <p style="font-size:13px;line-height:1.5;color:#64748b;margin:0;text-align:center;">Si el boton no funciona, copia y pega este enlace en tu navegador:</p>
                  <p style="font-size:13px;line-height:1.5;color:#0f766e;word-break:break-all;margin:10px 0 0;text-align:center;">${email.invitationUrl}</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
  </html>
`;

type EmailEventRow = {
  event_type: string;
  metadata: Record<string, unknown>;
  automation_id?: string;
  subject?: string;
  recipient_email?: string;
  sent_at?: string;
  provider_message_id?: string;
  status: 'sent' | 'failed';
  error_message?: string;
};

const logEmailEvent = async (row: EmailEventRow) => {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!supabaseUrl || !serviceRoleKey) return;

  const adminClient = createClient(supabaseUrl, serviceRoleKey);
  await adminClient.from('email_events').insert(row);
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Metodo no permitido.' }, 405);
  }

  const resendApiKey = Deno.env.get('RESEND_API_KEY');
  if (!resendApiKey) {
    return jsonResponse({ error: 'RESEND_API_KEY no esta configurada en Supabase.' }, 500);
  }

  let payload: EmailPayload;
  try {
    payload = await req.json();
  } catch {
    return jsonResponse({ error: 'El cuerpo del pedido no es valido.' }, 400);
  }

  if (payload.type !== 'company_onboarding' && payload.type !== 'user_invitation' && payload.type !== 'automation_email') {
    return jsonResponse({ error: 'Tipo de email no valido.' }, 400);
  }

  if (!payload.to || !isValidEmail(payload.to)) {
    return jsonResponse({ error: 'Email de destino no valido.' }, 400);
  }

  if (!payload.invitationUrl || !/^https?:\/\//.test(payload.invitationUrl)) {
    return jsonResponse({ error: 'Enlace de invitacion no valido.' }, 400);
  }

  let streakMessage = '';
  if (payload.type === 'automation_email' && payload.automationId === 'pause-reminder' && payload.includeReactivaStreak === true) {
    if (!isUuid(payload.recipientProfileId) || !isUuid(payload.recipientCompanyId)) {
      return jsonResponse({ error: 'No pudimos identificar al destinatario de la Racha ReActiva.' }, 400);
    }
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!supabaseUrl || !serviceRoleKey) {
      return jsonResponse({ error: 'Supabase no esta configurado para consultar la racha.' }, 500);
    }
    const adminClient = createClient(supabaseUrl, serviceRoleKey);
    const { data: recipient, error: recipientError } = await adminClient
      .from('profiles')
      .select('id')
      .eq('id', payload.recipientProfileId)
      .eq('company_id', payload.recipientCompanyId)
      .eq('email', payload.to)
      .eq('role', 'usuario')
      .maybeSingle();
    if (recipientError || !recipient) {
      return jsonResponse({ error: 'El destinatario no coincide con el usuario y la empresa indicados.' }, 400);
    }
    const { data: streakState, error: streakError } = await adminClient.rpc(
      'get_reactiva_email_streak_state',
      { target_profile_id: payload.recipientProfileId },
    );
    if (streakError || !streakState) {
      return jsonResponse({ error: streakError?.message ?? 'No pudimos consultar la Racha ReActiva.' }, 500);
    }
    streakMessage = reactivaStreakEmailMessage(streakState);
  }

  const email = buildEmail({
    type: payload.type,
    to: payload.to,
    invitationUrl: payload.invitationUrl,
    recipientName: payload.recipientName,
    companyName: payload.companyName,
    subject: payload.subject,
    body: payload.body,
    automationId: payload.automationId,
    streakMessage,
  });

  const resendPayload = {
    from: Deno.env.get('EMAIL_FROM') ?? 'ReActiva <onboarding@metodoreactiva.com>',
    to: [payload.to],
    subject: email.subject,
    html: renderHtml(email),
  };

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(resendPayload),
  });

  const data = await response.json().catch(() => ({}));
  const now = new Date().toISOString();

  if (!response.ok) {
    await logEmailEvent({
      event_type: 'email_failed',
      automation_id: payload.automationId ?? undefined,
      subject: email.subject,
      recipient_email: payload.to,
      status: 'failed',
      error_message: data?.message ?? 'No pudimos enviar el email.',
      metadata: {
        type: payload.type,
        invitationUrl: payload.invitationUrl,
        provider: 'resend',
        providerResponse: data,
      },
    });
    return jsonResponse({ error: data?.message ?? 'No pudimos enviar el email.' }, 502);
  }

  await logEmailEvent({
    event_type: 'email_sent',
    automation_id: payload.automationId ?? undefined,
    subject: email.subject,
    recipient_email: payload.to,
    sent_at: now,
    provider_message_id: data?.id ?? undefined,
    status: 'sent',
    metadata: {
      type: payload.type,
      invitationUrl: payload.invitationUrl,
      provider: 'resend',
    },
  });
  return jsonResponse({ ok: true, id: data?.id ?? null });
});
