import { useState } from 'react';
import { Save, Loader2, RotateCcw } from 'lucide-react';
import { useAvailability, useUpdateAvailability } from '../hooks/useAvailability';
import type { AvailabilityPolicy } from '@shared/types';

const DAYS: { key: keyof AvailabilityPolicy; label: string }[] = [
  { key: 'mondayEnabled', label: 'Monday' },
  { key: 'tuesdayEnabled', label: 'Tuesday' },
  { key: 'wednesdayEnabled', label: 'Wednesday' },
  { key: 'thursdayEnabled', label: 'Thursday' },
  { key: 'fridayEnabled', label: 'Friday' },
  { key: 'saturdayEnabled', label: 'Saturday' },
  { key: 'sundayEnabled', label: 'Sunday' },
] as const;

export default function AdminAvailability() {
  const { data: availability, isLoading, isError, refetch } = useAvailability();
  const updateMutation = useUpdateAvailability();

  const [policy, setPolicy] = useState<AvailabilityPolicy>({
    isEnabled: true,
    timezone: 'Africa/Addis_Ababa',
    minimumLeadTimeHours: 24,
    mondayEnabled: false,
    tuesdayEnabled: false,
    wednesdayEnabled: false,
    thursdayEnabled: false,
    fridayEnabled: false,
    saturdayEnabled: true,
    sundayEnabled: true,
  });

  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = <K extends keyof AvailabilityPolicy>(k: K, value: AvailabilityPolicy[K]) => {
    setPolicy(prev => ({ ...prev, [k]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('saving');
    setErrorMessage('');

    try {
      const input: Partial<{
        isEnabled: boolean;
        timezone: string;
        minimumLeadTimeHours: number;
        mondayEnabled: boolean;
        tuesdayEnabled: boolean;
        wednesdayEnabled: boolean;
        thursdayEnabled: boolean;
        fridayEnabled: boolean;
        saturdayEnabled: boolean;
        sundayEnabled: boolean;
      }> = { ...policy };

      await updateMutation.mutateAsync(input);
      setStatus('saved');
      setTimeout(() => setStatus('idle'), 2000);
      refetch();
    } catch (err: any) {
      setStatus('error');
      setErrorMessage(err.message || 'Failed to save');
    }
  };

  const handleReset = () => {
    if (availability) {
      setPolicy({
        isEnabled: availability.isEnabled,
        timezone: availability.timezone,
        minimumLeadTimeHours: availability.minimumLeadTimeHours,
        mondayEnabled: availability.days.monday,
        tuesdayEnabled: availability.days.tuesday,
        wednesdayEnabled: availability.days.wednesday,
        thursdayEnabled: availability.days.thursday,
        fridayEnabled: availability.days.friday,
        saturdayEnabled: availability.days.saturday,
        sundayEnabled: availability.days.sunday,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto py-12 text-center">
        <div className="w-8 h-8 border-2 border-lux-gold border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-stone-500 dark:text-stone-400">Loading availability settings...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="max-w-3xl mx-auto py-12 text-center">
        <p className="text-red-500 dark:text-red-400">Failed to load availability settings</p>
        <button onClick={() => refetch()} className="mt-4 px-4 py-2 bg-lux-gold text-stone-950 font-mono text-xs uppercase font-bold rounded-sm hover:bg-white transition-colors">
          Retry
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl mx-auto space-y-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="font-serif text-2xl text-stone-900 dark:text-white">Order Availability</h2>
          <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
            Configure which days customers can place orders and the minimum notice required.
          </p>
        </div>
      </div>

      {/* Global Toggle */}
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-sm p-6 space-y-6">
        <h3 className="font-serif text-lg text-stone-900 dark:text-white">Global Settings</h3>
        
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-3 cursor-pointer">
            <div>
              <span className="text-sm font-medium text-stone-900 dark:text-white">Ordering Enabled</span>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">Enable or disable all order requests globally</p>
            </div>
            <span className="relative inline-flex items-center" aria-hidden="true" role="presentation">
              <input
                id="ordering-enabled"
                type="checkbox"
                checked={policy.isEnabled}
                onChange={(e) => handleChange('isEnabled', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-stone-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-lux-gold/30 dark:peer-focus:ring-lux-gold/50 dark:bg-stone-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-stone-600 peer-checked:bg-lux-gold"></div>
            </span>
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-stone-200 dark:border-stone-800">
          <label className="flex flex-col gap-1">
            <span className="text-[10px] uppercase tracking-wider font-mono text-stone-500 dark:text-stone-400">Timezone</span>
            <select
              id="timezone-select"
              value={policy.timezone}
              onChange={(e) => handleChange('timezone', e.target.value)}
              className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-2 text-sm focus:outline-none focus:border-lux-gold rounded-sm"
            >
              <option value="Africa/Addis_Ababa">Africa/Addis_Ababa (EAT)</option>
              <option value="UTC">UTC</option>
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[10px] uppercase tracking-wider font-mono text-stone-500 dark:text-stone-400">Minimum Lead Time (hours)</span>
            <input
              id="lead-time-input"
              type="number"
              min="0"
              max="168"
              value={policy.minimumLeadTimeHours}
              onChange={(e) => handleChange('minimumLeadTimeHours', parseInt(e.target.value) || 0)}
              className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-2 text-sm focus:outline-none focus:border-lux-gold rounded-sm"
            />
          </label>
        </div>
      </div>

      {/* Weekday Toggles */}
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-sm p-6 space-y-6">
        <h3 className="font-serif text-lg text-stone-900 dark:text-white">Available Days</h3>
        <p className="text-sm text-stone-500 dark:text-stone-400">Select which days customers can schedule their orders for</p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {DAYS.map(({ key, label }) => {
            const checkboxId = `day-${key}`;
            return (
              <label key={key} className="flex items-center justify-between p-4 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-sm cursor-pointer hover:border-lux-gold/50 transition-colors">
                <span className="font-medium text-stone-900 dark:text-white capitalize">{label}</span>
                <span className="relative inline-flex items-center" aria-hidden="true" role="presentation">
                  <input
                    id={checkboxId}
                    type="checkbox"
                    checked={policy[key] as boolean}
                    onChange={(e) => handleChange(key, e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-stone-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-lux-gold/30 dark:peer-focus:ring-lux-gold/50 dark:bg-stone-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-stone-600 peer-checked:bg-lux-gold"></div>
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Error/Success Message */}
      {status === 'error' && (
        <div className="p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 rounded-sm flex items-center gap-2">
          <span>{errorMessage}</span>
        </div>
      )}
      {status === 'saved' && (
        <div className="p-4 bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-900 text-green-700 dark:text-green-300 rounded-sm flex items-center gap-2">
          <span>Settings saved successfully!</span>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-4 pt-4 border-t border-stone-200 dark:border-stone-800">
        <button
          type="button"
          onClick={handleReset}
          className="px-4 py-2.5 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 font-mono text-[10px] uppercase font-bold tracking-wider rounded-sm transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
          Reset
        </button>
        <button
          type="submit"
          disabled={updateMutation.isPending}
          className="px-6 py-2.5 bg-lux-gold text-stone-950 font-bold text-[10px] uppercase tracking-wider rounded-sm hover:bg-white transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-2"
        >
          {updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Changes
        </button>
      </div>
    </form>
  );
}