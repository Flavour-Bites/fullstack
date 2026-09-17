import { useState, useCallback } from 'react';
import { useToast } from '../../../shared/ui/Toast';
import { http, ApiResponse } from '../../../shared/utils/http';
import type { Category } from '../../admin/components/types';

export function useCategories() {
  const { showToast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);

  const fetchCategories = useCallback(async () => {
    setCategoriesLoading(true);
    try {
      const { data } = await http.get<ApiResponse<{ categories: Category[] }>>('/api/categories?includeInactive=true');
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
        const { data } = await http.patch<ApiResponse>(`/api/categories/${editingCategoryId}`, body);
        if (data.success) {
          showToast('Category Updated', `"${categoryForm.name}" updated.`, 'success');
        } else throw new Error(data.error);
      } else {
        const { data } = await http.post<ApiResponse>('/api/categories', body);
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
      const { data } = await http.delete<ApiResponse>(`/api/categories/${id}`);
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
      const { data } = await http.patch<ApiResponse>(`/api/categories/${cat.id}`, { isActive: !cat.isActive });
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