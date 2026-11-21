import { motion } from 'motion/react';
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { t } from '@client/i18n/index';

const COLLECTIONS = [
  {
    image: '/gallery_wedding.png',
    alt: 'Celebration Sculptures',
    badgeKey: 'home.customBadge',
    titleKey: 'home.celebrationSculptures',
    descKey: 'home.celebrationSculpturesDesc',
    linkKey: 'home.viewElegantTiers',
  },
  {
    image: '/gallery_birthday.png',
    alt: 'Milestones & Birthdays',
    badgeKey: 'home.milestonesBadge',
    titleKey: 'home.milestonesBirthdays',
    descKey: 'home.milestonesBirthdaysDesc',
    linkKey: 'home.viewModernCakes',
  },
  {
    image: '/gallery_treats.png',
    alt: 'Cookies & Treats',
    badgeKey: 'home.petitFoursBadge',
    titleKey: 'home.cookiesTreats',
    descKey: 'home.cookiesTreatsDesc',
    linkKey: 'home.viewGourmetSweets',
  },
];

export default function HomeCollections() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6">
      <div className="text-center max-w-xl mx-auto mb-16">
        <span className="text-[10px] uppercase tracking-[0.25em] text-lux-gold font-bold block mb-2 font-mono">{t('home.specialties')}</span>
        <h2 className="text-3xl sm:text-4xl font-serif text-stone-900 dark:text-stone-100">{t('home.collectionsTitle')}</h2>
        <div className="h-[2px] w-12 bg-lux-gold mx-auto mt-4" />
        <p className="text-stone-550 dark:text-stone-400 text-xs font-light mt-3 leading-relaxed max-w-sm mx-auto">
          {t('home.collectionsDesc')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {COLLECTIONS.map((c) => (
          <motion.div
            key={c.image}
            whileHover={{ y: -6 }}
            transition={{ duration: 0.3 }}
            className="bg-white dark:bg-stone-950 p-6 shadow-sm hover:shadow-xl border border-stone-200/50 dark:border-stone-850 rounded-sm flex flex-col justify-between text-left"
          >
            <div>
              <div className="aspect-[4/5] overflow-hidden mb-6 relative group bg-stone-100 dark:bg-stone-900">
                <img
                  src={c.image}
                  alt={c.alt}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-black/5 group-hover:bg-black/0 transition-colors duration-300" />
                <div className="absolute top-4 left-4 inline-block bg-stone-900/95 backdrop-blur-md px-3 py-1 text-[9px] uppercase tracking-widest font-mono text-lux-gold rounded-full font-semibold">
                  {t(c.badgeKey)}
                </div>
              </div>
              <h3 className="text-xl font-serif text-stone-900 dark:text-stone-100 mb-2">{t(c.titleKey)}</h3>
              <p className="text-xs text-stone-600 dark:text-stone-400 font-light leading-relaxed mb-6 font-sans">
                {t(c.descKey)}
              </p>
            </div>
            <Link
              to="/gallery"
              className="text-lux-gold text-xs uppercase tracking-widest font-semibold hover:text-stone-900 hover:dark:text-white transition-colors flex items-center gap-1.5 self-start mt-auto font-mono cursor-pointer"
            >
              {t(c.linkKey)} <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}