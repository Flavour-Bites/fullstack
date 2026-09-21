import { AnimatePresence, motion } from 'motion/react';
import { MessageSquare, X } from 'lucide-react';
import { t } from '@client/i18n/index';

interface ChatToggleButtonProps {
  isOpen: boolean;
  onToggle: () => void;
}

export default function ChatToggleButton({ isOpen, onToggle }: ChatToggleButtonProps) {
  return (
    <div className="fixed bottom-6 right-6 z-50">
      <motion.button
        onClick={onToggle}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`w-14 h-14 rounded-full flex items-center justify-center shadow-2xl relative cursor-pointer border transition-colors outline-none ${
          isOpen
            ? 'bg-stone-900 border-stone-800 text-lux-gold'
            : 'bg-lux-gold border-lux-gold/40 text-stone-950 hover:bg-stone-900 hover:text-lux-gold hover:border-stone-800'
        }`}
        aria-label={t('bot.toggleChat')}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close-icon"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex items-center justify-center"
            >
              <X className="w-6 h-6 stroke-[1.5]" />
            </motion.div>
          ) : (
            <motion.div
              key="chat-icon"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex items-center justify-center relative"
            >
              <MessageSquare className="w-6 h-6 stroke-[1.5]" />
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-stone-900 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-stone-950" />
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}