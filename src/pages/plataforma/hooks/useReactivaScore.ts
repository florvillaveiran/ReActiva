import { useCallback, useEffect, useState } from 'react';
import { fetchMyReactivaScore, REACTIVA_SCORE_UPDATED_EVENT, type ReactivaScore } from '../lib/reactivaScore';

export const useReactivaScore = (enabled = true) => {
  const [score, setScore] = useState<ReactivaScore | null>(null);
  const [loading, setLoading] = useState(enabled);
  const [unavailable, setUnavailable] = useState(false);

  const refresh = useCallback(async () => {
    if (!enabled) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error } = await fetchMyReactivaScore();
    setScore(data);
    setUnavailable(Boolean(error));
    setLoading(false);
  }, [enabled]);

  useEffect(() => {
    void refresh();
    window.addEventListener(REACTIVA_SCORE_UPDATED_EVENT, refresh);
    window.addEventListener('focus', refresh);
    return () => {
      window.removeEventListener(REACTIVA_SCORE_UPDATED_EVENT, refresh);
      window.removeEventListener('focus', refresh);
    };
  }, [refresh]);

  return { score, loading, unavailable, refresh };
};
