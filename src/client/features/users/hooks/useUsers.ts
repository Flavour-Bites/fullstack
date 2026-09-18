import { useState, useCallback } from 'react';
import { useToast } from '../../../components/Toast';
import { http, type ApiResponse } from '@/shared/api';
import type { SystemUser } from '../../admin/components/types';

export function useUsers() {
  const { showToast } = useToast();
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);

  const fetchUsers = useCallback(async () => {
    setUsersLoading(true);
    try {
      const { data } = await http.get<ApiResponse<{ users: SystemUser[] }>>('/api/users');
      if (data.success) setUsers(data.users || []);
    } catch (e) { /* ignore */ }
    finally { setUsersLoading(false); }
  }, []);

  const saveUserRole = useCallback(async (userId: string, userName: string, newRole: string) => {
    try {
      const { data } = await http.patch<ApiResponse>(`/api/users/${userId}`, { role: newRole });
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
      const { data } = await http.delete<ApiResponse>(`/api/users/${userId}`);
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