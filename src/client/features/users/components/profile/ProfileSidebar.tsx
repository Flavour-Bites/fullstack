import { User, LogOut, Settings, Bell, Shield, ShoppingBag, ChevronRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { User as UserType } from '@shared/types';
import { ProfileTab } from '../../hooks/useProfileForm';

interface ProfileSidebarProps {
  currentUser: UserType;
  activeTab: ProfileTab;
  onTabChange: (tab: ProfileTab) => void;
  onLogout: () => void;
}

const NAV_ITEMS = [
  { id: 'personal', label: 'Personal Info', icon: User },
  { id: 'preferences', label: 'Preferences', icon: Settings },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Security', icon: Shield },
] as const;

export default function ProfileSidebar({ currentUser, activeTab, onTabChange, onLogout }: ProfileSidebarProps) {
  return (
    <div className="md:col-span-4 lg:col-span-3 space-y-4">
      {/* Elegant User Card */}
      <div className="bg-white dark:bg-stone-900 border border-stone-200/50 dark:border-stone-850 p-6 rounded-sm shadow-sm text-center relative overflow-hidden group">
        <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-lux-gold/60 via-lux-gold to-lux-gold/60" />

        <div className="w-16 h-16 rounded-full bg-lux-cream dark:bg-stone-850 border border-lux-gold/30 flex items-center justify-center mx-auto mb-4 shadow-sm relative transition-transform duration-500 group-hover:scale-105">
          <span className="text-xl font-serif italic text-lux-gold font-bold">
            {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
          </span>
          <div className="absolute -bottom-1 -right-1 w-5.5 h-5.5 bg-lux-gold rounded-full flex items-center justify-center text-[10px] text-stone-950 font-bold shadow-md border border-white dark:border-stone-900">
            {currentUser.role === 'admin' ? <Sparkles className="w-3 h-3 text-stone-950 fill-stone-950" /> : '✓'}
          </div>
        </div>

        <h3 className="text-md font-serif text-stone-900 dark:text-stone-100 font-semibold truncate leading-tight">
          {currentUser.name || 'Valued Guest'}
        </h3>
        <p className="text-[9px] font-mono tracking-widest text-stone-400 dark:text-stone-500 uppercase mt-1.5 font-bold">
          {currentUser.role === 'admin' ? 'Administrator' : 'Valued Guest'}
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white dark:bg-stone-900 border border-stone-200/50 dark:border-stone-850 p-2.5 rounded-sm shadow-sm space-y-1">
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => onTabChange(id)}
              className={`w-full flex items-center justify-between p-3.5 rounded-xs transition-all duration-300 relative group cursor-pointer ${
                isActive
                  ? 'bg-lux-cream/40 dark:bg-stone-900/40 text-stone-900 dark:text-white border-l-2 border-lux-gold'
                  : 'hover:bg-lux-cream/20 dark:hover:bg-stone-900/20 text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 border-l-2 border-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 transition-colors duration-300 ${isActive ? 'text-lux-gold' : 'text-stone-400 dark:text-stone-500 group-hover:text-lux-gold'}`} />
                <span className={`text-[10px] uppercase tracking-widest font-mono ${isActive ? 'font-bold' : 'font-medium'}`}>
                  {label}
                </span>
              </div>
              <ChevronRight className={`w-3.5 h-3.5 transition-all duration-300 ${isActive ? 'text-lux-gold translate-x-1 opacity-100' : 'opacity-0 -translate-x-1 group-hover:opacity-60 group-hover:translate-x-0'}`} />
            </button>
          );
        })}

        <div className="pt-4 mt-4 border-t border-stone-100 dark:border-stone-850 space-y-1">
          <Link
            to="/orders"
            className="w-full flex items-center justify-between p-3 rounded-xs text-stone-500 dark:text-stone-400 hover:text-lux-gold hover:bg-lux-cream/20 dark:hover:bg-stone-900/20 transition-all text-left group"
          >
            <div className="flex items-center gap-3">
              <ShoppingBag className="w-4 h-4 text-stone-400 dark:text-stone-500 group-hover:text-lux-gold transition-colors" />
              <span className="text-[10px] uppercase tracking-widest font-mono font-medium">My Orders</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 opacity-0 -translate-x-1 transition-all duration-300 group-hover:opacity-60 group-hover:translate-x-0" />
          </Link>
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-between p-3 rounded-xs text-red-600/70 hover:text-red-600 dark:text-red-400/70 dark:hover:text-red-400 hover:bg-red-500/5 transition-all cursor-pointer text-left group"
          >
            <div className="flex items-center gap-3">
              <LogOut className="w-4 h-4 text-red-400/50 dark:text-red-400/50 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors" />
              <span className="text-[10px] uppercase tracking-widest font-mono font-medium">Sign Out</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}