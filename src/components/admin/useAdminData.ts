import { useEffect, useCallback, useState } from 'react';
import type { Stats } from './types';
import type { User } from '../../types';

export function useAdminData(currentUser: User | null) {
  const isAdmin = currentUser?.role === 'admin';

  // Stats
  const [stats, setStats] = useState<Stats | null>(null);

  const fetchStats = useCallback(async () => {  
    try {
      const res = await fetch('/api/stats');
      const data = await res.json();
      if (data.success) setStats(data.stats);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => { fetchStats(); }, []);

  return { stats, isAdmin, fetchStats };
}
