import { MapPin, Check, Navigation, ExternalLink } from 'lucide-react';
import { BUSINESS_INFO } from '../../../../shared/constants/index';

export default function StudioMapSection() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6">
      <div className="bg-stone-900 text-white p-8 sm:p-12 rounded-sm border border-stone-800 relative z-10 overflow-hidden font-sans">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left detail column */}
          <div className="lg:col-span-5 space-y-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-lux-gold/20 bg-lux-gold/5 font-sans">
              <MapPin className="w-3.5 h-3.5 text-lux-gold" />
              <span className="text-[9px] uppercase tracking-[0.25em] text-lux-gold font-mono font-semibold">Studio Location & Atelier</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-serif text-white">{BUSINESS_INFO.location.name}</h2>
            <p className="text-sm text-stone-300 font-light leading-relaxed font-sans">
              {BUSINESS_INFO.location.directionsNote}
            </p>

            <div className="space-y-3 pt-2 text-xs font-light text-stone-300 font-sans">
              <div className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-lux-gold shrink-0 mt-0.5" />
                <span>
                  <strong className="text-white font-medium">Address:</strong> {BUSINESS_INFO.location.fullAddress}
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-lux-gold shrink-0 mt-0.5" />
                <span>
                  <strong className="text-white font-medium">Coordinates:</strong> {BUSINESS_INFO.location.coordinates.display}
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-lux-gold shrink-0 mt-0.5" />
                <span>
                  <strong className="text-white font-medium">Pickup Hours:</strong> {BUSINESS_INFO.hours.pickup}
                </span>
              </div>
            </div>

            <div className="pt-2">
              <a
                href={BUSINESS_INFO.location.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-sm bg-lux-gold text-stone-950 font-semibold text-xs tracking-widest uppercase hover:bg-lux-gold-light transition-all shadow-md group cursor-pointer"
              >
                <Navigation className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                <span>Open in Google Maps</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-70" />
              </a>
            </div>
          </div>

          {/* Embedded Google Maps Frame with Luxury Dark Styling */}
          <div className="lg:col-span-7">
            <div className="relative rounded-sm overflow-hidden border border-stone-800 bg-stone-950 shadow-2xl">
              {/* Header bar */}
              <div className="flex items-center justify-between px-4 py-2.5 bg-stone-950 border-b border-stone-800 text-[11px] font-mono text-stone-400">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-stone-200 font-medium">{BUSINESS_INFO.location.area}, {BUSINESS_INFO.location.city}</span>
                </div>
                <span className="text-stone-500 hidden sm:inline">{BUSINESS_INFO.location.coordinates.display}</span>
              </div>

              {/* Google Maps iFrame */}
              <div className="relative w-full h-[380px] sm:h-[440px] bg-stone-950">
                <iframe
                  title="Flavour Bites Studio Location — Garment, Addis Ababa"
                  src={BUSINESS_INFO.location.googleMapsEmbedUrl}
                  className="w-full h-full border-0"
                  loading="lazy"
                  allowFullScreen
                  referrerPolicy="no-referrer-when-downgrade"
                />

                {/* Floating studio badge overlay */}
                <div className="absolute bottom-4 left-4 pointer-events-none">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-xs bg-stone-950/90 backdrop-blur-md border border-stone-800 shadow-lg text-[11px] font-mono text-stone-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-lux-gold" />
                    <span>{BUSINESS_INFO.name} Atelier</span>
                    <span className="text-stone-500">•</span>
                    <span className="text-lux-gold">{BUSINESS_INFO.location.area}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}