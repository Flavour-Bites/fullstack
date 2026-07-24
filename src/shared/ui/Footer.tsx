import { Cake, Send, MapPin, Clock, ArrowRight, Quote, Instagram, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

interface FooterProps {
  isAdminMode: boolean;
}

export default function Footer({ isAdminMode }: FooterProps) {
  if (isAdminMode) {
    return (
      <footer className="bg-[#111111] text-stone-500 border-t border-stone-900/60 py-6 text-[10px] relative z-10 font-sans">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row justify-between items-center gap-3">
          <div>
            <p>&copy; {new Date().getFullYear()} Flavour Bites &bull; Staff Portal Active &bull; Yodit Ashenafi</p>
          </div>
          <div className="flex gap-4 font-mono uppercase text-[9px] tracking-widest text-[#c5a880] items-center">
            <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live</span>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className="bg-[#111111] text-stone-300 relative z-10 font-sans overflow-hidden">
      {/* Decorative top accent */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-lux-gold/40 to-transparent" />

      {/* Main footer content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-16 pb-10">
        {/* Top row: Brand + Quick info */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mb-14">
          {/* Brand column */}
          <div className="lg:col-span-5 space-y-5">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-sm bg-stone-800/80 flex items-center justify-center text-lux-gold border border-stone-700/50">
                <Cake className="w-5 h-5" />
              </div>
              <span className="font-serif text-xl font-semibold tracking-tight text-white">
                FLAVOUR <span className="italic font-light text-lux-gold font-sans font-normal text-sm tracking-widest ml-0.5">BITES</span>
              </span>
            </div>
            <p className="text-stone-400 font-light leading-relaxed max-w-sm text-[13px]">
              Commission-only artisan bakery in Addis Ababa. Every cake is hand-crafted to order by Yodit Ashenafi — no shelves, no stock, just your vision brought to life.
            </p>
            <div className="flex gap-3 pt-1">
              <a href="https://t.me/flavourbites_placeholder" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-sm bg-stone-800/60 flex items-center justify-center text-stone-400 hover:text-lux-gold hover:bg-stone-800 transition-all border border-stone-700/30" aria-label="Follow on Telegram">
                <Send className="w-4 h-4 rotate-[-25deg]" />
              </a>
              <a href="https://instagram.com/flavourbites" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-sm bg-stone-800/60 flex items-center justify-center text-stone-400 hover:text-lux-gold hover:bg-stone-800 transition-all border border-stone-700/30" aria-label="Follow on Instagram">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="mailto:hello@flavourbites.et" className="w-9 h-9 rounded-sm bg-stone-800/60 flex items-center justify-center text-stone-400 hover:text-lux-gold hover:bg-stone-800 transition-all border border-stone-700/30" aria-label="Email us">
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Bento info cards */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Location card */}
            <div className="bg-stone-800/30 border border-stone-700/40 rounded-sm p-5 space-y-3 hover:border-lux-gold/20 transition-colors group">
              <div className="w-8 h-8 rounded-sm bg-stone-800 flex items-center justify-center text-lux-gold/70 group-hover:text-lux-gold transition-colors">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-mono tracking-widest text-stone-500 font-semibold mb-1">Studio Location</p>
                <p className="text-white text-sm font-light">Addis Ababa, Ethiopia</p>
                <p className="text-stone-500 text-xs mt-1">Pre-scheduled pickups only</p>
              </div>
            </div>

            {/* Response time card */}
            <div className="bg-stone-800/30 border border-stone-700/40 rounded-sm p-5 space-y-3 hover:border-lux-gold/20 transition-colors group">
              <div className="w-8 h-8 rounded-sm bg-stone-800 flex items-center justify-center text-lux-gold/70 group-hover:text-lux-gold transition-colors">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-mono tracking-widest text-stone-500 font-semibold mb-1">Response Time</p>
                <p className="text-white text-sm font-light">Within 24 hours</p>
                <p className="text-stone-500 text-xs mt-1">Via phone or Telegram</p>
              </div>
            </div>

            {/* Quick links card */}
            <div className="bg-stone-800/30 border border-stone-700/40 rounded-sm p-5 space-y-3 hover:border-lux-gold/20 transition-colors group">
              <div className="w-8 h-8 rounded-sm bg-stone-800 flex items-center justify-center text-lux-gold/70 group-hover:text-lux-gold transition-colors">
                <ArrowRight className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-mono tracking-widest text-stone-500 font-semibold mb-2">Quick Links</p>
                <ul className="space-y-1.5">
                  <li><Link to="/gallery" className="text-stone-300 hover:text-lux-gold text-xs transition-colors cursor-pointer text-left block">Gallery</Link></li>
                  <li><Link to="/about" className="text-stone-300 hover:text-lux-gold text-xs transition-colors cursor-pointer text-left block">About Yodit</Link></li>
                  <li><Link to="/testimonials" className="text-stone-300 hover:text-lux-gold text-xs transition-colors cursor-pointer text-left block">Reviews</Link></li>
                  <li><Link to="/contact" className="text-stone-300 hover:text-lux-gold text-xs transition-colors cursor-pointer text-left block">Contact</Link></li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Testimonial strip */}
        <div className="border-t border-stone-800/80 pt-10 mb-10">
          <div className="max-w-2xl mx-auto text-center space-y-4">
            <Quote className="w-6 h-6 text-lux-gold/30 mx-auto" />
            <blockquote className="font-serif text-base sm:text-lg text-stone-200 italic leading-relaxed font-light">
              &ldquo;Yodit&rsquo;s cakes are more than dessert — they&rsquo;re the centrepiece of our most cherished celebrations. Every detail, every flavour, crafted with care.&rdquo;
            </blockquote>
            <div className="flex items-center justify-center gap-2 pt-1">
              <div className="w-8 h-8 rounded-full bg-stone-700 flex items-center justify-center text-lux-gold text-[10px] font-serif font-bold">A</div>
              <div className="text-left">
                <p className="text-stone-300 text-xs font-medium">Abebaw</p>
                <p className="text-stone-500 text-[10px]">Milestone Birthday Celebration</p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA strip */}
        <div className="border-t border-stone-800/80 pt-10 mb-10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 bg-stone-800/20 border border-stone-700/30 rounded-sm p-6 sm:p-8">
            <div>
              <h3 className="font-serif text-lg text-white mb-1">Ready to create something memorable?</h3>
              <p className="text-stone-400 text-xs font-light">Tell us about your celebration. Yodit will reach out to bring your vision to life.</p>
            </div>
            <Link
              to="/request"
              className="shrink-0 px-8 py-3 bg-lux-gold text-stone-950 font-bold text-[11px] uppercase tracking-[0.2em] rounded-sm hover:bg-white transition-colors cursor-pointer flex items-center gap-2"
            >
              Commission Your Cake
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-stone-800/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 flex flex-col sm:flex-row justify-between items-center gap-3 text-stone-600 text-[11px] font-light">
          <p>&copy; {new Date().getFullYear()} Flavour Bites. Handcrafted with care in Addis Ababa.</p>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-lux-gold/50" />
            <span className="text-stone-500">Made with love, one cake at a time</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
