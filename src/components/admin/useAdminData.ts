import { useState, useEffect, useCallback } from 'react';
import { useToast } from '../Toast';
import type { CakeRequest, SystemUser, Stats, Category, ReviewItem } from './types';
import { orderPrice } from './types';
import type { User } from '../../types';

export function useAdminData(currentUser: User | null) {
  const { showToast } = useToast();
  const isAdmin = currentUser?.role === 'admin';

  // Orders state
  const [requests, setRequests] = useState<CakeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [seeding, setSeeding] = useState(false);

  // Users state (admin only)
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);

  // Menu state
  const [galleryItems, setGalleryItems] = useState<any[]>([]);
  const [galleryLoading, setGalleryLoading] = useState(false);

  // Stats
  const [stats, setStats] = useState<Stats | null>(null);

  // Categories state
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);

  // Reviews state
  const [reviewItems, setReviewItems] = useState<ReviewItem[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  // Recovery state
  const [recoveryRequests, setRecoveryRequests] = useState<any[]>([]);
  const [recoveryLoading, setRecoveryLoading] = useState(false);
  const [recoveryStatusFilter, setRecoveryStatusFilter] = useState('all');

  // ── Data Fetching ──────────────────────────────────────────
  const fetchRequests = useCallback(async (silent = false) => {
    if (!silent) setRefreshing(true);
    try {
      const res = await fetch('/api/requests');
      const data = await res.json();
      if (data.success) {
        setRequests(data.requests || []);
        if (!silent) showToast('Orders Refreshed', `Loaded ${data.requests?.length || 0} orders.`, 'info');
      } else throw new Error(data.error);
    } catch (err: any) {
      showToast('Sync Failed', err.message, 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    setUsersLoading(true);
    try {
      const res = await fetch('/api/users');
      const data = await res.json();
      if (data.success) setUsers(data.users || []);
    } catch (e) { /* ignore */ }
    finally { setUsersLoading(false); }
  }, []);

  const fetchGallery = useCallback(async () => {
    setGalleryLoading(true);
    try {
      const res = await fetch('/api/gallery');
      const data = await res.json();
      if (data.success) setGalleryItems(data.items || []);
    } catch (e) { /* ignore */ }
    finally { setGalleryLoading(false); }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/stats');
      const data = await res.json();
      if (data.success) setStats(data.stats);
    } catch (e) { /* ignore */ }
  }, []);

  const fetchCategories = useCallback(async () => {
    setCategoriesLoading(true);
    try {
      const res = await fetch('/api/categories?includeInactive=true');
      const data = await res.json();
      if (data.success) setCategories(data.categories || []);
    } catch (e) { /* ignore */ }
    finally { setCategoriesLoading(false); }
  }, []);

  const fetchReviews = useCallback(async () => {
    setReviewsLoading(true);
    try {
      const res = await fetch('/api/reviews');
      const data = await res.json();
      if (data.success) setReviewItems(data.reviews || []);
    } catch (e) { /* ignore */ }
    finally { setReviewsLoading(false); }
  }, []);

  const fetchRecoveryRequests = useCallback(async () => {
    setRecoveryLoading(true);
    try {
      const url = recoveryStatusFilter === 'all' ? '/api/recovery' : `/api/recovery?status=${recoveryStatusFilter}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) setRecoveryRequests(data.requests || []);
    } catch (e) { /* ignore */ }
    finally { setRecoveryLoading(false); }
  }, [recoveryStatusFilter]);

  // ── Order Actions ──────────────────────────────────────────
  const handleDatabaseSeed = useCallback(async () => {
    setSeeding(true);
    try {
      const res = await fetch('/api/seed', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        showToast('Database Seeded', `Added ${data.seededRequests} orders and ${data.seededGalleryItems} menu items.`, 'success');
        fetchRequests(true); fetchStats();
      } else throw new Error(data.error);
    } catch (e: any) {
      showToast('Seeding Failed', e.message, 'error');
    } finally { setSeeding(false); }
  }, []);

  const handleDeleteRequest = useCallback(async (id: string, name: string) => {
    if (!window.confirm(`Delete order from ${name}? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/requests/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showToast('Order Deleted', `${name}'s order has been removed.`, 'warning');
        fetchRequests(true); fetchStats();
        return true;
      } else throw new Error(data.error);
    } catch (e: any) { showToast('Delete Failed', e.message, 'error'); }
    return false;
  }, []);

  const saveRequestUpdates = useCallback(async (id: string, name: string, editStatus: string, editCost: number, editDeposit: number) => {
    try {
      const body: Record<string, any> = { status: editStatus };
      if (editCost > 0) body.quotedPrice = editCost;
      if (editDeposit > 0) body.depositAmount = editDeposit;
      const res = await fetch(`/api/requests/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (data.success) {
        showToast('Order Updated', `${name}'s order updated — status: ${editStatus}, price: ${editCost.toLocaleString()} ETB.`, 'success');
        fetchRequests(true); fetchStats();
        return true;
      } else throw new Error(data.error);
    } catch (e: any) { showToast('Update Failed', e.message, 'error'); }
    return false;
  }, []);

  const advanceStatus = useCallback(async (req: CakeRequest, next: string) => {
    try {
      const res = await fetch(`/api/requests/${req.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: next })
      });
      const data = await res.json();
      if (data.success) {
        showToast('Status Updated', `${req.contactName}'s order moved to "${next}".`, 'success');
        fetchRequests(true); fetchStats();
        return true;
      }
    } catch (e: any) { showToast('Failed', e.message, 'error'); }
    return false;
  }, []);

  // ── User Role Actions (Admin Only) ────────────────────────
  const saveUserRole = useCallback(async (userId: string, userName: string, newRole: string) => {
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole })
      });
      const data = await res.json();
      if (data.success) {
        showToast('Role Updated', `${userName} is now a ${newRole}.`, 'success');
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
        fetchStats();
        return true;
      } else throw new Error(data.error);
    } catch (e: any) { showToast('Role Update Failed', e.message, 'error'); }
    return false;
  }, []);

  const deleteUser = useCallback(async (userId: string, userName: string) => {
    if (!window.confirm(`Delete user "${userName}"? All their data will be removed.`)) return false;
    try {
      const res = await fetch(`/api/users/${userId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showToast('User Deleted', `${userName} has been removed from the system.`, 'warning');
        setUsers(prev => prev.filter(u => u.id !== userId));
        fetchStats();
        return true;
      } else throw new Error(data.error);
    } catch (e: any) { showToast('Delete Failed', e.message, 'error'); }
    return false;
  }, []);

  // ── Category Actions ─────────────────────────────────────
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

  // ── Review Actions ───────────────────────────────────────
  const handleDeleteReview = useCallback(async (id: string, author: string) => {
    if (!window.confirm(`Delete review by ${author}? This cannot be undone.`)) return false;
    try {
      const res = await fetch(`/api/reviews/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showToast('Review Deleted', `Review by ${author} removed.`, 'warning');
        fetchReviews();
        return true;
      } else throw new Error(data.error);
    } catch (e: any) { showToast('Delete Failed', e.message, 'error'); }
    return false;
  }, []);

  const handleSaveReview = useCallback(async (id: string, content: string, rating: number) => {
    try {
      const res = await fetch(`/api/reviews/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, rating }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('Review Updated', 'Review updated successfully.', 'success');
        fetchReviews();
        return true;
      } else throw new Error(data.error);
    } catch (e: any) { showToast('Update Failed', e.message, 'error'); }
    return false;
  }, []);

  // ── Gallery CRUD Actions ────────────────────────────────
  const handleSaveGalleryItem = useCallback(async (galleryForm: any, editingGalleryId: string | null) => {
    if (!galleryForm.name.trim() || !galleryForm.priceEstimate.trim()) {
      showToast('Validation', 'Name and price are required.', 'error'); return false;
    }
    try {
      const body: Record<string, unknown> = {
        name: galleryForm.name,
        description: galleryForm.description,
        categoryId: galleryForm.categoryId || undefined,
        flavors: galleryForm.flavors.split(',').map((f: string) => f.trim()).filter(Boolean),
        priceEstimate: galleryForm.priceEstimate,
        image: galleryForm.image || undefined,
        servingCount: galleryForm.servingCount || undefined,
        tags: galleryForm.tags.split(',').map((t: string) => t.trim()).filter(Boolean),
      };
      if (editingGalleryId) {
        const res = await fetch(`/api/gallery/${editingGalleryId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        const data = await res.json();
        if (data.success) {
          showToast('Gallery Item Updated', `"${galleryForm.name}" updated.`, 'success');
        } else throw new Error(data.error);
      } else {
        const res = await fetch('/api/gallery', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        const data = await res.json();
        if (data.success) {
          showToast('Gallery Item Created', `"${galleryForm.name}" added.`, 'success');
        } else throw new Error(data.error);
      }
      fetchGallery();
      return true;
    } catch (e: any) { showToast('Failed', e.message, 'error'); }
    return false;
  }, []);

  const handleDeleteGalleryItem = useCallback(async (id: string, name: string) => {
    if (!window.confirm(`Delete gallery item "${name}"? This cannot be undone.`)) return false;
    try {
      const res = await fetch(`/api/gallery/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showToast('Gallery Item Deleted', `"${name}" removed.`, 'warning');
        fetchGallery();
        return true;
      } else throw new Error(data.error);
    } catch (e: any) { showToast('Delete Failed', e.message, 'error'); }
    return false;
  }, []);

  // ── Recovery Actions ────────────────────────────────────
  const handleRecoveryStatus = useCallback(async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/recovery/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('Recovery Updated', `Request ${status}.`, 'success');
        fetchRecoveryRequests();
      } else throw new Error(data.error);
    } catch (e: any) {
      showToast('Update Failed', e.message, 'error');
    }
  }, []);

  // ── Effects ────────────────────────────────────────────────
  useEffect(() => { fetchRequests(true); fetchStats(); }, []);

  // ── Derived Values ─────────────────────────────────────────
  const totalRevenue = requests.reduce((s, r) => s + orderPrice(r), 0);
  const pendingCount = requests.filter(r => r.status === 'Received' || r.status === 'Pending').length;
  const activeCount = requests.filter(r => ['Designing', 'Quoted', 'Confirmed', 'In Progress'].includes(r.status)).length;

  return {
    // State
    requests, loading, refreshing, seeding, users, usersLoading,
    galleryItems, galleryLoading, stats, categories, categoriesLoading,
    reviewItems, reviewsLoading, recoveryRequests, recoveryLoading, recoveryStatusFilter,
    // Derived
    totalRevenue, pendingCount, activeCount,
    isAdmin,
    // Fetch
    fetchRequests, fetchUsers, fetchGallery, fetchStats,
    fetchCategories, fetchReviews, fetchRecoveryRequests, setRecoveryStatusFilter,
    // Actions
    handleDatabaseSeed, handleDeleteRequest, saveRequestUpdates, advanceStatus,
    saveUserRole, deleteUser,
    handleSaveCategory, handleDeleteCategory, handleToggleCategoryActive,
    handleDeleteReview, handleSaveReview,
    handleSaveGalleryItem, handleDeleteGalleryItem,
    handleRecoveryStatus,
  };
}
