import { useState } from 'react';
import { Users, Edit3, Trash2, Save, Loader2, RefreshCw, AlertTriangle, ShieldCheck } from 'lucide-react';
import { t } from '../../i18n';
import { SkeletonTable } from '../Skeleton';
import type { SystemUser } from './types';
import type { User } from '../../types';

interface AdminUsersProps {
  users: SystemUser[];
  usersLoading: boolean;
  isAdmin: boolean;
  currentUser: User | null;
  saveUserRole: (userId: string, userName: string, newRole: string) => Promise<boolean | undefined>;
  deleteUser: (userId: string, userName: string) => Promise<boolean | undefined>;
  fetchUsers: () => Promise<void>;
}

export default function AdminUsers({
  users, usersLoading, isAdmin, currentUser,
  saveUserRole, deleteUser, fetchUsers,
}: AdminUsersProps) {
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editingRole, setEditingRole] = useState('');
  const [updatingRole, setUpdatingRole] = useState(false);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);

  const handleSave = async (userId: string, userName: string) => {
    setUpdatingRole(true);
    const ok = await saveUserRole(userId, userName, editingRole);
    if (ok) setEditingUserId(null);
    setUpdatingRole(false);
  };

  const handleDelete = async (userId: string, userName: string) => {
    setDeletingUserId(userId);
    const ok = await deleteUser(userId, userName);
    if (ok) setDeletingUserId(null);
  };

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto py-20 bg-white dark:bg-[#1d1916] border border-stone-200 dark:border-stone-800 rounded-sm text-center relative z-10 font-sans shadow-xl">
        <ShieldCheck className="w-12 h-12 text-lux-gold/30 mx-auto mb-4" />
        <h3 className="font-serif text-lg text-stone-900 dark:text-white font-medium mb-2">Admin Access Only</h3>
        <p className="text-xs text-stone-400 dark:text-stone-400 max-w-xs mx-auto leading-relaxed">
          User management is restricted to system administrators. Contact your admin if you need account changes.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-5 relative z-10 font-sans">
      <div className="flex justify-between items-center bg-stone-50 dark:bg-[#1d1916] p-5 border border-stone-200 dark:border-stone-800 rounded-sm">
        <h2 className="font-serif text-xl text-stone-900 dark:text-white flex items-center gap-2">
          <Users className="w-5 h-5 text-lux-gold" /> {t('admin.totalUsers')} ({users.length})
        </h2>
        <button onClick={fetchUsers} className="text-[10px] uppercase font-mono text-stone-400 dark:text-stone-400 hover:text-lux-gold flex items-center gap-1 cursor-pointer">
          <RefreshCw className="w-3 h-3" /> Refresh
        </button>
      </div>

      {usersLoading ? (
        <SkeletonTable rows={5} cols={4} />
      ) : (
        <div className="bg-[#1e1a17] border border-stone-200 dark:border-stone-800 rounded-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-100 dark:bg-[#15110f] text-stone-400 dark:text-stone-400 uppercase font-mono tracking-wider font-semibold border-b border-stone-200 dark:border-stone-800">
                <tr>
                  <th className="px-5 py-4">Name</th>
                  <th className="px-5 py-4">Email</th>
                  <th className="px-5 py-4">Role</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800/60">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-5 py-4 font-serif italic text-stone-900 dark:text-white text-sm">{u.name}</td>
                    <td className="px-5 py-4 text-stone-600 dark:text-stone-300 font-light">{u.email || '—'}</td>
                    <td className="px-5 py-4">
                      {editingUserId === u.id ? (
                        <select
                          value={editingRole}
                          onChange={e => setEditingRole(e.target.value)}
                          className="bg-stone-100 dark:bg-[#15110f] border border-lux-gold text-stone-700 dark:text-stone-200 py-1 px-2 text-xs rounded-xs font-mono"
                        >
                          <option value="customer">Customer</option>
                          <option value="staff">Bakery Staff</option>
                          <option value="admin">System Admin</option>
                        </select>
                      ) : (
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono uppercase font-bold border ${
                          u.role === 'admin' ? 'bg-lux-gold/10 border-lux-gold text-lux-gold'
                          : u.role === 'staff' ? 'bg-blue-900/10 border-blue-800 text-blue-400'
                          : 'bg-stone-100 dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300'
                        }`}>
                          {u.role === 'admin' ? 'System Admin' : u.role === 'staff' ? 'Bakery Staff' : 'Customer'}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {editingUserId === u.id ? (
                          <>
                            <button
                              onClick={() => handleSave(u.id, u.name)}
                              disabled={updatingRole}
                              className="px-2.5 py-1 bg-lux-gold text-stone-950 font-mono text-[9px] uppercase font-bold rounded-xs flex items-center gap-1"
                            >
                              {updatingRole ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />} Save
                            </button>
                            <button onClick={() => setEditingUserId(null)} className="px-2.5 py-1 bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-300 font-mono text-[9px] uppercase font-bold rounded-xs">
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => { setEditingUserId(u.id); setEditingRole(u.role); }}
                              aria-label="Change role"
                              className="p-1.5 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-400 dark:text-stone-400 hover:text-lux-gold rounded-xs border border-stone-200 dark:border-stone-800 transition-colors"
                              title="Change role"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            {u.id !== currentUser?.id && (
                              <button
                                onClick={() => handleDelete(u.id, u.name)}
                                disabled={deletingUserId === u.id}
                                aria-label="Delete user"
                                className="p-1.5 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-400 dark:text-stone-500 hover:text-red-400 rounded-xs border border-stone-200 dark:border-stone-800 transition-colors"
                                title="Delete user"
                              >
                                {deletingUserId === u.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 rounded-sm p-4 flex items-start gap-3">
        <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <p className="text-xs text-amber-800/80 dark:text-amber-300/80 font-sans font-light leading-relaxed">
          <strong>Role changes take effect immediately.</strong> Promoting a user to <em>Bakery Staff</em> grants access to the Orders and Menu management tabs. Promoting to <em>System Admin</em> grants full system access including this Users panel. Demoting yourself is blocked to prevent lockout.
        </p>
      </div>
    </div>
  );
}
