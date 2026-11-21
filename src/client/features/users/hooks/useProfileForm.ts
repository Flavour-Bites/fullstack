import { useState, useEffect } from 'react';
import { User as UserType } from '@shared/types';
import { http } from '@client/lib/http';
import type { ApiResponse } from '@/shared/api';

export const DIETARY_OPTIONS = ['Gluten-Free', 'Vegan', 'Dairy-Free', 'Nut Allergy', 'Egg-Free'];

const SAVE_SUCCESS_NOTIFICATION_DURATION_MS = 3000;

export type ProfileTab = 'personal' | 'preferences' | 'notifications' | 'security';

export function useProfileForm(currentUser: UserType, onUpdateUser?: (updated: UserType) => void) {
  const [activeTab, setActiveTab] = useState<ProfileTab>('personal');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [name, setName] = useState(currentUser.name || '');
  const [phone, setPhone] = useState(currentUser.telegramPhone || '');
  const [dietary, setDietary] = useState<string[]>(currentUser.dietaryPreferences || []);
  const [language, setLanguage] = useState(currentUser.language || 'en');
  const [notify, setNotify] = useState(currentUser.notifyViaTelegram ?? true);

  // Sync internal state if currentUser prop changes
  useEffect(() => {
    setName(currentUser.name || '');
    setPhone(currentUser.telegramPhone || '');
    setDietary(currentUser.dietaryPreferences || []);
    setLanguage(currentUser.language || 'en');
    setNotify(currentUser.notifyViaTelegram ?? true);
  }, [currentUser]);

  const handleSave = async (e?: React.SyntheticEvent) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      const { data } = await http.put<ApiResponse<{ user: UserType }>>('/api/auth/me', {
        name,
        telegramPhone: phone,
        dietaryPreferences: dietary,
        language,
        notifyViaTelegram: notify,
      });

      if (data.success && data.user) {
        if (onUpdateUser) onUpdateUser(data.user);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), SAVE_SUCCESS_NOTIFICATION_DURATION_MS);
      }
    } catch (err) {
      console.error('Failed to update profile:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const toggleDietary = (pref: string) => {
    setDietary((prev) =>
      prev.includes(pref) ? prev.filter((p) => p !== pref) : [...prev, pref],
    );
  };

  return {
    activeTab,
    setActiveTab,
    isSaving,
    saveSuccess,
    name,
    setName,
    phone,
    setPhone,
    dietary,
    language,
    setLanguage,
    notify,
    setNotify,
    handleSave,
    toggleDietary,
  };
}