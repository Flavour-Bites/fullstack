import { PRESET_QUESTIONS } from '../../hooks/useCakeChat';

interface PresetQuestionsProps {
  onSelect: (text: string) => void;
}

export default function PresetQuestions({ onSelect }: PresetQuestionsProps) {
  return (
    <div className="px-3 py-1.5 bg-stone-50/80 dark:bg-stone-900/60 border-t border-b border-stone-150 dark:border-stone-850 flex items-center justify-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
      {PRESET_QUESTIONS.map((q) => (
        <button
          key={q.label}
          type="button"
          onClick={() => onSelect(q.text)}
          className="shrink-0 px-2.5 py-1 bg-white dark:bg-stone-850 hover:bg-stone-100 dark:hover:bg-stone-800 border border-stone-200 dark:border-stone-750 text-[10px] text-stone-650 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white rounded-full transition-colors cursor-pointer font-sans"
        >
          {q.label}
        </button>
      ))}
    </div>
  );
}