import { supabase } from './supabase';

export type ScheduledVideoBlock = 'morning' | 'afternoon';

export interface ScheduledVideo {
  id: string;
  day: string;
  block: ScheduledVideoBlock;
  time: string;
  title: string;
  url: string;
  thumbnailUrl?: string;
  companyName?: string;
  createdAt: string;
}

const STORAGE_KEY = 'reactiva_scheduled_videos';
export const SCHEDULED_VIDEOS_EVENT = 'reactiva-scheduled-videos-updated';

const isUuid = (id: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

const normalizeTime = (time: string) => (time || '08:00').slice(0, 5);

const readStoredVideos = (): ScheduledVideo[] => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') as ScheduledVideo[];
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
  companyName?: string
) => {
  const matches = videos
    .filter(video => video.day === day && video.block === block)
    .filter(video => !video.companyName || video.companyName === 'Global' || !companyName || video.companyName === companyName);

  return matches[matches.length - 1] ?? null;
};

const rowToScheduledVideo = (row: any): ScheduledVideo | null => {
  const metadata = row.metadata ?? {};
  if (!metadata.day || !metadata.block || !row.url) return null;
  return {
    id: row.id,
    day: metadata.day,
    block: metadata.block,
    time: normalizeTime(metadata.time),
    title: row.title ?? 'Pausa activa',
    url: row.url,
    thumbnailUrl: row.thumbnail_url ?? metadata.thumbnailUrl,
    companyName: metadata.companyName ?? 'Global',
    createdAt: row.created_at ?? new Date().toISOString(),
  };
};

export const fetchScheduledVideos = async (): Promise<ScheduledVideo[]> => {
  if (!supabase) return readStoredVideos();

  const { data, error } = await supabase
    .from('content_items')
    .select('id, title, url, thumbnail_url, metadata, created_at')
    .eq('kind', 'video')
    .eq('active', true)
    .order('created_at', { ascending: true });

  if (error || !data) return readStoredVideos();

  const remote = data.map(rowToScheduledVideo).filter(Boolean) as ScheduledVideo[];
  const merged = new Map<string, ScheduledVideo>();
  remote.forEach((video) => {
    const key = `${video.day}__${video.block}__${video.companyName ?? 'Global'}`;
    merged.set(key, video);
  });
  const videos = Array.from(merged.values());
  saveScheduledVideosLocal(videos);
  return videos;
};

export const saveScheduledVideo = async (video: ScheduledVideo) => {
  if (!supabase) {
    const current = readStoredVideos();
    const withoutSameSlot = current.filter(item => !(item.day === video.day && item.block === video.block && (item.companyName ?? 'Global') === (video.companyName ?? 'Global')));
    saveScheduledVideosLocal([...withoutSameSlot, video]);
    return { ok: true };
  }

  const { error } = await supabase.rpc('save_content_item', {
    item_id: isUuid(video.id) ? video.id : null,
    item_kind: 'video',
    item_title: video.title,
    item_description: 'Video programado de pausa activa',
    item_category: 'Microentrenamientos',
    item_tags: ['microentrenamiento', video.day, video.block],
    item_url: video.url,
    item_thumbnail_url: video.thumbnailUrl ?? null,
    item_active: true,
    item_featured: false,
    item_sort_order: 0,
    item_metadata: {
      day: video.day,
      block: video.block,
      time: video.time,
      companyName: video.companyName ?? 'Global',
      thumbnailUrl: video.thumbnailUrl ?? null,
    },
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
