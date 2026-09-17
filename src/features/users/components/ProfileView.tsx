import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, 
  LogOut, 
  Settings, 
  Bell, 
  Shield, 
  ShoppingBag, 
  CheckCircle2, 
  ChevronRight,
  Phone,
  Globe,
  Lock,
  Sparkles
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { t } from '../../../i18n/index';
import { usePageTitle } from '../../core/hooks/usePageTitle';
import { User as UserType } from '../../../types';
import { http, ApiResponse } from '../../../shared/utils/http';

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

  // Sync internal state if currentUser prop changes
  React.useEffect(() => {
    setName(currentUser.name || '');
    setPhone(currentUser.telegramPhone || '');
    setDietary(currentUser.dietaryPreferences || []);
    setLanguage(currentUser.language || 'en');
    setNotify(currentUser.notifyViaTelegram ?? true);
  }, [currentUser]);

  const DIETARY_OPTIONS = ['Gluten-Free', 'Vegan', 'Dairy-Free', 'Nut Allergy', 'Egg-Free'];

  const handleSave = async (e?: React.SyntheticEvent) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);
    
    try {
      const { data } = await http.put<ApiResponse<{ user: UserType }>>('/api/auth/me', {
        name,
        telegramPhone: phone,
        dietaryPreferences: dietary,
        language,
        notifyViaTelegram: notify,
      });
      
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
      <div className="bg-lux-cream/30 dark:bg-stone-950/30 min-h-screen py-16 px-4 flex justify-center items-center font-sans">
        <p className="text-stone-500 dark:text-stone-400 font-light">Please log in to view your profile.</p>
      </div>
    );
  }

  const navItems = [
    { id: 'personal', label: 'Personal Info', icon: User },
    { id: 'preferences', label: 'Preferences', icon: Settings },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
  ] as const;

  return (
    <div className="bg-lux-cream/30 dark:bg-stone-950/30 min-h-screen py-16 px-4 sm:px-6 relative overflow-hidden">
      {/* Decorative ambient background glows */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-lux-gold/[0.02] rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-lux-gold/[0.01] rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-5xl mx-auto relative z-10">
        
        {/* Header */}
        <div className="mb-12">
          <span className="text-[10px] uppercase tracking-[0.3em] text-lux-gold font-mono block mb-2 font-bold">{t('profile.accountDashboard')}</span>
          <h1 className="text-4xl font-serif text-warm-950 dark:text-stone-100 font-medium italic">{t('profile.yourProfile')}</h1>
          <div className="h-[2px] w-12 bg-lux-gold mt-4" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          
          {/* Sidebar Navigation */}
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
              {navItems.map(({ id, label, icon: Icon }) => {
                const isActive = activeTab === id;
                return (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id)}
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

          {/* Main Content Card Area */}
          <div className="md:col-span-8 lg:col-span-9 bg-white dark:bg-stone-900 border border-stone-200/50 dark:border-stone-850 rounded-sm shadow-sm p-6 sm:p-8 md:p-10 min-h-[550px] relative flex flex-col justify-between overflow-hidden">
            {/* Elegant top gradient border */}
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-lux-gold via-stone-200 dark:via-stone-800 to-transparent" />
            
            {/* Ambient visual background element */}
            <div className="absolute -top-16 -right-16 w-36 h-36 bg-lux-gold/[0.02] rounded-full blur-xl pointer-events-none" />

            <div className="flex-grow">
              <AnimatePresence mode="wait">
                {activeTab === 'personal' && (
                  <motion.div
                    key="personal"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-6"
                  >
                    <div>
                      <h2 className="text-2xl font-serif text-stone-900 dark:text-stone-100 font-semibold italic">Personal Information</h2>
                      <p className="text-xs text-stone-400 dark:text-stone-500 font-mono tracking-wider uppercase mt-1">Update your private details & contact information</p>
                      <div className="h-[1px] w-full bg-stone-100 dark:bg-stone-850 mt-4" />
                    </div>
                    
                    <div className="space-y-5 max-w-lg mt-8">
                      <div>
                        <label className="block text-[10px] uppercase font-mono tracking-widest text-stone-400 dark:text-stone-500 mb-2 font-bold">Full Name</label>
                        <div className="relative rounded-xs shadow-inner">
                          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                            <User className="w-4 h-4 text-stone-400 dark:text-stone-500" />
                          </div>
                          <input 
                            type="text"
                            value={name}
                            onChange={e => setName(e.target.value)}
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
                            onChange={e => setPhone(e.target.value)}
                            placeholder="+251 911 234 567"
                            className="w-full bg-stone-50/50 dark:bg-stone-900/40 border border-stone-200/80 dark:border-stone-800 focus:outline-none focus:ring-1 focus:ring-lux-gold/30 focus:border-lux-gold/80 focus:bg-white focus:dark:bg-[#111] pl-10 pr-4 py-3 text-sm text-stone-850 dark:text-stone-100 rounded-xs transition-all duration-300"
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'preferences' && (
                  <motion.div
                    key="preferences"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-6"
                  >
                    <div>
                      <h2 className="text-2xl font-serif text-stone-900 dark:text-stone-100 font-semibold italic">Preferences</h2>
                      <p className="text-xs text-stone-400 dark:text-stone-500 font-mono tracking-wider uppercase mt-1">Help us tailor your bakery & tasting experience</p>
                      <div className="h-[1px] w-full bg-stone-100 dark:bg-stone-850 mt-4" />
                    </div>
                    
                    <div className="space-y-8 max-w-lg mt-8">
                      <div>
                        <label className="block text-[10px] uppercase font-mono tracking-widest text-stone-400 dark:text-stone-500 mb-3 font-bold">Dietary Restrictions & Allergies</label>
                        <div className="flex flex-wrap gap-2.5">
                          {DIETARY_OPTIONS.map(pref => {
                            const isSelected = dietary.includes(pref);
                            return (
                              <button
                                key={pref}
                                onClick={() => toggleDietary(pref)}
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
                            onChange={e => setLanguage(e.target.value)}
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
                    </div>
                  </motion.div>
                )}

                {activeTab === 'notifications' && (
                  <motion.div
                    key="notifications"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-6"
                  >
                    <div>
                      <h2 className="text-2xl font-serif text-stone-900 dark:text-stone-100 font-semibold italic">Notifications</h2>
                      <p className="text-xs text-stone-400 dark:text-stone-500 font-mono tracking-wider uppercase mt-1">Control how and when we communicate with you</p>
                      <div className="h-[1px] w-full bg-stone-100 dark:bg-stone-850 mt-4" />
                    </div>
                    
                    <div className="space-y-4 max-w-xl mt-8">
                      <label className="flex items-start gap-4.5 cursor-pointer p-5 bg-stone-50/30 dark:bg-stone-900/10 border border-stone-200/80 dark:border-stone-800 rounded-sm hover:border-lux-gold/40 transition-all duration-300 group shadow-xs">
                        <div className="relative mt-1 shrink-0">
                          <input 
                            type="checkbox" 
                            checked={notify}
                            onChange={e => setNotify(e.target.checked)}
                            className="sr-only peer" 
                          />
                          <div className="w-11 h-6 bg-stone-200 dark:bg-stone-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-stone-700 peer-checked:bg-lux-gold"></div>
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-stone-900 dark:text-stone-100 group-hover:text-lux-gold transition-colors duration-300">Order Updates via Telegram</div>
                          <div className="text-xs text-stone-500 dark:text-stone-400 font-light mt-1.5 leading-relaxed">
                            Receive immediate baking status changes, handcrafting milestones, and pick-up/delivery scheduling alerts straight to your Telegram. Highly recommended.
                          </div>
                        </div>
                      </label>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'security' && (
                  <motion.div
                    key="security"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-6"
                  >
                    <div>
                      <h2 className="text-2xl font-serif text-stone-900 dark:text-stone-100 font-semibold italic">Security</h2>
                      <p className="text-xs text-stone-400 dark:text-stone-500 font-mono tracking-wider uppercase mt-1">Manage credentials & secure connection statuses</p>
                      <div className="h-[1px] w-full bg-stone-100 dark:bg-stone-850 mt-4" />
                    </div>
                    
                    <div className="space-y-6 max-w-xl mt-8">
                      <div className="p-5 bg-stone-50/50 dark:bg-stone-900/40 border border-stone-200/80 dark:border-stone-800 rounded-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs relative overflow-hidden group">
                        <div className="absolute top-0 left-0 bottom-0 w-[3px] bg-blue-500 rounded-l-sm" />
                        
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center shrink-0 border border-blue-500/10 group-hover:scale-105 transition-transform duration-300">
                            <svg className="w-6 h-6 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.5 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.892-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                            </svg>
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-stone-900 dark:text-stone-100">Telegram Account</div>
                            <div className="text-xs text-stone-400 dark:text-stone-500 mt-1 font-mono">
                              Connected as {currentUser.telegramUsername ? `@${currentUser.telegramUsername}` : `ID: ${currentUser.telegramId}`}
                            </div>
                          </div>
                        </div>
                        <div className="self-start sm:self-auto flex items-center">
                          <div className="px-3 py-1 bg-green-500/10 text-green-600 dark:text-green-400 text-[10px] uppercase tracking-wider font-mono font-bold rounded-full border border-green-500/20">
                            Connected
                          </div>
                        </div>
                      </div>

                      <div className="p-5 bg-lux-cream/40 dark:bg-stone-900/10 border border-lux-gold/15 dark:border-lux-gold/10 rounded-sm text-xs text-stone-600 dark:text-stone-400 space-y-2">
                        <div className="flex items-center gap-2 text-lux-gold font-semibold font-mono uppercase tracking-wider text-[10px]">
                          <Lock className="w-3.5 h-3.5" />
                          <span>Secure OIDC Authentication</span>
                        </div>
                        <p className="font-light leading-relaxed">
                          Your account is secured via Telegram OpenID Connect (OIDC). We never store passwords directly, ensuring your account is immune to typical credential leaks.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Bottom Action Bar */}
            {activeTab !== 'security' && (
              <div className="mt-12 pt-6 border-t border-stone-100 dark:border-stone-850/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <p className="text-[10px] text-stone-400 dark:text-stone-500 italic font-light">
                  * Verify your details before finalizing modifications.
                </p>
                <div className="flex items-center justify-end gap-4 shrink-0">
                  <AnimatePresence>
                    {saveSuccess && (
                      <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="flex items-center gap-2 text-green-600 dark:text-green-400 text-xs font-mono font-medium"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Changes saved</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="px-6 py-2.5 bg-stone-900 dark:bg-stone-800 hover:bg-lux-gold text-white hover:text-stone-950 font-mono text-[10px] uppercase font-bold tracking-widest rounded-xs transition-all duration-300 disabled:opacity-50 flex items-center gap-2 shadow-md hover:shadow-lux-gold/10 cursor-pointer"
                  >
                    {isSaving ? (
                      <>
                        <span className="w-3 h-3 border-2 border-stone-950 border-t-transparent rounded-full animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <span>Save Changes</span>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
