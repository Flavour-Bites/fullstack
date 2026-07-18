import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Send, Paperclip, CheckCircle2, ShieldCheck, Loader2, AlertCircle } from 'lucide-react';
import { CustomCakeRequest, CakeGalleryItem, User } from '../types';
import { useToast } from './Toast';
import { t } from '../i18n';
import { apiFetch } from '../shared/utils/apiClient';
import { usePageTitle } from '../hooks/usePageTitle';
import OrderTrackingView from './OrderTrackingView';

interface RequestFormViewProps {
  prefilledCake: CakeGalleryItem | null;
  onClearPrefilledCake: () => void;
  currentUser?: User | null;
}

const DEFAULT_FORM = {
  contactName: '',
  contactPhone: '',
  eventType: 'Birthday',
  guestCount: 20,
  deliveryOption: 'pickup' as 'pickup' | 'delivery',
  deliveryAddress: '',
  deliveryDate: '',
  designStyle: '',
  flavor: 'Madagascar Vanilla Bean',
  tierCount: 1,
  specialInstructions: '',
  referenceImage: ''
};

export default function RequestFormView({
  prefilledCake,
  onClearPrefilledCake,
  currentUser
}: RequestFormViewProps) {
  usePageTitle("Request a Cake");
  const { showToast } = useToast();
  const [form, setForm] = useState(DEFAULT_FORM);

  // Auto prefill contact details from logged-in user
  useEffect(() => {
    if (currentUser) {
      setForm((prev) => ({
        ...prev,
        contactName: currentUser.name || '',
      }));
    }
  }, [currentUser]);
  const [activeRequests, setActiveRequests] = useState<CustomCakeRequest[]>([]);
  const [fileAttached, setFileAttached] = useState<string | null>(null);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [estimatedCost, setEstimatedCost] = useState(0);
  const [dbConnected, setDbConnected] = useState<boolean | null>(null);
  const [valError, setValError] = useState<string | null>(null);
  const [dateError, setDateError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);


  // Helper to calculate the 48-hour advance notice minimum date
  const getMinDateString = () => {
    const minDate = new Date();
    minDate.setDate(minDate.getDate() + 2); // Minimum 48 hours
    return minDate.toISOString().split('T')[0];
  };

  // Sync inputs from prefilled inspiration cake
  useEffect(() => {
    if (prefilledCake) {
      setForm((prev) => ({
        ...prev,
        eventType: 'Birthday', // Birthday/Celebration cake
        designStyle: `Inspired by "${prefilledCake.name}" - ${prefilledCake.description}`,
        flavor: prefilledCake.flavors[0] || 'Madagascar Vanilla Bean',
        tierCount: 1
      }));
    }
  }, [prefilledCake]);

  // Read previous requests
  const fetchRequests = async () => {
    try {
      const res = await fetch('/api/requests');
      if (!res.ok) {
        throw new Error('Database server offline or missing target variables');
      }
      const data = await res.json();
      if (data.success) {
        setActiveRequests(data.requests);
        setDbConnected(true);
      } else {
        throw new Error(data.error || 'Server error');
      }
    } catch (e: any) {
      console.warn('Backend API unavailable. Falling back to client-side caching:', e.message);
      setDbConnected(false);

      // Robust local storage fallback path
      const list = localStorage.getItem('fb_request_commissions');
      if (list) {
        try {
          const parsed = JSON.parse(list) as CustomCakeRequest[];
          setActiveRequests(parsed);
        } catch (err) {
          console.error('Error parsing localStorage', err);
        }
      } else {
        // Default initial luxury mock requests aligned with Ethiopian context
        const defaultRequests: CustomCakeRequest[] = [
          {
            id: 'FB-9812A',
            contactName: 'Saba Tekle',
            contactPhone: '+251 911 123 456',
            eventType: 'Anniversary',
            guestCount: 85,
            deliveryOption: 'pickup',
            deliveryAddress: '',
            deliveryDate: new Date(Date.now() + 86400000 * 45).toISOString().split('T')[0],
            designStyle: 'Three-tier custom cream cake decorated with fresh golden-trimmed roses.',
            flavor: 'Madagascar Vanilla Bean',
            tierCount: 3,
            specialInstructions: 'Safe wrapping for travel. Pickup will occur at pre-scheduled slot.',
            requestDate: 'June 18, 2026',
            status: 'Designing',
            quotedPrice: 11500,
          },
          {
            id: 'FB-9231B',
            contactName: 'Kidus Solomon',
            contactPhone: '+251 912 345 678',
            eventType: 'Birthday',
            guestCount: 25,
            deliveryOption: 'pickup',
            deliveryAddress: '',
            deliveryDate: new Date(Date.now() + 86400000 * 12).toISOString().split('T')[0],
            designStyle: 'Clean modern custom iced birthday layout with golden edges.',
            flavor: 'Rich Chocolate Ganache',
            tierCount: 1,
            specialInstructions: 'Minimalist chocolate wording directly on cake surface.',
            requestDate: 'June 19, 2026',
            status: 'Quoted',
            quotedPrice: 2800,
          }
        ];
        localStorage.setItem('fb_request_commissions', JSON.stringify(defaultRequests));
        setActiveRequests(defaultRequests);
      }
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  // Recalculate Mock Pricing in ETB
  useEffect(() => {
    let base = 500; // base processing fee in ETB
    if (form.eventType === 'Anniversary' || form.eventType === 'Corporate') base += 1000;

    const guestCost = Math.min(form.guestCount, 300) * 85; // 85 ETB per serving
    const tierCost = (form.tierCount - 1) * 750; // multiple tiers structural support
    let deliveryCost = 0;
    if (form.deliveryOption === 'delivery') deliveryCost += 850; // Delivery fee in ETB

    const total = base + guestCost + tierCost + deliveryCost;
    setEstimatedCost(Math.round(total));
  }, [form.eventType, form.guestCount, form.tierCount, form.deliveryOption]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === 'guestCount' || name === 'tierCount' ? Number(value) : value
    }));

    if (name === 'deliveryDate') {
      const minDateStr = getMinDateString();
      if (!value) {
        setDateError('Target delivery date is required.');
      } else if (value < minDateStr) {
        setDateError(`Min 48-hour notice required. Select a date on or after ${new Date(minDateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}.`);
      } else {
        setDateError(null);
      }
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setFileAttached(file.name);

    try {
      const reader = new FileReader();
      const dataBase64 = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsDataURL(file);
      });

      const res = await apiFetch('/api/uploads/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: file.name,
          mimeType: file.type,
          size: file.size,
          dataBase64,
        }),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Upload failed');

      setUploadedImageUrl(data.image.url);
      showToast('Image Uploaded', 'Reference image uploaded to Cloudinary.', 'success');
    } catch (err: any) {
      setUploadError(err.message);
      showToast('Upload Failed', err.message, 'error');
    } finally {
      setUploading(false);
    }
  };

  const deleteRequest = async (id: string) => {
    let deletedOnBackend = false;
    if (dbConnected) {
      try {
        const res = await fetch(`/api/requests/${id}`, {
          method: 'DELETE'
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            deletedOnBackend = true;
            fetchRequests();
          }
        }
      } catch (err) {
        console.warn('Failed backend delete request:', err);
      }
    }

    if (!deletedOnBackend) {
      const updated = activeRequests.filter((item) => item.id !== id);
      setActiveRequests(updated);
      localStorage.setItem('fb_request_commissions', JSON.stringify(updated));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.contactName || !form.deliveryDate) {
      setValError('Please fill out Name and Delivery Date.');
      return;
    }

    const minDateStr = getMinDateString();
    if (form.deliveryDate < minDateStr) {
      setValError(`Minimum 48-hour notice required. Yodit needs at least 2 complete days of preparation to guarantee artisan standards. Please choose a date on or after ${new Date(minDateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}.`);
      setDateError(`Min 48-hour notice required. Choose a date on or after ${new Date(minDateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}.`);
      return;
    }

    setValError(null);
    setDateError(null);

    const uniqueId = `FB-${Math.floor(1000 + Math.random() * 9000)}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`;

    const newInquiry: CustomCakeRequest = {
      id: uniqueId,
      contactName: form.contactName,
      contactPhone: form.contactPhone,
      eventType: form.eventType,
      guestCount: form.guestCount,
      deliveryOption: form.deliveryOption,
      deliveryAddress: form.deliveryAddress,
      deliveryDate: form.deliveryDate,
      designStyle: form.designStyle,
      flavor: form.flavor,
      tierCount: form.tierCount,
      specialInstructions: form.specialInstructions,
      requestDate: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      status: 'Received',
      referenceImage: uploadedImageUrl || fileAttached || undefined,
    };

    let savedOnBackend = false;
    if (dbConnected) {
      try {
        const res = await fetch('/api/requests', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newInquiry)
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            savedOnBackend = true;
            fetchRequests();
          }
        }
      } catch (err) {
        console.warn('Failed backend post, caching in local state:', err);
      }
    }

    if (!savedOnBackend) {
      const nextList = [newInquiry, ...activeRequests];
      setActiveRequests(nextList);
      localStorage.setItem('fb_request_commissions', JSON.stringify(nextList));
    }

    // Clear and state
    setFormSubmitted(true);
    setFileAttached(null);
    onClearPrefilledCake();

    showToast(
      t('order.artisanInquiryFiled'),
      t('order.submittedSuccess', { id: uniqueId }),
      'majestic',
      7000
    );

    setTimeout(() => {
      setFormSubmitted(false);
      setForm(DEFAULT_FORM);
    }, 15000); // keep success message longer so it can be read fully
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-20">
      {/* Visual Header */}
      <section className="text-center max-w-xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-lux-gold/20 bg-lux-gold/10 mb-4 font-sans">
          <Sparkles className="w-3.5 h-3.5 text-lux-gold" />
          <span className="text-[10px] uppercase tracking-[0.25em] text-lux-gold font-medium">{t('order.orderCake')}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-serif text-warm-950 dark:text-stone-100 mb-3">{t('order.createTitle')}</h1>
        <p className="text-sm text-stone-600 dark:text-stone-300 font-light leading-relaxed font-sans">
          Tell us about your celebration theme and event date. Submit the request to start a design review, and monitor your order status live below.
        </p>
        <div className="h-[1px] w-24 bg-stone-300 mx-auto mt-6" />
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start text-left">
        {/* Form Column */}
        <div className="lg:col-span-7 bg-white dark:bg-[#111111] p-6 sm:p-10 border border-stone-200/60 dark:border-stone-850 rounded-sm shadow-xs">
          <AnimatePresence mode="wait">
            {formSubmitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-16 space-y-6"
              >
                <div className="w-20 h-20 bg-green-50 dark:bg-green-950/30 rounded-full flex items-center justify-center mx-auto border border-green-250">
                  <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-2xl font-serif text-stone-900 dark:text-stone-100">{t('order.thankYou')}</h3>
                <p className="text-sm text-stone-600 dark:text-stone-300 max-w-lg mx-auto font-sans font-light leading-relaxed">
                  Yodit Ashenafi will check your details and follow up by phone or Telegram with her availability and price quote — usually within 24 hours.
                </p>
                <div className="p-4 bg-stone-50 dark:bg-stone-900/60 border border-stone-200 dark:border-stone-800 text-xs text-stone-500 dark:text-stone-400 rounded-sm text-left max-w-md mx-auto">
                  <p className="font-semibold mb-1">{t('order.whatHappensNext')}</p>
                  <ol className="list-decimal pl-4 space-y-1">
                    <li>Your order is listed as <strong>Received</strong> in the tracker below.</li>
                    <li>Yodit reviews decoration availability.</li>
                    <li>She messages or calls you on phone/Telegram to confirm.</li>
                  </ol>
                </div>
                <button
                  onClick={() => setFormSubmitted(false)}
                  className="px-6 py-2.5 bg-stone-900 dark:bg-stone-800 text-white font-medium text-xs tracking-widest uppercase rounded-sm hover:bg-stone-800"
                >
                  {t('order.createAnother')}
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-8" id="cake-custom-form">
                {valError && (
                  <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-xs rounded-sm font-sans flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                    <span>{valError}</span>
                  </div>
                )}
                {prefilledCake && (
                  <div className="p-4 bg-lux-gold/10 border border-lux-gold/30 dark:border-lux-gold/50 rounded-xs flex justify-between items-center text-xs font-sans">
                    <div className="text-left">
                      <span className="font-semibold text-warm-950 dark:text-lux-gold text-[10px] uppercase font-mono tracking-wider block">Your Cake Inspiration</span>
                      <p className="text-stone-700 dark:text-stone-300 italic">Inspired by "{prefilledCake.name}"</p>
                    </div>
                    <button
                      type="button"
                      onClick={onClearPrefilledCake}
                      className="text-[10px] uppercase font-mono text-lux-gold hover:text-stone-900 tracking-widest cursor-pointer px-2 py-1 bg-white dark:bg-stone-900 hover:bg-stone-100 dark:hover:bg-stone-800 border border-stone-200 dark:border-stone-800 rounded-sm"
                    >
                      Clear Inspiration
                    </button>
                  </div>
                )}

                {/* Section A: Contact Info */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-stone-150 dark:border-stone-800 pb-2">
                    <span className="w-5 h-5 rounded-full bg-stone-900 dark:bg-stone-800 text-white flex items-center justify-center text-[10px] font-semibold font-mono">1</span>
                    <h3 className="font-serif text-lg text-stone-900 dark:text-stone-100 uppercase tracking-wide">{t('order.aboutYou')}</h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] uppercase font-mono tracking-widest text-stone-500 dark:text-stone-400 font-bold block mb-1">{t('order.yourName')} *</label>
                      <input
                        type="text"
                        name="contactName"
                        value={form.contactName}
                        onChange={handleInputChange}
                        placeholder="e.g. Helina Tesfaye"
                        required
                        className="w-full border border-stone-200 dark:border-stone-850 p-3 text-sm focus:outline-none focus:border-lux-gold bg-stone-50/50 dark:bg-stone-900/40 text-stone-850 dark:text-stone-100 rounded-sm"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase font-mono tracking-widest text-stone-500 dark:text-stone-400 font-bold block mb-1">Your Email *</label>
                      <input
                        type="email"
                        name="contactEmail"
                        value={form.contactEmail}
                        onChange={handleInputChange}
                        placeholder="e.g. helina@example.com"
                        required
                        className="w-full border border-stone-200 dark:border-stone-850 p-3 text-sm focus:outline-none focus:border-lux-gold bg-stone-50/50 dark:bg-stone-900/40 text-stone-850 dark:text-stone-100 rounded-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-mono tracking-widest text-stone-500 dark:text-stone-400 font-bold block mb-1">{t('order.yourPhone')} *</label>
                    <input
                      type="tel"
                      name="contactPhone"
                      value={form.contactPhone}
                      onChange={handleInputChange}
                      placeholder="e.g. +251 911 000 000"
                      required
                      className="w-full border border-stone-200 dark:border-stone-850 p-3 text-sm focus:outline-none focus:border-lux-gold bg-stone-50/50 dark:bg-stone-900/40 text-stone-850 dark:text-stone-100 rounded-sm shadow-xs"
                    />
                    <span className="text-[10px] text-stone-400 dark:text-stone-550 mt-1 block">Yodit will reach out via this line on Telegram or normal call to verify your order.</span>
                  </div>
                </div>

                {/* Section B: Event specifics */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-stone-150 dark:border-stone-800 pb-2">
                    <span className="w-5 h-5 rounded-full bg-stone-900 dark:bg-stone-800 text-white flex items-center justify-center text-[10px] font-semibold font-mono">2</span>
                    <h3 className="font-serif text-lg text-stone-900 dark:text-stone-100 uppercase tracking-wide">{t('order.cakeAndEvent')}</h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] uppercase font-mono tracking-widest text-stone-500 dark:text-stone-400 font-bold block mb-1">{t('order.eventTypeSelect')} *</label>
                      <select
                        name="eventType"
                        value={form.eventType}
                        onChange={handleInputChange}
                        className="w-full border border-stone-200 dark:border-stone-800 p-3 text-sm focus:outline-none focus:border-lux-gold bg-white dark:bg-stone-900 rounded-sm text-stone-850 dark:text-stone-100"
                      >
                        <option value="Birthday">Birthday Milestone Cake</option>
                        <option value="Kids">Kids Event Concept Cake</option>
                        <option value="Anniversary">Anniversary Cake</option>
                        <option value="Corporate">Corporate Gathering Design</option>
                        <option value="Other">Other Festive Celebration</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] uppercase font-mono tracking-widest text-stone-500 dark:text-stone-400 font-bold block mb-1">{t('order.guestEstimate')} *</label>
                      <input
                        type="number"
                        name="guestCount"
                        min="5"
                        max="1000"
                        value={form.guestCount}
                        onChange={handleInputChange}
                        className="w-full border border-stone-200 dark:border-stone-800 p-3 text-sm focus:outline-none focus:border-lux-gold bg-stone-50/50 dark:bg-stone-900/40 rounded-sm text-stone-850 dark:text-stone-100"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className={`text-[10px] uppercase font-mono tracking-widest font-bold block ${dateError ? 'text-red-500' : 'text-stone-500 dark:text-stone-400'}`}>
                          {t('order.targetDate')} *
                        </label>
                        {form.deliveryDate && !dateError && (
                          <span className="text-[9px] uppercase font-mono text-emerald-600 dark:text-emerald-400 font-bold tracking-wider flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Notice Met
                          </span>
                        )}
                      </div>
                      <input
                        type="date"
                        name="deliveryDate"
                        value={form.deliveryDate}
                        onChange={handleInputChange}
                        min={getMinDateString()}
                        required
                        className={`w-full border p-3 text-sm focus:outline-none rounded-sm font-mono transition-colors text-stone-850 dark:text-stone-100 ${
                          dateError
                            ? 'border-red-300 dark:border-red-900 bg-red-50/30 dark:bg-red-950/20 focus:border-red-500'
                            : form.deliveryDate
                            ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/10 dark:bg-emerald-950/10 focus:border-emerald-600'
                            : 'border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/40 focus:border-lux-gold'
                        }`}
                      />
                      {dateError ? (
                        <p className="text-[10px] text-red-655 dark:text-red-400 font-sans mt-1 leading-normal font-medium">{dateError}</p>
                      ) : (
                        <span className="text-[10px] text-lux-gold mt-1 block">Requires minimum 48 hours notice.</span>
                      )}
                    </div>

                    <div>
                      <label className="text-[10px] uppercase font-mono tracking-widest text-stone-500 dark:text-stone-400 font-bold block mb-1">{t('order.tiersCount')}</label>
                      <select
                        name="tierCount"
                        value={form.tierCount}
                        onChange={handleInputChange}
                        className="w-full border border-stone-200 dark:border-stone-800 p-3 text-sm focus:outline-none focus:border-lux-gold bg-white dark:bg-stone-900 rounded-sm text-stone-850 dark:text-stone-100"
                      >
                        <option value="1">1 Tier - Classic Lounge Cake (Serves up to 25)</option>
                        <option value="2">2 Tiers - Medium Salon Gathering (Serves up to 50)</option>
                        <option value="3">3 Tiers - Grand Pavilion (Serves up to 90)</option>
                        <option value="4">4 Tiers - Monumental Ballroom Tiers (Serves up to 150)</option>
                        <option value="5">5+ Tiers - Grand Luxury Architectural Cake</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Section C: Aesthetic Tastes */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-stone-150 dark:border-stone-800 pb-2">
                    <span className="w-5 h-5 rounded-full bg-stone-900 dark:bg-stone-800 text-white flex items-center justify-center text-[10px] font-semibold font-mono">3</span>
                    <h3 className="font-serif text-lg text-stone-900 dark:text-stone-100 uppercase tracking-wide">{t('order.flavorsAndDesign')}</h3>
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-mono tracking-widest text-stone-500 dark:text-stone-400 font-bold block mb-1">{t('order.flavor')}</label>
                    <select
                      name="flavor"
                      value={form.flavor}
                      onChange={handleInputChange}
                      className="w-full border border-stone-200 dark:border-stone-800 p-3 text-sm focus:outline-none focus:border-lux-gold bg-white dark:bg-stone-900 rounded-sm text-stone-850 dark:text-stone-100"
                    >
                      <option value="Madagascar Vanilla Bean">Madagascar Vanilla Bean organic buttercream (Classic)</option>
                      <option value="Double Dark Callebaut Pearl">Double Dark chocolate ganache layers</option>
                      <option value="Earl Grey infusion with Lavender Buttercream">Earl Grey Infusion with Lavender (Floral-Modern)</option>
                      <option value="Coconut & Passionfruit">Coconut Sponge & Passionfruit Curd (Tropical)</option>
                      <option value="Sweet Honey Butter">Sweet Highland Honey & Salted Buttercream</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-mono tracking-widest text-stone-500 dark:text-stone-400 font-bold block mb-1">{t('order.themeSummary')}</label>
                    <textarea
                      name="designStyle"
                      value={form.designStyle}
                      onChange={handleInputChange}
                      rows={3}
                      placeholder="Describe preferred colors, watercolor effects, custom sugar flowers, or specific cartoon characters/themes..."
                      className="w-full border border-stone-200 dark:border-stone-800 p-3 text-sm focus:outline-none focus:border-lux-gold bg-stone-50/50 dark:bg-stone-900/40 text-stone-800 dark:text-stone-100 rounded-sm"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <legend className="text-[10px] uppercase font-mono tracking-widest text-stone-500 dark:text-stone-400 font-bold block mb-1">{t('order.fulfillmentMode')}</legend>
                      <div className="flex gap-4 pt-1 font-sans">
                        <label className="flex items-center gap-2 text-sm text-stone-700 dark:text-stone-300 cursor-pointer">
                          <input
                            type="radio"
                            name="deliveryOption"
                            value="pickup"
                            checked={form.deliveryOption === 'pickup'}
                            onChange={() => setForm((prev) => ({ ...prev, deliveryOption: 'pickup', deliveryAddress: '' }))}
                            className="text-stone-900 dark:text-stone-100 focus:ring-lux-gold focus:ring-1"
                          />
                          {t('order.pickup')}
                        </label>
                        <label className="flex items-center gap-2 text-sm text-stone-700 dark:text-stone-300 cursor-pointer">
                          <input
                            type="radio"
                            name="deliveryOption"
                            value="delivery"
                            checked={form.deliveryOption === 'delivery'}
                            onChange={() => setForm((prev) => ({ ...prev, deliveryOption: 'delivery' }))}
                            className="text-stone-900 dark:text-stone-100 focus:ring-lux-gold focus:ring-1"
                          />
                          {t('order.delivery')}
                        </label>
                      </div>
                    </div>

                    {form.deliveryOption === 'delivery' && (
                      <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="col-span-1"
                      >
                        <label className="text-[10px] uppercase font-mono tracking-widest text-stone-500 dark:text-stone-400 font-bold block mb-1">Delivery Address *</label>
                        <input
                          type="text"
                          name="deliveryAddress"
                          value={form.deliveryAddress}
                          onChange={handleInputChange}
                          required
                          placeholder="e.g. Bole Sub-City, Addis Ababa, Ethiopia"
                          className="w-full border border-stone-200 dark:border-stone-800 p-2.5 text-sm focus:outline-none focus:border-lux-gold bg-stone-50/50 dark:bg-stone-900/40 rounded-sm text-stone-800 dark:text-stone-100"
                        />
                      </motion.div>
                    )}
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-mono tracking-widest text-stone-500 dark:text-stone-400 font-bold block mb-1">{t('order.uploadReference')}</label>
                    <div className={`border border-dashed rounded-sm p-6 text-center relative transition-colors font-sans ${
                        uploading
                          ? 'border-lux-gold bg-lux-gold/5'
                          : uploadedImageUrl
                            ? 'border-emerald-400/50 bg-emerald-500/5'
                            : uploadError
                              ? 'border-red-400/50 bg-red-500/5'
                              : 'border-stone-300 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-900/30'
                      }`}>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        disabled={uploading}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full disabled:cursor-not-allowed"
                      />
                      {uploading ? (
                        <>
                          <Loader2 className="w-6 h-6 text-lux-gold mx-auto mb-2 animate-spin" />
                          <p className="text-xs text-lux-gold font-semibold">Uploading to Cloudinary...</p>
                        </>
                      ) : uploadedImageUrl ? (
                        <>
                          <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
                          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">Image uploaded successfully</p>
                          <p className="text-[10px] text-stone-400 dark:text-stone-500 mt-1 truncate max-w-full">{fileAttached}</p>
                        </>
                      ) : uploadError ? (
                        <>
                          <AlertCircle className="w-6 h-6 text-red-400 mx-auto mb-2" />
                          <p className="text-xs text-red-500 font-semibold">Upload failed</p>
                          <p className="text-[10px] text-red-400 mt-1">{uploadError}</p>
                          <p className="text-[10px] text-stone-400 dark:text-stone-500 mt-1">Click to try again</p>
                        </>
                      ) : (
                        <>
                          <Paperclip className="w-6 h-6 text-stone-400 dark:text-stone-600 mx-auto mb-2" />
                          <p className="text-xs text-stone-600 dark:text-stone-300 font-semibold">
                            Click/Drag to upload style sketches or cake references
                          </p>
                          <p className="text-[10px] text-stone-400 dark:text-stone-500 mt-1">Accepts JPG, PNG up to 10MB</p>
                        </>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-mono tracking-widest text-stone-500 dark:text-stone-400 font-bold block mb-1">{t('order.specialDiet')}</label>
                    <textarea
                      name="specialInstructions"
                      value={form.specialInstructions}
                      onChange={handleInputChange}
                      rows={2}
                      placeholder="e.g. Dairy-free bases, eggless custom baking, or extra wrapping safety details."
                      className="w-full border border-stone-200 dark:border-stone-800 p-3 text-sm focus:outline-none focus:border-lux-gold bg-stone-50/50 dark:bg-stone-900/40 text-stone-800 dark:text-stone-100 rounded-sm"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-4 bg-stone-900 hover:bg-lux-gold hover:text-stone-950 font-bold text-xs tracking-[0.25em] uppercase rounded-sm transition-all shadow-md cursor-pointer hover:translate-y-[-1px] flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4 text-lux-gold" />
                  {t('order.submitRequest')}
                </button>
              </form>
            )}
          </AnimatePresence>
        </div>

        {/* Pricing Estimator Column */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-stone-900 text-white p-6 sm:p-8 rounded-sm shadow-xl space-y-6 border border-stone-800">
            <div>
              <span className="text-[10px] uppercase tracking-[0.3em] text-lux-gold font-mono block mb-1">{t('order.priceEstimates')}</span>
              <h3 className="font-serif text-2xl text-white">Estimated Proposal Details</h3>
            </div>
            <hr className="border-stone-800" />

            <div className="space-y-4 text-xs font-sans">
              <div className="flex justify-between">
                <span className="text-stone-400">{t('order.consultationFee')}</span>
                <span className="font-mono">500 ETB</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-400 font-sans">{t('order.designSurcharge')}</span>
                <span className="font-mono">
                  {form.eventType === 'Anniversary' || form.eventType === 'Corporate' ? '+1,000 ETB' : '+0 ETB'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-400">Yield Serving Surcharge ({form.guestCount} servings)</span>
                <span className="font-mono">+{Math.min(form.guestCount, 300) * 85} ETB</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-400">Structural Tier Surcharge ({form.tierCount} Tiers)</span>
                <span className="font-mono">+{(form.tierCount - 1) * 750} ETB</span>
              </div>

              {form.deliveryOption === 'delivery' && (
                <div className="flex justify-between text-lux-gold">
                  <span>{t('order.deliveryFee')}</span>
                  {/* [NEEDS INPUT: delivery fee] */}
                  <span className="font-mono">+850 ETB</span>
                </div>
              )}
            </div>

            <hr className="border-stone-800" />

            <div className="flex justify-between items-end">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-stone-400 block font-mono">{t('order.estimatedTotal')}</span>
                <span className="text-[10px] text-stone-400 font-light italic">{t('order.subjectToReview')}</span>
              </div>
              <div className="text-right">
                <span className="text-2xl font-serif text-lux-gold font-light leading-none">
                  {estimatedCost} ETB
                </span>
              </div>
            </div>

            <div className="p-3.5 bg-stone-850 rounded-xs border border-stone-800 text-[10px] text-stone-400 leading-relaxed font-light font-sans">
              <ShieldCheck className="w-4 h-4 text-lux-gold inline mr-1.5 align-text-bottom" />
              This calculator provides starting estimates. Yodit Ashenafi reviews each customized detail, flavor profile, and flower selection to confirm availability and final billing.
            </div>
          </div>

          <div className="bg-white dark:bg-[#111111] p-6 border border-stone-200/60 dark:border-stone-850 rounded-xs space-y-4">
            <h4 className="font-serif text-lg text-stone-900 dark:text-stone-100 font-medium">Why Choose Flavour Bites?</h4>
            <ul className="space-y-3.5 text-xs text-stone-600 dark:text-stone-300 font-light font-sans text-left">
              <li className="flex items-start gap-2.5">
                <div className="text-lux-gold font-mono mt-0.5">✔</div>
                <p>Yodit only takes a few orders each week to focus on absolute design quality.</p>
              </li>
              <li className="flex items-start gap-2.5">
                <div className="text-lux-gold font-mono mt-0.5">✔</div>
                <p>Pure ingredients, free of chemical stabilizers, customized entirely by hand.</p>
              </li>
              <li className="flex items-start gap-2.5">
                <div className="text-lux-gold font-mono mt-0.5">✔</div>
                <p>All dietary requirements (eggless, dairy-free, sugar levels) strictly isolated.</p>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <OrderTrackingView requests={activeRequests} dbConnected={dbConnected} onDelete={deleteRequest} />
    </div>
  );
}
