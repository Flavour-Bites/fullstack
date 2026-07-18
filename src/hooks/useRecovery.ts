import { useState, useCallback } from 'react';
import { useToast } from '../components/Toast';

export function useRecovery() {
  const { showToast } = useToast();
  const [recoveryRequests, setRecoveryRequests] = useState<any[]>([]);
  const [recoveryLoading, setRecoveryLoading] = useState(false);
  const [recoveryStatusFilter, setRecoveryStatusFilter] = useState('all');

  const fetchRecoveryRequests = useCallback(async () => {
    setRecoveryLoading(true);
    try {
      const url = recoveryStatusFilter === 'all' ? '/api/recovery' : `/api/recovery?status=${recoveryStatusFilter}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) setRecoveryRequests(data.requests || []);
    } catch (e) { /* ignore */ }
    finally { setRecoveryLoading(false); }
  }, [recoveryStatusFilter]);

  const handleRecoveryStatus = useCallback(async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/recovery/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('Recovery Updated', `Request ${status}.`, 'success');
        fetchRecoveryRequests();
      } else throw new Error(data.error);
    } catch (e: any) {
      showToast('Update Failed', e.message, 'error');
    }
  }, []);

  return {
    recoveryRequests,
    recoveryLoading,
    recoveryStatusFilter,
    setRecoveryStatusFilter,
    fetchRecoveryRequests,
    handleRecoveryStatus,
  };
}
