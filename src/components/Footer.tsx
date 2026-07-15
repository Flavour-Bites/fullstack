import React from 'react';
import { Cake, Send, Instagram, Mail, Compass } from 'lucide-react';
import type { PageType } from '../types';

interface FooterProps {
  isAdminMode: boolean;
  onNavigate: (page: PageType) => void;
}

export default function Footer({ isAdminMode, onNavigate }: FooterProps) {
  if (isAdminMode) {
    return (
      <footer className="bg-[#111111] text-stone-500 border-t border-stone-900/60 py-6 text-[10px] relative z-10 font-sans">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row justify-between items-center gap-3">
          <div>
            <p>© {new Date().getFullYear()} Flavour Bites • Master Staff Portal Active • Powered by Neon Postgres Container.</p>
          </div>
          <div className="flex gap-4 font-mono uppercase text-[9px] tracking-widest text-[#c5a880] items-center">
            <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live Node Secure</span>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className="bg-[#111111] text-white border-t border-stone-800 pt-16 pb-8 text-xs relative z-10 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-12 gap-12 pb-12 border-b border-stone-850">

        {/* Branding */}
        <div className="md:col-span-4 space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-sm bg-stone-800 flex items-center justify-center text-lux-gold">
              <Cake className="w-4.5 h-4.5" />
            </div>
            <span className="font-serif text-lg font-semibold tracking-tight text-white block">
              FLAVOUR <span className="italic font-light text-lux-gold font-sans font-normal text-sm tracking-widest ml-0.5">BITES</span>
            </span>
          </div>
          <p className="text-stone-400 font-light leading-relaxed max-w-sm">
            Commission-only cake customizer and home-based artisan bakery. We hand-craft custom landmark birthday cakes, celebratory bakes, and gourmet treats. Pre-scheduled pickups at our home studio in Addis Ababa, Ethiopia.
          </p>
          <div className="flex gap-4 pt-2">
            <a href="https://t.me/flavourbites_placeholder" target="_blank" rel="noopener noreferrer" className="text-stone-400 hover:text-lux-gold transition-colors block" aria-label="Follow us on Telegram">
              <Send className="w-5 h-5 rotate-[-25deg]" />
            </a>
            <a href="#instagram" className="text-stone-400 hover:text-lux-gold transition-colors block" aria-label="Follow us on Instagram">
              <Instagram className="w-5 h-5" />
            </a>
            <a href="#mail" className="text-stone-400 hover:text-lux-gold transition-colors block" aria-label="Email our concierge">
              <Mail className="w-5 h-5" />
            </a>
            <a href="#about" onClick={(e) => { e.preventDefault(); onNavigate('about'); }} className="text-stone-400 hover:text-lux-gold transition-colors block cursor-pointer text-left" aria-label="Compass coordinates">
              <Compass className="w-5 h-5" />
            </a>
          </div>
        </div>

        {/* Sitemaps */}
        <div className="md:col-span-3 col-span-1 space-y-4">
          <h4 className="text-[10px] uppercase font-mono tracking-widest text-lux-gold font-semibold">The Studio</h4>
          <ul className="space-y-2.5 font-light text-stone-300">
            <li><button onClick={() => onNavigate('home')} className="hover:text-lux-gold transition-colors cursor-pointer text-left font-sans">Welcome Salon</button></li>
            <li><button onClick={() => onNavigate('about')} className="hover:text-lux-gold transition-colors cursor-pointer text-left font-sans">Meet Yodit Ashenafi</button></li>
            <li><button onClick={() => onNavigate('testimonials')} className="hover:text-lux-gold transition-colors cursor-pointer text-left font-sans">Celebration Stories</button></li>
            <li><button onClick={() => onNavigate('contact')} className="hover:text-lux-gold transition-colors cursor-pointer text-left font-sans">Coordinates Office</button></li>
          </ul>
        </div>

        {/* Cake Categories */}
        <div className="md:col-span-4 col-span-1 space-y-4">
          <h4 className="text-[10px] uppercase font-mono tracking-widest text-lux-gold font-semibold">Cake Categories</h4>
          <ul className="space-y-2.5 font-light text-stone-300">
            <li><button onClick={() => onNavigate('gallery')} className="hover:text-lux-gold transition-colors cursor-pointer text-left font-sans">Bespoke Celebrations</button></li>
            <li><button onClick={() => onNavigate('gallery')} className="hover:text-lux-gold transition-colors cursor-pointer text-left font-sans">Elite Birthday Bakes</button></li>
            <li><button onClick={() => onNavigate('gallery')} className="hover:text-lux-gold transition-colors cursor-pointer text-left font-sans">Gourmet Treats</button></li>
            <li><button onClick={() => onNavigate('gallery')} className="hover:text-lux-gold transition-colors cursor-pointer text-left font-sans">Fairytale Kids Bakes</button></li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-stone-500 font-light font-sans">
        <div>
          <p>© {new Date().getFullYear()} Flavour Bites. Handcrafted in Addis Ababa, Ethiopia. All reserves held.</p>
        </div>
        <div className="flex gap-6">
          <a href="#terms" className="hover:text-white transition-colors">Terms of Commission</a>
          <a href="#privacy" className="hover:text-white transition-colors">Privacy Ordinance</a>
          <a href="#sourcing" className="hover:text-white transition-colors">Ingredient Integrity</a>
        </div>
      </div>
    </footer>
  );
}
