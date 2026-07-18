import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Search, CheckCircle2, Clock, Eye, AlertCircle, RefreshCw, ShoppingBag, ShieldCheck } from 'lucide-react';
import { t } from '../i18n';
import { usePageTitle } from '../hooks/usePageTitle';

interface SimulatedOrder {
  id: string;
  clientName: string;
  email: string;
  cakeType: string;
  eventDate: string;
  status: 'Pending' | 'In Review' | 'Confirmed' | 'Designing' | 'Quoted' | 'In Progress' | 'Ready' | 'Completed';
  stepNum: number; // 1 to 5 steps
  tierCount: number;
  flavor: string;
  amount: string;
  details: string;
  timeline: { title: string; date: string; description: string; done: boolean }[];
}

const SIMULATED_ORDERS: SimulatedOrder[] = [
  {
    id: 'FB-9812A',
    clientName: 'Saba Tekle',
    email: 'saba.tekle@example.com',
    cakeType: 'Anniversary Couture',
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
    cakeType: 'Traditional Couture Wedding',
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
  },
  {
    id: 'FB-5100E',
    clientName: 'Helena Tekalign',
    email: 'helena.t@example.com',
    cakeType: 'Milestone Jubilee Cake',
    eventDate: 'June 24, 2026',
    status: 'Pending',
    stepNum: 1,
    tierCount: 2,
    flavor: 'Salted Caramel Pecan',
    amount: '6,200 ETB',
    details: 'Two-tier textured milestone cake dusted with 23K edible gold layers.',
    timeline: [
      { title: 'Inquiry Received', date: 'June 20, 2026', description: 'Initial order request registered in local sandbox logs.', done: true },
      { title: 'Aesthetic Concept Design', date: 'Awaiting Feedback', description: 'Waiting for Yodit to review current schedule availability.', done: false },
      { title: 'Quotation Accepted & Deposit Paid', date: 'Pending Quotation', description: 'Booking slot locked once terms have been finalized.', done: false },
      { title: 'Baking & Handcrafting Artistry', date: 'Scheduled', description: 'Oven timelines assigned and ingredients sourced.', done: false },
      { title: 'Pre-Scheduled Studio Collection', date: 'June 24, 2026', description: 'Scheduled collection.', done: false }
    ]
  }
];

interface MyOrdersViewProps {
  currentUser: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}

