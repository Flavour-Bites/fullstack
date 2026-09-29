import { useState, useEffect, useCallback } from 'react';
import { CustomCakeRequest, Product, User, AvailabilityResponse } from '@shared/types';
import { useToast } from '../../../components/Toast';
import { t } from '@client/i18n/index';
import { http } from '@client/lib/http';
import type { ApiResponse } from '@/shared/api';
import { useAvailability } from '../../admin/hooks/useAvailability';

export const DEFAULT_FORM = {
  contactName: '',
  contactPhone: '',
  eventDate: '',
  cakeDescription: '',
};

export type RequestForm = typeof DEFAULT_FORM;

export function generateRequestId(): string {
  const cryptoObj = typeof window !== 'undefined' ? window.crypto : undefined;
  let num: number;
  let charCode: number;

  if (cryptoObj?.getRandomValues) {
    const array = new Uint32Array(2);
    cryptoObj.getRandomValues(array);
    num = 1000 + (array[0] % 9000);
    charCode = 65 + (array[1] % 26);
  } else {
    const now = Date.now();
    num = 1000 + (now % 9000);
    charCode = 65 + (now % 26);
  }

  return `FB-${num}${String.fromCodePoint(charCode)}`;
}

export function getDateInputStyles(
  dateError: string | null,
  eventDate: string,
  availability?: { minimumLeadTimeHours: number; days: Record<string, boolean> }
): string {
  if (dateError) {
    return 'border-red-300 dark:border-red-900 bg-red-50/30 dark:bg-red-950/20 focus:border-red-500';
  }
  if (eventDate) {
    if (availability?.days) {
      const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const dayIndex = new Date(eventDate).getDay();
      const dayKey = dayNames[dayIndex];
      if (availability.days[dayKey] === false) {
        return 'border-red-300 dark:border-red-900 bg-red-50/30 dark:bg-red-950/20 focus:border-red-500';
      }
    }
    return 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/10 dark:bg-emerald-950/10 focus:border-emerald-600';
  }
  return 'border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/40 focus:border-lux-gold';
}

export interface UseRequestFormReturn {
  form: RequestForm;
  activeRequests: CustomCakeRequest[];
  formSubmitted: boolean;
  submittedId: string;
  valError: string | null;
  dateError: string | null;
  uploading: boolean;
  uploadedImageUrl: string | null;
  uploadError: string | null;
  submitting: boolean;
  isDragging: boolean;
  getMinDateString: () => string;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleDragOver: (e: React.DragEvent) => void;
  handleDragEnter: (e: React.DragEvent) => void;
  handleDragLeave: (e: React.DragEvent) => void;
  handleDrop: (e: React.DragEvent) => void;
  deleteRequest: (id: string) => Promise<void>;
  handleSubmit: (e: React.SyntheticEvent<HTMLFormElement>) => Promise<void>;
  resetForm: () => void;
  availability: AvailabilityResponse | undefined;
  availabilityLoading: boolean;
}

