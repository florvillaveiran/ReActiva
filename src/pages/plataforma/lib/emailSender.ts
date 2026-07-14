import { supabase } from './supabase';

export type TransactionalEmailType = 'company_onboarding' | 'user_invitation' | 'automation_email';

export type TransactionalEmailPayload = {
  type: TransactionalEmailType;
  to: string;
  recipientName?: string;
  companyName?: string;
  invitationUrl: string;
  subject?: string;
  body?: string;
  automationId?: string;
};

type EmailResult = {
  ok: boolean;
  message?: string;
  providerId?: string;
};

export const sendTransactionalEmail = async (payload: TransactionalEmailPayload): Promise<EmailResult> => {
  if (!supabase) {
    return { ok: false, message: 'Supabase no está configurado.' };
  }

  const { data, error } = await supabase.functions.invoke('send-email', {
    body: payload,
  });

  if (error) {
    return { ok: false, message: error.message };
  }

  if (data?.error) {
    return { ok: false, message: data.error };
  }

  return { ok: true, providerId: data?.id };
};
