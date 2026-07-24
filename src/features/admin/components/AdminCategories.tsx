import { useState } from 'react';
import { Layers, Plus, Save, Loader2, Edit3, Trash2, ToggleRight, ToggleLeft } from 'lucide-react';
import { t } from '../../../i18n/index';
import { SkeletonTable } from '../../../shared/ui/Skeleton';
import type { Category } from './types';

interface AdminCategoriesProps {
  categories: Category[];
  categoriesLoading: boolean;
  handleSaveCategory: (form: any, editingId: string | null) => Promise<boolean | undefined>;
  handleDeleteCategory: (id: string, name: string) => Promise<boolean | undefined>;
  handleToggleCategoryActive: (cat: Category) => Promise<void>;
  fetchCategories: () => Promise<void>;
}

export default function AdminCategories({
  categories, categoriesLoading,
  handleSaveCategory, handleDeleteCategory,
  handleToggleCategoryActive, fetchCategories,
}: AdminCategoriesProps) {
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [categoryForm, setCategoryForm] = useState({ name: '', slug: '', description: '', color: '', icon: '', sortOrder: 0 });
  const [savingCategory, setSavingCategory] = useState(false);

  const startEditCategory = (cat: Category) => {
    setEditingCategoryId(cat.id);
    setCategoryForm({
      name: cat.name,
      slug: cat.slug,
      description: cat.description || '',
      color: cat.color || '',
      icon: cat.icon || '',
      sortOrder: cat.sortOrder,
    });
    setShowCategoryForm(true);
  };

  const handleSave = async () => {
    if (!categoryForm.name.trim()) return;
    setSavingCategory(true);
    const ok = await handleSaveCategory(categoryForm, editingCategoryId);
    if (ok) {
      setShowCategoryForm(false);
      setEditingCategoryId(null);
      setCategoryForm({ name: '', slug: '', description: '', color: '', icon: '', sortOrder: 0 });
      fetchCategories();
    }
    setSavingCategory(false);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-5 relative z-10 font-sans">
      <div className="flex justify-between items-center bg-stone-50 dark:bg-[#1d1916] p-5 border border-stone-200 dark:border-stone-800 rounded-sm">
        <h2 className="font-serif text-xl text-stone-900 dark:text-white flex items-center gap-2">
          <Layers className="w-5 h-5 text-lux-gold" /> {t('admin.categories')} ({categories.length})
        </h2>
        <button
          onClick={() => { setShowCategoryForm(true); setEditingCategoryId(null); setCategoryForm({ name: '', slug: '', description: '', color: '', icon: '', sortOrder: 0 }); }}
          className="px-3 py-1.5 bg-lux-gold text-stone-950 font-mono text-[10px] uppercase font-bold tracking-wider rounded-sm flex items-center gap-1.5 hover:bg-white transition-all cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" /> {t('admin.addCategory')}
        </button>
      </div>

      {showCategoryForm && (
        <div className="bg-white dark:bg-[#1e1a17] border border-lux-gold/30 dark:border-[#c5a880]/30 rounded-sm p-6 space-y-4">
          <h3 className="font-serif text-base text-stone-900 dark:text-white font-medium">
            {editingCategoryId ? t('admin.editCategory') : t('admin.addCategory')}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[9px] uppercase tracking-wider font-mono text-stone-400 dark:text-stone-400 block mb-1">{t('admin.categoryName')}</label>
              <input value={categoryForm.name} onChange={e => setCategoryForm(f => ({ ...f, name: e.target.value }))} className="w-full bg-stone-100 dark:bg-[#15110f] border border-stone-200 dark:border-stone-800 p-2 text-xs text-stone-700 dark:text-stone-200 focus:outline-none rounded-xs" />
            </div>
            <div>
              <label className="text-[9px] uppercase tracking-wider font-mono text-stone-400 dark:text-stone-400 block mb-1">{t('admin.categorySlug')}</label>
              <input value={categoryForm.slug} onChange={e => setCategoryForm(f => ({ ...f, slug: e.target.value }))} placeholder="Auto-generated if empty" className="w-full bg-stone-100 dark:bg-[#15110f] border border-stone-200 dark:border-stone-800 p-2 text-xs text-stone-700 dark:text-stone-200 focus:outline-none rounded-xs" />
            </div>
            <div className="sm:col-span-2">
              <label className="text-[9px] uppercase tracking-wider font-mono text-stone-400 dark:text-stone-400 block mb-1">{t('admin.categoryDescription')}</label>
              <textarea value={categoryForm.description} onChange={e => setCategoryForm(f => ({ ...f, description: e.target.value }))} rows={2} className="w-full bg-stone-100 dark:bg-[#15110f] border border-stone-200 dark:border-stone-800 p-2 text-xs text-stone-700 dark:text-stone-200 focus:outline-none rounded-xs" />
            </div>
            <div>
              <label className="text-[9px] uppercase tracking-wider font-mono text-stone-400 dark:text-stone-400 block mb-1">{t('admin.categoryColor')}</label>
              <input value={categoryForm.color} onChange={e => setCategoryForm(f => ({ ...f, color: e.target.value }))} placeholder="#c5a880" className="w-full bg-stone-100 dark:bg-[#15110f] border border-stone-200 dark:border-stone-800 p-2 text-xs text-stone-700 dark:text-stone-200 focus:outline-none rounded-xs" />
            </div>
            <div>
              <label className="text-[9px] uppercase tracking-wider font-mono text-stone-400 dark:text-stone-400 block mb-1">{t('admin.categoryIcon')}</label>
              <input value={categoryForm.icon} onChange={e => setCategoryForm(f => ({ ...f, icon: e.target.value }))} placeholder="Cake" className="w-full bg-stone-100 dark:bg-[#15110f] border border-stone-200 dark:border-stone-800 p-2 text-xs text-stone-700 dark:text-stone-200 focus:outline-none rounded-xs" />
            </div>
            <div>
              <label className="text-[9px] uppercase tracking-wider font-mono text-stone-400 dark:text-stone-400 block mb-1">{t('admin.categorySortOrder')}</label>
              <input type="number" value={categoryForm.sortOrder} onChange={e => setCategoryForm(f => ({ ...f, sortOrder: parseInt(e.target.value) || 0 }))} className="w-full bg-stone-100 dark:bg-[#15110f] border border-stone-200 dark:border-stone-800 p-2 text-xs text-stone-700 dark:text-stone-200 focus:outline-none rounded-xs" />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => { setShowCategoryForm(false); setEditingCategoryId(null); }} className="px-3 py-1.5 text-[10px] font-mono font-bold uppercase bg-stone-200 dark:bg-stone-800 text-stone-500 dark:text-stone-400 hover:bg-stone-300 dark:hover:bg-stone-700 rounded-sm">{t('admin.cancelEdit')}</button>
            <button onClick={handleSave} disabled={savingCategory} className="px-3.5 py-1.5 text-[10px] font-mono font-bold uppercase bg-lux-gold text-stone-950 hover:bg-white rounded-sm flex items-center gap-1">
              {savingCategory ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />} {t('admin.saveChanges')}
            </button>
          </div>
        </div>
      )}

      {categoriesLoading ? (
        <SkeletonTable rows={4} cols={3} />
      ) : categories.length === 0 ? (
        <div className="text-center py-16 bg-stone-50 dark:bg-[#1d1916] border border-stone-200 dark:border-stone-800 rounded-sm">
          <Layers className="w-10 h-10 text-stone-400 dark:text-stone-500 mx-auto mb-3" />
          <p className="text-sm font-serif text-stone-600 dark:text-stone-300 italic">{t('admin.noCategories')}</p>
        </div>
      ) : (
        <div className="bg-[#1e1a17] border border-stone-200 dark:border-stone-800 rounded-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-100 dark:bg-[#15110f] text-stone-400 dark:text-stone-400 uppercase font-mono tracking-wider font-semibold border-b border-stone-200 dark:border-stone-800">
                <tr>
                  <th className="px-5 py-4">{t('admin.categoryName')}</th>
                  <th className="px-5 py-4">{t('admin.categorySlug')}</th>
                  <th className="px-5 py-4">{t('admin.categorySortOrder')}</th>
                  <th className="px-5 py-4">{t('admin.categoryColor')}</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4 text-right">{t('admin.saveChanges')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800/60">
                {categories.map(cat => (
                  <tr key={cat.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-5 py-4 font-serif italic text-stone-900 dark:text-white text-sm">{cat.name}</td>
                    <td className="px-5 py-4 text-stone-500 dark:text-stone-400 font-mono text-[10px]">{cat.slug}</td>
                    <td className="px-5 py-4 text-stone-400 dark:text-stone-500">{cat.sortOrder}</td>
                    <td className="px-5 py-4">
                      {cat.color ? <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full border" style={{ backgroundColor: cat.color }} />{cat.color}</span> : <span className="text-stone-500">—</span>}
                    </td>
                    <td className="px-5 py-4">
                      <button onClick={() => handleToggleCategoryActive(cat)} className={`text-[9px] font-mono uppercase font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${cat.isActive ? 'bg-emerald-900/20 border-emerald-800 text-emerald-400' : 'bg-stone-800 border-stone-700 text-stone-500'}`}>
                        {cat.isActive ? <ToggleRight className="w-3 h-3" /> : <ToggleLeft className="w-3 h-3" />}
                        {cat.isActive ? t('admin.active') : t('admin.inactive')}
                      </button>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => startEditCategory(cat)} aria-label={t('admin.editCategory')} className="p-1.5 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-400 dark:text-stone-400 hover:text-lux-gold rounded-xs border border-stone-200 dark:border-stone-800" title={t('admin.editCategory')}>
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleDeleteCategory(cat.id, cat.name)} aria-label={t('admin.deleteCategory')} className="p-1.5 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-400 dark:text-stone-500 hover:text-red-400 rounded-xs border border-stone-200 dark:border-stone-800" title={t('admin.deleteCategory')}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
