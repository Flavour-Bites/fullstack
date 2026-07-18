import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { User as UserIcon, Search, AlertCircle, ShoppingBag, ShieldCheck, Mail, Calendar, Sparkles, Building, Settings, RefreshCw, Send, Loader2, Clock } from 'lucide-react';
import { User } from '../types';
import { useToast } from './Toast';
import { t } from '../i18n';
import { usePageTitle } from '../hooks/usePageTitle';

// Predefined simulated orders that match sandbox user emails
const SIMULATED_ORDERS = [
  {
    id: 'FB-9812A',
    clientName: 'Saba Tekle',
    email: 'saba.tekle@example.com',
    cakeType: 'Anniversary Custom Cake',
    eventDate: 'August 04, 2026',
    status: 'In Progress',
    stepNum: 4,
    tierCount: 3,
    flavor: 'Madagascar Vanilla Bean',
    amount: '11,500 ETB',
    details: 'Three-tier custom cream cake with fresh golden-trimmed delicate cream roses.',
    timeline: [
      { title: 'Inquiry Received', date: 'June 18, 2026', description: 'Design specs and guest counts submitted to Yodit Ashenafi.', done: true },
      { title: 'Aesthetic Concept Design', date: 'June 19, 2026', description: 'Interactive design sheet sketched by Yodit.', done: true },
      { title: 'Quotation Accepted & Deposit Paid', date: 'June 20, 2026', description: '50% reservation deposit confirmed on Bole Studio accounts.', done: true },
      { title: 'Baking & Handcrafting Artistry', date: 'Active Right Now', description: 'Yodit is currently baking vanilla sponge sponges and sculpting custom roses.', done: true },
      { title: 'Pre-Scheduled Studio Collection', date: 'August 04, 2026', description: 'Pending client collection with custom heavy-duty travel boxes.', done: false }
    ]
  },
  {
    id: 'FB-9231B',
    clientName: 'Kidus Solomon',
    email: 'kidus@example.com',
    cakeType: 'Modern Birthday Landmark',
    eventDate: 'July 02, 2026',
    status: 'In Review',
    stepNum: 2,
    tierCount: 1,
    flavor: 'Rich Chocolate Ganache',
    amount: '2,800 ETB',
    details: 'Clean modern custom iced birthday layout with elegant golden painted margins.',
    timeline: [
      { title: 'Inquiry Received', date: 'June 19, 2026', description: 'Specs for 25 guests birthday cake received.', done: true },
      { title: 'Aesthetic Concept Design', date: 'Active Right Now', description: 'Yodit is selecting fine dark Belgian chocolate pairings and drafting the color schema.', done: true },
      { title: 'Quotation Accepted & Deposit Paid', date: 'Pending Deposit', description: 'Awaiting 50% reservation booking fee to begin custom sponge preparations.', done: false },
      { title: 'Baking & Handcrafting Artistry', date: 'Scheduled', description: 'Preparation of dark ganache sponges in Bole kitchen.', done: false },
      { title: 'Pre-Scheduled Studio Collection', date: 'July 02, 2026', description: 'Secure custom box pickup.', done: false }
    ]
  },
  {
    id: 'FB-8831C',
    clientName: 'Almaz Belay',
    email: 'almaz.belay@example.com',
    cakeType: 'Traditional Custom Wedding',
    eventDate: 'August 19, 2026',
    status: 'Confirmed',
    stepNum: 3,
    tierCount: 4,
    flavor: 'Red Velvet with Cream Cheese',
    amount: '18,500 ETB',
    details: 'Four-tier traditional wedding design with hand-painted gold detailing & organic sugar jasmine blossoms.',
    timeline: [
      { title: 'Inquiry Received', date: 'June 20, 2026', description: 'Wedding reservation proposal submitted.', done: true },
      { title: 'Aesthetic Concept Design', date: 'June 21, 2026', description: 'Gold detailing and jasmine layout approved.', done: true },
      { title: 'Quotation Accepted & Deposit Paid', date: 'June 21, 2026', description: '50% wedding booking deposit ledger verified.', done: true },
      { title: 'Baking & Handcrafting Artistry', date: 'Late July', description: 'Assembly of red velvet foundations and sugar jasmine petals.', done: false },
      { title: 'Refrigerated Venue Delivery', date: 'August 19, 2026', description: 'Zone 2 express delivery to Bole wedding salon venue.', done: false }
    ]
  }
];

