import { useState, useCallback } from 'react';
import { useToast } from '../../../components/Toast';
import { http } from '@client/lib/http';
import type { ApiResponse } from '@/shared/api';
import type { CakeRequest } from '../../admin/types';
import { orderPrice } from '../../admin/types';

export function useOrders(onMutation?: () => void) {
  const { showToast } = useToast();
  const [requests, setRequests] = useState<CakeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // ── Data Fetching ──────────────────────────────────────────
  const fetchRequests = useCallback(async (silent = false) => {
    if (!silent) setRefreshing(true);
    try {
      const { data } = await http.get<ApiResponse<{ requests: CakeRequest[] }>>('/api/requests');
      if (data.success) {
        setRequests(data.requests || []);
        if (!silent) showToast('Orders Refreshed', `Loaded ${data.requests?.length || 0} orders.`, 'info');
      } else throw new Error(data.error);
    } catch (err: any) {
      showToast('Sync Failed', err.message, 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // ── Order Actions ──────────────────────────────────────────
  const handleDeleteRequest = useCallback(async (id: string, name: string) => {
    if (!window.confirm(`Delete order from ${name}? This cannot be undone.`)) return;
    try {
      const { data } = await http.delete<ApiResponse>(`/api/requests/${id}`);
      if (data.success) {
        showToast('Order Deleted', `${name}'s order has been removed.`, 'warning');
        fetchRequests(true);
        onMutation?.();
        return true;
      } else throw new Error(data.error);
    } catch (e: any) { showToast('Delete Failed', e.message, 'error'); }
    return false;
  }, [onMutation]);

  const saveRequestUpdates = useCallback(async (id: string, name: string, editStatus: string, editCost: number) => {
    try {
      const body: Record<string, any> = { status: editStatus };
      if (editCost > 0) body.price = editCost;
      const { data } = await http.patch<ApiResponse>(`/api/requests/${id}`, body);
      if (data.success) {
        showToast('Order Updated', `${name}'s order updated — status: ${editStatus}, price: ${editCost.toLocaleString()} ETB.`, 'success');
        fetchRequests(true);
        onMutation?.();
        return true;
      } else throw new Error(data.error);
    } catch (e: any) { showToast('Update Failed', e.message, 'error'); }
    return false;
  }, [onMutation]);

  const advanceStatus = useCallback(async (req: CakeRequest, next: string) => {
    try {
      const { data } = await http.patch<ApiResponse>(`/api/requests/${req.id}`, { status: next });
      if (data.success) {
        showToast('Status Updated', `${req.contactName}'s order moved to "${next}".`, 'success');
        fetchRequests(true);
        onMutation?.();
        return true;
      }
    } catch (e: any) { showToast('Failed', e.message, 'error'); }
    return false;
  }, [onMutation]);

  // ── Derived Values ─────────────────────────────────────────
  const totalRevenue = requests.reduce((s, r) => s + orderPrice(r), 0);
  const pendingCount = requests.filter(r => r.status === 'Received' || r.status === 'Pending').length;
  const activeCount = requests.filter(r => ['Designing', 'Priced', 'Confirmed', 'InProgress'].includes(r.status)).length;

  return {
    requests, loading, refreshing,
    totalRevenue, pendingCount, activeCount,
    fetchRequests, handleDeleteRequest, saveRequestUpdates, advanceStatus,
  };
}