import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Activity, Clock, Filter, Trash2, AlertTriangle, X } from 'lucide-react';
import { t } from '../i18n';
import type { CustomCakeRequest } from '../types';

interface OrderTrackingViewProps {
  requests: CustomCakeRequest[];
  dbConnected: boolean | null;
  onDelete: (id: string) => void;
}

export default function OrderTrackingView({ requests, dbConnected, onDelete }: OrderTrackingViewProps) {
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const pendingDelete = confirmDeleteId ? requests.find(r => r.id === confirmDeleteId) : null;
  return (
    <section className="pt-8 border-t border-stone-200/80 dark:border-stone-800">
      <div className="bg-stone-50 dark:bg-[#111111] border border-stone-200 dark:border-stone-850 p-6 sm:p-10 rounded-sm shadow-xs space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-left">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-stone-300 dark:border-stone-800 bg-white dark:bg-stone-900 mb-2">
              <Activity className="w-3.5 h-3.5 text-stone-600 dark:text-stone-400" />
              <span className="text-[9px] uppercase tracking-[0.25em] text-stone-600 dark:text-stone-400 font-mono">{t('order.myRequests')}</span>
            </div>
            <h2 className="text-2xl font-serif text-warm-950 dark:text-stone-100">{t('order.trackRequests')}</h2>
            <p className="text-xs text-stone-500 dark:text-stone-400 font-light mt-1 mb-3 font-sans">See live progress updates, design status, and custom price bids.</p>

            {dbConnected === false && (
              <div className="inline-flex flex-col sm:flex-row sm:items-center gap-x-2.5 gap-y-1.5 px-3.5 py-2.5 rounded-sm border bg-amber-50/50 dark:bg-amber-950/15 border-amber-250 dark:border-amber-900/50 text-amber-900 dark:text-amber-300 text-[10.5px] font-mono tracking-wider max-w-xl">
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  <span className="font-semibold text-left">{t('order.sandboxActive')}</span>
                </div>
                <span className="text-[9.5px] text-stone-500 dark:text-stone-400 font-light text-left">
                  (To activate Postgres cloud persistence, add your <code className="bg-stone-200/60 dark:bg-stone-800 px-1 rounded font-bold">DATABASE_URL</code> to environment secrets)
                </span>
              </div>
            )}
          </div>
          <div className="bg-white dark:bg-stone-900 px-4 py-2 border border-stone-200 dark:border-stone-800 rounded-sm text-xs text-stone-700 dark:text-stone-300 flex items-center gap-2 font-sans shrink-0">
            <Clock className="w-4 h-4 text-lux-gold animate-pulse" />
            <span>Yodit usually responds in 24 hours.</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          {requests.length === 0 ? (
            <div className="text-center py-10 bg-white dark:bg-[#111111] border border-dashed border-stone-200 dark:border-stone-800 rounded-sm font-sans">
              <Filter className="w-10 h-10 text-stone-300 dark:text-stone-600 mx-auto mb-3" />
              <p className="text-sm font-serif italic text-stone-500 dark:text-stone-400">{t('order.noActiveRequests')}</p>
              <p className="text-xs text-stone-400 dark:text-stone-500 mt-1 font-light">Fill out the custom builder above to start your first design.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-stone-200 dark:border-stone-800 text-[10px] uppercase tracking-widest text-stone-500 dark:text-stone-450 font-mono">
                  <th className="py-3 px-4 font-semibold">{t('order.orderId')}</th>
                  <th className="py-3 px-4 font-semibold">{t('order.eventDate')}</th>
                  <th className="py-3 px-4 font-semibold">{t('order.designDetails')}</th>
                  <th className="py-3 px-4 font-semibold">{t('order.contactName')}</th>
                  <th className="py-3 px-4 font-semibold">{t('order.statusLabel')}</th>
                  <th className="py-3 px-4 font-semibold text-right">{t('order.priceEstimate')}</th>
                  <th className="py-3 px-4 font-semibold text-center">{t('order.action')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-150/60 dark:divide-stone-800 bg-white dark:bg-[#111111] font-sans">
                {requests.map((req) => (
                  <motion.tr
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    key={req.id}
                    className="hover:bg-lux-cream/30 dark:hover:bg-stone-900/30 transition-colors"
                  >
                    <td className="py-4 px-4 font-mono font-medium text-stone-900 dark:text-stone-100 border-stone-100 dark:border-stone-850">
                      {req.id}
                    </td>
                    <td className="py-4 px-4 font-light text-stone-600 dark:text-stone-300 border-stone-100 dark:border-stone-850 font-mono">
                      {req.deliveryDate}
                    </td>
                    <td className="py-4 px-4 border-stone-100 dark:border-stone-850 text-left">
                      <div className="font-semibold text-stone-800 dark:text-stone-200">{req.eventType} Cake</div>
                      <div className="text-[10px] text-stone-500 dark:text-stone-400 mt-0.5">
                        {req.tierCount} Tier{req.tierCount > 1 ? 's' : ''} • {req.flavor}
                      </div>
                    </td>
                    <td className="py-4 px-4 border-stone-100 dark:border-stone-850 text-left">
                      <div className="text-stone-700 dark:text-stone-300">{req.contactName}</div>
                      <div className="text-[10px] text-stone-450 dark:text-stone-500 mt-0.5 font-mono">{req.contactPhone}</div>
                    </td>
                    <td className="py-4 px-4 border-stone-100 dark:border-stone-850 text-left">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] uppercase font-semibold font-mono rounded-full ${
                          req.status === 'Ready'
                            ? 'bg-green-100 dark:bg-green-950/40 text-green-850 dark:text-green-300 border border-green-200 dark:border-green-900/30'
                            : req.status === 'InProgress'
                            ? 'bg-blue-100 dark:bg-blue-950/40 text-blue-850 dark:text-blue-300 border border-blue-200 dark:border-blue-900/30'
                            : req.status === 'Designing'
                            ? 'bg-amber-100 dark:bg-amber-955/40 text-amber-850 dark:text-amber-300 border border-amber-250 dark:border-amber-900/30'
                            : req.status === 'Quoted'
                            ? 'bg-purple-100 dark:bg-purple-955/40 text-purple-850 dark:text-purple-300 border border-purple-250 dark:border-purple-900/30'
                            : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 border border-stone-250 dark:border-stone-700/55'
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        {req.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 font-mono text-right text-stone-900 dark:text-stone-100 font-semibold border-stone-100 dark:border-stone-850">
                      {((req as any).finalPrice ?? (req as any).quotedPrice ?? 0).toLocaleString()} ETB
                    </td>
                    <td className="py-4 px-4 text-center border-stone-100 dark:border-stone-850">
                      <button
                        onClick={() => setConfirmDeleteId(req.id)}
                        className="p-1 px-2.5 border border-stone-200 dark:border-stone-800 rounded-sm hover:border-red-350 dark:hover:border-red-900 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 text-stone-500 dark:text-stone-400 font-medium font-mono text-[10px] transition-all cursor-pointer inline-flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        {t('order.cancelRequest')}
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <AnimatePresence>
        {pendingDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9998] bg-black/50 flex items-center justify-center p-4"
            onClick={() => setConfirmDeleteId(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-sm p-6 max-w-sm w-full shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-red-50 dark:bg-red-950/30 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                </div>
                <div>
                  <h3 className="font-serif text-lg text-stone-900 dark:text-stone-100">Cancel this request?</h3>
                  <p className="text-[10px] text-stone-500 dark:text-stone-400 font-mono">{pendingDelete.id}</p>
                </div>
                <button
                  onClick={() => setConfirmDeleteId(null)}
                  className="ml-auto p-1 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-sm transition-colors"
                >
                  <X className="w-4 h-4 text-stone-400" />
                </button>
              </div>
              <p className="text-xs text-stone-600 dark:text-stone-300 mb-6 leading-relaxed">
                This will permanently cancel your {pendingDelete.eventType} cake request for {pendingDelete.deliveryDate}. This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmDeleteId(null)}
                  className="flex-1 py-2.5 border border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300 text-xs font-medium rounded-sm hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors cursor-pointer"
                >
                  Keep Request
                </button>
                <button
                  onClick={() => { onDelete(pendingDelete.id); setConfirmDeleteId(null); }}
                  className="flex-1 py-2.5 bg-red-600 text-white text-xs font-medium rounded-sm hover:bg-red-700 transition-colors cursor-pointer"
                >
                  Yes, Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
