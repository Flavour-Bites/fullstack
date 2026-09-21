import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { User as UserIcon, ShoppingBag, ShieldCheck, LogIn, HelpCircle, Sun, Moon, LogOut } from 'lucide-react';
import type { User } from '@shared/types';
import { BUSINESS_INFO } from '../../shared/constants/index';

interface HeaderProfileDropdownProps {
  currentUser: User | null;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onLogout: () => void;
}

export default function HeaderProfileDropdown({
  currentUser,
  darkMode,
  onToggleDarkMode,
  onLogout,
}: Readonly<HeaderProfileDropdownProps>) {
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  return (
    <div
      className="relative shrink-0"
      onMouseEnter={() => setProfileDropdownOpen(true)}
      onMouseLeave={() => setProfileDropdownOpen(false)}
    >
      <div
        className={`flex items-center gap-2 mr-1 cursor-pointer hover:opacity-90 transition-opacity border px-2.5 py-1.5 rounded-sm ${
          darkMode
            ? 'border-stone-800 bg-stone-900/30 text-white'
            : 'border-stone-200 bg-white/30 text-stone-900'
        }`}
        onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setProfileDropdownOpen(!profileDropdownOpen);
          }
        }}
        aria-label={currentUser ? `Account: ${currentUser.name}` : 'Sign in'}
        aria-expanded={profileDropdownOpen}
      >
        {currentUser ? (
          <>
            <div className="w-5.5 h-5.5 rounded-full bg-stone-900 border border-lux-gold/60 text-lux-gold flex items-center justify-center text-[9px] font-sans font-bold uppercase shrink-0">
              {currentUser.name ? currentUser.name.charAt(0) : 'U'}
            </div>
            <span className="text-[10px] uppercase font-sans tracking-[0.14em] font-semibold">
              {currentUser.name.split(' ')[0]}
            </span>
          </>
        ) : (
          <>
            <UserIcon className="w-3.5 h-3.5 text-lux-gold" />
            <span className="text-[10px] uppercase font-sans tracking-[0.14em] font-semibold">
              Account
            </span>
          </>
        )}
      </div>

      <AnimatePresence>
        {profileDropdownOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.12 }}
            className={`absolute right-0 mt-1 w-52 rounded-sm border p-1.5 shadow-2xl z-50 text-left font-sans ${
              darkMode
                ? 'bg-stone-950 border-stone-800 text-stone-200 shadow-stone-950/80'
                : 'bg-lux-cream border-stone-200 text-stone-800 shadow-stone-400/20'
            }`}
          >
            {currentUser ? (
              <div className={`px-3 py-2 border-b ${darkMode ? 'border-stone-800/80' : 'border-stone-200/50'}`}>
                <div className={`text-[10px] font-bold uppercase tracking-wider truncate mb-0.5 ${darkMode ? 'text-white' : 'text-stone-900'}`}>
                  {currentUser.name}
                </div>
                <div className="text-[8px] font-mono uppercase tracking-widest text-lux-gold font-bold">
                  {currentUser.role === 'admin' ? 'System Admin' : currentUser.role === 'staff' ? 'Bakery Staff' : 'Customer'}
                </div>
              </div>
            ) : (
              <div className={`px-3 py-2 border-b ${darkMode ? 'border-stone-800/80' : 'border-stone-200/50'}`}>
                <div className="text-[10px] font-semibold text-stone-400 uppercase tracking-widest">
                  Welcome Guest
                </div>
              </div>
            )}

            <div className="py-1 space-y-0.5">
              {currentUser ? (
                <>
                  <Link
                    to="/profile"
                    onClick={() => { setProfileDropdownOpen(false); }}
                    className={`w-full text-left px-3 py-1.5 text-[10px] uppercase font-sans font-semibold tracking-wider rounded-sm transition-colors cursor-pointer flex items-center gap-2 ${
                      darkMode
                        ? 'hover:bg-stone-900 text-stone-300 hover:text-white'
                        : 'hover:bg-stone-100 text-stone-600 hover:text-stone-950'
                    }`}
                  >
                    <UserIcon className="w-3.5 h-3.5 text-lux-gold shrink-0" />
                    <span>My Profile</span>
                  </Link>
                  <Link
                    to="/orders"
                    onClick={() => { setProfileDropdownOpen(false); }}
                    className={`w-full text-left px-3 py-1.5 text-[10px] uppercase font-sans font-semibold tracking-wider rounded-sm transition-colors cursor-pointer flex items-center gap-2 ${
                      darkMode
                        ? 'hover:bg-stone-900 text-stone-300 hover:text-white'
                        : 'hover:bg-stone-100 text-stone-600 hover:text-stone-950'
                    }`}
                  >
                    <ShoppingBag className="w-3.5 h-3.5 text-lux-gold shrink-0" />
                    <span>My Orders</span>
                  </Link>
                  {(currentUser.role === 'admin' || currentUser.role === 'staff') && (
                    <Link
                      to="/admin"
                      onClick={() => { setProfileDropdownOpen(false); }}
                      className={`w-full text-left px-3 py-1.5 text-[10px] uppercase font-sans font-semibold tracking-wider rounded-sm transition-colors cursor-pointer flex items-center gap-2 ${
                        darkMode
                          ? 'hover:bg-stone-900 text-stone-300 hover:text-white'
                          : 'hover:bg-stone-100 text-stone-600 hover:text-stone-950'
                      }`}
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-lux-gold shrink-0" />
                      <span>Admin Workspace</span>
                    </Link>
                  )}
                </>
              ) : (
                <>
                  <Link
                    to="/auth"
                    onClick={() => { setProfileDropdownOpen(false); }}
                    className={`w-full text-left px-3 py-1.5 text-[10px] uppercase font-sans font-semibold tracking-wider rounded-sm transition-colors cursor-pointer flex items-center gap-2 ${
                      darkMode
                        ? 'hover:bg-stone-900 text-stone-300 hover:text-white'
                        : 'hover:bg-stone-100 text-stone-600 hover:text-stone-950'
                    }`}
                  >
                    <LogIn className="w-3.5 h-3.5 text-lux-gold shrink-0" />
                    <span>Sign In / Join</span>
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      alert(`Flavour Bites Service Desk:\n\nReach our studio team at ${BUSINESS_INFO.email} or call our master desk line at ${BUSINESS_INFO.phone}.`);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-[10px] uppercase font-sans font-semibold tracking-wider rounded-sm transition-colors cursor-pointer flex items-center gap-2 ${
                      darkMode
                        ? 'hover:bg-stone-900 text-stone-300 hover:text-white'
                        : 'hover:bg-stone-100 text-stone-600 hover:text-stone-950'
                    }`}
                  >
                    <HelpCircle className="w-3.5 h-3.5 text-lux-gold shrink-0" />
                    <span>Help / Support</span>
                  </button>
                </>
              )}

              <div className={`my-1 border-t border-b py-1.5 ${darkMode ? 'border-stone-850' : 'border-stone-200/50'}`}>
                <button
                  type="button"
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleDarkMode(); }}
                  aria-label={`Switch to ${darkMode ? 'light' : 'dark'} mode`}
                  className={`w-full text-left px-3 py-1 text-[10px] rounded-sm transition-colors cursor-pointer flex items-center justify-between group ${
                    darkMode
                      ? 'hover:bg-stone-900 text-stone-300 hover:text-white'
                      : 'hover:bg-stone-100 text-stone-600 hover:text-stone-950'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {darkMode ? <Sun className="w-3.5 h-3.5 text-lux-gold shrink-0" /> : <Moon className="w-3.5 h-3.5 text-lux-gold shrink-0" />}
                    <span className="font-sans font-medium uppercase tracking-wider text-[9.5px]">
                      {darkMode ? 'Light Theme' : 'Dark Theme'}
                    </span>
                  </div>
                  <div className={`w-8 h-4.5 rounded-full p-0.5 transition-colors relative flex items-center shrink-0 ${darkMode ? 'bg-lux-gold' : 'bg-stone-300'}`}>
                    <div className={`w-3.5 h-3.5 rounded-full bg-stone-950 shadow-sm transform duration-300 ${darkMode ? 'translate-x-3.5' : 'translate-x-0'}`} />
                  </div>
                </button>
              </div>

              {currentUser && (
                <div className={`border-t pt-1 ${darkMode ? 'border-stone-850' : 'border-stone-200/50'}`}>
                  <button
                    type="button"
                    onClick={() => { setProfileDropdownOpen(false); onLogout(); }}
                    className={`w-full text-left px-3 py-1.5 text-[10px] uppercase font-sans font-bold tracking-wider rounded-sm transition-colors cursor-pointer flex items-center gap-2 ${
                      darkMode
                        ? 'text-red-400 hover:bg-stone-900 hover:text-red-350'
                        : 'text-red-600 hover:bg-red-50 hover:text-red-700'
                    }`}
                  >
                    <LogOut className="w-3.5 h-3.5 shrink-0" />
                    <span>Log Out</span>
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
