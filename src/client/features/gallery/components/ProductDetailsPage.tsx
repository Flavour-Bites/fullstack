import { useParams, Link, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Cake, Star, ChevronLeft } from 'lucide-react';
import { t } from '@client/i18n/index';
import { usePageTitle } from '../../core/hooks/usePageTitle';
import { useGalleryQuery } from '../hooks/useGalleryQuery';
import { useProductReviews } from '../../core/hooks/useReviews';

export default function ProductDetailsPage() {
  usePageTitle("Product Details");
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: cakes = [] } = useGalleryQuery();
  const cake = cakes.find((c) => c.id === id);
  const { data: productReviews = [], isLoading: reviewsLoading } = useProductReviews(id || '');

  useEffect(() => {
    if (!cake && id) {
      navigate('/gallery', { replace: true });
    }
  }, [cake, id, navigate]);

  if (!cake) {
    return (
      <div className="bg-stone-50 dark:bg-stone-900 min-h-screen font-sans flex items-center justify-center px-4">
        <div className="text-center max-w-md p-8">
          <Cake className="w-16 h-16 text-stone-300 dark:text-stone-600 mx-auto mb-4 stroke-1" />
          <h2 className="text-2xl font-serif text-stone-900 dark:text-white mb-2">Product Not Found</h2>
          <p className="text-stone-500 dark:text-stone-400 mb-6">
            The cake you're looking for doesn't exist or has been removed.
          </p>
          <Link
            to="/gallery"
            className="inline-block px-6 py-2.5 bg-stone-900 dark:bg-stone-700 hover:bg-stone-800 dark:hover:bg-stone-600 text-white text-xs font-semibold uppercase tracking-widest rounded-sm transition-colors cursor-pointer font-mono"
          >
            Back to Gallery
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-stone-50 dark:bg-stone-900 min-h-screen font-sans pb-16">
      {/* Breadcrumb */}
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 py-6" aria-label="Breadcrumb">
        <ol className="flex items-center gap-2 text-sm font-sans">
          <li>
            <Link to="/" className="text-stone-500 dark:text-stone-400 hover:text-lux-gold transition-colors">
              Home
            </Link>
          </li>
          <li className="text-stone-300 dark:text-stone-600">/</li>
          <li>
            <Link to="/gallery" className="text-stone-500 dark:text-stone-400 hover:text-lux-gold transition-colors">
              {t('gallery.title')}
            </Link>
          </li>
          <li className="text-stone-300 dark:text-stone-600">/</li>
          <li className="text-stone-900 dark:text-white truncate max-w-[200px]">{cake.name}</li>
        </ol>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
        {/* Product Header */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Image */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="aspect-[3/4] bg-stone-100 dark:bg-stone-900 rounded-sm overflow-hidden">
              <img
                src={cake.image}
                alt={cake.name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="absolute top-4 left-4 bg-stone-900/90 text-white text-[10px] tracking-widest uppercase font-mono px-3 py-1 shadow-md font-semibold font-bold rounded-xs">
              {t('gallery.collection')} {cake.category?.name ?? cake.categoryId}
            </div>
          </motion.div>

          {/* Product Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="space-y-8 pt-4"
          >
            <div>
              <h1 className="text-3xl md:text-4xl font-serif text-warm-950 dark:text-stone-100 leading-tight mb-4">
                {cake.name}
              </h1>
              <span className="text-lux-gold font-mono text-xs uppercase tracking-wide bg-lux-gold/10 px-4 py-1.5 rounded-sm inline-block font-semibold">
                {t('gallery.priceEstimate')}: {cake.priceEstimate}
              </span>
            </div>

            <hr className="border-stone-250/65 dark:border-stone-800" />

            <div className="space-y-6">
              <div>
                <h2 className="text-[10px] uppercase tracking-widest text-stone-500 dark:text-stone-450 font-bold font-mono mb-3">
                  {t('gallery.designConcept')}
                </h2>
                <p className="text-stone-600 dark:text-stone-300 text-base font-light leading-relaxed">
                  {cake.description}
                </p>
              </div>

              {cake.tags && cake.tags.length > 0 && (
                <div>
                  <h2 className="text-[10px] uppercase tracking-widest text-stone-500 dark:text-stone-450 font-bold font-mono mb-3">
                    {t('gallery.stylingElements')}
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {cake.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1.5 bg-stone-905 dark:bg-stone-900 text-lux-gold border border-stone-800 text-xs font-mono rounded-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h2 className="text-[10px] uppercase tracking-widest text-stone-500 dark:text-stone-450 font-bold font-mono mb-3">
                  {t('gallery.flavorPairings')}
                </h2>
                <div className="flex flex-wrap gap-2">
                  {cake.flavors.map((flv, idx) => (
                    <span key={idx} className="px-4 py-2 bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-sm text-stone-700 dark:text-stone-300 font-light rounded-sm">
                      {flv}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-white dark:bg-stone-950 p-6 border border-stone-200/50 dark:border-stone-850 rounded-sm shadow-xs">
                <div>
                  <h3 className="text-[9px] uppercase tracking-widest text-stone-450 dark:text-stone-500 font-bold font-mono mb-1">
                    {t('gallery.servingsCapacity')}
                  </h3>
                  <p className="text-sm font-semibold text-stone-850 dark:text-stone-100">{cake.servingCount}</p>
                </div>
                <div>
                  <h3 className="text-[9px] uppercase tracking-widest text-stone-450 dark:text-stone-500 font-bold font-mono mb-1">
                    {t('gallery.leadTime')}
                  </h3>
                  <p className="text-sm font-semibold text-stone-850 dark:text-stone-100">
                    {t('gallery.min48Hours')}
                  </p>
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="space-y-4 pt-6 border-t border-stone-200/50 dark:border-stone-800">
              <button
                onClick={() => navigate('/request', { state: { prefilledCake: cake } })}
                className="w-full py-4 bg-stone-900 dark:bg-stone-800 text-white font-medium text-xs tracking-[0.2em] uppercase rounded-sm transition-all shadow-md hover:bg-stone-800 dark:hover:bg-stone-700 cursor-pointer flex items-center justify-center gap-2 hover:translate-y-[-1px]"
              >
                <Cake className="w-4 h-4 text-lux-gold" />
                {t('gallery.orderSimilar')}
              </button>
              <Link
                to="/gallery"
                className="w-full inline-flex items-center justify-center py-3 px-4 bg-transparent border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 font-medium text-xs tracking-[0.2em] uppercase rounded-sm transition-all hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                {t('gallery.backToGallery')}
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Product Reviews Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="border-t border-stone-200/50 dark:border-stone-800 pt-12"
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-serif text-stone-900 dark:text-white mb-2">
                {t('testimonials.title')}
              </h2>
              <p className="text-stone-500 dark:text-stone-400 font-light">
                {t('testimonials.subtitle')}
              </p>
            </div>
            <span className="px-3 py-1 bg-lux-gold/10 text-lux-gold text-xs font-mono uppercase tracking-wider rounded-full font-semibold">
              {productReviews.length} {productReviews.length === 1 ? 'Review' : 'Reviews'}
            </span>
          </div>

          {reviewsLoading ? (
            <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="break-inside-avoid bg-white dark:bg-stone-800 p-8 rounded-2xl border border-stone-100 dark:border-stone-700/50 animate-pulse space-y-4">
                  <div className="h-4 bg-stone-200 dark:bg-stone-700 rounded-sm w-1/4" />
                  <div className="h-5 bg-stone-200 dark:bg-stone-700 rounded-sm w-full" />
                  <div className="h-5 bg-stone-200 dark:bg-stone-700 rounded-sm w-3/4" />
                  <div className="pt-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-stone-200 dark:bg-stone-700" />
                    <div className="space-y-1.5 flex-1">
                      <div className="h-3 bg-stone-200 dark:bg-stone-700 rounded-sm w-1/2" />
                      <div className="h-2 bg-stone-200 dark:bg-stone-700 rounded-sm w-1/3" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : productReviews.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-stone-800/80 border border-stone-150 dark:border-stone-700/50 rounded-2xl max-w-3xl mx-auto p-8 shadow-xs">
              <Star className="w-12 h-12 text-stone-300 dark:text-stone-600 mx-auto mb-4 stroke-1" />
              <h3 className="text-xl font-serif text-stone-900 dark:text-stone-100 mb-2">No reviews for this cake yet</h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 font-light leading-relaxed mb-6">
                Be the first to share your experience with the <strong>{cake.name}</strong>!
              </p>
              <Link
                to="/request"
                className="inline-block px-6 py-2.5 bg-stone-900 dark:bg-stone-700 hover:bg-stone-800 dark:hover:bg-stone-600 text-white text-xs font-semibold uppercase tracking-widest rounded-sm transition-colors cursor-pointer font-mono"
              >
                Order This Cake
              </Link>
            </div>
          ) : (
            <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
              <AnimatePresence>
                {productReviews.map((review, idx) => {
                  const userPhoto = review.user?.telegramPhoto;
                  return (
                    <motion.div
                      layout
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-50px" }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.6, delay: (idx % 3) * 0.1, ease: "easeOut" }}
                      key={review.id}
                      className="break-inside-avoid bg-white dark:bg-stone-800 p-8 rounded-2xl shadow-xs border border-stone-100 dark:border-stone-700/50 hover:shadow-lg transition-shadow duration-300 relative group"
                    >
                      <Star className="absolute top-6 right-6 w-8 h-8 text-lux-gold/20 dark:text-lux-gold/10 group-hover:text-lux-gold/40 transition-colors duration-300" />
                      
                      {/* Rating Stars */}
                      <div className="flex gap-1 mb-6">
                        {Array.from({ length: review.rating }).map((_, i) => (
                          <span key={i} className="text-lux-gold text-sm leading-none">★</span>
                        ))}
                      </div>

                      <p className="text-stone-700 dark:text-stone-200 font-serif text-lg leading-relaxed mb-8">
                        "{review.content}"
                      </p>

                      <div className="flex items-center gap-4 pt-6 border-t border-stone-100 dark:border-stone-700/50">
                        {userPhoto ? (
                          <img
                            src={userPhoto}
                            alt={review.author}
                            className="w-12 h-12 rounded-full object-cover border border-stone-200 dark:border-stone-700"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-lux-gold/20 border border-lux-gold/40 flex items-center justify-center text-lux-gold font-serif font-bold text-sm shrink-0">
                            {review.author ? review.author.charAt(0).toUpperCase() : 'FB'}
                          </div>
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-stone-900 dark:text-stone-100 text-sm">
                              {review.author}
                            </h4>
                            {!review.userId && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400 border border-stone-200 dark:border-stone-700 font-medium">
                                Deleted Account
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-stone-500 dark:text-stone-400 block mt-0.5">
                            {review.eventType} • {review.role}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </motion.section>
      </div>
    </div>
  );
}