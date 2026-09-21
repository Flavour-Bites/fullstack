import { MapPin, Send, Mail, Phone } from 'lucide-react';
import { t } from '@client/i18n/index';
import { BUSINESS_INFO } from '../../../../shared/constants/index';

function ContactDetail({
  icon,
  label,
  children,
  accent = false,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <div className="flex gap-4 items-start">
      <div className="w-5 h-5 text-lux-gold shrink-0 mt-0.5">{icon}</div>
      <div>
        <label className={`text-[10px] uppercase font-mono tracking-widest ${accent ? 'text-lux-gold' : 'text-stone-400 dark:text-stone-500'} font-semibold block mb-0.5`}>
          {label}
        </label>
        {children}
      </div>
    </div>
  );
}

function ContactCoordinates() {
  return (
    <div className="bg-white dark:bg-stone-950 p-8 border border-stone-200/60 dark:border-stone-850 rounded-sm shadow-xs space-y-6">
      <h2 className="font-serif text-2xl text-warm-950 dark:text-stone-100">{t('contact.coordinates')}</h2>
      <div className="h-[2px] w-12 bg-lux-gold" />

      <div className="space-y-6 text-sm text-stone-600 dark:text-stone-350 font-sans font-light text-left">
        <ContactDetail
          icon={<MapPin className="w-5 h-5 text-lux-gold" />}
          label={t('contact.studioLocation')}
        >
          <p className="text-stone-850 dark:text-stone-150 font-medium">{BUSINESS_INFO.location.name}</p>
          <p className="dark:text-stone-300">{BUSINESS_INFO.location.area}, {BUSINESS_INFO.location.subCity}</p>
          <p className="dark:text-stone-300">{BUSINESS_INFO.location.city}, {BUSINESS_INFO.location.country}</p>
        </ContactDetail>

        <ContactDetail
          icon={<Send className="w-5 h-5 text-lux-gold rotate-[-25deg]" />}
          label={t('contact.telegramChannel')}
          accent
        >
          <p className="font-semibold text-stone-800 dark:text-stone-200">
            <a href={BUSINESS_INFO.social.telegram.link} target="_blank" rel="noopener noreferrer" className="hover:text-lux-gold transition-colors underline">
              {BUSINESS_INFO.social.telegram.handle}
            </a>
          </p>
          <span className="text-[11px] text-stone-400 dark:text-stone-500">{t('contact.quickestChannel')}</span>
        </ContactDetail>

        <ContactDetail
          icon={<Mail className="w-5 h-5 text-lux-gold" />}
          label={t('contact.inquiriesMailbox')}
        >
          <p className="font-mono dark:text-stone-300">{BUSINESS_INFO.email}</p>
        </ContactDetail>

        <ContactDetail
          icon={<Phone className="w-5 h-5 text-lux-gold" />}
          label={t('contact.directVoice')}
        >
          <p className="font-mono text-stone-800 dark:text-stone-150 font-semibold">{BUSINESS_INFO.phone}</p>
          <p className="text-xs text-stone-400 dark:text-stone-500 font-light">{t('contact.workingHours')}</p>
        </ContactDetail>
      </div>
    </div>
  );
}

function StudioHours() {
  return (
    <div className="bg-stone-900 text-white p-8 rounded-sm shadow-xl space-y-4 border border-stone-800 font-sans">
      <div className="flex items-center gap-2">
        <MapPin className="w-5 h-5 text-lux-gold" />
        <h3 className="font-serif text-lg text-white">{t('contact.studioLocation')}</h3>
      </div>
      <p className="text-xs text-stone-400 font-light leading-relaxed font-sans">
        {t('contact.operatingInfo')}
      </p>
      <div className="p-4 bg-stone-850 rounded-xs border border-stone-800 space-y-2 text-xs font-sans">
        <div className="flex justify-between items-center">
          <span className="font-mono text-stone-400 text-[10px] uppercase">{t('contact.topic')}</span>
          <span className="font-mono text-lux-gold font-semibold">{BUSINESS_INFO.location.name.toUpperCase()}</span>
        </div>
        <div className="flex justify-between items-center border-t border-stone-800 pt-2">
          <span className="font-mono text-stone-400 text-[10px] uppercase">Pickup Hours</span>
          <span className="text-xs font-mono text-stone-200">{BUSINESS_INFO.hours.pickup}</span>
        </div>
      </div>
    </div>
  );
}

export default function ContactInfoColumn() {
  return (
    <div className="lg:col-span-5 space-y-8">
      <ContactCoordinates />
      <StudioHours />
    </div>
  );
}