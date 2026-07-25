import { ArrowRight } from 'lucide-react';

export default function RequestSidebar() {
  return (
    <div className="lg:col-span-4 space-y-6">
      <div className="bg-white dark:bg-[#111111] p-6 border border-stone-200/60 dark:border-stone-850 rounded-sm space-y-4">
        <h4 className="font-serif text-lg text-stone-900 dark:text-stone-100 font-medium">How it works</h4>
        <ul className="space-y-3.5 text-xs text-stone-600 dark:text-stone-300 font-light font-sans text-left">
          <li className="flex items-start gap-2.5">
            <div className="text-lux-gold font-mono mt-0.5">1</div>
            <p>Submit your request with a date and cake description.</p>
          </li>
          <li className="flex items-start gap-2.5">
            <div className="text-lux-gold font-mono mt-0.5">2</div>
            <p>Yodit reaches out to discuss flavours, design, and pricing.</p>
          </li>
          <li className="flex items-start gap-2.5">
            <div className="text-lux-gold font-mono mt-0.5">3</div>
            <p>Once confirmed, your cake enters production and you track it live.</p>
          </li>
        </ul>
      </div>

      <div className="bg-white dark:bg-[#111111] p-6 border border-stone-200/60 dark:border-stone-850 rounded-sm space-y-4">
        <h4 className="font-serif text-lg text-stone-900 dark:text-stone-100 font-medium">Why Flavour Bites?</h4>
        <ul className="space-y-3.5 text-xs text-stone-600 dark:text-stone-300 font-light font-sans text-left">
          <li className="flex items-start gap-2.5">
            <div className="text-lux-gold font-mono mt-0.5">&#10003;</div>
            <p>A few orders each week, so every cake gets full attention.</p>
          </li>
          <li className="flex items-start gap-2.5">
            <div className="text-lux-gold font-mono mt-0.5">&#10003;</div>
            <p>Pure ingredients, no stabilizers, entirely handcrafted.</p>
          </li>
          <li className="flex items-start gap-2.5">
            <div className="text-lux-gold font-mono mt-0.5">&#10003;</div>
            <p>Dietary requirements (eggless, dairy-free) strictly isolated.</p>
          </li>
        </ul>
      </div>

      <a
        href="#gallery"
        onClick={(e) => { e.preventDefault(); window.history.back(); }}
        className="flex items-center justify-center gap-2 py-3 border border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-300 hover:border-lux-gold hover:text-lux-gold text-xs font-medium tracking-wider uppercase rounded-sm transition-all cursor-pointer"
      >
        Browse the Gallery
        <ArrowRight className="w-3.5 h-3.5" />
      </a>
    </div>
  );
}
