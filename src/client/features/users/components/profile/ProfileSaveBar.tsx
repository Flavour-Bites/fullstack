import { AnimatePresence, motion } from 'motion/react';
import { CheckCircle2 } from 'lucide-react';

interface SaveBarProps {
  visible: boolean;
  isSaving: boolean;
  saveSuccess: boolean;
  onSave: () => void;
}

export default function ProfileSaveBar({ visible, isSaving, saveSuccess, onSave }: SaveBarProps) {
  if (!visible) return null;

  return (
    <div className="mt-12 pt-6 border-t border-stone-100 dark:border-stone-850/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <p className="text-[10px] text-stone-400 dark:text-stone-500 italic font-light">
        * Verify your details before finalizing modifications.
      </p>
      <div className="flex items-center justify-end gap-4 shrink-0">
        <AnimatePresence>
          {saveSuccess && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex items-center gap-2 text-green-600 dark:text-green-400 text-xs font-mono font-medium"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Changes saved</span>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={onSave}
          disabled={isSaving}
          className="px-6 py-2.5 bg-stone-900 dark:bg-stone-800 hover:bg-lux-gold text-white hover:text-stone-950 font-mono text-[10px] uppercase font-bold tracking-widest rounded-xs transition-all duration-300 disabled:opacity-50 flex items-center gap-2 shadow-md hover:shadow-lux-gold/10 cursor-pointer"
        >
          {isSaving ? (
            <>
              <span className="w-3 h-3 border-2 border-stone-950 border-t-transparent rounded-full animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            <span>Save Changes</span>
          )}
        </button>
      </div>
    </div>
  );
}