interface ProfileViewProps {
  currentUser: User | null;
  onLogout: () => void;
  onNavigate: (page: string) => void;
}

export default function ProfileView({ currentUser, onLogout, onNavigate }: ProfileViewProps) {
  usePageTitle("Profile");
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [liveOrders, setLiveOrders] = useState<any[]>([]);
  const [searchError, setSearchError] = useState(false);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  // Recovery request state
  const [showRecoveryForm, setShowRecoveryForm] = useState(false);
  const [newTelegramId, setNewTelegramId] = useState('');
  const [recoverySubmitting, setRecoverySubmitting] = useState(false);

  const handleRecoverySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTelegramId.trim()) return;
    setRecoverySubmitting(true);
    try {
      const res = await fetch('/api/recovery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oldTelegramId: currentUser?.telegramId, newTelegramId: newTelegramId.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        if (data.alreadyExists) {
          showToast('Request Already Exists', 'A pending recovery request for these IDs already exists.', 'info');
        } else {
          showToast('Recovery Request Submitted', 'An admin will review your request shortly.', 'success');
          setShowRecoveryForm(false);
          setNewTelegramId('');
        }
      } else {
        throw new Error(data.error || 'Failed to submit request');
      }
    } catch (err: any) {
      showToast('Submission Failed', err.message, 'error');
    } finally {
      setRecoverySubmitting(false);
    }
  };

  useEffect(() => {
    async function loadOrders() {
      if (!currentUser) return;
      setLoading(true);
      try {
        const res = await fetch('/api/requests');
        const dbData = await res.json();
        let dbRequests: any[] = [];
        if (dbData.success && Array.isArray(dbData.requests)) {
          dbRequests = dbData.requests;
        }

        const mappedDbOrders = dbRequests.map((item: any) => {
          const numTiers = Number(item.tierCount) || 1;
          const price = item.finalPrice ?? item.quotedPrice;
          const amountEtb = price ? `${price.toLocaleString()} ETB` : 'Pending Price';

          let stepNumber = 1;
          if (item.status === 'Quoted') stepNumber = 2;
          if (item.status === 'Confirmed') stepNumber = 3;
          if (item.status === 'Designing' || item.status === 'In Progress') stepNumber = 4;
          if (item.status === 'Ready' || item.status === 'Completed') stepNumber = 5;

          return {
            id: item.id || `FB-${Math.floor(1000 + Math.random() * 9000)}Y`,
            clientName: item.contactName || 'Valued Client',
            cakeType: `${item.eventType || 'Bespoke Celebration'} Cake`,
            eventDate: item.deliveryDate || 'TBD',
            status: item.status || 'Pending',
            stepNum: stepNumber,
            tierCount: numTiers,
            flavor: item.flavor || 'Bespoke Assortment',
            amount: amountEtb,
            details: item.specialInstructions || item.designStyle || 'Custom cake studio creation requested.',
            timeline: [
              { title: 'Inquiry Received', date: item.requestDate || 'Just Now', description: 'Your request has been filed in Yodit\'s review queue!', done: true },
              { title: 'Aesthetic Concept Design', date: 'Studio Stage', description: 'Yodit reviews your specs to draft a visual layout.', done: stepNumber >= 2 },
              { title: 'Quotation Accepted & Deposit Paid', date: 'Booking Confirmed', description: 'After price discussion, a 50% reservation fee secures your slot.', done: stepNumber >= 3 },
              { title: 'Baking & Handcrafting Artistry', date: 'Active Phase', description: 'Oven baking and intricate hand-sculpted marzipan artwork.', done: stepNumber >= 4 },
              { title: 'Secure Event Pickup', date: item.deliveryDate || 'TBD', description: 'Safe hand-off at Bole studio coordinates.', done: stepNumber >= 5 }
            ]
          };
        });

        // Use all DB orders (server-side filtered by userId for customers)
        // plus SIMULATED_ORDERS as fallback if there are none
        if (mappedDbOrders.length > 0) {
          setLiveOrders(mappedDbOrders);
        } else {
          setLiveOrders(SIMULATED_ORDERS);
        }
      } catch (err) {
        console.warn('Error loading orders in profile view:', err);
        setLiveOrders(SIMULATED_ORDERS);
      } finally {
        setLoading(false);
      }
    }
    loadOrders();
  }, [currentUser]);

  // Pre-select first order if available to give high density instantly
  useEffect(() => {
    if (liveOrders.length > 0 && !selectedOrder) {
      setSelectedOrder(liveOrders[0]);
    }
  }, [liveOrders]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchError(false);
    
    if (!searchQuery.trim()) {
      return;
    }

    const trimmed = searchQuery.trim().toLowerCase();
    const found = liveOrders.find(
      (ord) =>
        ord.id.toLowerCase().includes(trimmed) ||
        ord.clientName.toLowerCase().includes(trimmed) ||
        ord.email.toLowerCase().includes(trimmed) ||
        ord.cakeType.toLowerCase().includes(trimmed)
    );

    if (found) {
      setSelectedOrder(found);
    } else {
      setSearchError(true);
    }
  };

  const getStatusBadgeStyles = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'bg-amber-50 border-amber-200 text-amber-700';
      case 'In Review':
        return 'bg-blue-50 border-blue-200 text-blue-700';
      case 'Confirmed':
        return 'bg-emerald-50 border-emerald-200 text-emerald-700';
      case 'In Progress':
        return 'bg-purple-50 border-purple-200 text-purple-700';
      case 'Ready':
        return 'bg-teal-50 border-teal-200 text-teal-700';
      case 'Completed':
        return 'bg-stone-50 border-stone-200 text-stone-700';
      default:
        return 'bg-stone-50 border-stone-200 text-stone-700';
    }
  };

  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto py-24 px-4 text-center">
        <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-6 text-stone-400">
          <UserIcon className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-serif text-stone-900 mb-2">{t('profile.accessAccount')}</h2>
        <p className="text-sm text-stone-500 font-light mb-6">{t('profile.accessDescription')}</p>
        <button
          onClick={() => onNavigate('auth')}
          className="px-6 py-2.5 bg-stone-900 hover:bg-lux-gold text-white hover:text-stone-950 font-mono text-xs uppercase font-bold tracking-wider rounded-sm transition-all"
        >
          {t('profile.signInNow')}
        </button>
      </div>
    );
  }

  // Count metrics to display
  const pendingCount = liveOrders.filter(o => o.status === 'Pending' || o.status === 'In Review').length;
  const progressCount = liveOrders.filter(o => o.status === 'Confirmed' || o.status === 'In Progress').length;
  const readyCount = liveOrders.filter(o => o.status === 'Ready').length;

  return (
    <div className="bg-[#faf7f2]/10 dark:bg-[#111111]/90 min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Editorial Subheader */}
        <div className="text-center md:text-left border-b border-stone-200/50 dark:border-stone-800/80 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-lux-gold/20 bg-lux-gold/5 mb-2 font-sans">
              <Sparkles className="w-3 h-3 text-lux-gold" />
              <span className="text-[9px] uppercase tracking-[0.2em] text-lux-gold font-bold">{t('profile.customerDashboard')}</span>
            </div>
            <h1 className="text-3xl font-serif text-warm-950 dark:text-stone-100">{t('profile.accountDashboard')}</h1>
            <p className="text-xs text-stone-500 dark:text-stone-400 font-light mt-1">
              {t('profile.dashboardDescription')}
            </p>
          </div>
          
          <div className="flex gap-2 justify-center">
            {currentUser.role === 'admin' && (
              <button
                onClick={() => onNavigate('admin')}
                className="px-4 py-2 border border-lux-gold text-lux-gold hover:bg-lux-gold hover:text-stone-950 dark:border-lux-gold dark:text-lux-gold dark:hover:bg-lux-gold dark:hover:text-[#111111] text-[10px] uppercase tracking-wider font-bold transition-all rounded-sm flex items-center gap-1.5"
              >
                <Settings className="w-3.5 h-3.5" />
                {t('profile.staffAdmin')}
              </button>
            )}
            <button
              onClick={onLogout}
              className="px-4 py-2 border border-stone-200 dark:border-stone-850 text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-50 dark:hover:bg-stone-900 text-[10px] uppercase tracking-wider font-bold transition-all rounded-sm flex items-center gap-1.5"
            >
              {t('nav.signOut')}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Premium User Details Slate */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-[#faf7f2] dark:bg-[#111111] border border-stone-200/50 dark:border-stone-800/80 rounded-sm shadow-xs p-6 relative overflow-hidden">
              {/* Subtle visual accent */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-lux-gold/10 via-transparent to-transparent pointer-events-none" />
              
              <div className="flex items-center gap-4 text-left">
                <div className="w-14 h-14 rounded-full bg-stone-900 text-lux-gold font-serif flex items-center justify-center text-xl font-medium border border-lux-gold/40 relative">
                  {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'C'}
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-lux-gold text-stone-950 rounded-full border border-white flex items-center justify-center">
                    <Sparkles className="w-3 h-3" />
                  </div>
                </div>
                <div>
                  <h3 className="font-serif text-lg text-stone-900 dark:text-stone-100 font-semibold">{currentUser.name}</h3>
                  <span className="text-[10px] uppercase font-mono bg-stone-100 dark:bg-stone-800/80 text-stone-600 dark:text-stone-300 px-2.5 py-0.5 rounded-full font-bold">
                    {currentUser.role === 'admin' ? t('profile.role.admin') : t('profile.signatureClient')}
                  </span>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-stone-100 dark:border-stone-800/60 space-y-4 text-left text-xs font-sans">
                <div className="flex items-center justify-between">
                  <span className="text-stone-500 dark:text-stone-400 font-light flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-stone-300 dark:text-stone-500" /> {t('profile.telegram')}</span>
                  <span className="font-mono text-stone-800 dark:text-stone-200 leading-none truncate max-w-[150px]">@{currentUser.telegramUsername || currentUser.telegramId || 'Connected'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-stone-500 dark:text-stone-400 font-light flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-stone-300 dark:text-stone-500" /> {t('profile.joined')}</span>
                  <span className="font-mono text-stone-800 dark:text-stone-200 leading-none">June 2026</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-stone-500 dark:text-stone-400 font-light flex items-center gap-1.5"><Building className="w-3.5 h-3.5 text-stone-300 dark:text-stone-500" /> {t('profile.location')}</span>
                  <span className="text-stone-800 dark:text-stone-200 leading-none">Addis Ababa, ET</span>
                </div>
              </div>
            </div>

            {/* Custom Metric Overview Grid */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-[#faf7f2] dark:bg-[#111111] border border-stone-200/50 dark:border-stone-800/80 p-4 rounded-sm text-center shadow-xs">
                <span className="text-xl font-serif text-amber-700 dark:text-amber-400 font-bold block">{pendingCount}</span>
                <span className="text-[9px] uppercase tracking-wider text-stone-400 dark:text-stone-500 block font-light mt-0.5">{t('profile.inReview')}</span>
              </div>
              <div className="bg-[#faf7f2] dark:bg-[#111111] border border-stone-200/50 dark:border-stone-800/80 p-4 rounded-sm text-center shadow-xs">
                <span className="text-xl font-serif text-purple-700 dark:text-purple-400 font-bold block">{progressCount}</span>
                <span className="text-[9px] uppercase tracking-wider text-stone-400 dark:text-stone-500 block font-light mt-0.5">{t('profile.bakingSlot')}</span>
              </div>
              <div className="bg-[#faf7f2] dark:bg-[#111111] border border-stone-200/50 dark:border-stone-800/80 p-4 rounded-sm text-center shadow-xs">
                <span className="text-xl font-serif text-teal-700 dark:text-teal-400 font-bold block">{readyCount}</span>
                <span className="text-[9px] uppercase tracking-wider text-stone-400 dark:text-stone-500 block font-light mt-0.5">{t('profile.ready')}</span>
              </div>
            </div>

            {/* Direct commission prompt card */}
            <div className="bg-stone-900 text-white p-6 rounded-sm border border-stone-800 shadow-md text-left relative overflow-hidden">
              <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-lux-gold/10 rounded-full blur-xl" />
              <h4 className="font-serif text-base text-white mb-2">{t('profile.needMasterpiece')}</h4>
              <p className="text-xs text-stone-300 font-light leading-relaxed mb-4">
                {t('profile.needMasterpieceDesc')}
              </p>
              <button
                onClick={() => onNavigate('request')}
                className="w-full py-2 bg-lux-gold hover:bg-white text-stone-950 font-bold text-[10px] uppercase tracking-wider rounded-xs transition-colors"
              >
                {t('profile.orderCustomCake')}
              </button>
            </div>

            {/* Account Recovery Card - visible when user has a Telegram ID */}
            {currentUser.telegramId && (
              <div className="bg-[#faf7f2] dark:bg-[#111111] border border-stone-200/50 dark:border-stone-800/80 rounded-sm shadow-xs p-6 text-left relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent pointer-events-none" />
                <h4 className="font-serif text-base text-stone-900 dark:text-white mb-1 flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 text-lux-gold" /> {t('admin.recoverAccount')}
                </h4>
                <p className="text-[10px] text-stone-500 dark:text-stone-400 font-light leading-relaxed mb-3">
                  Migrate your account to a new Telegram ID if you've changed accounts.
                </p>

                <div className="text-xs text-stone-500 dark:text-stone-400 font-mono mb-3">
                  <span className="text-stone-400">Current Telegram ID: </span>
                  <span className="text-stone-800 dark:text-stone-200 font-semibold">{currentUser.telegramId}</span>
                </div>

                {showRecoveryForm ? (
                  <form onSubmit={handleRecoverySubmit} className="space-y-3">
                    <div>
                      <label className="text-[9px] uppercase tracking-wider font-mono text-stone-400 block mb-1">New Telegram ID</label>
                      <input
                        type="text"
                        value={newTelegramId}
                        onChange={e => setNewTelegramId(e.target.value)}
                        placeholder="Enter your new Telegram user ID"
                        className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-2 text-xs text-stone-700 dark:text-stone-200 focus:outline-none focus:ring-1 focus:ring-lux-gold rounded-xs font-mono"
                        required
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        disabled={recoverySubmitting || !newTelegramId.trim()}
                        className="flex-1 py-2 bg-lux-gold text-stone-950 font-bold text-[10px] uppercase tracking-wider rounded-xs transition-colors hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1"
                      >
                        {recoverySubmitting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                        Submit Request
                      </button>
                      <button
                        type="button"
                        onClick={() => { setShowRecoveryForm(false); setNewTelegramId(''); }}
                        className="px-3 py-2 border border-stone-200 dark:border-stone-800 text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 text-[10px] uppercase font-mono rounded-xs cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <button
                    onClick={() => setShowRecoveryForm(true)}
                    className="w-full py-2 border border-lux-gold text-lux-gold hover:bg-lux-gold hover:text-stone-950 font-bold text-[10px] uppercase tracking-wider rounded-xs transition-colors cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3 inline mr-1" /> Recover Account
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Right Column: Dynamic Live Tracking Block */}
          <div className="lg:col-span-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
              
              {/* Order Selection Sidebar (Left inside the right block) */}
              <div className="md:col-span-12 space-y-4">
                
                {/* Search query block */}
                <div className="bg-[#faf7f2] dark:bg-[#111111] border border-stone-200/50 dark:border-stone-800/80 p-5 rounded-sm shadow-xs space-y-3.5">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                    <h3 className="font-serif text-sm font-semibold text-stone-900 dark:text-stone-100 text-left">{t('profile.activeOrders')}</h3>
                    
                    {/* Custom search bar */}
                    <form onSubmit={handleSearch} className="flex gap-1.5 shrink-0">
                      <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400" />
                        <input
                          type="text"
                          placeholder={t('profile.searchItems')}
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="bg-stone-100/50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 focus:outline-none focus:ring-1 focus:ring-lux-gold focus:border-lux-gold pl-7 pr-2 py-1.5 text-[11px] text-stone-800 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 rounded-sm w-[160px] sm:w-[190px]"
                        />
                      </div>
                      <button
                        type="submit"
                        className="px-3 bg-stone-900 dark:bg-stone-800 border border-stone-900 dark:border-stone-800 hover:bg-lux-gold text-white hover:text-stone-950 text-[10px] font-bold uppercase transition-colors rounded-sm cursor-pointer"
                      >
                        {t('common.find')}
                      </button>
                    </form>
                  </div>

                  {searchError && (
                    <div className="p-2.5 bg-red-50 dark:bg-red-950/20 border border-red-150 dark:border-red-900/50 text-red-700 dark:text-red-400 text-[10px] rounded-xs font-sans flex items-center gap-1.5 text-left">
                      <AlertCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />
                      <span>{t('profile.noMatch')}</span>
                      <button onClick={() => setSearchError(false)} className="ml-auto font-bold text-stone-600 dark:text-stone-400 underline">{t('common.reset')}</button>
                    </div>
                  )}

                  {/* List of active queue items - horizontally scrollable or responsive stacked list for ultra-quick selection */}
                  {loading ? (
                    <div className="py-8 text-center text-xs text-stone-400 dark:text-stone-500 font-mono flex items-center justify-center gap-1.5">
                      <Clock className="w-4 h-4 animate-spin text-lux-gold" /> Loading your orders...
                    </div>
                  ) : liveOrders.length === 0 ? (
                    <div className="py-10 text-center font-sans border border-dashed border-stone-200 dark:border-stone-800">
                      <ShoppingBag className="w-8 h-8 text-stone-300 dark:text-stone-700 mx-auto mb-2" />
                      <h4 className="text-xs text-stone-700 dark:text-stone-400">{t('profile.noActiveOrders')}</h4>
                      <p className="text-[10px] text-stone-400 dark:text-stone-500 font-light mt-0.5">{t('profile.ordersWillList')}</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      {liveOrders.map((ord) => {
                        const isSelected = selectedOrder?.id === ord.id;
                        return (
                          <div
                            key={ord.id}
                            onClick={() => { setSelectedOrder(ord); setSearchError(false); }}
                            className={`p-4 rounded-sm border transition-all duration-300 cursor-pointer text-left relative ${
                              isSelected
                                ? 'bg-[#faf7f2]/50 dark:bg-stone-900/40 border-lux-gold/80 shadow-xs'
                                : 'bg-stone-50/50 dark:bg-stone-900/10 hover:bg-stone-50 dark:hover:bg-stone-900/20 border-stone-200/70 dark:border-stone-800/80'
                            }`}
                          >
                            {isSelected && (
                              <div className="absolute top-0 left-0 bottom-0 w-[3px] bg-lux-gold rounded-l-xs" />
                            )}
                            <div className="flex justify-between items-start mb-1.5">
                              <span className="font-mono text-[10px] font-bold text-stone-800 dark:text-stone-200">{ord.id}</span>
                              <span className={`px-2 py-0.5 rounded-full text-[8px] font-mono uppercase font-bold border ${getStatusBadgeStyles(ord.status)}`}>
                                {ord.status}
                              </span>
                            </div>
                            <h4 className="font-serif text-sm text-stone-900 dark:text-stone-100 font-medium tracking-wide truncate">{ord.cakeType}</h4>
                            <div className="flex justify-between items-center text-[10px] text-stone-500 dark:text-stone-400 mt-2 font-sans font-light">
                              <span>{ord.tierCount} Tier • {ord.flavor.split(' ')[0]}</span>
                              <span className="font-mono text-lux-gold">{ord.amount}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                </div>

              </div>

              {/* Order Progress Details Matrix (Shows timeline step results instantly with zero clicks!) */}
              <div className="md:col-span-12">
                {selectedOrder ? (
                  <motion.div
                    key={selectedOrder.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[#faf7f2] dark:bg-[#111111] border border-stone-200/60 dark:border-stone-800/80 rounded-sm shadow-xs overflow-hidden text-left"
                  >
                    <div className="h-1 bg-lux-gold w-full" />
                    
                    <div className="p-6 sm:p-8 space-y-6">
                      
                      {/* Sub-header inside detail block */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 dark:border-stone-800 pb-5">
                        <div>
                          <span className="text-[8px] uppercase tracking-widest font-mono text-white bg-stone-900/90 dark:bg-stone-800 px-2 py-0.5 rounded-xs font-bold inline-block mb-1">
                            {t('profile.cakeTracker')}
                          </span>
                          <h2 className="font-serif text-lg font-semibold text-stone-900 dark:text-stone-100">{selectedOrder.cakeType} Blueprint</h2>
                          <p className="text-[10px] text-stone-500 dark:text-stone-400 font-mono mt-0.5">Order Number: {selectedOrder.id} • Customer: {selectedOrder.clientName}</p>
                        </div>
                        <div className="sm:text-right">
                          <span className="text-[9px] uppercase tracking-wider text-stone-400 dark:text-stone-500 block font-mono">{t('profile.orderProgress')}</span>
                          <span className={`inline-block px-3 py-1 rounded-full text-[9px] font-mono uppercase font-bold border mt-1.5 ${getStatusBadgeStyles(selectedOrder.status)}`}>
                            {selectedOrder.status}
                          </span>
                        </div>
                      </div>

                      {/* Design specs grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-[#faf7f2]/50 dark:bg-stone-900/35 p-4 border border-stone-200/50 dark:border-stone-800/80 rounded-sm">
                        <div>
                          <span className="text-[8px] uppercase tracking-wider text-stone-400 dark:text-stone-500 font-mono block">{t('profile.cakeSize')}</span>
                          <span className="text-xs text-stone-800 dark:text-stone-200 font-semibold">{selectedOrder.tierCount} Tier Cake</span>
                        </div>
                        <div>
                          <span className="text-[8px] uppercase tracking-wider text-stone-400 dark:text-stone-500 font-mono block">{t('profile.flavorChoice')}</span>
                          <span className="text-xs text-stone-800 dark:text-stone-200 font-semibold truncate block dark:text-stone-200">{selectedOrder.flavor}</span>
                        </div>
                        <div>
                          <span className="text-[8px] uppercase tracking-wider text-stone-400 dark:text-stone-500 font-mono block">{t('profile.pickupDate')}</span>
                          <span className="text-xs text-stone-800 dark:text-stone-200 font-semibold font-mono">{selectedOrder.eventDate}</span>
                        </div>
                        <div>
                          <span className="text-[8px] uppercase tracking-wider text-stone-400 dark:text-stone-500 font-mono block">{t('profile.priceCost')}</span>
                          <span className="text-xs text-lux-gold font-semibold font-mono block">{selectedOrder.amount}</span>
                        </div>
                      </div>

                      {/* Design parameters */}
                      <div className="space-y-1.5">
                        <span className="text-[9px] uppercase tracking-[0.15em] text-stone-400 dark:text-stone-500 font-mono font-semibold block">{t('profile.designNotes')}</span>
                        <p className="text-xs text-stone-750 dark:text-stone-300 font-light leading-relaxed font-sans">{selectedOrder.details}</p>
                      </div>

                      {/* Live milestone list */}
                      <div className="space-y-4 pt-4 border-t border-stone-100 dark:border-stone-800">
                        <span className="text-[9px] uppercase tracking-[0.15em] text-stone-400 dark:text-stone-500 font-mono font-bold block">{t('profile.bakingSteps')}</span>
                        
                        <div className="relative pl-6 space-y-6 border-l-2 border-stone-200 dark:border-stone-800">
                          {selectedOrder.timeline.map((step: any, idx: number) => (
                            <div key={idx} className="relative">
                              <div className={`absolute -left-[31px] top-0 w-4 h-4 rounded-full border-2 bg-[#faf7f2] dark:bg-[#111111] flex items-center justify-center transition-all ${
                                step.done 
                                  ? 'border-lux-gold text-lux-gold' 
                                  : 'border-stone-200 dark:border-stone-800'
                              }`}>
                                {step.done && (
                                  <div className="w-1.5 h-1.5 rounded-full bg-lux-gold" />
                                )}
                              </div>

                              <div>
                                <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 justify-between">
                                  <h4 className={`text-xs font-semibold ${step.done ? 'text-stone-800 dark:text-stone-200' : 'text-stone-400 dark:text-stone-500 font-medium'}`}>
                                    {step.title}
                                  </h4>
                                  <span className={`text-[9px] font-mono ${step.done ? 'text-lux-gold font-bold' : 'text-stone-400 dark:text-stone-500'}`}>
                                    {step.date}
                                  </span>
                                </div>
                                <p className={`text-[10px] leading-relaxed mt-1 font-sans font-light ${step.done ? 'text-stone-550 dark:text-stone-400' : 'text-stone-400 dark:text-stone-500'}`}>
                                  {step.description}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Studio policy */}
                      <div className="p-3.5 bg-stone-50/50 dark:bg-stone-900/20 border-l-2 border-lux-gold text-stone-600 dark:text-stone-400 text-[10px] font-sans leading-relaxed flex items-start gap-2 max-w-full">
                        <ShieldCheck className="w-4 h-4 text-lux-gold shrink-0 mt-0.5" />
                        <p className="font-light">
                          Our bookings depend on how many cake slots we have. If you need to make changes, please call or email our studio.
                        </p>
                      </div>

                    </div>
                  </motion.div>
                ) : (
                  <div className="bg-[#faf7f2] dark:bg-[#111111] border border-dashed border-stone-200 dark:border-stone-800 rounded-sm py-20 text-center font-sans">
                    <ShoppingBag className="w-10 h-10 text-stone-300 dark:text-stone-700 mx-auto mb-3" />
                    <h3 className="font-serif text-sm text-stone-700 dark:text-stone-400 italic">{t('common.noSelection')}</h3>
                    <p className="text-[11px] text-stone-400 dark:text-stone-500 font-light mt-1 max-w-xs mx-auto">
                      Select an active order card from the list above to track your cake progress in real-time.
                    </p>
                  </div>
                )}
              </div>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
