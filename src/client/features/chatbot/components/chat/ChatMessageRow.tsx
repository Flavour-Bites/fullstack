import { Bot } from 'lucide-react';
import { ChatMessage } from '../../hooks/useCakeChat';

function renderMessageTextPart(text: string) {
  const lines = text.split('\n');
  return lines.map((line, idx) => {
    const trimmed = line.trim();
    const isBullet = trimmed.startsWith('*') || trimmed.startsWith('-');
    let content = line;
    if (isBullet) {
      content = trimmed.replace(/^[*-]\s*/, '');
    }

    const parts = content.split(/(\*\*.*?\*\*)/g);
    const elements = parts.map((part, pIdx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          // eslint-disable-next-line react/no-array-index-key
          <strong key={pIdx} className="font-semibold text-stone-900 underline decoration-lux-gold/30">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });

    if (isBullet) {
      return (
        // eslint-disable-next-line react/no-array-index-key
        <li key={idx} className="ml-4 list-disc text-stone-750 font-light text-xs my-0.5 font-sans leading-relaxed">
          {elements}
        </li>
      );
    }

    return (
      // eslint-disable-next-line react/no-array-index-key
      <p key={idx} className="text-stone-750 font-light text-xs my-1 font-sans leading-relaxed min-h-[0.8em]">
        {elements}
      </p>
    );
  });
}

interface ChatMessageRowProps {
  message: ChatMessage;
}

export default function ChatMessageRow({ message }: ChatMessageRowProps) {
  const isBot = message.role === 'assistant';

  return (
    <div
      className={`flex gap-2.5 max-w-[85%] ${isBot ? 'mr-auto items-start' : 'ml-auto flex-row-reverse items-end'}`}
    >
      <div className={`w-6.5 h-6.5 rounded-full flex items-center justify-center shrink-0 border ${
        isBot
          ? 'bg-stone-900 border-lux-gold/30 text-lux-gold'
          : 'bg-lux-gold border-stone-200/50 text-stone-950 font-serif font-bold text-[10px]'
      }`}>
        {isBot ? <Bot className="w-3 h-3" /> : 'FB'}
      </div>

      <div className="space-y-1">
        <div className={`p-3.5 rounded-sm relative text-xs leading-relaxed border ${
          isBot
            ? 'bg-white border-stone-200 text-stone-850 rounded-tl-none shadow-xs'
            : 'bg-stone-900 border-stone-800 text-white rounded-br-none shadow-sm'
        }`}>
          {isBot ? (
            <div className="space-y-2">{renderMessageTextPart(message.text)}</div>
          ) : (
            <p className="font-sans font-light text-xs text-stone-100">{message.text}</p>
          )}
        </div>
        <span className={`text-[8px] text-stone-400 font-mono block ${isBot ? 'text-left pl-1' : 'text-right pr-1'}`}>
          {message.timestamp}
        </span>
      </div>
    </div>
  );
}