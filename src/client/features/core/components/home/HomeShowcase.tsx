import { ChevronRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Product } from '@shared/types';
import { t } from '@client/i18n/index';

interface HomeShowcaseProps {
  featuredCakes: Product[];
  onSelectCake: (cake: Product) => void;
}

export default function HomeShowcase({ featuredCakes, onSelectCake }: HomeShowcaseProps) {
  const navigate = useNavigate();

  return (
    <section className="bg-stone-50 dark:bg-stone-950 py-20 relative border-y border-stone-200/50 dark:border-stone-850/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-end mb-12 border-b border-stone-200 dark:border-stone-850 pb-6 text-left">
          <div>
            <span className="text-[10px] uppercase tracking-[0.3em] text-lux-gold font-bold block mb-2 font-mono">{t('home.portfolioSubtitle')}</span>
            <h2 className="text-3xl font-serif text-stone-900 dark:text-stone-100">{t('home.portfolioTitle')}</h2>
          </div>
          <Link
            to="/gallery"
            className="text-stone-900 dark:text-stone-200 text-xs font-semibold uppercase tracking-widest hover:text-lux-gold dark:hover:text-lux-gold transition-colors flex items-center gap-1 mt-4 sm:mt-0 cursor-pointer font-mono"
          >
            {t('home.explorePortfolio')}
            <ChevronRight className="w-4 h-4 text-lux-gold" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {featuredCakes.map((cake) => (
            <div
              key={cake.id}
              className="group cursor-pointer text-left bg-white dark:bg-stone-950 border border-stone-200/60 dark:border-stone-850/70 p-4 rounded-sm shadow-xs transition-all duration-300 hover:shadow-xl"
              onClick={() => {
                onSelectCake(cake);
                navigate('/gallery');
              }}
            >
              <div className="aspect-[3/4] overflow-hidden mb-4 relative bg-stone-100 dark:bg-stone-900 rounded-sm">
                <img
                  src={cake.image}
                  alt={cake.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-4 left-4 px-3 py-1 bg-stone-900/90 backdrop-blur-md text-lux-gold text-[9px] uppercase font-mono tracking-widest rounded-full border border-stone-800">
                  {typeof cake.category === 'string' ? cake.category : cake.category?.name}
                </div>
              </div>
              <div className="flex justify-between items-start pt-1.5 font-sans">
                <div>
                  <h4 className="font-serif text-lg text-stone-900 dark:text-stone-100 group-hover:text-lux-gold transition-colors font-semibold">{cake.name}</h4>
                  <p className="text-xs text-stone-500 dark:text-stone-400 font-light mt-1 font-sans">{cake.servingCount}</p>
                </div>
                <span className="font-mono text-xs text-lux-gold font-bold bg-lux-gold/10 px-2 py-1 rounded-sm border border-lux-gold/15 shrink-0">{cake.priceEstimate}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}