import { useState, useEffect, useCallback } from 'react';
import { useToast } from '../Toast';
import type { CakeRequest, SystemUser, Stats } from './types';
import { orderPrice } from './types';
import type { User } from '../../types';

export function useAdminData(currentUser: User | null) {
  const { showToast } = useToast();
  const isAdmin = currentUser?.role === 'admin';

  // Orders state
  const [requests, setRequests] = useState<CakeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Users state (admin only)
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);

  // Stats
  const [stats, setStats] = useState<Stats | null>(null);

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

  const fetchUsers = useCallback(async () => {
    setUsersLoading(true);
    try {
      const res = await fetch('/api/users');
      const data = await res.json();
      if (data.success) setUsers(data.users || []);
    } catch (e) { /* ignore */ }
    finally { setUsersLoading(false); }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/stats');
      const data = await res.json();
      if (data.success) setStats(data.stats);
    } catch (e) { /* ignore */ }
  }, []);

  // ── Order Actions ──────────────────────────────────────────
  const handleDeleteRequest = useCallback(async (id: string, name: string) => {
    if (!window.confirm(`Delete order from ${name}? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/requests/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showToast('Order Deleted', `${name}'s order has been removed.`, 'warning');
        fetchRequests(true); fetchStats();
        return true;
      } else throw new Error(data.error);
    } catch (e: any) { showToast('Delete Failed', e.message, 'error'); }
    return false;
  }, []);

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
        fetchRequests(true); fetchStats();
        return true;
      } else throw new Error(data.error);
    } catch (e: any) { showToast('Update Failed', e.message, 'error'); }
    return false;
  }, []);

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
        fetchRequests(true); fetchStats();
        return true;
      }
    } catch (e: any) { showToast('Failed', e.message, 'error'); }
    return false;
  }, []);

  // ── User Role Actions (Admin Only) ────────────────────────
  const saveUserRole = useCallback(async (userId: string, userName: string, newRole: string) => {
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole })
      });
      const data = await res.json();
      if (data.success) {
        showToast('Role Updated', `${userName} is now a ${newRole}.`, 'success');
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
        fetchStats();
        return true;
      } else throw new Error(data.error);
    } catch (e: any) { showToast('Role Update Failed', e.message, 'error'); }
    return false;
  }, []);

  const deleteUser = useCallback(async (userId: string, userName: string) => {
    if (!window.confirm(`Delete user "${userName}"? All their data will be removed.`)) return false;
    try {
      const res = await fetch(`/api/users/${userId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showToast('User Deleted', `${userName} has been removed from the system.`, 'warning');
        setUsers(prev => prev.filter(u => u.id !== userId));
        fetchStats();
        return true;
      } else throw new Error(data.error);
    } catch (e: any) { showToast('Delete Failed', e.message, 'error'); }
    return false;
  }, []);

  // ── Effects ────────────────────────────────────────────────
  useEffect(() => { fetchRequests(true); fetchStats(); }, []);

  // ── Derived Values ─────────────────────────────────────────
  const totalRevenue = requests.reduce((s, r) => s + orderPrice(r), 0);
  const pendingCount = requests.filter(r => r.status === 'Received' || r.status === 'Pending').length;
  const activeCount = requests.filter(r => ['Designing', 'Quoted', 'Confirmed', 'In Progress'].includes(r.status)).length;

  return {
    // State
    requests, loading, refreshing, users, usersLoading, stats,
    // Derived
    totalRevenue, pendingCount, activeCount,
    isAdmin,
    // Fetch
    fetchRequests, fetchUsers, fetchStats,
    // Actions
    handleDeleteRequest, saveRequestUpdates, advanceStatus,
    saveUserRole, deleteUser,
  };
}
