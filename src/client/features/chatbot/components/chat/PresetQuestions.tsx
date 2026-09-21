import { PRESET_QUESTIONS } from '../../hooks/useCakeChat';

interface PresetQuestionsProps {
  onSelect: (text: string) => void;
}

export default function PresetQuestions({ onSelect }: PresetQuestionsProps) {
  return (
    <div className="px-3 py-2 bg-stone-50/80 border-t border-b border-stone-150 flex gap-1.5 overflow-x-auto no-scrollbar scroll-smooth">
      {PRESET_QUESTIONS.map((q) => (
        <button
          key={q.label}
          onClick={() => onSelect(q.text)}
          className="shrink-0 px-2.5 py-1 bg-white hover:bg-stone-100 border border-stone-200 text-[10px] text-stone-650 hover:text-stone-900 rounded-full transition-colors cursor-pointer font-sans"
        >
          {q.label}
        </button>
      ))}
    </div>
  );
}