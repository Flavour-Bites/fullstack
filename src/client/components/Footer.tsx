import { Send, Instagram, Mail, Phone, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BUSINESS_INFO } from '../../shared/constants/index';

export default function Footer() {
  return (
    <footer className="bg-stone-950 text-stone-300 relative z-10 font-sans overflow-hidden border-t border-stone-900/60">
      {/* Decorative top accent line with warm gold transition */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-lux-gold/40 to-transparent" />

      {/* Subtle warm background ambient glow */}
      <div 
        className="absolute top-0 left-1/3 w-[500px] h-48 bg-lux-gold/5 rounded-full blur-3xl pointer-events-none -translate-y-1/2" 
        aria-hidden="true"
      />

      {/* Main footer content - matching full-width header proportions */}
      <div className="w-full px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 pt-16 pb-12 relative">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10 xl:gap-12">
          {/* Main Brand Atelier column - visibly dominant anchor */}
          <div className="lg:col-span-4 xl:col-span-4 space-y-6">
            <Link to="/" className="inline-flex items-center gap-3 group">
              <div className="w-11 h-11 rounded-sm bg-stone-900 flex items-center justify-center text-lux-gold border border-stone-800 transition-all duration-300 group-hover:border-lux-gold/60 group-hover:shadow-[0_0_14px_rgba(197,168,128,0.25)]">
                <img 
                  src="/favicon_pink_f_1782078000588.jpg" 
                  alt="Flavour Bites" 
                  className="w-full h-full rounded-full object-cover" 
                />
              </div>
              <div className="flex flex-col">
                <span className="font-serif text-xl font-semibold tracking-tight text-white group-hover:text-lux-gold transition-colors">
                  FLAVOUR <span className="italic font-light text-lux-gold font-sans font-normal text-sm tracking-widest ml-0.5">BITES</span>
                </span>
                <span className="text-[10px] uppercase font-mono tracking-widest text-stone-300">
                  Custom Cake Boutique
                </span>
              </div>
            </Link>

            <p className="text-stone-200 font-normal leading-relaxed max-w-sm lg:max-w-md text-[13px]">
              Artisanal custom cake studio in Addis Ababa. Every cake is freshly baked to order by Chef Yodit Ashenafi — crafted to bring your special celebration to life with unmatched flavour and beauty.
            </p>

            {/* Social & direct contact chips */}
            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              <a
                href={BUSINESS_INFO.social.telegram.link}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-sm bg-stone-900 flex items-center justify-center text-stone-200 hover:text-lux-gold hover:bg-stone-850 hover:border-lux-gold/50 transition-all border border-stone-800"
                aria-label="Follow on Telegram"
              >
                <Send className="w-4 h-4 rotate-[-25deg]" />
              </a>
              <a
                href={BUSINESS_INFO.social.instagram.link}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-sm bg-stone-900 flex items-center justify-center text-stone-200 hover:text-lux-gold hover:bg-stone-850 hover:border-lux-gold/50 transition-all border border-stone-800"
                aria-label="Follow on Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href={`mailto:${BUSINESS_INFO.email}`}
                className="w-9 h-9 rounded-sm bg-stone-900 flex items-center justify-center text-stone-200 hover:text-lux-gold hover:bg-stone-850 hover:border-lux-gold/50 transition-all border border-stone-800"
                aria-label="Email us"
              >
                <Mail className="w-4 h-4" />
              </a>
              <a
                href={`tel:${BUSINESS_INFO.phone}`}
                className="inline-flex items-center gap-2 px-3 h-9 rounded-sm bg-stone-900 text-stone-200 hover:text-lux-gold hover:bg-stone-850 hover:border-lux-gold/50 transition-all border border-stone-800 text-xs font-mono"
                aria-label="Call studio"
              >
                <Phone className="w-3.5 h-3.5 text-lux-gold" />
                <span>{BUSINESS_INFO.phoneFormatted}</span>
              </a>
            </div>
          </div>

          {/* 3 Balanced Typographic Columns - wider allocation & closer to brand */}
          <div className="lg:col-span-8 xl:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-6 lg:gap-8 xl:gap-10">
            {/* Quick Links Column */}
            <div className="space-y-3.5">
              <h4 className="text-[11px] uppercase font-mono tracking-widest text-lux-gold font-bold">
                Quick Links
              </h4>
              <ul className="space-y-2.5 text-xs">
                <li>
                  <Link 
                    to="/gallery" 
                    className="text-stone-200 hover:text-lux-gold hover:translate-x-1 transition-all text-left block font-medium"
                  >
                    Gallery
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/about" 
                    className="text-stone-200 hover:text-lux-gold hover:translate-x-1 transition-all text-left block font-medium"
                  >
                    About Yodit
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/testimonials" 
                    className="text-stone-200 hover:text-lux-gold hover:translate-x-1 transition-all text-left block font-medium"
                  >
                    Reviews
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/help" 
                    className="text-stone-200 hover:text-lux-gold hover:translate-x-1 transition-all text-left block font-medium"
                  >
                    Help & FAQ
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/contact" 
                    className="text-stone-200 hover:text-lux-gold hover:translate-x-1 transition-all text-left block font-medium"
                  >
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            {/* Studio Location Column */}
            <div className="space-y-3.5">
              <h4 className="text-[11px] uppercase font-mono tracking-widest text-lux-gold font-bold">
                Studio Location
              </h4>
              <div className="space-y-2 text-xs">
                <p className="text-stone-100 font-medium text-sm leading-snug">
                  {BUSINESS_INFO.location.area}, {BUSINESS_INFO.location.subCity}
                </p>
                <p className="text-stone-200">
                  {BUSINESS_INFO.location.city}, {BUSINESS_INFO.location.country}
                </p>
                <div className="pt-1">
                  <span className="inline-block px-2.5 py-1 rounded-xs bg-stone-900 border border-stone-800 text-stone-200 text-[11px] font-medium">
                    Pre-scheduled pickups only
                  </span>
                </div>
                <div className="pt-1.5">
                  <a
                    href={BUSINESS_INFO.location.googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-lux-gold hover:text-white hover:underline text-xs transition-colors"
                  >
                    <span>Google Maps Directions</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>

            {/* Response Time & Schedule Column */}
            <div className="space-y-3.5">
              <h4 className="text-[11px] uppercase font-mono tracking-widest text-lux-gold font-bold">
                Response Time
              </h4>
              <div className="space-y-3 text-xs">
                {/* Response Commitment */}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-lux-gold shrink-0" aria-hidden="true" />
                    <span className="text-white font-medium text-sm leading-snug">
                      Within 24 hours
                    </span>
                  </div>
                  <p className="text-stone-400 text-[11px] mt-1 pl-3.5 leading-relaxed">
                    Direct reply via phone or Telegram
                  </p>
                </div>

                {/* Structured Studio Schedule Timetable */}
                <div className="pt-3 border-t border-stone-850/80 space-y-2">
                  <p className="text-stone-300 text-[10px] uppercase font-mono tracking-widest font-semibold">
                    Studio Schedule
                  </p>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-stone-300 font-medium">Tue – Sun</span>
                      <span className="text-stone-100 font-mono text-[11px]">9:00 AM – 6:00 PM</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-stone-400">Mondays</span>
                      <span className="text-stone-400 text-[11px] italic">Studio Prep (Closed)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar with chatbot button clearance */}
      <div className="border-t border-stone-850/80">
        <div className="w-full px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 py-5 flex flex-col sm:flex-row justify-between items-center gap-3 text-stone-200 text-xs font-normal pr-24 sm:pr-32 md:pr-36 lg:pr-40">
          <p>&copy; {new Date().getFullYear()} Flavour Bites. Handcrafted with care in Addis Ababa.</p>
          <span className="text-stone-200 font-medium">Made with love, one cake at a time</span>
        </div>
      </div>
    </footer>
  );
}
