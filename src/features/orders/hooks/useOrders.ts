import { useState, useCallback } from 'react';
import { useToast } from '../../../shared/ui/Toast';
import type { CakeRequest } from '../../admin/components/types';
import { orderPrice } from '../../admin/components/types';

export function useOrders(onMutation?: () => void) {
  const { showToast } = useToast();
  const [requests, setRequests] = useState<CakeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // ── Data Fetching ──────────────────────────────────────────
  const fetchRequests = useCallback(async (silent = false) => {
    if (!silent) setRefreshing(true);
    try {
      const res = await fetch('/api/requests');
      const data = await res.json();
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
      const res = await fetch(`/api/requests/${id}`, { method: 'DELETE' });
      const data = await res.json();
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
      if (editCost > 0) body.quotedPrice = editCost;
      const res = await fetch(`/api/requests/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();
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
      const res = await fetch(`/api/requests/${req.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: next })
      });
      const data = await res.json();
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
  const activeCount = requests.filter(r => ['Designing', 'Quoted', 'Confirmed', 'In Progress'].includes(r.status)).length;

  return {
    requests, loading, refreshing,
    totalRevenue, pendingCount, activeCount,
    fetchRequests, handleDeleteRequest, saveRequestUpdates, advanceStatus,
  };
}
