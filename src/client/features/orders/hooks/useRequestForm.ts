import { useState, useEffect, useCallback } from 'react';
import { CustomCakeRequest, Product, User, AvailabilityResponse } from '@shared/types';
import { useToast } from '../../../components/Toast';
import { t } from '@client/i18n/index';
import { http } from '@client/lib/http';
import type { ApiResponse } from '@/shared/api';
import { useAvailability } from '../../admin/hooks/useAvailability';
import { useFileUpload } from './useFileUpload';
import { useRequestManagement } from './useRequestManagement';

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

const DAY_NAMES = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
const DAY_NAMES_DISPLAY = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function getDayKey(dateString: string): string {
  return DAY_NAMES[new Date(dateString).getDay()];
}

function getDayDisplayName(dateString: string): string {
  return DAY_NAMES_DISPLAY[new Date(dateString).getDay()];
}

function isDayAvailable(dateString: string, availability: { days: Record<string, boolean> } | undefined): boolean {
  if (!availability?.days) return true;
  const dayKey = getDayKey(dateString);
  return availability.days[dayKey] !== false;
}

export function getDateValidationError(
  dateString: string,
  minDateStr: string,
  availability?: { minimumLeadTimeHours: number; days: Record<string, boolean> }
): string | null {
  if (!dateString) return 'Event date is required.';
  if (dateString < minDateStr) {
    const hours = availability?.minimumLeadTimeHours ?? 24;
    return `Minimum notice of ${hours} hours is required. Please choose ${new Date(minDateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} or later.`;
  }
  if (!isDayAvailable(dateString, availability)) {
    return `Orders for ${getDayDisplayName(dateString)} are not currently accepted. Please choose an available day.`;
  }
  return null;
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
    if (!isDayAvailable(eventDate, availability)) {
      return 'border-red-300 dark:border-red-900 bg-red-50/30 dark:bg-red-950/20 focus:border-red-500';
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
): UseRequestFormReturn {
  const { showToast } = useToast();
  const { data: availability, isLoading: availabilityLoading } = useAvailability();
  const { uploading, uploadedImageUrl, uploadError, isDragging, handleFileChange, handleDragOver, handleDragEnter, handleDragLeave, handleDrop, clearUploadedImage } = useFileUpload();
  const { activeRequests, setActiveRequests, fetchRequests, deleteRequest } = useRequestManagement();

  const [form, setForm] = useState<RequestForm>(DEFAULT_FORM);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [submittedId, setSubmittedId] = useState('');
  const [valError, setValError] = useState<string | null>(null);
  const [dateError, setDateError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const getMinDateString = useCallback(() => {
    const minDate = new Date();
    const hours = availability?.minimumLeadTimeHours ?? 24;
    minDate.setTime(minDate.getTime() + hours * 60 * 60 * 1000);
    return minDate.toISOString().split('T')[0];
  }, [availability]);

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

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setForm((prev) => ({ ...prev, [name]: value }));

      if (name === 'eventDate') {
        const minDateStr = getMinDateString();
        const error = getDateValidationError(value, minDateStr, availability);
        setDateError(error);
      }
    },
    [getMinDateString, availability]
  );

  const handleSubmit = useCallback(
    async (e: React.SyntheticEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!form.contactName || !form.contactPhone || !form.eventDate) {
        setValError('Please fill in your name, phone, and event date.');
        return;
      }
      const minDateStr = getMinDateString();
      const error = getDateValidationError(form.eventDate, minDateStr, availability);
      if (error) {
        setValError(error);
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
      clearUploadedImage();
      showToast(t('order.inquiryFiled'), t('order.submittedSuccess', { id: uniqueId }), 'majestic', 7000);
    },
    [
      form,
      getMinDateString,
      availability,
      uploadedImageUrl,
      activeRequests,
      fetchRequests,
      onClearPrefilledCake,
      clearUploadedImage,
      showToast,
    ]
  );

  const resetForm = useCallback(() => {
    setFormSubmitted(false);
    setForm(DEFAULT_FORM);
    clearUploadedImage();
  }, [clearUploadedImage]);

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
  };
}