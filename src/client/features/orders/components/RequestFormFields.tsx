import { Send, Loader2 } from 'lucide-react';
import { CakeGalleryItem } from '@shared/types';
import { t } from '@client/i18n/index';
import ReferenceImageUploader from './ReferenceImageUploader';
import { getDateInputStyles, RequestForm } from '../hooks/useRequestForm';

interface RequestFormFieldsProps {
  form: RequestForm;
  prefilledCake: CakeGalleryItem | null;
  valError: string | null;
  dateError: string | null;
  uploading: boolean;
  uploadedImageUrl: string | null;
  uploadError: string | null;
  isDragging: boolean;
  submitting: boolean;
  getMinDateString: () => string;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragEnter: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onClearPrefilledCake: () => void;
  onSubmit: (e: React.SyntheticEvent<HTMLFormElement>) => void;
}

export default function RequestFormFields({
  form,
  prefilledCake,
  valError,
  dateError,
  uploading,
  uploadedImageUrl,
  uploadError,
  isDragging,
  submitting,
  getMinDateString,
  onInputChange,
  onFileChange,
  onDragOver,
  onDragEnter,
  onDragLeave,
  onDrop,
  onClearPrefilledCake,
  onSubmit,
}: RequestFormFieldsProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-6" id="cake-custom-form">
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
              onChange={onInputChange}
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
              onChange={onInputChange}
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
              {t('order.targetDate')} *
            </label>
            {form.deliveryDate && !dateError && (
              <span className="text-[9px] uppercase font-mono text-emerald-600 dark:text-emerald-400 font-bold tracking-wider flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />{' '}
                Notice Met
              </span>
            )}
          </div>
          <input
            type="date"
            name="deliveryDate"
            value={form.deliveryDate}
            onChange={onInputChange}
            min={getMinDateString()}
            required
            className={`w-full border p-3 text-sm focus:outline-none rounded-sm font-mono transition-colors text-stone-850 dark:text-stone-100 ${getDateInputStyles(dateError, form.deliveryDate)}`}
          />
          {dateError ? (
            <p className="text-[10px] text-red-500 dark:text-red-400 font-sans mt-1 leading-normal font-medium">{dateError}</p>
          ) : (
            <span className="text-[10px] text-stone-400 mt-1 block">Minimum 48 hours notice required.</span>
          )}
        </div>

        <div>
          <label htmlFor="cakeDescription" className="text-[10px] uppercase font-mono tracking-widest text-stone-500 dark:text-stone-400 font-bold block mb-1">Cake Description & Vision *</label>
          <textarea
            id="cakeDescription"
            name="cakeDescription"
            value={form.cakeDescription}
            onChange={onInputChange}
            rows={4}
            placeholder="Describe your ideal cake — colours, theme, size, any inspiration photos..."
            required
            className="w-full border border-stone-200 dark:border-stone-800 p-3 text-sm focus:outline-none focus:border-lux-gold bg-stone-50/50 dark:bg-stone-900/40 text-stone-800 dark:text-stone-100 rounded-sm"
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-stone-150 dark:border-stone-800 pb-2">
          <span className="w-5 h-5 rounded-full bg-stone-900 dark:bg-stone-800 text-white flex items-center justify-center text-[10px] font-semibold font-mono">3</span>
          <h3 className="font-serif text-lg text-stone-900 dark:text-stone-100 uppercase tracking-wide">Reference (Optional)</h3>
        </div>

        <ReferenceImageUploader
          uploading={uploading}
          uploadedImageUrl={uploadedImageUrl}
          uploadError={uploadError}
          isDragging={isDragging}
          onFileChange={onFileChange}
          onDragOver={onDragOver}
          onDragEnter={onDragEnter}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
        />
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
  );
}