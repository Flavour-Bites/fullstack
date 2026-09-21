import { AnimatePresence } from 'motion/react';
import { t } from '@client/i18n/index';
import { usePageTitle } from '../../core/hooks/usePageTitle';
import { User as UserType } from '@shared/types';
import { useProfileForm } from '../hooks/useProfileForm';
import ProfileSidebar from './profile/ProfileSidebar';
import PersonalInfoTab from './profile/PersonalInfoTab';
import PreferencesTab from './profile/PreferencesTab';
import NotificationsTab from './profile/NotificationsTab';
import SecurityTab from './profile/SecurityTab';
import ProfileSaveBar from './profile/ProfileSaveBar';

interface ProfileViewProps {
  currentUser: UserType;
  onLogout: () => void;
  onUpdateUser?: (updated: UserType) => void;
}

export default function ProfileView({ currentUser, onLogout, onUpdateUser }: ProfileViewProps) {
  usePageTitle("Profile");
  const profile = useProfileForm(currentUser, onUpdateUser);

  if (!currentUser) {
    return (
      <div className="bg-lux-cream/30 dark:bg-stone-950/30 min-h-screen py-16 px-4 flex justify-center items-center font-sans">
        <p className="text-stone-500 dark:text-stone-400 font-light">Please log in to view your profile.</p>
      </div>
    );
  }

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
          <ProfileSidebar
            currentUser={currentUser}
            activeTab={profile.activeTab}
            onTabChange={profile.setActiveTab}
            onLogout={onLogout}
          />

          {/* Main Content Card Area */}
          <div className="md:col-span-8 lg:col-span-9 bg-white dark:bg-stone-900 border border-stone-200/50 dark:border-stone-850 rounded-sm shadow-sm p-6 sm:p-8 md:p-10 min-h-[550px] relative flex flex-col justify-between overflow-hidden">
            {/* Elegant top gradient border */}
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-lux-gold via-stone-200 dark:via-stone-800 to-transparent" />

            {/* Ambient visual background element */}
            <div className="absolute -top-16 -right-16 w-36 h-36 bg-lux-gold/[0.02] rounded-full blur-xl pointer-events-none" />

            <div className="flex-grow">
              <AnimatePresence mode="wait">
                {profile.activeTab === 'personal' && (
                  <PersonalInfoTab
                    key="personal"
                    name={profile.name}
                    phone={profile.phone}
                    onNameChange={profile.setName}
                    onPhoneChange={profile.setPhone}
                  />
                )}

                {profile.activeTab === 'preferences' && (
                  <PreferencesTab
                    key="preferences"
                    dietary={profile.dietary}
                    language={profile.language}
                    onDietaryToggle={profile.toggleDietary}
                    onLanguageChange={profile.setLanguage}
                  />
                )}

                {profile.activeTab === 'notifications' && (
                  <NotificationsTab
                    key="notifications"
                    notify={profile.notify}
                    onNotifyChange={profile.setNotify}
                  />
                )}

                {profile.activeTab === 'security' && (
                  <SecurityTab key="security" currentUser={currentUser} />
                )}
              </AnimatePresence>
            </div>

            {/* Bottom Action Bar */}
            <ProfileSaveBar
              visible={profile.activeTab !== 'security'}
              isSaving={profile.isSaving}
              saveSuccess={profile.saveSuccess}
              onSave={profile.handleSave}
            />
          </div>
        </div>
      </div>
    </div>
  );
}