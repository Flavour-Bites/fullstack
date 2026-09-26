import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Search, AlertCircle, ShoppingBag, ShieldCheck } from 'lucide-react';
import { t } from '@client/i18n/index';
import { usePageTitle } from '../../core/hooks/usePageTitle';
import { getStatusStyles } from '../../../../shared/utils/statusStyles';
import { BUSINESS_INFO } from '../../../../shared/constants/index';
import { useOrders } from '../hooks/useOrders';

interface FrontendOrder {
  id: string;
  clientName: string;
  email: string;
  cakeType: string;
  eventDate: string;
  status: 'Pending' | 'In Review' | 'Confirmed' | 'Designing' | 'Priced' | 'InProgress' | 'Ready' | 'Completed';
  stepNum: number; // 1 to 5 steps
  tierCount: number;
  flavor: string;
  amount: string;
  details: string;
  timeline: { title: string; date: string; description: string; done: boolean }[];
}

interface MyOrdersViewProps {
  currentUser: {
    id: string;
    email?: string;
    name: string;
    role: string;
  };
}

export default function MyOrdersView({ currentUser }: MyOrdersViewProps) {
  usePageTitle("My Orders");
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<FrontendOrder | null>(null);
  const [searchError, setSearchError] = useState(false);
  
  const { requests, fetchRequests } = useOrders();

  useEffect(() => {
    if (currentUser) {
      fetchRequests(true);
    }
  }, [currentUser, fetchRequests]);

  const liveOrders: FrontendOrder[] = requests.map((item: any) => {
    const numTiers = Number(item.tierCount) || 1;
    const price = item.finalPrice ?? item.price ?? 0;
    const amountEtb = price ? `${price.toLocaleString()} ETB` : 'Pending Price';
    
    let stepNumber = 1;
    if (item.status === 'Priced') stepNumber = 2;
    if (item.status === 'Confirmed') stepNumber = 3;
    if (item.status === 'Designing' || item.status === 'InProgress') stepNumber = 4;
    if (item.status === 'Ready' || item.status === 'Completed') stepNumber = 5;

    return {
      id: item.id || `FB-${Math.floor(1000 + Math.random() * 9000)}Y`,
      clientName: item.contactName || 'Valued Client',
      email: item.contactEmail || '',
      cakeType: `${item.eventType || 'Custom Celebration'} Cake`,
      eventDate: item.deliveryDate || 'TBD',
      status: item.status || 'Pending',
      stepNum: stepNumber,
      tierCount: numTiers,
      flavor: item.flavor || 'Custom Assortment',
      amount: amountEtb,
      details: item.designStyle || 'Custom cake studio creation requested.',
      timeline: [
        { title: 'Inquiry Received', date: item.requestDate || 'Just Now', description: 'Your request has been filed in Yodit\'s review queue!', done: true },
        { title: 'Aesthetic Concept Design', date: 'Studio Stage', description: 'Yodit reviews your specs to draft a visual layout.', done: stepNumber >= 2 },
        { title: 'Price Confirmed & Deposit Paid', date: 'Booking Confirmed', description: 'After price confirmation, a 50% reservation fee secures your slot.', done: stepNumber >= 3 },
        { title: 'Baking & Handcrafting Artistry', date: 'Active Phase', description: 'Oven baking and intricate hand-sculpted marzipan artwork.', done: stepNumber >= 4 },
        { title: 'Secure Event Pickup', date: item.deliveryDate || 'TBD', description: `Safe hand-off at ${BUSINESS_INFO.location.name} coordinates.`, done: stepNumber >= 5 }
      ]
    };
  });

  const handleSearch = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSearchError(false);
    
    if (!searchQuery.trim()) {
      setSelectedOrder(null);
      return;
    }

    const trimmed = searchQuery.trim().toLowerCase();
    const found = liveOrders.find(
      (ord) =>
        ord.id.toLowerCase().includes(trimmed) ||
        ord.clientName.toLowerCase().includes(trimmed) ||
        ord.email.toLowerCase().includes(trimmed)
    );

    if (found) {
      setSelectedOrder(found);
    } else {
      setSelectedOrder(null);
      setSearchError(true);
    }
  };

  return (
    <div className="bg-lux-cream/30 dark:bg-stone-900/10 min-h-screen py-16 px-4 sm:px-6">
      {/* Visual Title Header */}
      <div className="max-w-6xl mx-auto mb-16 text-center">
        <span className="text-[10px] uppercase tracking-[0.3em] text-lux-gold font-mono block mb-2 font-bold">{t('order.orderMonitor')}</span>
        <h1 className="text-4xl font-serif text-warm-950 dark:text-stone-100 font-medium italic">{t('order.orderUpdates')}</h1>
        <p className="text-xs text-stone-500 dark:text-stone-400 font-light mt-2 max-w-lg mx-auto font-sans">
          {t('order.orderMonitorDesc')}
        </p>
        <div className="h-[2px] w-12 bg-lux-gold mx-auto mt-4" />
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Search & Overview List - left */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white dark:bg-stone-950 p-6 border border-stone-200/60 dark:border-stone-850 rounded-xs shadow-xs space-y-4 text-left">
            <h3 className="font-serif text-base text-stone-900 dark:text-stone-100 font-medium">{t('order.orderId')}</h3>
            <p className="text-[11px] text-stone-500 dark:text-stone-400 font-light font-sans">
              {t('order.enterOrderId')}
            </p>

            <form onSubmit={handleSearch} className="flex gap-2 font-sans" id="order-search-form">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input
                  type="text"
                  placeholder={t('order.searchOrderPlaceholder')}
                  aria-label={t('order.searchOrderPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 focus:outline-none focus:ring-1 focus:ring-lux-gold focus:border-lux-gold pl-9 pr-3 py-3 text-xs text-stone-850 dark:text-stone-100 placeholder-stone-400 rounded-sm"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-3 bg-stone-900 dark:bg-stone-800 hover:bg-lux-gold text-white hover:text-stone-950 dark:hover:text-stone-950 font-mono text-[10px] uppercase font-bold tracking-wider rounded-sm transition-colors cursor-pointer"
              >
                {t('common.track')}
              </button>
            </form>

            {searchError && (
              <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400 text-[11px] rounded-xs font-sans flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                <span>{t('order.noOrderMatches')}</span>
              </div>
            )}
          </div>

          <div className="bg-white dark:bg-stone-950 p-6 border border-stone-200/60 dark:border-stone-850 rounded-xs shadow-xs space-y-4 text-left">
            <div className="flex justify-between items-center pb-2 border-b border-stone-100 dark:border-stone-850">
              <h3 className="font-serif text-sm text-stone-900 dark:text-stone-100 font-medium">{t('order.sampleOrdersList')}</h3>
              <span className="text-[9px] uppercase tracking-wider font-mono text-lux-gold bg-lux-gold/15 py-0.5 px-2 font-bold rounded-xs">
                {t('common.sandbox')}
              </span>
            </div>

            <div className="space-y-3.5 max-h-[360px] overflow-y-auto pr-1">
              {liveOrders.map((ord) => (
                <div
                  key={ord.id}
                  onClick={() => { setSelectedOrder(ord); setSearchError(false); }}
                  role="button"
                  tabIndex={0}
                  className={`p-3.5 rounded-sm border transition-all cursor-pointer text-left ${
                    selectedOrder?.id === ord.id
                      ? 'bg-lux-cream/20 dark:bg-stone-900/40 border-lux-gold/60 shadow-xs'
                      : 'bg-stone-50/50 dark:bg-stone-900/20 hover:bg-stone-50 dark:hover:bg-stone-900/65 border-stone-200 dark:border-stone-800'
                  }`}
                >
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="font-mono text-[11px] font-semibold text-stone-900 dark:text-stone-100">{ord.id}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono uppercase font-bold border ${getStatusStyles(ord.status)}`}>
                      {ord.status}
                    </span>
                  </div>
                  <h4 className="font-serif text-sm text-stone-800 dark:text-stone-200 font-medium">{ord.clientName}</h4>
                  <div className="flex justify-between items-center text-[10px] text-stone-500 dark:text-stone-400 mt-1 font-sans font-light">
                    <span>{ord.cakeType} ({ord.tierCount} Tiers)</span>
                    <span className="font-mono">{ord.eventDate}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Selected Order Tracking Detail Stage - right */}
        <div className="lg:col-span-7">
          {selectedOrder ? (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white dark:bg-stone-950 border border-stone-200/70 dark:border-stone-850 shadow-sm rounded-xs overflow-hidden"
            >
              {/* Gold status bar */}
              <div className="h-1 bg-lux-gold w-full" />
              
              <div className="p-6 sm:p-8 space-y-6">
                {/* Header Profile */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 dark:border-stone-800 pb-5">
                  <div className="text-left">
                    <span className="text-[9px] uppercase tracking-widest font-mono text-lux-gold bg-stone-900/90 px-2 py-0.5 rounded-xs font-bold inline-block mb-1">
                      {t('order.orderDetailsLabel')}
                    </span>
                    <h2 className="font-serif text-xl font-medium text-stone-900 dark:text-stone-100">{selectedOrder.clientName}</h2>
                    <p className="text-[10px] text-stone-500 dark:text-stone-400 font-mono mt-1">{selectedOrder.id} • {selectedOrder.email}</p>
                  </div>
                  <div className="sm:text-right text-left">
                    <span className="text-[10px] uppercase tracking-wider text-stone-400 dark:text-stone-500 block font-mono">{t('order.orderProgressTracker')}</span>
                    <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-mono uppercase font-bold border mt-1.5 ${getStatusStyles(selectedOrder.status)}`}>
                      {selectedOrder.status}
                    </span>
                  </div>
                </div>

                {/* Cake Configuration Matrix */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-stone-50 dark:bg-stone-900/40 p-4 border border-stone-200/60 dark:border-stone-850 rounded-sm text-left">
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-stone-400 dark:text-stone-500 font-mono block">{t('order.cakeDesignLabel')}</span>
                    <span className="text-xs text-stone-800 dark:text-stone-200 font-semibold">{selectedOrder.cakeType}</span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-stone-400 dark:text-stone-500 font-mono block">{t('order.cakeSizeLabel')}</span>
                    <span className="text-xs text-stone-800 dark:text-stone-200 font-semibold">{selectedOrder.tierCount} Tiers</span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-stone-400 dark:text-stone-500 font-mono block">{t('order.cakeFlavorLabel')}</span>
                    <span className="text-xs text-stone-800 dark:text-stone-200 font-semibold">{selectedOrder.flavor}</span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-stone-400 dark:text-stone-500 font-mono block">{t('order.ourPriceLabel')}</span>
                    <span className="text-xs text-lux-gold font-semibold font-mono">{selectedOrder.amount}</span>
                  </div>
                </div>

                {/* Design Narrative details */}
                <div className="space-y-1.5 text-left">
                  <span className="text-[9px] uppercase tracking-[0.15em] text-stone-400 dark:text-stone-400 font-mono font-semibold block">{t('order.designDetailsSheet')}</span>
                  <p className="text-xs text-stone-650 dark:text-stone-300 font-light leading-relaxed font-sans">{selectedOrder.details}</p>
                </div>

                {/* Visual Blueprint Steps Map - Accordion timeline */}
                <div className="space-y-4 pt-4 border-t border-stone-100 dark:border-stone-800 text-left">
                  <span className="text-[9px] uppercase tracking-[0.15em] text-stone-400 dark:text-stone-400 font-mono font-semibold block">{t('order.orderMilestones')}</span>
                  
                  <div className="relative pl-6 space-y-6 border-l-2 border-stone-200 dark:border-stone-800">
                    {selectedOrder.timeline.map((step, idx) => {

                      return (
                        <div key={idx} className="relative">
                          {/* Circle indicator node */}
                          <div className={`absolute -left-[31px] top-0 w-4 h-4 rounded-full border-2 bg-white dark:bg-stone-900 flex items-center justify-center transition-all ${
                            step.done 
                              ? 'border-lux-gold text-lux-gold' 
                              : 'border-stone-300 dark:border-stone-700'
                          }`}>
                            {step.done && (
                              <div className="w-1.5 h-1.5 rounded-full bg-lux-gold" />
                            )}
                          </div>

                          <div>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 justify-between">
                              <h4 className={`text-xs font-semibold ${step.done ? 'text-stone-850 dark:text-stone-200' : 'text-stone-400 dark:text-stone-500 font-medium'}`}>
                                {step.title}
                              </h4>
                              <span className={`text-[9px] font-mono ${step.done ? 'text-lux-gold font-bold' : 'text-stone-400 dark:text-stone-500'}`}>
                                {step.date}
                              </span>
                            </div>
                            <p className={`text-[11px] leading-relaxed mt-1 font-sans font-light ${step.done ? 'text-stone-600 dark:text-stone-300' : 'text-stone-400 dark:text-stone-500'}`}>
                              {step.description}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="p-4 bg-stone-100 dark:bg-stone-900/60 border-l-2 border-lux-gold text-stone-800 dark:text-white text-[11px] rounded-xs font-sans leading-relaxed tracking-normal flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-lux-gold shrink-0 mt-0.5" />
                  <p className="font-light text-stone-600 dark:text-stone-300">
                    {t('order.reschedulePolicy')}
                  </p>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="bg-white dark:bg-stone-950 border border-dashed border-stone-200/80 dark:border-stone-800 rounded-xs py-24 text-center font-sans">
              <ShoppingBag className="w-12 h-12 text-stone-300 dark:text-stone-700 mx-auto mb-4" />
              <h3 className="font-serif text-lg text-stone-700 dark:text-stone-300 italic">{t('common.noSelection')}</h3>
              <p className="text-xs text-stone-400 dark:text-stone-500 font-light mt-1 max-w-sm mx-auto">
                {t('order.selectOrderPrompt')}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
