import { useState, useCallback } from 'react';
import { useToast } from '@client/components/Toast';
import { http } from '@client/lib/http';
import type { ApiResponse } from '@/shared/api';
import type { RecoveryRequest } from '@shared/types';

export function useRecovery() {
  const { showToast } = useToast();
  const [recoveryRequests, setRecoveryRequests] = useState<RecoveryRequest[]>([]);
  const [recoveryLoading, setRecoveryLoading] = useState(false);
  const [recoveryStatusFilter, setRecoveryStatusFilter] = useState('all');

  const fetchRecoveryRequests = useCallback(async () => {
    setRecoveryLoading(true);
    try {
      const url = recoveryStatusFilter === 'all' ? '/api/recovery' : `/api/recovery?status=${recoveryStatusFilter}`;
      const { data } = await http.get<ApiResponse<{ requests: RecoveryRequest[] }>>(url);
      if (data.success) setRecoveryRequests(data.requests || []);
    } catch (e) { /* ignore */ }
    finally { setRecoveryLoading(false); }
  }, [recoveryStatusFilter]);

  const handleRecoveryStatus = useCallback(async (id: string, status: string) => {
    try {
      const { data } = await http.patch<ApiResponse>(`/api/recovery/${id}`, { status });
      if (data.success) {
        showToast('Recovery Updated', `Request ${status}.`, 'success');
        fetchRecoveryRequests();
      } else throw new Error(data.error);
    } catch (e: any) {
      showToast('Update Failed', e.message, 'error');
    }
  }, [fetchRecoveryRequests]);

  return {
    recoveryRequests,
    recoveryLoading,
    recoveryStatusFilter,
    setRecoveryStatusFilter,
    fetchRecoveryRequests,
    handleRecoveryStatus,
  };
}
