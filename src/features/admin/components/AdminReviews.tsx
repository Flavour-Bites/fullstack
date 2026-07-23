import { useState } from 'react';
import { MessageSquare, Star, Edit3, Trash2, Save, Loader2 } from 'lucide-react';
import { t } from '../../../i18n/index';
import { SkeletonCard } from '../../../shared/ui/Skeleton';
import type { ReviewItem } from './types';

interface AdminReviewsProps {
  reviewItems: ReviewItem[];
  reviewsLoading: boolean;
  handleDeleteReview: (id: string, author: string) => Promise<boolean | undefined>;
  handleSaveReview: (id: string, content: string, rating: number) => Promise<boolean | undefined>;
  fetchReviews: () => Promise<void>;
}

export default function AdminReviews({
  reviewItems, reviewsLoading,
  handleDeleteReview, handleSaveReview, fetchReviews,
}: AdminReviewsProps) {
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [editReviewContent, setEditReviewContent] = useState('');
  const [editReviewRating, setEditReviewRating] = useState(5);
  const [savingReview, setSavingReview] = useState(false);

  const handleSave = async (id: string) => {
    setSavingReview(true);
    const ok = await handleSaveReview(id, editReviewContent, editReviewRating);
    if (ok) {
      setEditingReviewId(null);
      fetchReviews();
    }
    setSavingReview(false);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-5 relative z-10 font-sans">
      <div className="flex justify-between items-center bg-stone-50 dark:bg-[#1d1916] p-5 border border-stone-200 dark:border-stone-800 rounded-sm">
        <h2 className="font-serif text-xl text-stone-900 dark:text-white flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-lux-gold" /> {t('admin.reviews')} ({reviewItems.length})
        </h2>
      </div>

      {reviewsLoading ? (
        <div className="space-y-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : reviewItems.length === 0 ? (
        <div className="text-center py-16 bg-stone-50 dark:bg-[#1d1916] border border-stone-200 dark:border-stone-800 rounded-sm">
          <MessageSquare className="w-10 h-10 text-stone-400 dark:text-stone-500 mx-auto mb-3" />
          <p className="text-sm font-serif text-stone-600 dark:text-stone-300 italic">{t('admin.noReviews')}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviewItems.map(rev => {
            const isEditing = editingReviewId === rev.id;
            return (
              <div key={rev.id} className="bg-white dark:bg-[#1e1a17] border border-stone-200 dark:border-stone-800 rounded-sm p-5 text-left">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-serif text-base text-stone-900 dark:text-white font-medium">{rev.author}</h3>
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
                  <div className="flex gap-1">
                    <button
                      onClick={() => {
                        if (isEditing) { setEditingReviewId(null); return; }
                        setEditingReviewId(rev.id);
                        setEditReviewContent(rev.content);
                        setEditReviewRating(rev.rating);
                      }}
                      aria-label={t('admin.editReview')}
                      className="p-1.5 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-400 dark:text-stone-400 hover:text-lux-gold rounded-xs border border-stone-200 dark:border-stone-800"
                      title={t('admin.editReview')}
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleDeleteReview(rev.id, rev.author)} aria-label={t('admin.deleteReview')} className="p-1.5 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-400 dark:text-stone-500 hover:text-red-400 rounded-xs border border-stone-200 dark:border-stone-800" title={t('admin.deleteReview')}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {isEditing ? (
                  <div className="mt-4 space-y-3 p-4 bg-stone-100 dark:bg-[#15110f] border border-stone-200 dark:border-stone-800 rounded-xs">
                    <div>
                      <label className="text-[9px] uppercase tracking-wider font-mono text-stone-400 dark:text-stone-400 block mb-1">{t('admin.reviewRating')}</label>
                      <select value={editReviewRating} onChange={e => setEditReviewRating(Number(e.target.value))} className="w-full bg-stone-100 dark:bg-[#15110f] border border-stone-200 dark:border-stone-800 p-2 text-xs text-stone-700 dark:text-stone-200 focus:outline-none rounded-xs">
                        {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n} Star{n > 1 ? 's' : ''}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-[9px] uppercase tracking-wider font-mono text-stone-400 dark:text-stone-400 block mb-1">{t('admin.reviewContent')}</label>
                      <textarea value={editReviewContent} onChange={e => setEditReviewContent(e.target.value)} rows={3} className="w-full bg-stone-100 dark:bg-[#15110f] border border-stone-200 dark:border-stone-800 p-2 text-xs text-stone-700 dark:text-stone-200 focus:outline-none rounded-xs" />
                    </div>
                    <div className="flex justify-end gap-2">
                      <button onClick={() => setEditingReviewId(null)} className="px-3 py-1.5 text-[10px] font-mono font-bold uppercase bg-stone-200 dark:bg-stone-800 text-stone-500 dark:text-stone-400 hover:bg-stone-300 dark:hover:bg-stone-700 rounded-sm">{t('admin.cancelEdit')}</button>
                      <button onClick={() => handleSave(rev.id)} disabled={savingReview} className="px-3.5 py-1.5 text-[10px] font-mono font-bold uppercase bg-lux-gold text-stone-950 hover:bg-white rounded-sm flex items-center gap-1">
                        {savingReview ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />} {t('admin.saveChanges')}
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-stone-600 dark:text-stone-300 font-light mt-3 leading-relaxed">"{rev.content}"</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
