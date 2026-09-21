export default function HelpGuideBanner() {
  return (
    <section className="max-w-3xl mx-auto px-4 sm:px-6">
      <div className="bg-stone-50 dark:bg-stone-900/40 border border-stone-200/60 dark:border-stone-850 rounded-sm p-8 text-center shadow-xs">
        <h3 className="font-serif text-xl text-stone-900 dark:text-stone-100 mb-2">Have specific questions?</h3>
        <p className="text-stone-500 dark:text-stone-400 font-light text-sm mb-6 max-w-md mx-auto">
          Check our Support & Guide page for detailed instructions on ordering, tracking, and our frequently asked questions.
        </p>
        <a href="/help" className="inline-flex items-center justify-center px-6 py-2.5 bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-stone-800 dark:text-stone-200 font-medium text-xs tracking-widest uppercase rounded-sm hover:border-lux-gold dark:hover:border-lux-gold transition-colors font-semibold">
          Visit the Help Guide
        </a>
      </div>
    </section>
  );
}