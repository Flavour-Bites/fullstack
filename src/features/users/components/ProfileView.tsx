import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, LogOut, Settings, Bell, Shield, ShoppingBag, CheckCircle2, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { t } from '../../../i18n/index';
import { usePageTitle } from '../../core/hooks/usePageTitle';
import { User as UserType } from '../../../types';

interface ProfileViewProps {
  currentUser: UserType;
  onLogout: () => void;
  onUpdateUser?: (updated: UserType) => void;
}

type TabType = 'personal' | 'preferences' | 'notifications' | 'security';

export default function ProfileView({ currentUser, onLogout, onUpdateUser }: ProfileViewProps) {
  usePageTitle("Profile");
  
  const [activeTab, setActiveTab] = useState<TabType>('personal');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Form states
  const [name, setName] = useState(currentUser.name || '');
  const [phone, setPhone] = useState(currentUser.telegramPhone || '');
  const [dietary, setDietary] = useState<string[]>(currentUser.dietaryPreferences || []);
  const [language, setLanguage] = useState(currentUser.language || 'en');
  const [notify, setNotify] = useState(currentUser.notifyViaTelegram ?? true);

  const DIETARY_OPTIONS = ['Gluten-Free', 'Vegan', 'Dairy-Free', 'Nut Allergy', 'Egg-Free'];

  const handleSave = async (e?: React.SyntheticEvent) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);
    
    try {
      const res = await fetch('/api/auth/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          telegramPhone: phone,
          dietaryPreferences: dietary,
          language,
          notifyViaTelegram: notify,
        }),
      });
      
      const data = await res.json();
      if (data.success && data.user) {
        if (onUpdateUser) onUpdateUser(data.user);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Failed to update profile:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const toggleDietary = (pref: string) => {
    setDietary(prev => 
      prev.includes(pref) ? prev.filter(p => p !== pref) : [...prev, pref]
    );
  };

  if (!currentUser) {
    return (
      <div className="bg-lux-cream/30 dark:bg-stone-900/10 min-h-screen py-16 px-4 flex justify-center items-center font-sans">
        <p className="text-stone-500 font-light">Please log in to view your profile.</p>
      </div>
    );
  }

  return (
    <div className="bg-lux-cream/30 dark:bg-stone-900/10 min-h-screen py-16 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="mb-12">
          <span className="text-[10px] uppercase tracking-[0.3em] text-lux-gold font-mono block mb-2 font-bold">{t('profile.accountDashboard')}</span>
          <h1 className="text-4xl font-serif text-warm-950 dark:text-stone-100 font-medium italic">{t('profile.yourProfile')}</h1>
          <div className="h-[2px] w-12 bg-lux-gold mt-4" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          
          {/* Sidebar Navigation */}
          <div className="md:col-span-3 space-y-2">
            <button 
              onClick={() => setActiveTab('personal')}
              className={`w-full flex items-center justify-between p-3 rounded-sm transition-all duration-300 ${activeTab === 'personal' ? 'bg-white dark:bg-stone-850 shadow-sm border border-stone-200/50 dark:border-stone-800' : 'hover:bg-black/5 dark:hover:bg-white/5 text-stone-500'}`}
            >
              <div className="flex items-center gap-3">
                <User className={`w-4 h-4 ${activeTab === 'personal' ? 'text-lux-gold' : ''}`} />
                <span className={`text-sm ${activeTab === 'personal' ? 'font-medium text-stone-900 dark:text-white' : ''}`}>Personal Info</span>
              </div>
              {activeTab === 'personal' && <ChevronRight className="w-4 h-4 text-lux-gold" />}
            </button>
            
            <button 
              onClick={() => setActiveTab('preferences')}
              className={`w-full flex items-center justify-between p-3 rounded-sm transition-all duration-300 ${activeTab === 'preferences' ? 'bg-white dark:bg-stone-850 shadow-sm border border-stone-200/50 dark:border-stone-800' : 'hover:bg-black/5 dark:hover:bg-white/5 text-stone-500'}`}
            >
              <div className="flex items-center gap-3">
                <Settings className={`w-4 h-4 ${activeTab === 'preferences' ? 'text-lux-gold' : ''}`} />
                <span className={`text-sm ${activeTab === 'preferences' ? 'font-medium text-stone-900 dark:text-white' : ''}`}>Preferences</span>
              </div>
              {activeTab === 'preferences' && <ChevronRight className="w-4 h-4 text-lux-gold" />}
            </button>

            <button 
              onClick={() => setActiveTab('notifications')}
              className={`w-full flex items-center justify-between p-3 rounded-sm transition-all duration-300 ${activeTab === 'notifications' ? 'bg-white dark:bg-stone-850 shadow-sm border border-stone-200/50 dark:border-stone-800' : 'hover:bg-black/5 dark:hover:bg-white/5 text-stone-500'}`}
            >
              <div className="flex items-center gap-3">
                <Bell className={`w-4 h-4 ${activeTab === 'notifications' ? 'text-lux-gold' : ''}`} />
                <span className={`text-sm ${activeTab === 'notifications' ? 'font-medium text-stone-900 dark:text-white' : ''}`}>Notifications</span>
              </div>
              {activeTab === 'notifications' && <ChevronRight className="w-4 h-4 text-lux-gold" />}
            </button>

            <button 
              onClick={() => setActiveTab('security')}
              className={`w-full flex items-center justify-between p-3 rounded-sm transition-all duration-300 ${activeTab === 'security' ? 'bg-white dark:bg-stone-850 shadow-sm border border-stone-200/50 dark:border-stone-800' : 'hover:bg-black/5 dark:hover:bg-white/5 text-stone-500'}`}
            >
              <div className="flex items-center gap-3">
                <Shield className={`w-4 h-4 ${activeTab === 'security' ? 'text-lux-gold' : ''}`} />
                <span className={`text-sm ${activeTab === 'security' ? 'font-medium text-stone-900 dark:text-white' : ''}`}>Security</span>
              </div>
              {activeTab === 'security' && <ChevronRight className="w-4 h-4 text-lux-gold" />}
            </button>
            
            <div className="pt-6 mt-6 border-t border-stone-200 dark:border-stone-800 space-y-2">
              <Link
                to="/orders"
                className="w-full flex items-center gap-3 p-3 text-stone-600 dark:text-stone-400 hover:text-lux-gold transition-colors text-sm"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>My Orders</span>
              </Link>
              <button
                onClick={onLogout}
                className="w-full flex items-center gap-3 p-3 text-red-600/80 hover:text-red-600 dark:text-red-400/80 dark:hover:text-red-400 transition-colors text-sm cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="md:col-span-9 bg-white dark:bg-[#111111] border border-stone-200/60 dark:border-stone-850 rounded-sm shadow-sm p-8 min-h-[500px] relative">
            <AnimatePresence mode="wait">
              {activeTab === 'personal' && (
                <motion.div
                  key="personal"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <h2 className="text-2xl font-serif text-stone-900 dark:text-stone-100">Personal Information</h2>
                  <p className="text-sm text-stone-500 dark:text-stone-400 font-light">Update your personal details below.</p>
                  
                  <div className="space-y-4 max-w-lg mt-8">
                    <div>
                      <label className="block text-[10px] uppercase font-mono tracking-widest text-stone-500 mb-2">Full Name</label>
                      <input 
                        type="text"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 focus:outline-none focus:ring-1 focus:ring-lux-gold focus:border-lux-gold px-4 py-3 text-sm text-stone-850 dark:text-stone-100 rounded-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-mono tracking-widest text-stone-500 mb-2">Phone Number</label>
                      <input 
                        type="tel"
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        placeholder="+251 911 234 567"
                        className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 focus:outline-none focus:ring-1 focus:ring-lux-gold focus:border-lux-gold px-4 py-3 text-sm text-stone-850 dark:text-stone-100 rounded-sm"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'preferences' && (
                <motion.div
                  key="preferences"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <h2 className="text-2xl font-serif text-stone-900 dark:text-stone-100">Preferences</h2>
                  <p className="text-sm text-stone-500 dark:text-stone-400 font-light">Help us tailor your experience to your needs.</p>
                  
                  <div className="space-y-8 max-w-lg mt-8">
                    <div>
                      <label className="block text-[10px] uppercase font-mono tracking-widest text-stone-500 mb-4">Dietary Restrictions</label>
                      <div className="flex flex-wrap gap-2">
                        {DIETARY_OPTIONS.map(pref => (
                          <button
                            key={pref}
                            onClick={() => toggleDietary(pref)}
                            className={`px-4 py-2 rounded-full text-xs transition-colors border ${
                              dietary.includes(pref) 
                                ? 'bg-lux-gold text-white border-lux-gold' 
                                : 'bg-transparent text-stone-600 dark:text-stone-300 border-stone-300 dark:border-stone-700 hover:border-lux-gold'
                            }`}
                          >
                            {pref}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-[10px] uppercase font-mono tracking-widest text-stone-500 mb-2">Preferred Language</label>
                      <select 
                        value={language}
                        onChange={e => setLanguage(e.target.value)}
                        className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 focus:outline-none focus:ring-1 focus:ring-lux-gold focus:border-lux-gold px-4 py-3 text-sm text-stone-850 dark:text-stone-100 rounded-sm"
                      >
                        <option value="en">English</option>
                        <option value="am">Amharic (አማርኛ)</option>
                      </select>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'notifications' && (
                <motion.div
                  key="notifications"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <h2 className="text-2xl font-serif text-stone-900 dark:text-stone-100">Notifications</h2>
                  <p className="text-sm text-stone-500 dark:text-stone-400 font-light">Control how we communicate with you.</p>
                  
                  <div className="space-y-4 max-w-lg mt-8">
                    <label className="flex items-center gap-4 cursor-pointer p-4 border border-stone-200 dark:border-stone-800 rounded-sm hover:border-lux-gold/50 transition-colors">
                      <div className="relative">
                        <input 
                          type="checkbox" 
                          checked={notify}
                          onChange={e => setNotify(e.target.checked)}
                          className="sr-only peer" 
                        />
                        <div className="w-11 h-6 bg-stone-200 peer-focus:outline-none rounded-full peer dark:bg-stone-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-lux-gold"></div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-stone-900 dark:text-stone-100">Order Updates via Telegram</div>
                        <div className="text-xs text-stone-500 font-light mt-1">Receive immediate status changes and delivery updates on Telegram.</div>
                      </div>
                    </label>
                  </div>
                </motion.div>
              )}

              {activeTab === 'security' && (
                <motion.div
                  key="security"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <h2 className="text-2xl font-serif text-stone-900 dark:text-stone-100">Security</h2>
                  <p className="text-sm text-stone-500 dark:text-stone-400 font-light">Manage your connected accounts and password.</p>
                  
                  <div className="space-y-6 max-w-lg mt-8">
                    <div className="p-4 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-sm flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-500/10 rounded-full flex items-center justify-center">
                          <svg className="w-5 h-5 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.5 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.892-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                          </svg>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-stone-900 dark:text-stone-100">Telegram Account</div>
                          <div className="text-xs text-stone-500 font-light mt-1">Connected as {currentUser.telegramUsername ? `@${currentUser.telegramUsername}` : currentUser.telegramId}</div>
                        </div>
                      </div>
                      <div className="px-3 py-1 bg-green-500/10 text-green-600 dark:text-green-400 text-[10px] uppercase tracking-wider font-mono font-bold rounded-full">
                        Connected
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Save Button (shows on all tabs except security if we don't have security settings to save) */}
            {activeTab !== 'security' && (
              <div className="absolute bottom-8 right-8 flex items-center gap-4">
                <AnimatePresence>
                  {saveSuccess && (
                    <motion.div 
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="flex items-center gap-2 text-green-600 dark:text-green-400 text-sm"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Changes saved</span>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-6 py-2.5 bg-stone-900 dark:bg-stone-800 hover:bg-lux-gold text-white hover:text-stone-950 font-mono text-[11px] uppercase font-bold tracking-wider rounded-sm transition-all duration-300 disabled:opacity-50 flex items-center gap-2 shadow-md cursor-pointer"
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
