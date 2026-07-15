import React from 'react';
import { ShieldCheck, RefreshCw, Loader2, X, Clock } from 'lucide-react';
import { t } from '../../i18n';

interface AdminRecoveryProps {
  isAdmin: boolean;
  recoveryRequests: any[];
  recoveryLoading: boolean;
  recoveryStatusFilter: string;
  setRecoveryStatusFilter: (s: string) => void;
  fetchRecoveryRequests: () => Promise<void>;
  handleRecoveryStatus: (id: string, status: string) => Promise<void>;
}

function getRecoveryStatusBadge(status: string) {
  const base = 'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-mono uppercase font-bold border';
  switch (status) {
    case 'pending':
      return `${base} bg-amber-900/10 border-amber-800 text-amber-400`;
    case 'approved':
      return `${base} bg-emerald-900/10 border-emerald-800 text-emerald-400`;
    case 'rejected':
      return `${base} bg-red-900/10 border-red-800 text-red-400`;
    default:
      return `${base} bg-stone-800 border-stone-700 text-stone-400`;
  }
}

export default function AdminRecovery({
  isAdmin, recoveryRequests, recoveryLoading,
  recoveryStatusFilter, setRecoveryStatusFilter,
  fetchRecoveryRequests, handleRecoveryStatus,
}: AdminRecoveryProps) {
  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto py-20 bg-white dark:bg-[#1d1916] border border-stone-200 dark:border-stone-800 rounded-sm text-center relative z-10 font-sans shadow-xl">
        <ShieldCheck className="w-12 h-12 text-lux-gold/30 mx-auto mb-4" />
        <h3 className="font-serif text-lg text-stone-900 dark:text-white font-medium mb-2">Admin Access Only</h3>
        <p className="text-xs text-stone-400 dark:text-stone-400 max-w-xs mx-auto leading-relaxed">
          Recovery request management is restricted to system administrators.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-5 relative z-10 font-sans">
      <div className="flex justify-between items-center bg-stone-50 dark:bg-[#1d1916] p-5 border border-stone-200 dark:border-stone-800 rounded-sm">
        <h2 className="font-serif text-xl text-stone-900 dark:text-white flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-lux-gold" /> {t('admin.recoveryRequests')} ({recoveryRequests.length})
        </h2>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-[10px] font-mono">
            {['all', 'pending', 'approved', 'rejected'].map(s => (
              <button
                key={s}
                onClick={() => setRecoveryStatusFilter(s)}
                className={`px-2 py-1 uppercase tracking-wider cursor-pointer border transition-colors ${
                  recoveryStatusFilter === s
                    ? 'bg-lux-gold text-stone-950 border-lux-gold font-bold'
                    : 'bg-transparent text-stone-400 dark:text-stone-400 border-stone-200 dark:border-stone-800 hover:text-lux-gold'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
          <button onClick={fetchRecoveryRequests} className="text-stone-400 hover:text-lux-gold p-1 cursor-pointer" title="Refresh">
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {recoveryLoading ? (
        <div className="text-center py-16 bg-stone-50 dark:bg-[#1d1916] border border-stone-200 dark:border-stone-800 rounded-sm">
          <Loader2 className="w-7 h-7 animate-spin text-lux-gold mx-auto mb-2" />
          <p className="text-xs text-stone-400 dark:text-stone-400 font-mono">Loading recovery requests...</p>
        </div>
      ) : recoveryRequests.length === 0 ? (
        <div className="text-center py-16 bg-stone-50 dark:bg-[#1d1916] border border-stone-200 dark:border-stone-800 rounded-sm">
          <ShieldCheck className="w-10 h-10 text-stone-400 dark:text-stone-500 mx-auto mb-3" />
          <p className="text-sm font-serif text-stone-600 dark:text-stone-300 italic">No recovery requests found.</p>
        </div>
      ) : (
        <div className="bg-[#1e1a17] border border-stone-200 dark:border-stone-800 rounded-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-100 dark:bg-[#15110f] text-stone-400 dark:text-stone-400 uppercase font-mono tracking-wider font-semibold border-b border-stone-200 dark:border-stone-800">
                <tr>
                  <th className="px-5 py-4">Old Telegram ID</th>
                  <th className="px-5 py-4">New Telegram ID</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Created</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800/60">
                {recoveryRequests.map((req: any) => (
                  <tr key={req.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-5 py-4 font-mono text-stone-900 dark:text-white text-sm">{req.oldTelegramId}</td>
                    <td className="px-5 py-4 font-mono text-stone-900 dark:text-white text-sm">{req.newTelegramId}</td>
                    <td className="px-5 py-4">
                      <span className={getRecoveryStatusBadge(req.status)}>
                        {req.status === 'approved' ? <ShieldCheck className="w-3 h-3" /> : req.status === 'rejected' ? <X className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                        {req.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-stone-500 font-mono text-[10px]">{new Date(req.createdAt).toLocaleDateString()}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {req.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleRecoveryStatus(req.id, 'approved')}
                              className="px-2.5 py-1 bg-emerald-600 text-white font-mono text-[9px] uppercase font-bold rounded-xs flex items-center gap-1 hover:bg-emerald-500 cursor-pointer"
                            >
                              <ShieldCheck className="w-3 h-3" /> Approve
                            </button>
                            <button
                              onClick={() => handleRecoveryStatus(req.id, 'rejected')}
                              className="px-2.5 py-1 bg-red-700 text-white font-mono text-[9px] uppercase font-bold rounded-xs flex items-center gap-1 hover:bg-red-600 cursor-pointer"
                            >
                              <X className="w-3 h-3" /> Reject
                            </button>
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
    </div>
  );
}
