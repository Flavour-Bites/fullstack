import { MessageSquare, Star, Trash2 } from 'lucide-react';
import { t } from '@client/i18n/index';
import { SkeletonCard } from '../../../components/Skeleton';
import type { ReviewItem } from '../types';

interface AdminReviewsProps {
  reviewItems: ReviewItem[];
  reviewsLoading: boolean;
  handleDeleteReview: (id: string, author: string) => Promise<boolean | undefined>;
  fetchReviews: () => Promise<void>;
}

export default function AdminReviews({
  reviewItems,
  reviewsLoading,
  handleDeleteReview,
  fetchReviews,
}: AdminReviewsProps) {
  return (
    <div className="max-w-7xl mx-auto space-y-5 relative z-10 font-sans">
      <div className="flex justify-between items-center bg-stone-50 dark:bg-stone-900 p-5 border border-stone-200 dark:border-stone-800 rounded-sm">
        <h2 className="font-serif text-xl text-stone-900 dark:text-white flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-lux-gold" /> {t('admin.reviews')} ({reviewItems.length})
        </h2>
        <button
          type="button"
          onClick={() => void fetchReviews()}
          disabled={reviewsLoading}
          className="text-xs uppercase tracking-wider font-semibold text-lux-gold hover:text-lux-gold/80 transition-colors disabled:opacity-50 cursor-pointer"
        >
          Refresh
        </button>
      </div>

      {reviewsLoading ? (
        <div className="space-y-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : reviewItems.length === 0 ? (
        <div className="text-center py-16 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-sm">
          <MessageSquare className="w-10 h-10 text-stone-400 dark:text-stone-500 mx-auto mb-3" />
          <p className="text-sm font-serif text-stone-600 dark:text-stone-300 italic">{t('admin.noReviews')}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviewItems.map(rev => {
            const isDeletedAccount = !rev.userId;
            return (
              <div key={rev.id} className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-sm p-5 text-left">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-serif text-base text-stone-900 dark:text-white font-medium">{rev.author}</h3>
                      {isDeletedAccount && (
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-stone-500 border border-stone-300 dark:border-stone-700">
                          Deleted Account
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`w-3.5 h-3.5 ${i < rev.rating ? 'text-lux-gold fill-lux-gold' : 'text-stone-300 dark:text-stone-600'}`} />
                        ))}
                      </div>
                      <span className="text-[10px] text-stone-400 dark:text-stone-400 font-mono">{rev.eventType}</span>
                      <span className="text-[10px] text-stone-400 dark:text-stone-400 font-mono">• {rev.date}</span>
                    </div>
                  </div>
                  <div>
                    <button
                      onClick={() => handleDeleteReview(rev.id, rev.author)}
                      aria-label={t('admin.deleteReview')}
                      className="p-1.5 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-400 dark:text-stone-500 hover:text-red-400 rounded-xs border border-stone-200 dark:border-stone-800"
                      title={t('admin.deleteReview')}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-stone-600 dark:text-stone-300 font-light mt-3 leading-relaxed">"{rev.content}"</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
