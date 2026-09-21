import { t } from '@client/i18n/index';

export default function GalleryIntro() {
  return (
    <section className="text-center max-w-2xl mx-auto pt-16 sm:pt-20 md:pt-24 px-4">
      <h1 className="text-4xl sm:text-5xl font-serif text-warm-950 dark:text-stone-100 mb-6">{t('gallery.customGallery')}</h1>
      <p className="text-sm sm:text-base text-stone-700 dark:text-stone-300 font-light leading-relaxed max-w-lg mx-auto font-sans">
        {t('gallery.galleryDescription')}
      </p>
      <div className="h-[1px] w-24 bg-stone-300 dark:bg-stone-700 mx-auto mt-6" />
    </section>
  );
}