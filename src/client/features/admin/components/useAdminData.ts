import { useEffect, useCallback, useState } from 'react';
import type { Stats } from './types';
import type { User } from '@shared/types';
import { http } from '@client/lib/http';
import type { ApiResponse } from '@/shared/api';

export function useAdminData(currentUser: User | null) {
  const isAdmin = currentUser?.role === 'admin';

  // Stats
  const [stats, setStats] = useState<Stats | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      const { data } = await http.get<ApiResponse<{ stats: Stats }>>('/api/stats');
      if (data.success) setStats(data.stats);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => { fetchStats(); }, []);

  return { stats, isAdmin, fetchStats };
}