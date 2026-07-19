import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search, Filter, FilterX, Shield, ArrowRight, Edit3, Trash2,
  Save, X, Loader2, Calendar, Mail, Phone, MapPin
} from 'lucide-react';
import { t } from '../../i18n';
import { SkeletonCard } from '../Skeleton';
import { STATUS_COLORS, STATUS_ICONS, WORKFLOW, nextStatus, orderPrice } from './types';
import type { CakeRequest } from './types';

interface AdminOrdersProps {
  requests: CakeRequest[];
  loading: boolean;
  refreshing: boolean;
  handleDeleteRequest: (id: string, name: string) => Promise<boolean | undefined>;
  saveRequestUpdates: (id: string, name: string, editStatus: string, editCost: number) => Promise<boolean | undefined>;
  advanceStatus: (req: CakeRequest, next: string) => Promise<boolean | undefined>;
}

export default function AdminOrders({ requests, loading, handleDeleteRequest, saveRequestUpdates, advanceStatus }: AdminOrdersProps) {
  const [selectedRequest, setSelectedRequest] = useState<CakeRequest | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editStatus, setEditStatus] = useState('');
  const [editCost, setEditCost] = useState(0);
  const [updating, setUpdating] = useState(false);

  const filteredRequests = requests.filter(r => {
    const q = searchTerm.toLowerCase();
    const matchesSearch = r.contactName.toLowerCase().includes(q) || r.id.toLowerCase().includes(q) || r.flavor.toLowerCase().includes(q) || r.eventType.toLowerCase().includes(q);
    if (statusFilter === 'all') return matchesSearch;
    if (statusFilter === 'pending') return matchesSearch && (r.status === 'Received' || r.status === 'Pending');
    if (statusFilter === 'active') return matchesSearch && ['Designing', 'Quoted', 'Confirmed', 'In Progress'].includes(r.status);
    if (statusFilter === 'completed') return matchesSearch && (r.status === 'Ready' || r.status === 'Completed');
    return matchesSearch && r.status.toLowerCase() === statusFilter.toLowerCase();
  });

  const startEditing = (req: CakeRequest) => {
    setEditingId(req.id);
    setEditStatus(req.status);
    setEditCost(req.finalPrice ?? req.quotedPrice ?? 0);
  };

  const handleSave = async (id: string, name: string) => {
    setUpdating(true);
    await saveRequestUpdates(id, name, editStatus, editCost);
    if (selectedRequest?.id === id) {
      setSelectedRequest({ ...selectedRequest, status: editStatus, quotedPrice: editCost });
    }
    setEditingId(null);
    setUpdating(false);
  };

  return (
    <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10 items-start">
      {/* Left: order list */}
      <div className="lg:col-span-7 space-y-5">
        {/* Search & Filter */}
        <div className="bg-stone-50 dark:bg-[#1d1916] p-4 border border-stone-200/60 dark:border-stone-800/60 rounded-sm space-y-4 font-sans">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-grow w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 dark:text-stone-400" />
              <input
                type="text"
                placeholder={t('admin.searchOrders')}
                aria-label={t('admin.searchOrders')}
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full bg-stone-100 dark:bg-[#15110f] border border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-200 focus:outline-none focus:ring-1 focus:ring-lux-gold pl-9 pr-3 py-3 text-xs rounded-xs"
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
              <Filter className="w-3.5 h-3.5 text-stone-400 dark:text-stone-400 shrink-0" />
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="bg-stone-100 dark:bg-[#15110f] border border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-300 focus:outline-none focus:ring-1 focus:ring-lux-gold py-3 px-3 text-xs rounded-xs font-mono font-bold flex-grow sm:flex-grow-0"
              >
                <option value="all">{t('admin.allStatuses')}</option>
                <option value="pending">Pending</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                {WORKFLOW.map(s => <option key={s} value={s.toLowerCase()}>{s}</option>)}
              </select>
            </div>
          </div>
          {(searchTerm || statusFilter !== 'all') && (
            <div className="flex items-center justify-between pt-1 border-t border-stone-200/50 dark:border-stone-800/50">
              <span className="text-[10px] text-stone-400 dark:text-stone-400 font-mono">
                Showing <strong className="text-lux-gold">{filteredRequests.length}</strong> matching orders
              </span>
              <button onClick={() => { setSearchTerm(''); setStatusFilter('all'); }} className="text-[9px] uppercase font-mono text-stone-400 dark:text-stone-400 hover:text-lux-gold flex items-center gap-1 cursor-pointer">
                <FilterX className="w-3 h-3" /> Clear
              </button>
            </div>
          )}
        </div>

        {/* Order List */}
        {loading ? (
          <div className="space-y-4">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="bg-stone-50 dark:bg-[#1d1916] text-center p-16 border border-stone-200/60 dark:border-stone-800/60 rounded-sm">
            <Shield className="w-10 h-10 text-stone-400 dark:text-stone-500 mx-auto mb-3" />
            <p className="text-sm font-serif text-stone-600 dark:text-stone-300 italic">{t('admin.noOrders')}</p>
            <p className="text-xs text-stone-400 dark:text-stone-500 mt-1">Try changing your filters or seed some demo data.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredRequests.map(req => {
              const isSelected = selectedRequest?.id === req.id;
              const isEditing = editingId === req.id;
              const next = nextStatus(req.status);
              return (
                <motion.div
                  key={req.id}
                  layoutId={`order-${req.id}`}
                  onClick={() => { if (!isEditing) setSelectedRequest(req); }}
                  role="button"
                  tabIndex={0}
                  className={`bg-white/95 dark:bg-[#1e1a17]/95 border text-left rounded-sm p-5 transition-all cursor-pointer relative ${
                    isSelected ? 'border-lux-gold shadow-lg shadow-lux-gold/5 bg-stone-100 dark:bg-[#221d19]' : 'border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700'
                  }`}
                >
                  {isSelected && <div className="absolute top-0 bottom-0 left-0 w-1 bg-lux-gold rounded-l-sm" />}

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-semibold text-lux-gold">{req.id}</span>
                      <span className="text-[9px] uppercase tracking-wider font-mono text-stone-500 dark:text-stone-400 bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 px-2 py-0.5 rounded-sm">{req.eventType}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-mono uppercase font-bold border flex items-center gap-1 ${STATUS_COLORS[req.status] || 'bg-stone-100 dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300'}`}>
                        {STATUS_ICONS[req.status]}
                        {req.status}
                      </span>
                      <span className="text-[11px] font-mono font-bold text-stone-600 dark:text-stone-300">
                        {orderPrice(req) ? `${orderPrice(req).toLocaleString()} ETB` : 'Unquoted'}
                      </span>
                    </div>
                  </div>

                  <h3 className="font-serif text-base text-stone-900 dark:text-white font-medium mb-1">{req.contactName}</h3>
                  <div className="font-sans text-[11px] text-stone-400 dark:text-stone-400 font-light flex flex-wrap gap-x-4 gap-y-1 mb-3 pb-3 border-b border-stone-200/60 dark:border-stone-800/60">
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3 text-lux-gold" /> {req.deliveryDate}</span>
                    <span>{req.tierCount} tier • {req.guestCount} guests</span>
                    <span className="text-lux-gold">{req.flavor}</span>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <div className="flex gap-2 flex-wrap">
                      {next && (
                        <button
                          onClick={e => { e.stopPropagation(); advanceStatus(req, next); }}
                          className="bg-lux-gold/10 hover:bg-lux-gold text-lux-gold hover:text-stone-950 text-[9px] font-mono tracking-wider font-bold py-1 px-2.5 rounded-xs border border-lux-gold/20 flex items-center gap-1 transition-all"
                        >
                          <ArrowRight className="w-3 h-3" /> Mark as {next}
                        </button>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <button onClick={e => { e.stopPropagation(); startEditing(req); }} className="p-1 px-2 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-400 dark:text-stone-400 hover:text-lux-gold rounded-xs border border-stone-200 dark:border-stone-800 text-[10px] font-mono flex items-center gap-1">
                        <Edit3 className="w-3 h-3" /> Edit
                      </button>
                      <button onClick={e => { e.stopPropagation(); handleDeleteRequest(req.id, req.contactName); }} aria-label={`Delete order ${req.id}`} className="p-1.5 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-400 dark:text-stone-500 hover:text-red-400 rounded-xs border border-stone-200 dark:border-stone-800">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Inline edit form */}
                  {isEditing && (
                    <div onClick={e => e.stopPropagation()} className="mt-4 p-4 border-t border-stone-200/70 dark:border-stone-800/70 bg-stone-100/50 dark:bg-stone-900/50 space-y-4 rounded-xs">
                      <h4 className="text-[10px] uppercase tracking-wider font-mono text-stone-400 dark:text-stone-400 font-bold">{t('admin.editOrder')}</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="text-[9px] uppercase tracking-wider font-mono text-stone-400 dark:text-stone-400 block mb-1">{t('admin.statusLabel')}</label>
                          <select value={editStatus} onChange={e => setEditStatus(e.target.value)} className="w-full bg-stone-100 dark:bg-[#15110f] border border-stone-200 dark:border-stone-800 p-2 text-xs text-stone-700 dark:text-stone-200 focus:outline-none rounded-xs">
                            {WORKFLOW.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="text-[9px] uppercase tracking-wider font-mono text-stone-400 dark:text-stone-400 block mb-1">{t('admin.quotedPrice')}</label>
                          <input type="number" value={editCost} onChange={e => setEditCost(Math.max(0, Number(e.target.value)))} className="w-full bg-stone-100 dark:bg-[#15110f] border border-stone-200 dark:border-stone-800 p-2 text-xs text-stone-700 dark:text-stone-200 focus:outline-none rounded-xs" />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2">
                        <button onClick={() => setEditingId(null)} className="px-3 py-1.5 text-[10px] font-mono font-bold uppercase bg-stone-200 dark:bg-stone-800 text-stone-500 dark:text-stone-400 hover:bg-stone-300 dark:hover:bg-stone-700 rounded-sm">{t('admin.cancelEdit')}</button>
                        <button onClick={() => handleSave(req.id, req.contactName)} disabled={updating} className="px-3.5 py-1.5 text-[10px] font-mono font-bold uppercase bg-lux-gold text-stone-950 hover:bg-white rounded-sm flex items-center gap-1">
                          {updating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />} {t('admin.saveChanges')}
                        </button>
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Right: order detail sidebar */}
      <div className="lg:col-span-5 relative">
        <AnimatePresence mode="wait">
          {selectedRequest ? (
            <motion.div
              key={selectedRequest.id}
              initial={{ opacity: 0, x: 25 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -15 }}
              className="bg-white/95 dark:bg-[#1e1a17]/95 border border-lux-gold/30 dark:border-[#c5a880]/30 rounded-sm shadow-2xl sticky top-6"
            >
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-lux-gold via-white to-transparent" />
              <div className="p-6 space-y-5">
                <div className="flex justify-between items-start border-b border-stone-200 dark:border-stone-800 pb-4">
                  <div>
                    <span className="text-[9px] uppercase tracking-widest font-mono text-lux-gold block mb-1">Order Details</span>
                    <h2 className="font-serif text-xl text-stone-900 dark:text-white font-medium">{selectedRequest.contactName}</h2>
                    <p className="text-[10px] text-stone-400 dark:text-stone-400 font-mono mt-1">{selectedRequest.id} • {selectedRequest.requestDate}</p>
                  </div>
                  <button onClick={() => setSelectedRequest(null)} aria-label="Close details" className="p-1.5 rounded-sm hover:bg-stone-200 dark:hover:bg-stone-800 text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white"><X className="w-4 h-4" /></button>
                </div>

                <div className="space-y-2 bg-stone-100 dark:bg-[#15110f] p-3 border border-stone-200 dark:border-stone-800 rounded-xs text-xs">
                  <div className="flex items-center gap-2 text-stone-600 dark:text-stone-300"><Mail className="w-4 h-4 text-lux-gold shrink-0" /> {selectedRequest.userId ? 'via Telegram' : 'No contact email'}</div>
                  <div className="flex items-center gap-2 text-stone-600 dark:text-stone-300"><Phone className="w-4 h-4 text-lux-gold shrink-0" /> {selectedRequest.contactPhone}</div>
                  <div className="flex items-center gap-2 text-stone-600 dark:text-stone-300">
                    <MapPin className="w-4 h-4 text-lux-gold shrink-0" />
                    {selectedRequest.deliveryOption === 'pickup' ? 'Studio Pickup — Bole' : selectedRequest.deliveryAddress || 'Delivery'}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-stone-100 dark:bg-[#15110f] p-3 border border-stone-200 dark:border-stone-800 rounded-xs">
                    <span className="text-[9px] uppercase text-stone-400 dark:text-stone-400 font-mono block">Tiers</span>
                    <span className="text-stone-100 font-serif text-sm">{selectedRequest.tierCount} Tier</span>
                  </div>
                  <div className="bg-stone-100 dark:bg-[#15110f] p-3 border border-stone-200 dark:border-stone-800 rounded-xs">
                    <span className="text-[9px] uppercase text-stone-400 dark:text-stone-400 font-mono block">Guests</span>
                    <span className="text-stone-100 font-serif text-sm">{selectedRequest.guestCount}</span>
                  </div>
                  <div className="bg-stone-100 dark:bg-[#15110f] p-3 border border-stone-200 dark:border-stone-800 rounded-xs col-span-2">
                    <span className="text-[9px] uppercase text-stone-400 dark:text-stone-400 font-mono block">Flavor</span>
                    <span className="text-lux-gold font-serif text-sm">{selectedRequest.flavor}</span>
                  </div>
                </div>

                {selectedRequest.designStyle && (
                  <div>
                    <h4 className="text-[9px] uppercase tracking-wider font-mono text-stone-400 dark:text-stone-400 font-bold mb-2">Design Notes</h4>
                    <div className="p-3 border border-stone-200 dark:border-stone-800 bg-stone-100 dark:bg-[#15110f] rounded-xs text-stone-600 dark:text-stone-300 text-xs font-light leading-relaxed italic">
                      &quot;{selectedRequest.designStyle}&quot;
                    </div>
                  </div>
                )}

                {selectedRequest.specialInstructions && (
                  <div>
                    <h4 className="text-[9px] uppercase tracking-wider font-mono text-stone-400 dark:text-stone-400 font-bold mb-2">Special Instructions</h4>
                    <div className="p-3 border border-stone-200 dark:border-stone-800 bg-stone-100 dark:bg-[#15110f] rounded-xs text-stone-600 dark:text-stone-300 text-xs font-light leading-relaxed">
                      {selectedRequest.specialInstructions}
                    </div>
                  </div>
                )}

                <div className="border-t border-stone-200 dark:border-stone-800 pt-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[9px] uppercase font-mono text-stone-400 dark:text-stone-400 block">Quoted Price</span>
                      <span className="text-lg font-mono font-bold text-lux-gold">
                        {orderPrice(selectedRequest) ? `${orderPrice(selectedRequest).toLocaleString()} ETB` : 'Not quoted yet'}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => startEditing(selectedRequest)} className="px-3 py-2 bg-stone-100 dark:bg-stone-900 hover:bg-lux-gold text-stone-700 dark:text-stone-200 hover:text-stone-950 font-mono text-[10px] uppercase font-bold rounded-sm border border-stone-200 dark:border-stone-800 transition-all cursor-pointer">
                        Edit
                      </button>
                      <button onClick={() => handleDeleteRequest(selectedRequest.id, selectedRequest.contactName)} aria-label="Delete order" className="p-2 border border-stone-200 dark:border-stone-800 hover:border-red-800 bg-red-950/20 text-red-400 rounded-sm cursor-pointer">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-3 text-left">
                    <div className="bg-stone-100 dark:bg-[#15110f] p-2.5 border border-stone-200 dark:border-stone-800 rounded-xs">
                      <span className="text-[8px] uppercase font-mono text-stone-400 dark:text-stone-400 block">Quoted Price</span>
                      <span className="text-xs font-mono font-bold text-stone-700 dark:text-stone-200">{orderPrice(selectedRequest) ? `${orderPrice(selectedRequest).toLocaleString()} ETB` : 'Not quoted'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="bg-white/95 dark:bg-[#1e1a17]/95 border border-dashed border-stone-300 dark:border-stone-800 rounded-sm py-24 text-center sticky top-6">
              <Shield className="w-10 h-10 text-stone-600 mx-auto mb-3" />
              <h3 className="font-serif text-stone-400 dark:text-stone-400 italic">{t('admin.selectOrder')}</h3>
              <p className="text-xs text-stone-400 dark:text-stone-500 max-w-xs mx-auto mt-1 font-light px-6">Click any order on the left to view full details and manage it.</p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
