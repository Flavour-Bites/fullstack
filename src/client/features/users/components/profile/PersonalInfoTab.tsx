import { User, Phone } from 'lucide-react';
import ProfileTabPanel from './ProfileTabPanel';

interface PersonalInfoTabProps {
  name: string;
  phone: string;
  onNameChange: (value: string) => void;
  onPhoneChange: (value: string) => void;
}

export default function PersonalInfoTab({ name, phone, onNameChange, onPhoneChange }: PersonalInfoTabProps) {
  return (
    <ProfileTabPanel
      title="Personal Information"
      subtitle="Update your private details & contact information"
    >
      <div>
        <label className="block text-[10px] uppercase font-mono tracking-widest text-stone-400 dark:text-stone-500 mb-2 font-bold">Full Name</label>
        <div className="relative rounded-xs shadow-inner">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <User className="w-4 h-4 text-stone-400 dark:text-stone-500" />
          </div>
          <input
            type="text"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            className="w-full bg-stone-50/50 dark:bg-stone-900/40 border border-stone-200/80 dark:border-stone-800 focus:outline-none focus:ring-1 focus:ring-lux-gold/30 focus:border-lux-gold/80 focus:bg-white focus:dark:bg-[#111] pl-10 pr-4 py-3 text-sm text-stone-850 dark:text-stone-100 rounded-xs transition-all duration-300"
          />
        </div>
      </div>

      <div>
        <label className="block text-[10px] uppercase font-mono tracking-widest text-stone-400 dark:text-stone-500 mb-2 font-bold">Phone Number</label>
        <div className="relative rounded-xs shadow-inner">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Phone className="w-4 h-4 text-stone-400 dark:text-stone-500" />
          </div>
          <input
            type="tel"
            value={phone}
            onChange={(e) => onPhoneChange(e.target.value)}
            placeholder="+251 911 234 567"
            className="w-full bg-stone-50/50 dark:bg-stone-900/40 border border-stone-200/80 dark:border-stone-800 focus:outline-none focus:ring-1 focus:ring-lux-gold/30 focus:border-lux-gold/80 focus:bg-white focus:dark:bg-[#111] pl-10 pr-4 py-3 text-sm text-stone-850 dark:text-stone-100 rounded-xs transition-all duration-300"
          />
        </div>
      </div>
    </ProfileTabPanel>
  );
}