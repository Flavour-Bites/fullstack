import { useState } from 'react';
import { http } from '@client/lib/http';
import type { ApiResponse } from '@/shared/api';

export interface ContactFormState {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const INITIAL_FORM: ContactFormState = {
  name: '',
  email: '',
  subject: 'Consultation',
  message: '',
};

const SUBMISSION_RESET_DELAY_MS = 15000;

export function useContactForm() {
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [contactForm, setContactForm] = useState<ContactFormState>(INITIAL_FORM);
  const [valError, setValError] = useState<string | null>(null);

  const handleFieldChange = (field: keyof ContactFormState, value: string) => {
    setContactForm((prev) => ({ ...prev, [field]: value }));
  };

  const resetSubmitted = () => setFormSubmitted(false);

  const handleContactSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.email || !contactForm.message) {
      setValError('Please fill out Name, Email, and Message.');
      return;
    }
    setValError(null);
    setSending(true);
    try {
      const { data } = await http.post<ApiResponse>('/api/contact', contactForm);
      if (!data.success) throw new Error(data.error || 'Failed to send message');
      setFormSubmitted(true);
      setTimeout(() => {
        setFormSubmitted(false);
        setContactForm(INITIAL_FORM);
      }, SUBMISSION_RESET_DELAY_MS);
    } catch (err: any) {
      setValError(err.message);
    } finally {
      setSending(false);
    }
  };

  return {
    formSubmitted,
    sending,
    contactForm,
    valError,
    handleFieldChange,
    resetSubmitted,
    handleContactSubmit,
  };
}