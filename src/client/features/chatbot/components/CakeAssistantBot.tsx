import { AnimatePresence, motion } from 'motion/react';
import { useLocation } from 'react-router-dom';
import { useCakeChat } from '../hooks/useCakeChat';
import ChatToggleButton from './chat/ChatToggleButton';
import ChatHeader from './chat/ChatHeader';
import ChatMessageRow from './chat/ChatMessageRow';
import TypingLoader from './chat/TypingLoader';
import ChatErrorBanner from './chat/ChatErrorBanner';
import PresetQuestions from './chat/PresetQuestions';
import ChatInput from './chat/ChatInput';

export default function CakeAssistantBot() {
  const chat = useCakeChat();
  const location = useLocation();
  const HIDE_ON_PATHS = ['/request', '/admin'];

  if (HIDE_ON_PATHS.some(path => location.pathname.startsWith(path))) {
    return null;
  }

  return (
    <>
      <ChatToggleButton isOpen={chat.isOpen} onToggle={() => chat.setIsOpen(!chat.isOpen)} />

      <AnimatePresence>
        {chat.isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="fixed bottom-24 right-4 sm:right-6 w-[92vw] sm:w-[410px] h-[600px] max-h-[75vh] bg-white border border-stone-200 shadow-2xl rounded-sm z-50 overflow-hidden flex flex-col font-sans"
          >
            <ChatHeader onClear={chat.clearChatHistory} onClose={() => chat.setIsOpen(false)} />

            <div className="flex-grow p-4 overflow-y-auto bg-lux-cream/20 space-y-4">
              {chat.messages.map((msg) => (
                <ChatMessageRow key={msg.id} message={msg} />
              ))}

              {chat.isLoading && <TypingLoader />}

              <ChatErrorBanner errorStatus={chat.errorStatus} />

              <div ref={chat.endOfMessagesRef} />
            </div>

            {!chat.isLoading && (
              <PresetQuestions onSelect={chat.handleSendMessage} />
            )}

            <ChatInput
              value={chat.inputValue}
              loading={chat.isLoading}
              onSubmit={chat.handleSubmit}
              onChange={chat.handleInputChange}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}