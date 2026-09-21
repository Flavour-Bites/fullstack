import { useState, useRef, useEffect, useCallback } from 'react';
import { t } from '@client/i18n/index';
import { http } from '@client/lib/http';
import type { ApiResponse } from '@/shared/api';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export const PRESET_QUESTIONS = [
  { text: "🍰 Recommend unique flavor pairings", label: t('bot.flavorPairings') },
  { text: "💰 What are your custom cake pricing estimates?", label: t('bot.pricingEstimates') },
  { text: "📅 How far in advance do I need to book?", label: t('bot.bookingLeadTimes') },
  { text: "📍 Where is your studio located for pickup?", label: t('bot.pickupLocation') },
  { text: "🌱 Do you offer gluten-free or egg-free options?", label: t('bot.dietaryCustomization') }
];

export function useCakeChat() {
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

  useEffect(() => {
    if (endOfMessagesRef.current) {
      endOfMessagesRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  const handleSendMessage = useCallback(async (textToSend: string) => {
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

      const { data } = await http.post<ApiResponse<{ text: string }>>('/api/chat', { messages: historyToSend });

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
  }, [isLoading, messages]);

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

  const handleInputChange = (value: string) => setInputValue(value);

  const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleSendMessage(inputValue);
  };

  return {
    isOpen,
    setIsOpen,
    messages,
    inputValue,
    isLoading,
    errorStatus,
    endOfMessagesRef,
    handleSendMessage,
    clearChatHistory,
    handleInputChange,
    handleSubmit,
  };
}