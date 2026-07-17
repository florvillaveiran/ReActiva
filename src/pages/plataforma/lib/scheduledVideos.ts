import { supabase } from './supabase';

export type ScheduledVideoBlock = 'morning' | 'afternoon';
export type ScheduledVideoWorkProfile = 'ADMINISTRATIVO' | 'OPERATIVO';

export interface ScheduledVideo {
  id: string;
  day: string;
  scheduledDate: string;
  block: ScheduledVideoBlock;
  time: string;
  title: string;
  url: string;
  thumbnailUrl?: string;
  companyId?: string | null;
  companyName?: string;
  targetWorkProfile?: ScheduledVideoWorkProfile | null;
  createdAt: string;
}

const STORAGE_KEY = 'reactiva_scheduled_videos';
export const SCHEDULED_VIDEOS_EVENT = 'reactiva-scheduled-videos-updated';

const isUuid = (id: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

const normalizeTime = (time: string) => (time || '08:00').slice(0, 5);

const PROGRAM_DAY_OFFSETS: Record<string, number> = {
  Lunes: 0,
  Miércoles: 2,
  Viernes: 4,
};

export const toLocalDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getScheduledDateForProgramDay = (day: string, referenceDate = new Date()) => {
  const monday = new Date(referenceDate);
  const weekday = monday.getDay();
  monday.setHours(12, 0, 0, 0);
  monday.setDate(monday.getDate() + (weekday === 0 ? -6 : 1 - weekday));
  monday.setDate(monday.getDate() + (PROGRAM_DAY_OFFSETS[day] ?? 0));
  return toLocalDateKey(monday);
};

const normalizeStoredVideo = (video: ScheduledVideo): ScheduledVideo => ({
  ...video,
  scheduledDate: video.scheduledDate || getScheduledDateForProgramDay(video.day, new Date(video.createdAt || Date.now())),
});

const readStoredVideos = (): ScheduledVideo[] => {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') as ScheduledVideo[];
    return stored.map(normalizeStoredVideo);
  } catch {
    return [];
  }
};

export const saveScheduledVideosLocal = (videos: ScheduledVideo[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(videos));
  window.dispatchEvent(new Event(SCHEDULED_VIDEOS_EVENT));
};

export const getScheduledVideos = () => readStoredVideos();

export const getScheduledVideoFor = (
  videos: ScheduledVideo[],
  day: string,
  block: ScheduledVideoBlock,
  companyId?: string,
  scheduledDate?: string,
  workProfile?: ScheduledVideoWorkProfile,
) => {
  const matches = videos
    .filter(video => video.day === day && video.block === block)
    .filter(video => !scheduledDate || video.scheduledDate === scheduledDate)
    .filter(video => !video.companyId || video.companyId === companyId)
    .filter(video => !video.targetWorkProfile || video.targetWorkProfile === workProfile);

  const rank = (video: ScheduledVideo) => (
    (companyId && video.companyId === companyId ? 2 : 0)
    + (workProfile && video.targetWorkProfile === workProfile ? 1 : 0)
  );

  return matches.sort((first, second) => (
    rank(first) - rank(second)
    || first.createdAt.localeCompare(second.createdAt)
  )).at(-1) ?? null;
};

const rowToScheduledVideo = (row: any): ScheduledVideo | null => {
  const metadata = row.metadata ?? {};
  if (!metadata.day || !metadata.block || !row.url) return null;
  return {
    id: row.id,
    day: metadata.day,
    scheduledDate: metadata.scheduledDate || getScheduledDateForProgramDay(metadata.day, new Date(row.created_at ?? Date.now())),
    block: metadata.block,
    time: normalizeTime(metadata.time),
    title: row.title ?? 'Pausa activa',
    url: row.url,
    thumbnailUrl: row.thumbnail_url ?? metadata.thumbnailUrl,
    companyId: row.company_id ?? metadata.companyId ?? null,
    companyName: metadata.companyName ?? 'Global',
    targetWorkProfile: row.target_work_profile ?? metadata.targetWorkProfile ?? null,
    createdAt: row.created_at ?? new Date().toISOString(),
  };
};

export const fetchScheduledVideos = async (): Promise<ScheduledVideo[]> => {
  if (!supabase) return readStoredVideos();

  const { data, error } = await supabase
    .from('content_items')
    .select('id, company_id, target_work_profile, title, url, thumbnail_url, metadata, created_at')
    .eq('kind', 'video')
    .eq('active', true)
    .order('created_at', { ascending: true });

  if (error || !data) return readStoredVideos();

  const remote = data.map(rowToScheduledVideo).filter(Boolean) as ScheduledVideo[];
  const merged = new Map<string, ScheduledVideo>();
  remote.forEach((video) => {
    const key = `${video.scheduledDate}__${video.block}__${video.companyId ?? 'global'}__${video.targetWorkProfile ?? 'all'}`;
    merged.set(key, video);
  });
  const videos = Array.from(merged.values());
  saveScheduledVideosLocal(videos);
  return videos;
};

