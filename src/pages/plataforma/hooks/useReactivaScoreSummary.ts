import { useCallback, useEffect, useState } from 'react';
import { fetchReactivaScoreSummary, REACTIVA_SCORE_UPDATED_EVENT, type ReactivaScoreSummary } from '../lib/reactivaScore';

export const useReactivaScoreSummary = (companyId?: string | null, enabled = true, month?: Date) => {
  const [summary, setSummary] = useState<ReactivaScoreSummary | null>(null);
  const [loading, setLoading] = useState(enabled);
  const [unavailable, setUnavailable] = useState(false);

  const refresh = useCallback(async () => {
    if (!enabled) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error } = await fetchReactivaScoreSummary(companyId, month);
    setSummary(data);
    setUnavailable(Boolean(error));
    setLoading(false);
  }, [companyId, enabled, month?.getFullYear(), month?.getMonth()]);

  useEffect(() => {
    void refresh();
    window.addEventListener(REACTIVA_SCORE_UPDATED_EVENT, refresh);
    window.addEventListener('focus', refresh);
    return () => {
      window.removeEventListener(REACTIVA_SCORE_UPDATED_EVENT, refresh);
      window.removeEventListener('focus', refresh);
    };
  }, [refresh]);

  return { summary, loading, unavailable, refresh };
};
