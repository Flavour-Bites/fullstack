import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Paperclip, CheckCircle2, Loader2, ArrowRight } from 'lucide-react';
import { CustomCakeRequest, CakeGalleryItem, User } from '../../../types';
import { useToast } from '../../../shared/ui/Toast';
import { t } from '../../../i18n/index';
import { apiFetch } from '../../../shared/utils/apiClient';
import { usePageTitle } from '../../core/hooks/usePageTitle';
import OrderTrackingView from './OrderTrackingView';

interface RequestFormViewProps {
  prefilledCake: CakeGalleryItem | null;
  onClearPrefilledCake: () => void;
  currentUser?: User | null;
}

const DEFAULT_FORM = {
  contactName: '',
  contactPhone: '',
  deliveryDate: '',
  cakeDescription: '',
  deliveryOption: 'pickup' as 'pickup' | 'delivery',
  deliveryAddress: '',
};

export default function RequestFormView({
  prefilledCake,
  onClearPrefilledCake,
  currentUser
}: RequestFormViewProps) {
  usePageTitle("Request a Cake");
  const { showToast } = useToast();
  const [form, setForm] = useState(DEFAULT_FORM);
  const [activeRequests, setActiveRequests] = useState<CustomCakeRequest[]>([]);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [submittedId, setSubmittedId] = useState('');
  const [dbConnected, setDbConnected] = useState<boolean | null>(null);
  const [valError, setValError] = useState<string | null>(null);
  const [dateError, setDateError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const getMinDateString = () => {
    const minDate = new Date();
    minDate.setDate(minDate.getDate() + 2);
    return minDate.toISOString().split('T')[0];
  };

  useEffect(() => {
    if (currentUser) {
      setForm((prev) => ({
        ...prev,
        contactName: currentUser.name || '',
      }));
    }
  }, [currentUser]);

  useEffect(() => {
    if (prefilledCake) {
      setForm((prev) => ({
        ...prev,
        cakeDescription: `Inspired by "${prefilledCake.name}" — ${prefilledCake.description}`,
      }));
    }
  }, [prefilledCake]);

  const fetchRequests = async () => {
    try {
      const res = await fetch('/api/requests');
      if (!res.ok) throw new Error('Server unavailable');
      const data = await res.json();
      if (data.success) {
        setActiveRequests(data.requests);
        setDbConnected(true);
      }
    } catch {
      setDbConnected(false);
      const list = localStorage.getItem('fb_request_commissions');
      if (list) {
        try { setActiveRequests(JSON.parse(list)); } catch {}
      }
    }
  };

  useEffect(() => { fetchRequests(); }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    if (name === 'deliveryDate') {
      const minDateStr = getMinDateString();
      if (!value) {
        setDateError('Event date is required.');
      } else if (value < minDateStr) {
        setDateError(`Yodit needs at least 2 days. Choose ${new Date(minDateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} or later.`);
      } else {
        setDateError(null);
      }
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    const file = e.target.files?.[0];
    if (!file) return;
    await uploadFile(file);
  };

  const uploadFile = async (file: File) => {
    setUploadError(null);
    setUploading(true);
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
        body: JSON.stringify({ fileName: file.name, mimeType: file.type, size: file.size, dataBase64 }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Upload failed');
      setUploadedImageUrl(data.image.url);
      showToast('Image Uploaded', 'Your reference image is ready. Submit when you are.', 'success');
    } catch (err: any) {
      setUploadError(err.message);
      showToast('Upload Failed', err.message + ' You can still submit without an image.', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.types.includes('Files')) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget === e.target) setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) uploadFile(file);
  };

  const deleteRequest = async (id: string) => {
    let deletedOnBackend = false;
    if (dbConnected) {
      try {
        const res = await fetch(`/api/requests/${id}`, { method: 'DELETE' });
        if (res.ok) {
          const data = await res.json();
          if (data.success) { deletedOnBackend = true; fetchRequests(); }
        }
      } catch {}
    }
    if (!deletedOnBackend) {
      const updated = activeRequests.filter((item) => item.id !== id);
      setActiveRequests(updated);
      localStorage.setItem('fb_request_commissions', JSON.stringify(updated));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!form.contactName || !form.contactPhone || !form.deliveryDate) {
      setValError('Please fill in your name, phone, and event date.');
      return;
    }
    const minDateStr = getMinDateString();
    if (form.deliveryDate < minDateStr) {
      setValError(`Yodit needs at least 2 days to prepare. Please choose ${new Date(minDateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} or later.`);
      return;
    }

    setValError(null);
    setDateError(null);
    setSubmitting(true);

    const uniqueId = `FB-${Math.floor(1000 + Math.random() * 9000)}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`;

    const newInquiry: CustomCakeRequest = {
      id: uniqueId,
      contactName: form.contactName,
      contactPhone: form.contactPhone,
      eventType: 'Other',
      guestCount: 20,
      deliveryOption: form.deliveryOption,
      deliveryAddress: form.deliveryAddress,
      deliveryDate: form.deliveryDate,
      designStyle: form.cakeDescription,
      flavor: 'To be discussed',
      tierCount: 1,
      specialInstructions: '',
      requestDate: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      status: 'Received',
      referenceImage: uploadedImageUrl || undefined,
      depositAmount: 0,
      remainingBalance: 0,
      paymentStatus: 'unpaid',
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
          if (data.success) { savedOnBackend = true; fetchRequests(); }
        }
      } catch {}
    }

    if (!savedOnBackend) {
      const nextList = [newInquiry, ...activeRequests];
      setActiveRequests(nextList);
      localStorage.setItem('fb_request_commissions', JSON.stringify(nextList));
    }

    setSubmittedId(uniqueId);
    setFormSubmitted(true);
    setSubmitting(false);
    onClearPrefilledCake();
    showToast(t('order.artisanInquiryFiled'), t('order.submittedSuccess', { id: uniqueId }), 'majestic', 7000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-20">
      <section className="text-center max-w-xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-serif text-warm-950 dark:text-stone-100 mb-3">{t('order.createTitle')}</h1>
        <p className="text-sm text-stone-600 dark:text-stone-300 font-light leading-relaxed font-sans">
          Tell us about your celebration. Yodit will reach out to discuss flavours, design, and all the details.
        </p>
        <div className="h-[1px] w-24 bg-stone-300 mx-auto mt-6" />
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start text-left">
        <div className="lg:col-span-7 bg-white dark:bg-[#111111] p-6 sm:p-10 border border-stone-200/60 dark:border-stone-850 rounded-sm shadow-xs">
          <AnimatePresence mode="wait">
            {formSubmitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-16 space-y-6"
              >
                <div className="w-20 h-20 bg-green-50 dark:bg-green-950/30 rounded-full flex items-center justify-center mx-auto border border-green-200 dark:border-green-900">
                  <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-2xl font-serif text-stone-900 dark:text-stone-100">{t('order.thankYou')}</h3>
                <p className="text-sm text-stone-600 dark:text-stone-300 max-w-lg mx-auto font-sans font-light leading-relaxed">
                  Your request <span className="font-mono text-lux-gold font-semibold">{submittedId}</span> has been received. Yodit will review it and reach out within 24 hours to discuss your cake.
                </p>
                <div className="p-4 bg-stone-50 dark:bg-stone-900/60 border border-stone-200 dark:border-stone-800 text-xs text-stone-500 dark:text-stone-400 rounded-sm text-left max-w-md mx-auto">
                  <p className="font-semibold mb-1">{t('order.whatHappensNext')}</p>
                  <ol className="list-decimal pl-4 space-y-1">
                    <li>Yodit reviews your request and checks availability.</li>
                    <li>She reaches out by phone or Telegram to discuss flavours, design, and pricing.</li>
                    <li>Once confirmed, your cake enters production and you can track it below.</li>
                  </ol>
                </div>
                <button
                  onClick={() => { setFormSubmitted(false); setForm(DEFAULT_FORM); setUploadedImageUrl(null); }}
                  className="px-6 py-2.5 bg-stone-900 dark:bg-stone-800 hover:bg-lux-gold hover:text-stone-950 text-white font-medium text-xs tracking-widest uppercase rounded-sm transition-all cursor-pointer"
                >
                  {t('order.createAnother')}
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6" id="cake-custom-form">
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
                      Clear
                    </button>
                  </div>
                )}

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
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-stone-150 dark:border-stone-800 pb-2">
                    <span className="w-5 h-5 rounded-full bg-stone-900 dark:bg-stone-800 text-white flex items-center justify-center text-[10px] font-semibold font-mono">2</span>
                    <h3 className="font-serif text-lg text-stone-900 dark:text-stone-100 uppercase tracking-wide">{t('order.cakeAndEvent')}</h3>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className={`text-[10px] uppercase font-mono tracking-widest font-bold block ${dateError ? 'text-red-500' : 'text-stone-500 dark:text-stone-400'}`}>
                        {t('order.deliveryDate')} *
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
                      <p className="text-[10px] text-red-500 dark:text-red-400 font-sans mt-1 leading-normal font-medium">{dateError}</p>
                    ) : (
                      <span className="text-[10px] text-stone-400 mt-1 block">Minimum 48 hours notice required.</span>
                    )}
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-mono tracking-widest text-stone-500 dark:text-stone-400 font-bold block mb-1">Tell us about your cake *</label>
                    <textarea
                      name="cakeDescription"
                      value={form.cakeDescription}
                      onChange={handleInputChange}
                      rows={4}
                      placeholder="Describe your ideal cake — colours, theme, size, any inspiration photos..."
                      required
                      className="w-full border border-stone-200 dark:border-stone-800 p-3 text-sm focus:outline-none focus:border-lux-gold bg-stone-50/50 dark:bg-stone-900/40 text-stone-800 dark:text-stone-100 rounded-sm"
                    />
                  </div>

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
                    >
                      <label className="text-[10px] uppercase font-mono tracking-widest text-stone-500 dark:text-stone-400 font-bold block mb-1">Delivery Address *</label>
                      <input
                        type="text"
                        name="deliveryAddress"
                        value={form.deliveryAddress}
                        onChange={handleInputChange}
                        required
                        placeholder="e.g. Bole Sub-City, Addis Ababa"
                        className="w-full border border-stone-200 dark:border-stone-800 p-2.5 text-sm focus:outline-none focus:border-lux-gold bg-stone-50/50 dark:bg-stone-900/40 rounded-sm text-stone-800 dark:text-stone-100"
                      />
                    </motion.div>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-stone-150 dark:border-stone-800 pb-2">
                    <span className="w-5 h-5 rounded-full bg-stone-900 dark:bg-stone-800 text-white flex items-center justify-center text-[10px] font-semibold font-mono">3</span>
                    <h3 className="font-serif text-lg text-stone-900 dark:text-stone-100 uppercase tracking-wide">Reference (Optional)</h3>
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-mono tracking-widest text-stone-500 dark:text-stone-400 font-bold block mb-1">{t('order.uploadReference')}</label>
                    <div
                      onDragOver={handleDragOver}
                      onDragEnter={handleDragEnter}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      className={`border border-dashed rounded-sm p-6 text-center relative transition-colors font-sans ${
                        isDragging ? 'border-lux-gold bg-lux-gold/10 scale-[1.02]'
                          : uploading ? 'border-lux-gold bg-lux-gold/5'
                          : uploadedImageUrl ? 'border-emerald-400/50 bg-emerald-500/5'
                          : uploadError ? 'border-red-400/50 bg-red-500/5'
                          : 'border-stone-300 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-900/30'
                      }`}
                    >
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        disabled={uploading}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full disabled:cursor-not-allowed"
                      />
                      {isDragging ? (
                        <>
                          <div className="w-8 h-8 rounded-full bg-lux-gold/20 flex items-center justify-center mx-auto mb-2">
                            <Paperclip className="w-4 h-4 text-lux-gold" />
                          </div>
                          <p className="text-xs text-lux-gold font-semibold">Drop your image here</p>
                        </>
                      ) : uploading ? (
                        <>
                          <Loader2 className="w-6 h-6 text-lux-gold mx-auto mb-2 animate-spin" />
                          <p className="text-xs text-lux-gold font-semibold">Uploading...</p>
                        </>
                      ) : uploadedImageUrl ? (
                        <>
                          <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
                          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">Image uploaded</p>
                          <p className="text-[10px] text-stone-400 dark:text-stone-500 mt-1">Click to replace</p>
                        </>
                      ) : uploadError ? (
                        <>
                          <p className="text-xs text-red-500 font-semibold">Upload failed — click to retry</p>
                        </>
                      ) : (
                        <>
                          <Paperclip className="w-6 h-6 text-stone-400 dark:text-stone-600 mx-auto mb-2" />
                          <p className="text-xs text-stone-600 dark:text-stone-300 font-semibold">
                            Drag or click to upload a reference image
                          </p>
                          <p className="text-[10px] text-stone-400 dark:text-stone-500 mt-1">JPG, PNG up to 10MB</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-4 bg-stone-900 hover:bg-lux-gold hover:text-stone-950 font-bold text-xs tracking-[0.25em] uppercase rounded-sm transition-all shadow-md cursor-pointer hover:translate-y-[-1px] flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {submitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4 text-lux-gold" />
                  )}
                  {submitting ? 'Submitting...' : t('order.submitRequest')}
                </button>
              </form>
            )}
          </AnimatePresence>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white dark:bg-[#111111] p-6 border border-stone-200/60 dark:border-stone-850 rounded-sm space-y-4">
            <h4 className="font-serif text-lg text-stone-900 dark:text-stone-100 font-medium">How it works</h4>
            <ul className="space-y-3.5 text-xs text-stone-600 dark:text-stone-300 font-light font-sans text-left">
              <li className="flex items-start gap-2.5">
                <div className="text-lux-gold font-mono mt-0.5">1</div>
                <p>Submit your request with a date and cake description.</p>
              </li>
              <li className="flex items-start gap-2.5">
                <div className="text-lux-gold font-mono mt-0.5">2</div>
                <p>Yodit reaches out to discuss flavours, design, and pricing.</p>
              </li>
              <li className="flex items-start gap-2.5">
                <div className="text-lux-gold font-mono mt-0.5">3</div>
                <p>Once confirmed, your cake enters production and you track it live.</p>
              </li>
            </ul>
          </div>

          <div className="bg-white dark:bg-[#111111] p-6 border border-stone-200/60 dark:border-stone-850 rounded-sm space-y-4">
            <h4 className="font-serif text-lg text-stone-900 dark:text-stone-100 font-medium">Why Flavour Bites?</h4>
            <ul className="space-y-3.5 text-xs text-stone-600 dark:text-stone-300 font-light font-sans text-left">
              <li className="flex items-start gap-2.5">
                <div className="text-lux-gold font-mono mt-0.5">&#10003;</div>
                <p>A few orders each week, so every cake gets full attention.</p>
              </li>
              <li className="flex items-start gap-2.5">
                <div className="text-lux-gold font-mono mt-0.5">&#10003;</div>
                <p>Pure ingredients, no stabilizers, entirely handcrafted.</p>
              </li>
              <li className="flex items-start gap-2.5">
                <div className="text-lux-gold font-mono mt-0.5">&#10003;</div>
                <p>Dietary requirements (eggless, dairy-free) strictly isolated.</p>
              </li>
            </ul>
          </div>

          <a
            href="#gallery"
            onClick={(e) => { e.preventDefault(); window.history.back(); }}
            className="flex items-center justify-center gap-2 py-3 border border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-300 hover:border-lux-gold hover:text-lux-gold text-xs font-medium tracking-wider uppercase rounded-sm transition-all cursor-pointer"
          >
            Browse the Gallery
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      <OrderTrackingView requests={activeRequests} dbConnected={dbConnected} onDelete={deleteRequest} />
    </div>
  );
}