/**
 * Obtiene exclusivamente los turnos que le corresponden al usuario conectado.
 * Supabase deriva empresa y perfil laboral desde auth.uid(); los argumentos se
 * usan solamente para mantener un fallback local seguro durante el desarrollo.
 */
export const fetchScheduledVideosForUser = async (
  companyId?: string,
  workProfile?: ScheduledVideoWorkProfile,
  referenceDate = new Date(),
): Promise<ScheduledVideo[]> => {
  const requestedDays = Object.keys(PROGRAM_DAY_OFFSETS).map(day => ({
    day,
    scheduledDate: getScheduledDateForProgramDay(day, referenceDate),
  }));

  const localFallback = () => requestedDays.flatMap(({ day, scheduledDate }) => (
    (['morning', 'afternoon'] as const)
      .map(block => getScheduledVideoFor(readStoredVideos(), day, block, companyId, scheduledDate, workProfile))
      .filter((video): video is ScheduledVideo => Boolean(video))
  ));

  if (!supabase) return localFallback();

  const { data, error } = await supabase.rpc('get_my_scheduled_videos', {
    target_dates: requestedDays.map(item => item.scheduledDate),
  });

  if (error || !data) return localFallback();

  return data
    .map(rowToScheduledVideo)
    .filter((video): video is ScheduledVideo => Boolean(video));
};

export const saveScheduledVideo = async (video: ScheduledVideo) => {
  if (!supabase) {
    const current = readStoredVideos();
    const conflict = current.find(item => (
      item.id !== video.id
      && item.scheduledDate === video.scheduledDate
      && item.block === video.block
      && (item.companyId ?? 'global') === (video.companyId ?? 'global')
      && (item.targetWorkProfile ?? 'all') === (video.targetWorkProfile ?? 'all')
    ));
    if (conflict) {
      return {
        ok: false,
        error: new Error('Ya existe un video para esa empresa, perfil, fecha y turno. Editalo o elegi otra programacion.'),
      };
    }
    saveScheduledVideosLocal([...current.filter(item => item.id !== video.id), video]);
    return { ok: true };
  }

  const { error } = await supabase.rpc('save_scheduled_video', {
    item_id: isUuid(video.id) ? video.id : null,
    target_company_id: video.companyId ?? null,
    item_title: video.title,
    item_url: video.url,
    item_thumbnail_url: video.thumbnailUrl ?? null,
    scheduled_day: video.day,
    scheduled_date: video.scheduledDate,
    scheduled_block: video.block,
    scheduled_time: video.time,
    company_name: video.companyName ?? 'Global',
    target_work_profile: video.targetWorkProfile ?? null,
  });

  if (!error) await fetchScheduledVideos();
  return { ok: !error, error };
};

export const getYouTubeIdFromUrl = (url: string) => {
  const value = url.trim();
  if (!value) return null;

  try {
    const parsed = new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`);
    const hostname = parsed.hostname.toLowerCase().replace(/^www\./, '');
    const cleanId = (candidate?: string | null) => {
      const id = candidate?.trim();
      return id && /^[a-zA-Z0-9_-]{11}$/.test(id) ? id : null;
    };

    if (hostname === 'youtu.be') return cleanId(parsed.pathname.split('/').filter(Boolean)[0]);

    const isYouTubeHost = hostname === 'youtube.com'
      || hostname.endsWith('.youtube.com')
      || hostname === 'youtube-nocookie.com'
      || hostname.endsWith('.youtube-nocookie.com');
    if (!isYouTubeHost) return null;

    const queryId = cleanId(parsed.searchParams.get('v'));
    if (queryId) return queryId;

    const parts = parsed.pathname.split('/').filter(Boolean);
    if (['embed', 'shorts', 'live', 'v'].includes(parts[0])) return cleanId(parts[1]);
  } catch {
    return null;
  }

  return null;
};

export const getVideoThumbnail = (video: ScheduledVideo | null, fallback: string) => {
  if (!video) return fallback;
  if (video.thumbnailUrl) return video.thumbnailUrl;
  const youtubeId = getYouTubeIdFromUrl(video.url);
  if (youtubeId) return `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`;
  return fallback;
};
