import { useState, useCallback } from 'react';
import { useToast } from '../components/Toast';
import type { Category } from '../components/admin/types';

export function useCategories() {
  const { showToast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);

  const fetchCategories = useCallback(async () => {
    setCategoriesLoading(true);
    try {
      const res = await fetch('/api/categories?includeInactive=true');
      const data = await res.json();
      if (data.success) setCategories(data.categories || []);
    } catch (e) { /* ignore */ }
    finally { setCategoriesLoading(false); }
  }, []);

  const handleSaveCategory = useCallback(async (categoryForm: any, editingCategoryId: string | null) => {
    if (!categoryForm.name.trim()) { showToast('Validation', 'Name is required.', 'error'); return false; }
    try {
      const slug = categoryForm.slug || categoryForm.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      const body: Record<string, unknown> = { ...categoryForm, slug };
      if (editingCategoryId) {
        const res = await fetch(`/api/categories/${editingCategoryId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        const data = await res.json();
        if (data.success) {
          showToast('Category Updated', `"${categoryForm.name}" updated.`, 'success');
        } else throw new Error(data.error);
      } else {
        const res = await fetch('/api/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        const data = await res.json();
        if (data.success) {
          showToast('Category Created', `"${categoryForm.name}" added.`, 'success');
        } else throw new Error(data.error);
      }
      fetchCategories();
      return true;
    } catch (e: any) { showToast('Failed', e.message, 'error'); }
    return false;
  }, []);

  const handleDeleteCategory = useCallback(async (id: string, name: string) => {
    if (!window.confirm(`Delete category "${name}"? Gallery items in it will become uncategorized.`)) return false;
    try {
      const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showToast('Category Deleted', `"${name}" removed.`, 'warning');
        fetchCategories();
        return true;
      } else throw new Error(data.error);
    } catch (e: any) { showToast('Delete Failed', e.message, 'error'); }
    return false;
  }, []);

  const handleToggleCategoryActive = useCallback(async (cat: Category) => {
    try {
      const res = await fetch(`/api/categories/${cat.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !cat.isActive }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('Category Updated', `"${cat.name}" is now ${cat.isActive ? 'inactive' : 'active'}.`, 'success');
        fetchCategories();
      } else throw new Error(data.error);
    } catch (e: any) { showToast('Failed', e.message, 'error'); }
  }, []);

  return {
    categories,
    categoriesLoading,
    fetchCategories,
    handleSaveCategory,
    handleDeleteCategory,
    handleToggleCategoryActive,
  };
}