export function useRequestForm(
  prefilledCake: Product | null,
  onClearPrefilledCake: () => void,
  currentUser?: User | null,
) {
  const { showToast } = useToast();
  const { data: availability, isLoading: availabilityLoading } = useAvailability();
  const [form, setForm] = useState<RequestForm>(DEFAULT_FORM);
  const [activeRequests, setActiveRequests] = useState<CustomCakeRequest[]>([]);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [submittedId, setSubmittedId] = useState('');
  const [valError, setValError] = useState<string | null>(null);
  const [dateError, setDateError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const getMinDateString = () => {
    const minDate = new Date();
    const hours = availability?.minimumLeadTimeHours ?? 24;
    minDate.setTime(minDate.getTime() + hours * 60 * 60 * 1000);
    return minDate.toISOString().split('T')[0];
  };

  useEffect(() => {
    if (currentUser) {
      setForm((prev) => ({
        ...prev,
        contactName: currentUser.name || '',
        contactPhone: currentUser.telegramPhone || '',
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

  const fetchRequests = useCallback(async () => {
    try {
      const { data } = await http.get<ApiResponse<{ requests: CustomCakeRequest[] }>>('/api/requests');
      if (data.success) {
        setActiveRequests(data.requests);
      }
    } catch {
      const list = localStorage.getItem('fb_request_orders');
      if (list) {
        try { setActiveRequests(JSON.parse(list)); } catch (parseErr) { console.error('Failed to parse cached requests from localStorage:', parseErr); }
      }
    }
  }, []);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    if (name === 'eventDate') {
      const minDateStr = getMinDateString();
      if (!value) {
        setDateError('Event date is required.');
      } else if (value < minDateStr) {
        const hours = availability?.minimumLeadTimeHours ?? 24;
        setDateError(`Minimum notice of ${hours} hours is required. Please choose ${new Date(minDateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} or later.`);
      } else if (availability && !availability.days[new Date(value).getDay() === 0 ? 'sunday' : new Date(value).getDay() === 1 ? 'monday' : new Date(value).getDay() === 2 ? 'tuesday' : new Date(value).getDay() === 3 ? 'wednesday' : new Date(value).getDay() === 4 ? 'thursday' : new Date(value).getDay() === 5 ? 'friday' : 'saturday']) {
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const dayName = dayNames[new Date(value).getDay()];
        setDateError(`Orders for ${dayName} are not currently accepted. Please choose an available day.`);
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
      const { data } = await http.post<ApiResponse<{ image: { url: string } }>>('/api/uploads/image', {
        fileName: file.name,
        mimeType: file.type,
        size: file.size,
        dataBase64,
      });
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
    if (file?.type.startsWith('image/')) uploadFile(file);
  };

  const deleteRequest = async (id: string) => {
    let deletedOnBackend = false;
    try {
      const { data } = await http.delete<ApiResponse>(`/api/requests/${id}`);
      if (data.success) { deletedOnBackend = true; fetchRequests(); }
    } catch (deleteErr) { console.error(`Failed to delete request ${id} from backend:`, deleteErr); }
    if (!deletedOnBackend) {
      const updated = activeRequests.filter((item) => item.id !== id);
      setActiveRequests(updated);
      localStorage.setItem('fb_request_orders', JSON.stringify(updated));
    }
  };

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!form.contactName || !form.contactPhone || !form.eventDate) {
      setValError('Please fill in your name, phone, and event date.');
      return;
    }
    const minDateStr = getMinDateString();
    if (form.eventDate < minDateStr) {
      const hours = availability?.minimumLeadTimeHours ?? 24;
      setValError(`Minimum notice of ${hours} hours is required. Please choose ${new Date(minDateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} or later.`);
      return;
    }

    if (availability && !availability.days[new Date(form.eventDate).getDay() === 0 ? 'sunday' : new Date(form.eventDate).getDay() === 1 ? 'monday' : new Date(form.eventDate).getDay() === 2 ? 'tuesday' : new Date(form.eventDate).getDay() === 3 ? 'wednesday' : new Date(form.eventDate).getDay() === 4 ? 'thursday' : new Date(form.eventDate).getDay() === 5 ? 'friday' : 'saturday']) {
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const dayName = dayNames[new Date(form.eventDate).getDay()];
      setValError(`Orders for ${dayName} are not currently accepted. Please choose an available day.`);
      return;
    }

    setValError(null);
    setDateError(null);
    setSubmitting(true);

    const uniqueId = generateRequestId();

    const newInquiry: CustomCakeRequest = {
      id: uniqueId,
      contactName: form.contactName,
      contactPhone: form.contactPhone,
      eventType: 'Other',
      guestCount: 20,
      eventDate: form.eventDate,
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
    try {
      const { data } = await http.post<ApiResponse>('/api/requests', newInquiry);
      if (data.success) { savedOnBackend = true; fetchRequests(); }
    } catch (saveErr) { console.error('Failed to save request to backend:', saveErr); }

    if (!savedOnBackend) {
      const nextList = [newInquiry, ...activeRequests];
      setActiveRequests(nextList);
      localStorage.setItem('fb_request_orders', JSON.stringify(nextList));
    }

    setSubmittedId(uniqueId);
    setFormSubmitted(true);
    setSubmitting(false);
    onClearPrefilledCake();
    showToast(t('order.inquiryFiled'), t('order.submittedSuccess', { id: uniqueId }), 'majestic', 7000);
  };

  const resetForm = () => {
    setFormSubmitted(false);
    setForm(DEFAULT_FORM);
    setUploadedImageUrl(null);
  };

  return {
    form,
    activeRequests,
    formSubmitted,
    submittedId,
    valError,
    dateError,
    uploading,
    uploadedImageUrl,
    uploadError,
    submitting,
    isDragging,
    getMinDateString,
    handleInputChange,
    handleFileChange,
    handleDragOver,
    handleDragEnter,
    handleDragLeave,
    handleDrop,
    deleteRequest,
    handleSubmit,
    resetForm,
    availability,
    availabilityLoading,
  } as UseRequestFormReturn;
}