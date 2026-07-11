import { supabase } from './supabase';

export type UnlockDay = 'Lunes' | 'Miércoles' | 'Viernes';
export type UnlockBlock = 'morning' | 'afternoon';

export interface VideoUnlockItem {
  day: UnlockDay;
  block: UnlockBlock;
  enabled: boolean;
  time: string;
}

export const VIDEO_UNLOCK_SCHEDULE_KEY = 'reactiva_video_unlock_schedule';
export const VIDEO_UNLOCK_SCHEDULE_EVENT = 'reactiva-video-unlock-schedule-updated';
export const UNLOCK_LEAD_MINUTES = 1;

export const DEFAULT_VIDEO_UNLOCK_SCHEDULE: VideoUnlockItem[] = [
  { day: 'Lunes', block: 'morning', enabled: false, time: '08:00' },
  { day: 'Lunes', block: 'afternoon', enabled: false, time: '15:00' },
  { day: 'Miércoles', block: 'morning', enabled: false, time: '08:00' },
  { day: 'Miércoles', block: 'afternoon', enabled: false, time: '15:00' },
  { day: 'Viernes', block: 'morning', enabled: false, time: '08:00' },
  { day: 'Viernes', block: 'afternoon', enabled: false, time: '15:00' },
];

const weekdayMap: Record<number, UnlockDay | null> = {
  0: null,
  1: 'Lunes',
  2: null,
  3: 'Miércoles',
  4: null,
  5: 'Viernes',
  6: null,
};

export const getCurrentProgramDay = (date = new Date()): UnlockDay => weekdayMap[date.getDay()] ?? 'Lunes';

export const loadVideoUnlockSchedule = (): VideoUnlockItem[] => {
  try {
    const raw = localStorage.getItem(VIDEO_UNLOCK_SCHEDULE_KEY);
    if (!raw) return DEFAULT_VIDEO_UNLOCK_SCHEDULE;
    const parsed = JSON.parse(raw) as VideoUnlockItem[];
    return DEFAULT_VIDEO_UNLOCK_SCHEDULE.map((item) => ({
      ...item,
      ...(parsed.find((entry) => entry.day === item.day && entry.block === item.block) ?? {}),
    }));
  } catch {
    return DEFAULT_VIDEO_UNLOCK_SCHEDULE;
  }
};

export const saveVideoUnlockSchedule = (schedule: VideoUnlockItem[]) => {
  localStorage.setItem(VIDEO_UNLOCK_SCHEDULE_KEY, JSON.stringify(schedule));
  window.dispatchEvent(new Event(VIDEO_UNLOCK_SCHEDULE_EVENT));
};

type VideoUnlockScheduleRow = {
  day_label: UnlockDay;
  block: UnlockBlock;
  enabled: boolean;
  unlock_time: string;
};

const normalizeTime = (time: string) => time.slice(0, 5);

const mergeSchedule = (schedule: VideoUnlockItem[]) => DEFAULT_VIDEO_UNLOCK_SCHEDULE.map((item) => ({
  ...item,
  ...(schedule.find((entry) => entry.day === item.day && entry.block === item.block) ?? {}),
}));

export const fetchVideoUnlockSchedule = async (): Promise<VideoUnlockItem[]> => {
  if (!supabase) return loadVideoUnlockSchedule();

  const { data, error } = await supabase
    .from('video_unlock_schedule')
    .select('day_label, block, enabled, unlock_time')
    .is('company_id', null)
    .order('day_label', { ascending: true })
    .order('block', { ascending: true });

  if (error || !data) return loadVideoUnlockSchedule();

  const schedule = mergeSchedule((data as VideoUnlockScheduleRow[]).map((row) => ({
    day: row.day_label,
    block: row.block,
    enabled: row.enabled,
    time: normalizeTime(row.unlock_time),
  })));

  saveVideoUnlockSchedule(schedule);
  return schedule;
};

export const persistVideoUnlockSchedule = async (schedule: VideoUnlockItem[]) => {
  saveVideoUnlockSchedule(schedule);
  if (!supabase) return { ok: true };

  const rows = schedule.map((item) => ({
    company_id: null,
    day_label: item.day,
    block: item.block,
    enabled: item.enabled,
    unlock_time: item.time,
  }));

  const { error } = await supabase.rpc('save_video_unlock_schedule', {
    schedule: rows,
  });

  return { ok: !error, error };
};

const minutesFromTime = (time: string) => {
  const [hours = '0', minutes = '0'] = time.split(':');
  return Number(hours) * 60 + Number(minutes);
};

export const getVideoUnlockStatus = (
  schedule: VideoUnlockItem[],
  day: string,
  block: UnlockBlock,
  now = new Date()
) => {
  const item = schedule.find((entry) => entry.day === day && entry.block === block);
  if (!item?.enabled) {
    return { unlocked: false, reason: 'Contenido pendiente de habilitación por ReActiva' };
  }

  const currentProgramDay = weekdayMap[now.getDay()];
  if (currentProgramDay !== day) {
    return { unlocked: false, reason: `Disponible el ${day}` };
  }

  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const unlockMinutes = minutesFromTime(item.time) - UNLOCK_LEAD_MINUTES;
  if (currentMinutes < unlockMinutes) {
    return { unlocked: false, reason: `Disponible desde ${item.time} hs` };
  }

  return { unlocked: true, reason: '' };
};
