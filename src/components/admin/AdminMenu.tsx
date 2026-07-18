import React, { useState } from 'react';
import { Package, Plus, Image, Save, Loader2, Trash2, Pencil } from 'lucide-react';
import { t } from '../../i18n';
import { SkeletonGrid } from '../Skeleton';

interface AdminMenuProps {
  galleryItems: any[];
  galleryLoading: boolean;
  categories: any[];
  handleSaveGalleryItem: (galleryForm: any, editingGalleryId: string | null) => Promise<boolean | undefined>;
  handleDeleteGalleryItem: (id: string, name: string) => Promise<boolean | undefined>;
}

export default function AdminMenu({ galleryItems, galleryLoading, categories, handleSaveGalleryItem, handleDeleteGalleryItem }: AdminMenuProps) {
  const [showGalleryForm, setShowGalleryForm] = useState(false);
  const [editingGalleryId, setEditingGalleryId] = useState<string | null>(null);
  const [galleryForm, setGalleryForm] = useState({ name: '', description: '', categoryId: '', flavors: '', priceEstimate: '', image: '', servingCount: '', tags: '' });
  const [savingGallery, setSavingGallery] = useState(false);

  const startEditGalleryItem = (item: any) => {
    setEditingGalleryId(item.id);
    setGalleryForm({
      name: item.name,
      description: item.description || '',
      categoryId: item.categoryId || '',
      flavors: Array.isArray(item.flavors) ? item.flavors.join(', ') : '',
      priceEstimate: item.priceEstimate,
      image: item.image || '',
      servingCount: item.servingCount || '',
      tags: Array.isArray(item.tags) ? item.tags.join(', ') : '',
    });
    setShowGalleryForm(true);
  };

  const onSave = async () => {
    setSavingGallery(true);
    await handleSaveGalleryItem(galleryForm, editingGalleryId);
    setShowGalleryForm(false);
    setEditingGalleryId(null);
    setGalleryForm({ name: '', description: '', categoryId: '', flavors: '', priceEstimate: '', image: '', servingCount: '', tags: '' });
    setSavingGallery(false);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 relative z-10 text-left font-sans">
      <div className="flex justify-between items-center bg-stone-50 dark:bg-[#1d1916] p-5 border border-stone-200 dark:border-stone-800 rounded-sm">
        <h2 className="font-serif text-xl text-stone-900 dark:text-white flex items-center gap-2">
          <Package className="w-5 h-5 text-lux-gold" /> Cake Menu ({galleryItems.length} items)
        </h2>
        <button
          onClick={() => { setShowGalleryForm(true); setEditingGalleryId(null); setGalleryForm({ name: '', description: '', categoryId: '', flavors: '', priceEstimate: '', image: '', servingCount: '', tags: '' }); }}
          className="px-3 py-1.5 bg-lux-gold text-stone-950 font-mono text-[10px] uppercase font-bold tracking-wider rounded-sm flex items-center gap-1.5 hover:bg-white transition-all cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" /> {t('admin.addGalleryItem')}
        </button>
      </div>

      {/* Gallery Create/Edit Form */}
      {showGalleryForm && (
        <div className="bg-white dark:bg-[#1e1a17] border border-lux-gold/30 dark:border-[#c5a880]/30 rounded-sm p-6 space-y-4">
          <h3 className="font-serif text-base text-stone-900 dark:text-white font-medium">
            {editingGalleryId ? t('admin.editGalleryItem') : t('admin.addGalleryItem')}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[9px] uppercase tracking-wider font-mono text-stone-400 dark:text-stone-400 block mb-1">{t('admin.itemName')}</label>
              <input value={galleryForm.name} onChange={e => setGalleryForm(f => ({ ...f, name: e.target.value }))} className="w-full bg-stone-100 dark:bg-[#15110f] border border-stone-200 dark:border-stone-800 p-2 text-xs text-stone-700 dark:text-stone-200 focus:outline-none rounded-xs" />
            </div>
            <div>
              <label className="text-[9px] uppercase tracking-wider font-mono text-stone-400 dark:text-stone-400 block mb-1">{t('admin.itemCategory')}</label>
              <select value={galleryForm.categoryId} onChange={e => setGalleryForm(f => ({ ...f, categoryId: e.target.value }))} className="w-full bg-stone-100 dark:bg-[#15110f] border border-stone-200 dark:border-stone-800 p-2 text-xs text-stone-700 dark:text-stone-200 focus:outline-none rounded-xs">
                <option value="">— No category —</option>
                {categories.filter((c: any) => c.isActive).map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="text-[9px] uppercase tracking-wider font-mono text-stone-400 dark:text-stone-400 block mb-1">{t('admin.itemDescription')}</label>
              <textarea value={galleryForm.description} onChange={e => setGalleryForm(f => ({ ...f, description: e.target.value }))} rows={3} className="w-full bg-stone-100 dark:bg-[#15110f] border border-stone-200 dark:border-stone-800 p-2 text-xs text-stone-700 dark:text-stone-200 focus:outline-none rounded-xs" />
            </div>
            <div>
              <label className="text-[9px] uppercase tracking-wider font-mono text-stone-400 dark:text-stone-400 block mb-1">{t('admin.itemFlavors')}</label>
              <input value={galleryForm.flavors} onChange={e => setGalleryForm(f => ({ ...f, flavors: e.target.value }))} placeholder="Vanilla, Chocolate" className="w-full bg-stone-100 dark:bg-[#15110f] border border-stone-200 dark:border-stone-800 p-2 text-xs text-stone-700 dark:text-stone-200 focus:outline-none rounded-xs" />
            </div>
            <div>
              <label className="text-[9px] uppercase tracking-wider font-mono text-stone-400 dark:text-stone-400 block mb-1">{t('admin.itemPrice')}</label>
              <input value={galleryForm.priceEstimate} onChange={e => setGalleryForm(f => ({ ...f, priceEstimate: e.target.value }))} placeholder="From 4,500 ETB" className="w-full bg-stone-100 dark:bg-[#15110f] border border-stone-200 dark:border-stone-800 p-2 text-xs text-stone-700 dark:text-stone-200 focus:outline-none rounded-xs" />
            </div>
            <div>
              <label className="text-[9px] uppercase tracking-wider font-mono text-stone-400 dark:text-stone-400 block mb-1">{t('admin.itemImage')}</label>
              <input value={galleryForm.image} onChange={e => setGalleryForm(f => ({ ...f, image: e.target.value }))} placeholder="https://..." className="w-full bg-stone-100 dark:bg-[#15110f] border border-stone-200 dark:border-stone-800 p-2 text-xs text-stone-700 dark:text-stone-200 focus:outline-none rounded-xs" />
            </div>
            <div>
              <label className="text-[9px] uppercase tracking-wider font-mono text-stone-400 dark:text-stone-400 block mb-1">{t('admin.itemServingCount')}</label>
              <input value={galleryForm.servingCount} onChange={e => setGalleryForm(f => ({ ...f, servingCount: e.target.value }))} placeholder="10-15 guests" className="w-full bg-stone-100 dark:bg-[#15110f] border border-stone-200 dark:border-stone-800 p-2 text-xs text-stone-700 dark:text-stone-200 focus:outline-none rounded-xs" />
            </div>
            <div>
              <label className="text-[9px] uppercase tracking-wider font-mono text-stone-400 dark:text-stone-400 block mb-1">{t('admin.itemTags')}</label>
              <input value={galleryForm.tags} onChange={e => setGalleryForm(f => ({ ...f, tags: e.target.value }))} placeholder="birthday, chocolate" className="w-full bg-stone-100 dark:bg-[#15110f] border border-stone-200 dark:border-stone-800 p-2 text-xs text-stone-700 dark:text-stone-200 focus:outline-none rounded-xs" />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => { setShowGalleryForm(false); setEditingGalleryId(null); }} className="px-3 py-1.5 text-[10px] font-mono font-bold uppercase bg-stone-200 dark:bg-stone-800 text-stone-500 dark:text-stone-400 hover:bg-stone-300 dark:hover:bg-stone-700 rounded-sm">{t('admin.cancelEdit')}</button>
            <button onClick={onSave} disabled={savingGallery} className="px-3.5 py-1.5 text-[10px] font-mono font-bold uppercase bg-lux-gold text-stone-950 hover:bg-white rounded-sm flex items-center gap-1">
              {savingGallery ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />} {t('admin.saveChanges')}
            </button>
          </div>
        </div>
      )}

      {galleryLoading ? (
        <SkeletonGrid items={6} />
      ) : galleryItems.length === 0 ? (
        <div className="text-center py-20 bg-stone-50 dark:bg-[#1d1916] border border-stone-200 dark:border-stone-800 rounded-sm">
          <Image className="w-10 h-10 text-stone-400 dark:text-stone-500 mx-auto mb-3" />
          <p className="text-sm font-serif text-stone-600 dark:text-stone-300 italic">No gallery items yet.</p>
          <p className="text-xs text-stone-400 dark:text-stone-500 mt-1">Add your first cake to the menu.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {galleryItems.map((item: any) => (
            <div key={item.id} className="bg-[#1e1a17] border border-stone-200 dark:border-stone-800 rounded-sm overflow-hidden group">
              <img src={item.image} alt={item.name} className="h-44 w-full object-cover grayscale brightness-75 group-hover:grayscale-0 group-hover:brightness-100 transition-all duration-300" referrerPolicy="no-referrer" />
              <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[9px] uppercase tracking-widest font-mono text-lux-gold bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 px-2 py-0.5 rounded-sm">{item.category?.name ?? item.categoryId}</span>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => startEditGalleryItem(item)} aria-label={t('admin.editGalleryItem')} className="p-1 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-400 dark:text-stone-400 hover:text-lux-gold rounded-xs border border-stone-200 dark:border-stone-800" title={t('admin.editGalleryItem')}>
                      <Pencil className="w-3 h-3" />
                    </button>
                    <button onClick={() => handleDeleteGalleryItem(item.id, item.name)} aria-label={t('admin.deleteGalleryItem')} className="p-1 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-400 dark:text-stone-500 hover:text-red-400 rounded-xs border border-stone-200 dark:border-stone-800" title={t('admin.deleteGalleryItem')}>
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                <h3 className="font-serif text-base text-stone-100 font-medium">{item.name}</h3>
                <p className="text-xs text-stone-400 dark:text-stone-400 font-light mt-1 leading-relaxed line-clamp-2">{item.description}</p>
                <div className="mt-4 pt-3 border-t border-stone-200/60 dark:border-stone-800/60 font-mono text-[11px] text-stone-600 dark:text-stone-300 flex justify-between">
                  <span>Serves: <strong className="text-stone-100 font-normal">{item.servingCount}</strong></span>
                  <span className="text-emerald-400 font-semibold">{item.priceEstimate}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