export default function MyOrdersView({ currentUser }: MyOrdersViewProps) {
  usePageTitle("My Orders");
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<SimulatedOrder | null>(null);
  const [liveOrders, setLiveOrders] = useState<SimulatedOrder[]>([]);
  const [searchError, setSearchError] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load user submitted requests from the Postgres DB and merge with SIMULATED records
  useEffect(() => {
    async function loadOrders() {
      setLoading(true);
      try {
        // Fetch real requests from Neon Postgres
        const res = await fetch('/api/requests');
        const dbData = await res.json();
        let dbRequests: any[] = [];
        if (dbData.success && Array.isArray(dbData.requests)) {
          dbRequests = dbData.requests;
        }

        // Map database requests into simulated trackers
        const mappedDbOrders: SimulatedOrder[] = dbRequests.map((item: any) => {
          const numTiers = Number(item.tierCount) || 1;
          const price = item.finalPrice ?? item.quotedPrice ?? 0;
          const amountEtb = price ? `${price.toLocaleString()} ETB` : 'Pending Price';
          
          let stepNumber = 1;
          if (item.status === 'Quoted') stepNumber = 2;
          if (item.status === 'Confirmed') stepNumber = 3;
          if (item.status === 'Designing' || item.status === 'InProgress') stepNumber = 4;
          if (item.status === 'Ready' || item.status === 'Completed') stepNumber = 5;

          return {
            id: item.id || `FB-${Math.floor(1000 + Math.random() * 9000)}Y`,
            clientName: item.contactName || 'Valued Client',
            email: item.contactEmail || '',
            cakeType: `${item.eventType || 'Bespoke Celebration'} Cake`,
            eventDate: item.deliveryDate || 'TBD',
            status: item.status || 'Pending',
            stepNum: stepNumber,
            tierCount: numTiers,
            flavor: item.flavor || 'Bespoke Assortment',
            amount: amountEtb,
            details: item.designStyle || 'Custom cake studio creation requested.',
            timeline: [
              { title: 'Inquiry Received', date: item.requestDate || 'Just Now', description: 'Your request has been filed in Yodit\'s review queue!', done: true },
              { title: 'Aesthetic Concept Design', date: 'Studio Stage', description: 'Yodit reviews your specs to draft a visual layout.', done: stepNumber >= 2 },
              { title: 'Quotation Accepted & Deposit Paid', date: 'Booking Confirmed', description: 'After quote discussion, a 50% reservation fee secures your slot.', done: stepNumber >= 3 },
              { title: 'Baking & Handcrafting Artistry', date: 'Active Phase', description: 'Oven baking and intricate hand-sculpted marzipan artwork.', done: stepNumber >= 4 },
              { title: 'Secure Event Pickup', date: item.deliveryDate || 'TBD', description: 'Safe hand-off at Bole studio coordinates.', done: stepNumber >= 5 }
            ]
          };
        });

        // 1. Filter database requests by logged-in user's email
        const userDbOrders = mappedDbOrders.filter(
          (ord) => ord.email.toLowerCase() === (currentUser.email || '').toLowerCase()
        );

        // 2. Identify any relevant predefined simulated orders matching current email
        const matchingSimulated = SIMULATED_ORDERS.filter(
          (ord) => ord.email.toLowerCase() === (currentUser.email || '').toLowerCase()
        );

        // Determine final lists: we show users their specific orders.
        // If there are none yet, we can also display a couple of curated samples so the UI isn't completely empty and cold, but marked as baseline samples!
        const finalOrders = [...userDbOrders, ...matchingSimulated];
        
        if (finalOrders.length === 0) {
          // If no custom order exists, present the simulated list as viewable reference models
          setLiveOrders(SIMULATED_ORDERS);
        } else {
          setLiveOrders(finalOrders);
        }
      } catch (err) {
        console.warn('Error syncing db requests inside orders view:', err);
        setLiveOrders(SIMULATED_ORDERS);
      } finally {
        setLoading(false);
      }
    }
    
    if (currentUser) {
      loadOrders();
    }
  }, [currentUser]);

  const handleSearch = (e: React.FormEvent) => {
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

  const getStatusBadgeStyles = (status: string) => {
    switch (status) {
      case 'Received':
      case 'Pending':
        return 'bg-amber-100 border-amber-300 text-amber-800';
      case 'Designing':
        return 'bg-blue-100 border-blue-300 text-blue-800';
      case 'Quoted':
        return 'bg-indigo-100 border-indigo-300 text-indigo-800';
      case 'Confirmed':
        return 'bg-emerald-100 border-emerald-300 text-emerald-800';
      case 'InProgress':
        return 'bg-purple-100 border-purple-300 text-purple-800';
      case 'Ready':
        return 'bg-teal-100 border-teal-300 text-teal-800';
      case 'Completed':
        return 'bg-green-100 border-green-300 text-green-800';
      case 'Cancelled':
        return 'bg-red-100 border-red-300 text-red-800';
      default:
        return 'bg-stone-100 border-stone-300 text-stone-800';
    }
  };

  return (
    <div className="bg-lux-cream/30 dark:bg-stone-900/10 min-h-screen py-16 px-4 sm:px-6">
      {/* Visual Title Header */}
      <div className="max-w-6xl mx-auto mb-16 text-center">
        <span className="text-[10px] uppercase tracking-[0.3em] text-lux-gold font-mono block mb-2 font-bold">COMMISSION MONITOR</span>
        <h1 className="text-4xl font-serif text-warm-950 dark:text-stone-100 font-medium italic">{t('order.orderUpdates')}</h1>
        <p className="text-xs text-stone-500 dark:text-stone-400 font-light mt-2 max-w-lg mx-auto font-sans">
          Review your order steps, verified payments, and your current cake design milestones.
        </p>
        <div className="h-[2px] w-12 bg-lux-gold mx-auto mt-4" />
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Search & Overview List - left */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white dark:bg-[#111111] p-6 border border-stone-200/60 dark:border-stone-850 rounded-xs shadow-xs space-y-4 text-left">
            <h3 className="font-serif text-base text-stone-900 dark:text-stone-100 font-medium">{t('order.orderId')}</h3>
            <p className="text-[11px] text-stone-500 dark:text-stone-400 font-light font-sans">
              Enter your unique Order ID (like <code className="bg-stone-100 dark:bg-stone-800 px-1 rounded text-stone-600 dark:text-stone-300 font-bold">FB-9812A</code>) or the Name used to place the order.
            </p>

            <form onSubmit={handleSearch} className="flex gap-2 font-sans" id="order-search-form">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input
                  type="text"
                  placeholder="Order ID or Client Name..."
                  aria-label="Order ID or Client Name"
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
                <span>No order matches. Try searching "Saba", "Kidus" or verify your ID.</span>
              </div>
            )}
          </div>

          <div className="bg-white dark:bg-[#111111] p-6 border border-stone-200/60 dark:border-stone-850 rounded-xs shadow-xs space-y-4 text-left">
            <div className="flex justify-between items-center pb-2 border-b border-stone-100 dark:border-stone-850">
              <h3 className="font-serif text-sm text-stone-900 dark:text-stone-100 font-medium">Sample Orders List</h3>
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
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono uppercase font-bold border ${getStatusBadgeStyles(ord.status)}`}>
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
              className="bg-white dark:bg-[#111111] border border-stone-200/70 dark:border-stone-850 shadow-sm rounded-xs overflow-hidden"
            >
              {/* Gold status bar */}
              <div className="h-1 bg-lux-gold w-full" />
              
              <div className="p-6 sm:p-8 space-y-6">
                {/* Header Profile */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 dark:border-stone-800 pb-5">
                  <div className="text-left">
                    <span className="text-[9px] uppercase tracking-widest font-mono text-lux-gold bg-stone-900/90 px-2 py-0.5 rounded-xs font-bold inline-block mb-1">
                      ORDER DETAILS
                    </span>
                    <h2 className="font-serif text-xl font-medium text-stone-900 dark:text-stone-100">{selectedOrder.clientName}</h2>
                    <p className="text-[10px] text-stone-500 dark:text-stone-400 font-mono mt-1">{selectedOrder.id} • {selectedOrder.email}</p>
                  </div>
                  <div className="sm:text-right text-left">
                    <span className="text-[10px] uppercase tracking-wider text-stone-400 dark:text-stone-500 block font-mono">Order Progress</span>
                    <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-mono uppercase font-bold border mt-1.5 ${getStatusBadgeStyles(selectedOrder.status)}`}>
                      {selectedOrder.status}
                    </span>
                  </div>
                </div>

                {/* Cake Configuration Matrix */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-stone-50 dark:bg-stone-900/40 p-4 border border-stone-200/60 dark:border-stone-850 rounded-sm text-left">
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-stone-400 dark:text-stone-500 font-mono block">Cake Design</span>
                    <span className="text-xs text-stone-800 dark:text-stone-200 font-semibold">{selectedOrder.cakeType}</span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-stone-400 dark:text-stone-500 font-mono block">Cake Size</span>
                    <span className="text-xs text-stone-800 dark:text-stone-200 font-semibold">{selectedOrder.tierCount} Tiers</span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-stone-400 dark:text-stone-500 font-mono block">Cake Flavor</span>
                    <span className="text-xs text-stone-800 dark:text-stone-200 font-semibold">{selectedOrder.flavor}</span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-stone-400 dark:text-stone-500 font-mono block">Our Price</span>
                    <span className="text-xs text-lux-gold font-semibold font-mono">{selectedOrder.amount}</span>
                  </div>
                </div>

                {/* Design Narrative details */}
                <div className="space-y-1.5 text-left">
                  <span className="text-[9px] uppercase tracking-[0.15em] text-stone-400 dark:text-stone-400 font-mono font-semibold block">Design Details Sheet</span>
                  <p className="text-xs text-stone-650 dark:text-stone-300 font-light leading-relaxed font-sans">{selectedOrder.details}</p>
                </div>

                {/* Visual Blueprint Steps Map - Accordion timeline */}
                <div className="space-y-4 pt-4 border-t border-stone-100 dark:border-stone-800 text-left">
                  <span className="text-[9px] uppercase tracking-[0.15em] text-stone-400 dark:text-stone-400 font-mono font-semibold block">Artisan Handcraft milestones</span>
                  
                  <div className="relative pl-6 space-y-6 border-l-2 border-stone-200 dark:border-stone-800">
                    {selectedOrder.timeline.map((step, idx) => {
                      const isLast = idx === selectedOrder.timeline.length - 1;
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
                    <strong>Need to request changes or cancel?</strong> Reschedules must be requested at least <strong className="text-white">5 days before</strong> the scheduled date.
                  </p>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="bg-white dark:bg-[#111111] border border-dashed border-stone-200/80 dark:border-stone-800 rounded-xs py-24 text-center font-sans">
              <ShoppingBag className="w-12 h-12 text-stone-300 dark:text-stone-700 mx-auto mb-4" />
              <h3 className="font-serif text-lg text-stone-700 dark:text-stone-300 italic">{t('common.noSelection')}</h3>
              <p className="text-xs text-stone-400 dark:text-stone-500 font-light mt-1 max-w-sm mx-auto">
                Select an order block from the active list or type your ID to query individual real-time milestones.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
