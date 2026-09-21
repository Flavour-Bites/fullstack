import { Globe, ChevronRight } from 'lucide-react';
import { DIETARY_OPTIONS } from '../../hooks/useProfileForm';
import ProfileTabPanel from './ProfileTabPanel';

interface PreferencesTabProps {
  dietary: string[];
  language: string;
  onDietaryToggle: (pref: string) => void;
  onLanguageChange: (value: string) => void;
}

export default function PreferencesTab({ dietary, language, onDietaryToggle, onLanguageChange }: PreferencesTabProps) {
  return (
    <ProfileTabPanel
      title="Preferences"
      subtitle="Help us tailor your bakery & tasting experience"
    >
      <div>
        <label className="block text-[10px] uppercase font-mono tracking-widest text-stone-400 dark:text-stone-500 mb-3 font-bold">Dietary Restrictions & Allergies</label>
        <div className="flex flex-wrap gap-2.5">
          {DIETARY_OPTIONS.map((pref) => {
            const isSelected = dietary.includes(pref);
            return (
              <button
                key={pref}
                onClick={() => onDietaryToggle(pref)}
                type="button"
                className={`px-4 py-2 rounded-full text-xs font-mono tracking-wider transition-all duration-300 border cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-stone-900 dark:bg-stone-800 text-lux-gold border-lux-gold shadow-sm shadow-lux-gold/5 scale-[1.02]'
                    : 'bg-transparent text-stone-600 dark:text-stone-400 border-stone-200 dark:border-stone-800 hover:border-lux-gold hover:text-lux-gold hover:scale-[1.01]'
                }`}
              >
                {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-lux-gold" />}
                <span>{pref}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label className="block text-[10px] uppercase font-mono tracking-widest text-stone-400 dark:text-stone-500 mb-2 font-bold">Preferred Language</label>
        <div className="relative rounded-xs shadow-inner max-w-xs">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Globe className="w-4 h-4 text-stone-400 dark:text-stone-500" />
          </div>
          <select
            value={language}
            onChange={(e) => onLanguageChange(e.target.value)}
            className="w-full bg-stone-50/50 dark:bg-stone-900/40 border border-stone-200/80 dark:border-stone-800 focus:outline-none focus:ring-1 focus:ring-lux-gold/30 focus:border-lux-gold/80 focus:bg-white focus:dark:bg-[#111] pl-10 pr-10 py-3 text-sm text-stone-850 dark:text-stone-100 rounded-xs transition-all duration-300 appearance-none cursor-pointer"
          >
            <option value="en">English</option>
            <option value="am">Amharic (አማርኛ)</option>
          </select>
          <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none">
            <ChevronRight className="w-4 h-4 text-stone-400 rotate-90" />
          </div>
        </div>
      </div>
    </ProfileTabPanel>
  );
}