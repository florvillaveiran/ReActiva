import { supabase } from './supabase';

export type ReactivaScoreActivity = 'MICROTRAINING' | 'DAILY_FORM' | 'WEEKLY_FORM';

export interface ReactivaScoreWeek {
  week_start: string;
  score: number;
  maximum: number;
  complete: boolean;
  microtrainings: number;
  daily_forms: number;
  weekly_forms: number;
}

export interface ReactivaScoreSettings {
  enabled: boolean;
  monthly_close_day: number;
  prize_description: string;
  show_score_to_users: boolean;
  show_streak_to_users: boolean;
  show_score_to_rrhh: boolean;
}

export interface ReactivaScore {
  profile_id: string;
  company_id: string;
  month: string;
  score: number;
  maximum: number;
  percent: number;
  eligible: boolean;
  threshold_percent: number;
  streak: number;
  best_streak: number;
  settings: ReactivaScoreSettings;
  breakdown: {
    microtrainings: number;
    daily_forms: number;
    weekly_forms: number;
  };
  weeks: ReactivaScoreWeek[];
}

export interface ReactivaTeamScore extends ReactivaScore {
  name: string;
  email: string;
  work_profile?: 'ADMINISTRATIVO' | 'OPERATIVO' | null;
}

export interface ReactivaScoreSummary {
  month: string;
  company_id?: string | null;
  average_percent: number;
  global_average_percent?: number | null;
  users: ReactivaTeamScore[];
}

export interface EditableReactivaScoreSettings {
  enabled: boolean;
  raffle_threshold_percent: number;
  monthly_close_day: number;
  prize_description: string;
  show_score_to_users: boolean;
  show_streak_to_users: boolean;
  show_score_to_rrhh: boolean;
}

export const REACTIVA_SCORE_UPDATED_EVENT = 'reactiva-score-updated';

const monthKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}-01`;
};

const normalizeScore = (value: any): ReactivaScore | null => {
  if (!value || typeof value !== 'object') return null;
  return {
    ...value,
    score: Number(value.score ?? 0),
    maximum: Number(value.maximum ?? 0),
    percent: Number(value.percent ?? 0),
    threshold_percent: Number(value.threshold_percent ?? 80),
    streak: Number(value.streak ?? 0),
    best_streak: Number(value.best_streak ?? value.streak ?? 0),
    eligible: Boolean(value.eligible),
    settings: {
      enabled: value.settings?.enabled !== false,
      monthly_close_day: Number(value.settings?.monthly_close_day ?? 1),
      prize_description: String(value.settings?.prize_description ?? ''),
      show_score_to_users: value.settings?.show_score_to_users !== false,
      show_streak_to_users: value.settings?.show_streak_to_users !== false,
      show_score_to_rrhh: value.settings?.show_score_to_rrhh !== false,
    },
    breakdown: {
      microtrainings: Number(value.breakdown?.microtrainings ?? 0),
      daily_forms: Number(value.breakdown?.daily_forms ?? 0),
      weekly_forms: Number(value.breakdown?.weekly_forms ?? 0),
    },
    weeks: Array.isArray(value.weeks)
      ? value.weeks.map((week: any) => ({
          week_start: String(week.week_start),
          score: Number(week.score ?? 0),
          maximum: Number(week.maximum ?? 10),
          complete: Boolean(week.complete),
          microtrainings: Number(week.microtrainings ?? 0),
          daily_forms: Number(week.daily_forms ?? 0),
          weekly_forms: Number(week.weekly_forms ?? 0),
        }))
      : [],
  };
};

export const fetchMyReactivaScore = async (month = new Date()) => {
  if (!supabase) return { data: null, error: null };
  const { data, error } = await supabase.rpc('get_reactiva_user_score', {
    target_profile_id: null,
    target_month: monthKey(month),
  });
  return { data: error ? null : normalizeScore(data), error };
};

export const fetchReactivaScoreSummary = async (companyId?: string | null, month = new Date()) => {
  if (!supabase) return { data: null, error: null };
  const { data, error } = await supabase.rpc('get_reactiva_score_summary', {
    target_company_id: companyId ?? null,
    target_month: monthKey(month),
  });
  if (error || !data) return { data: null, error };
  const raw = data as any;
  const users = Array.isArray(raw.users)
    ? raw.users.flatMap((user: any) => {
        const normalized = normalizeScore(user);
        return normalized ? [{
          ...normalized,
          name: String(user.name ?? user.email?.split('@')[0] ?? 'Usuario'),
          email: String(user.email ?? ''),
          work_profile: user.work_profile ?? null,
        } as ReactivaTeamScore] : [];
      })
    : [];
  return {
    data: {
      month: String(raw.month ?? monthKey(month)),
      company_id: raw.company_id ?? companyId ?? null,
      average_percent: Number(raw.average_percent ?? 0),
      global_average_percent: raw.global_average_percent == null ? null : Number(raw.global_average_percent),
      users,
    } as ReactivaScoreSummary,
    error: null,
  };
};

export const fetchReactivaScoreSettings = async (companyId: string) => {
  if (!supabase) return { data: null, error: null };
  const { data, error } = await supabase
    .from('reactiva_score_settings')
    .select('enabled, raffle_threshold_percent, monthly_close_day, prize_description, show_score_to_users, show_streak_to_users, show_score_to_rrhh')
    .eq('company_id', companyId)
    .maybeSingle();
  return { data: data as EditableReactivaScoreSettings | null, error };
};

export const saveReactivaScoreSettings = async (companyId: string, settings: EditableReactivaScoreSettings) => {
  if (!supabase) return { ok: false, error: null };
  const { error } = await supabase.rpc('set_reactiva_score_settings', {
    target_company_id: companyId,
    score_enabled: settings.enabled,
    threshold_percent: settings.raffle_threshold_percent,
    close_day: settings.monthly_close_day,
    prize_text: settings.prize_description,
    users_can_see_score: settings.show_score_to_users,
    users_can_see_streak: settings.show_streak_to_users,
    rrhh_can_see_score: settings.show_score_to_rrhh,
  });
  return { ok: !error, error };
};

export const recordReactivaScoreEvent = async (
  activityType: ReactivaScoreActivity,
  contentItemId?: string | null,
) => {
  if (!supabase) return { ok: false, error: null };
  const { error } = await supabase.rpc('record_reactiva_score_event', {
    target_activity_type: activityType,
    target_content_item_id: contentItemId ?? null,
  });
  if (!error) window.dispatchEvent(new Event(REACTIVA_SCORE_UPDATED_EVENT));
  return { ok: !error, error };
};
