import { useState, useCallback } from 'react';
import { useToast } from '../components/Toast';
import type { SystemUser } from '../components/admin/types';

export function useUsers() {
  const { showToast } = useToast();
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);

  const fetchUsers = useCallback(async () => {
    setUsersLoading(true);
    try {
      const res = await fetch('/api/users');
      const data = await res.json();
      if (data.success) setUsers(data.users || []);
    } catch (e) { /* ignore */ }
    finally { setUsersLoading(false); }
  }, []);

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
        return true;
      } else throw new Error(data.error);
    } catch (e: any) { showToast('Delete Failed', e.message, 'error'); }
    return false;
  }, []);

  return {
    users,
    usersLoading,
    fetchUsers,
    saveUserRole,
    deleteUser,
  };
}
