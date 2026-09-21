import { t } from '@client/i18n/index';

export default function ContactIntro() {
  return (
    <section className="text-center max-w-2xl mx-auto pt-6 px-4">
      <h1 className="text-4xl sm:text-5xl font-serif text-warm-950 dark:text-stone-100 mb-3">{t('contact.title')}</h1>
      <p className="text-sm sm:text-base text-stone-600 dark:text-stone-300 font-light leading-relaxed max-w-lg mx-auto font-sans">
        {t('contact.getInTouch')} — {t('contact.yoditChecks')}
      </p>
      <div className="h-[1px] w-24 bg-stone-300 mx-auto mt-6" />
    </section>
  );
}