import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, X, Send, Sparkles, Trash2, ShieldAlert, Cake } from 'lucide-react';
import { t } from '../../../i18n/index';
import type { PageType } from '../../../types';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

const PRESET_QUESTIONS = [
  { text: "🍰 Recommend unique flavor pairings", label: t('bot.flavorPairings') },
  { text: "💰 What are your custom cake pricing estimates?", label: t('bot.pricingEstimates') },
  { text: "📅 How far in advance do I need to book?", label: t('bot.bookingLeadTimes') },
  { text: "📍 What are the pickup address and delivery fees?", label: t('bot.deliveryRates') },
  { text: "🌱 Do you offer gluten-free or egg-free options?", label: t('bot.dietaryCustomization') }
];

interface CakeAssistantBotProps {
  activePage?: PageType;
}

export default function CakeAssistantBot({ activePage }: CakeAssistantBotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      text: t('bot.welcome'),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);

  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  const HIDE_ON_PAGES: PageType[] = ['request', 'admin'];

  useEffect(() => {
    if (endOfMessagesRef.current) {
      endOfMessagesRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    setErrorStatus(null);
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const historyToSend = [...messages, userMessage].map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        text: msg.text
      }));

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: historyToSend })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'Server responded with an error');
      }

      const data = await response.json();
      if (data.success && data.text) {
        setMessages(prev => [
          ...prev,
          {
            id: `assistant-${Date.now()}`,
            role: 'assistant',
            text: data.text,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      } else {
        throw new Error('Incomplete response received from custom cake bot server.');
      }
    } catch (err: any) {
      console.error('Chat bot API error:', err);
      setErrorStatus(err.message || t('bot.geminiNotConfigured'));
    } finally {
      setIsLoading(false);
    }
  };

  const clearChatHistory = () => {
    if (window.confirm(t('bot.clearConfirm'))) {
      setMessages([
        {
          id: 'welcome-reset',
          role: 'assistant',
          text: t('bot.cleared'),
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      setErrorStatus(null);
    }
  };

  const renderMessageTextPart = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      const trimmed = line.trim();
      const isBullet = trimmed.startsWith('*') || trimmed.startsWith('-');
      let content = line;
      if (isBullet) {
        content = trimmed.replace(/^[\*\-]\s*/, '');
      }

      const parts = content.split(/(\*\*.*?\*\*)/g);
      const elements = parts.map((part, pIdx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <strong key={pIdx} className="font-semibold text-stone-900 underline decoration-lux-gold/30">
              {part.slice(2, -2)}
            </strong>
          );
        }
        return part;
      });

      if (isBullet) {
        return (
          <li key={idx} className="ml-4 list-disc text-stone-750 font-light text-xs my-0.5 font-sans leading-relaxed">
            {elements}
          </li>
        );
      }

      return (
        <p key={idx} className="text-stone-750 font-light text-xs my-1 font-sans leading-relaxed min-h-[0.8em]">
          {elements}
        </p>
      );
    });
  };

  if (activePage && HIDE_ON_PAGES.includes(activePage)) {
    return null;
  }

  return (
    <>
      {/* Floating Action Trigger Badge */}
      <div className="fixed bottom-6 right-6 z-50">
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
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

      {/* Slide-out Drawer Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="fixed bottom-24 right-4 sm:right-6 w-[92vw] sm:w-[410px] h-[600px] max-h-[75vh] bg-white border border-stone-200 shadow-2xl rounded-sm z-50 overflow-hidden flex flex-col font-sans"
          >
            {/* Elegant Premium Atelier Header */}
            <div className="bg-[#1e1a15] text-white p-4 flex items-center justify-between border-b border-lux-gold/25 relative">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-md bg-stone-900 border border-lux-gold/30 flex items-center justify-center text-lux-gold">
                  <Cake className="w-4.5 h-4.5 stroke-[1.5]" />
                </div>
                <div>
                  <h3 className="font-serif text-sm tracking-wider text-white font-medium flex items-center gap-1.5">
                    {t('bot.title')}
                    <span className="px-1.5 py-0.5 bg-lux-gold/15 text-lux-gold text-[8px] uppercase tracking-widest font-mono font-bold rounded-xs border border-lux-gold/20">
                      {t('bot.live')}
                    </span>
                  </h3>
                  <span className="text-[9px] uppercase tracking-wider text-stone-400 font-mono font-semibold block">{t('bot.subtitle')}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={clearChatHistory}
                  title="Clear chat log"
                  className="p-1 px-1.5 rounded-xs hover:bg-stone-850/60 text-stone-400 hover:text-red-400 transition-colors cursor-pointer"
                  aria-label={t('bot.clearLog')}
                >
                  <Trash2 className="w-4 h-4 shrink-0" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-full hover:bg-stone-850/80 text-stone-400 hover:text-white transition-colors cursor-pointer"
                  aria-label={t('bot.closePanel')}
                >
                  <X className="w-4 h-4 shrink-0" />
                </button>
              </div>
              {/* Subtle gold line accent */}
              <div className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-lux-gold/70 to-transparent" />
            </div>

            {/* Chat Flow Scroll Area */}
            <div className="flex-grow p-4 overflow-y-auto bg-lux-cream/20 space-y-4">
              {messages.map((msg) => {
                const isBot = msg.role === 'assistant';
                return (
                  <div
                    key={msg.id}
                    className={`flex gap-2.5 max-w-[85%] ${isBot ? 'mr-auto items-start' : 'ml-auto flex-row-reverse items-end'}`}
                  >
                    {/* Avatar Element */}
                    <div className={`w-6.5 h-6.5 rounded-full flex items-center justify-center shrink-0 border ${
                      isBot 
                        ? 'bg-stone-900 border-lux-gold/30 text-lux-gold' 
                        : 'bg-lux-gold border-stone-200/50 text-stone-950 font-serif font-bold text-[10px]'
                    }`}>
                      {isBot ? <Sparkles className="w-3 h-3" /> : 'FB'}
                    </div>

                    {/* Chat Bubble Container */}
                    <div className="space-y-1">
                      <div className={`p-3.5 rounded-sm relative text-xs leading-relaxed border ${
                        isBot 
                          ? 'bg-white border-stone-200 text-stone-850 rounded-tl-none shadow-xs' 
                          : 'bg-[#1e1a15] border-stone-800 text-white rounded-br-none shadow-sm'
                      }`}>
                        {isBot ? (
                          <div className="space-y-2">{renderMessageTextPart(msg.text)}</div>
                        ) : (
                          <p className="font-sans font-light text-xs text-stone-100">{msg.text}</p>
                        )}
                      </div>
                      <span className={`text-[8px] text-stone-400 font-mono block ${isBot ? 'text-left pl-1' : 'text-right pr-1'}`}>
                        {msg.timestamp}
                      </span>
                    </div>
                  </div>
                );
              })}

              {/* Loader Typing State */}
              {isLoading && (
                <div className="flex gap-2.5 max-w-[85%] mr-auto items-start animate-pulse">
                  <div className="w-6.5 h-6.5 rounded-full flex items-center justify-center shrink-0 bg-stone-900 border border-lux-gold/30 text-lux-gold">
                    <Sparkles className="w-3 h-3" />
                  </div>
                  <div className="space-y-1">
                    <div className="bg-white border border-stone-150 p-3.5 rounded-sm rounded-tl-none text-stone-500 flex items-center gap-2">
                      <div className="flex gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-lux-gold animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-lux-gold animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-lux-gold animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                      <span className="text-[10px] font-mono tracking-wider text-stone-400 uppercase font-semibold">{t('bot.consulting')}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Error Guard View */}
              {errorStatus && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xs font-sans flex items-start gap-2.5">
                  <ShieldAlert className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
                  <div>
                    <span className="font-semibold block text-red-955 mb-0.5">{t('bot.connectionBlocked')}</span>
                    <p className="text-[11px] leading-relaxed text-red-600">{errorStatus}</p>
                  </div>
                </div>
              )}

              <div ref={endOfMessagesRef} />
            </div>

            {/* Quick-reply Suggestion Drawer Chips: only shown when loading is false */}
            {!isLoading && (
              <div className="px-3 py-2 bg-stone-50/80 border-t border-b border-stone-150 flex gap-1.5 overflow-x-auto no-scrollbar scroll-smooth">
                {PRESET_QUESTIONS.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(q.text)}
                    className="shrink-0 px-2.5 py-1 bg-white hover:bg-stone-100 border border-stone-200 text-[10px] text-stone-650 hover:text-stone-900 rounded-full transition-colors cursor-pointer font-sans"
                  >
                    {q.label}
                  </button>
                ))}
              </div>
            )}

            {/* Send Input Area Form */}
            <form
              onSubmit={(e) => { e.preventDefault(); handleSendMessage(inputValue); }}
              className="p-3 bg-white border-t border-stone-200 flex gap-2 items-center"
              id="assistant-chat-form"
            >
              <input
                type="text"
                disabled={isLoading}
                placeholder={t('bot.inputPlaceholder')}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="flex-grow bg-stone-50 border border-stone-205 focus:outline-none focus:ring-1 focus:ring-lux-gold focus:border-lux-gold px-3 py-2.5 text-xs text-stone-800 placeholder-stone-400 rounded-sm transition-all disabled:opacity-60 font-sans"
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || isLoading}
                className="w-9 h-9 bg-stone-900 border border-stone-850 hover:bg-lux-gold text-white hover:text-stone-950 flex items-center justify-center shrink-0 rounded-sm transition-all disabled:opacity-40 disabled:hover:bg-stone-900 disabled:hover:text-white cursor-pointer"
                aria-label={t('bot.sendQuery')}
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
