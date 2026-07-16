# God Components Refactor — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Split `App.tsx` (868 lines) and `AdminView.tsx` (1668 lines) into focused, single-responsibility components.

**Architecture:** Extract visual sections from App.tsx into `Header`, `Footer`, and `AppContent`. Extract each admin tab from AdminView.tsx into its own component (`AdminDashboard`, `AdminOrders`, `AdminMenu`, `AdminCategories`, `AdminReviews`, `AdminUsers`, `AdminRecovery`). Move shared admin state + data-fetching into a custom `useAdminData` hook. AdminView.tsx becomes a thin tab router.

**Tech Stack:** React 19, TypeScript, Tailwind CSS, motion/react, lucide-react, existing i18n (`t()`)

## File Structure

### App.tsx Refactor
| File | Responsibility |
|------|---------------|
| `src/App.tsx` | Composition root — state + layout wiring (< 80 lines) |
| `src/components/Header.tsx` | Desktop nav, mobile drawer, account dropdown, locale switcher, CTA |
| `src/components/Footer.tsx` | Customer footer + admin footer |
| `src/components/AppContent.tsx` | Page routing with AnimatePresence transitions |

### AdminView.tsx Refactor
| File | Responsibility |
|------|---------------|
| `src/components/admin/types.ts` | Shared admin interfaces (CakeRequest, SystemUser, Stats, Category, ReviewItem) + helpers (STATUS_COLORS, STATUS_ICONS, WORKFLOW, nextStatus, exportOrdersCSV, orderPrice) |
| `src/components/admin/useAdminData.ts` | Custom hook — all state + data-fetching + CRUD actions |
| `src/components/AdminView.tsx` | Thin shell — header + tab switcher + renders active tab component |
| `src/components/admin/AdminDashboard.tsx` | Dashboard tab (stat cards, pipeline, status panels) |
| `src/components/admin/AdminOrders.tsx` | Orders tab (search/filter, order list, detail sidebar) |
| `src/components/admin/AdminMenu.tsx` | Menu tab (gallery CRUD, grid display) |
| `src/components/admin/AdminCategories.tsx` | Categories tab (CRUD table) |
| `src/components/admin/AdminReviews.tsx` | Reviews tab (list + edit) |
| `src/components/admin/AdminUsers.tsx` | Users tab (role management, delete) |
| `src/components/admin/AdminRecovery.tsx` | Recovery tab (request list, approve/reject) |

## Global Constraints
- React 19 + TypeScript strict mode
- Tailwind CSS utility classes — no new CSS files
- motion/react for animations (existing pattern)
- lucide-react for icons (existing pattern)
- `t()` from `../i18n` for all user-facing strings
- `useToast()` from `./Toast` for notifications
- No new npm dependencies
- Backend tests (27 files) must continue passing
- Frontend has zero component tests — verify via `npm run build` + manual smoke test

---

## Phase 1: AdminView.tsx Refactor (8 tasks)

### Task 1: Create shared admin types + helpers

**Files:**
- Create: `src/components/admin/types.ts`

**Interfaces:**
- Produces: `CakeRequest`, `SystemUser`, `Stats`, `Category`, `ReviewItem`, `STATUS_COLORS`, `STATUS_ICONS`, `WORKFLOW`, `nextStatus()`, `exportOrdersCSV()`, `orderPrice()`

- [ ] **Step 1: Create the types and helpers file**

Extract from `AdminView.tsx` lines 16-144 into a new file. This file contains pure types, constants, and utility functions with zero React dependencies.

```typescript
// src/components/admin/types.ts
import React from 'react';
import {
  Coins, Check, Edit3, CheckCircle2, Inbox, Package, Truck
} from 'lucide-react';

export interface CakeRequest {
  id: string;
  contactName: string;
  contactPhone: string;
  eventType: string;
  guestCount: number;
  deliveryOption: string;
  deliveryAddress: string | null;
  deliveryDate: string;
  designStyle: string;
  flavor: string;
  tierCount: number;
  specialInstructions: string | null;
  requestDate: string;
  status: string;
  referenceImage: string | null;
  userId?: string;
  quotedPrice?: number;
  finalPrice?: number;
  depositAmount: number;
  remainingBalance: number;
  paymentStatus: string;
  bakerNote?: string | null;
  createdAt: string;
}

export interface SystemUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface Stats {
  totalOrders: number;
  totalRevenue: number;
  avgRating: string;
  statusBreakdown: Record<string, number>;
  roleCounts: Record<string, number>;
  totalUsers: number;
  totalReviews: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  color: string | null;
  icon: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewItem {
  id: string;
  rating: number;
  content: string;
  author: string;
  eventType: string;
  role: string;
  userId: string | null;
  productId: string | null;
  date: string;
  createdAt: string;
}

export const STATUS_COLORS: Record<string, string> = {
  Completed: 'bg-emerald-100 dark:bg-emerald-900/40 border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400',
  Ready: 'bg-emerald-100 dark:bg-emerald-900/40 border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400',
  'In Progress': 'bg-blue-100 dark:bg-blue-950/40 border-blue-300 dark:border-blue-800 text-blue-700 dark:text-blue-400',
  Designing: 'bg-purple-100 dark:bg-purple-950/40 border-purple-300 dark:border-purple-800 text-purple-700 dark:text-purple-400',
  Confirmed: 'bg-sky-100 dark:bg-sky-950/40 border-sky-300 dark:border-sky-800 text-sky-700 dark:text-sky-400',
  Quoted: 'bg-orange-100 dark:bg-orange-950/40 border-orange-300 dark:border-orange-800 text-orange-700 dark:text-orange-400',
  Received: 'bg-amber-100 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-700 dark:text-amber-400',
  Pending: 'bg-amber-100 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-700 dark:text-amber-400',
};

export const STATUS_ICONS: Record<string, React.ReactNode> = {
  Received: <Inbox className="w-3 h-3" />,
  Pending: <Inbox className="w-3 h-3" />,
  Designing: <Edit3 className="w-3 h-3" />,
  Quoted: <Coins className="w-3 h-3" />,
  Confirmed: <CheckCircle2 className="w-3 h-3" />,
  'In Progress': <Package className="w-3 h-3" />,
  Ready: <Truck className="w-3 h-3" />,
  Completed: <Check className="w-3 h-3" />,
};

export const WORKFLOW: string[] = ['Received', 'Designing', 'Quoted', 'Confirmed', 'In Progress', 'Ready', 'Completed'];

export function nextStatus(current: string): string | null {
  const idx = WORKFLOW.indexOf(current);
  return idx >= 0 && idx < WORKFLOW.length - 1 ? WORKFLOW[idx + 1] : null;
}

export function orderPrice(r: CakeRequest): number {
  return r.finalPrice ?? r.quotedPrice ?? 0;
}

export function exportOrdersCSV(requests: CakeRequest[]) {
  const headers = ['ID', 'Customer', 'Phone', 'Event', 'Guests', 'Delivery Date', 'Flavor', 'Tiers', 'Status', 'Price (ETB)', 'Submitted'];
  const rows = requests.map(r => [
    r.id, r.contactName, r.contactPhone, r.eventType,
    r.guestCount, r.deliveryDate, r.flavor, r.tierCount, r.status,
    orderPrice(r), r.requestDate
  ]);
  const csv = [headers, ...rows].map(row => row.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `flavour-bites-orders-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
```

- [ ] **Step 2: Verify no import errors**

Run: `npx tsc --noEmit 2>&1 | Select-String "admin/types"` — should have no errors from this file.

- [ ] **Step 3: Commit**

```bash
git add src/components/admin/types.ts
git commit -m "refactor(admin): extract shared types and helpers to admin/types.ts"
```

---

### Task 2: Create useAdminData hook

**Files:**
- Create: `src/components/admin/useAdminData.ts`

**Interfaces:**
- Consumes: `CakeRequest`, `SystemUser`, `Stats`, `Category`, `ReviewItem` from `./types`
- Produces: `useAdminData(currentUser)` returning all state + actions + fetch functions

- [ ] **Step 1: Create the hook**

Extract all state declarations (lines 154-212) and all data-fetching/action functions (lines 215-619) from AdminView.tsx into a custom hook. The hook manages all admin state and exposes actions.

```typescript
// src/components/admin/useAdminData.ts
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '../Toast';
import type { CakeRequest, SystemUser, Stats, Category, ReviewItem } from './types';
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

import { orderPrice } from './types';
```

- [ ] **Step 2: Verify no import errors**

Run: `npx tsc --noEmit 2>&1 | Select-String "useAdminData"` — should have no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/admin/useAdminData.ts
git commit -m "refactor(admin): extract state and actions into useAdminData hook"
```

---

### Task 3: Create AdminDashboard component

**Files:**
- Create: `src/components/admin/AdminDashboard.tsx`

**Interfaces:**
- Consumes: `requests`, `stats`, `loading`, `seeding`, `refreshing`, `totalRevenue`, `pendingCount`, `activeCount`, `isAdmin`, `handleDatabaseSeed`, `fetchRequests`, `fetchStats` from useAdminData

- [ ] **Step 1: Create AdminDashboard.tsx**

Extract lines 697-858 from AdminView.tsx. This is the Dashboard tab content — stat cards, order pipeline, bakery status, system health, user breakdown.

The component receives all needed data + actions as props. No local state needed.

```typescript
// src/components/admin/AdminDashboard.tsx (abbreviated structure)
import React from 'react';
import { motion } from 'motion/react';
import { useToast } from '../Toast';
import { t } from '../../i18n';
// ... (full JSX from lines 697-858 with props instead of local state)
```

- [ ] **Step 2: Verify**

Run: `npx tsc --noEmit 2>&1 | Select-String "AdminDashboard"` — should compile clean.

- [ ] **Step 3: Commit**

```bash
git add src/components/admin/AdminDashboard.tsx
git commit -m "refactor(admin): extract AdminDashboard tab component"
```

---

### Task 4: Create AdminOrders component

**Files:**
- Create: `src/components/admin/AdminOrders.tsx`

**Interfaces:**
- Consumes: `requests`, `loading`, `refreshing`, `handleDeleteRequest`, `saveRequestUpdates`, `advanceStatus` from useAdminData
- Produces: Rendered orders tab with search/filter, order list, and detail sidebar

- [ ] **Step 1: Create AdminOrders.tsx**

Extract lines 862-1133 from AdminView.tsx. This is the largest tab — search/filter bar, order list with inline editing, and the detail sidebar.

Local state in this component: `selectedRequest`, `searchTerm`, `statusFilter`, `editingId`, `editStatus`, `editCost`, `editDeposit`, `updating`.

Derived: `filteredRequests` computed from `requests` + `searchTerm` + `statusFilter`.

- [ ] **Step 2: Commit**

```bash
git add src/components/admin/AdminOrders.tsx
git commit -m "refactor(admin): extract AdminOrders tab component"
```

---

### Task 5: Create AdminMenu component

**Files:**
- Create: `src/components/admin/AdminMenu.tsx`

**Interfaces:**
- Consumes: `galleryItems`, `galleryLoading`, `categories`, `handleSaveGalleryItem`, `handleDeleteGalleryItem` from useAdminData

- [ ] **Step 1: Create AdminMenu.tsx**

Extract lines 1136-1238 from AdminView.tsx. Gallery CRUD form + grid display.

Local state: `showGalleryForm`, `editingGalleryId`, `galleryForm`, `savingGallery`.

- [ ] **Step 2: Commit**

```bash
git add src/components/admin/AdminMenu.tsx
git commit -m "refactor(admin): extract AdminMenu tab component"
```

---

### Task 6: Create AdminCategories component

**Files:**
- Create: `src/components/admin/AdminCategories.tsx`

**Interfaces:**
- Consumes: `categories`, `categoriesLoading`, `handleSaveCategory`, `handleDeleteCategory`, `handleToggleCategoryActive` from useAdminData

- [ ] **Step 1: Create AdminCategories.tsx**

Extract lines 1242-1351 from AdminView.tsx. Category CRUD form + table.

Local state: `showCategoryForm`, `editingCategoryId`, `categoryForm`, `savingCategory`.

- [ ] **Step 2: Commit**

```bash
git add src/components/admin/AdminCategories.tsx
git commit -m "refactor(admin): extract AdminCategories tab component"
```

---

### Task 7: Create AdminReviews component

**Files:**
- Create: `src/components/admin/AdminReviews.tsx`

**Interfaces:**
- Consumes: `reviewItems`, `reviewsLoading`, `handleDeleteReview`, `handleSaveReview` from useAdminData

- [ ] **Step 1: Create AdminReviews.tsx**

Extract lines 1354-1440 from AdminView.tsx. Review list with inline editing.

Local state: `editingReviewId`, `editReviewContent`, `editReviewRating`.

- [ ] **Step 2: Commit**

```bash
git add src/components/admin/AdminReviews.tsx
git commit -m "refactor(admin): extract AdminReviews tab component"
```

---

### Task 8: Create AdminUsers and AdminRecovery components

**Files:**
- Create: `src/components/admin/AdminUsers.tsx`
- Create: `src/components/admin/AdminRecovery.tsx`

**Interfaces:**
- Consumes: `users`, `usersLoading`, `saveUserRole`, `deleteUser`, `fetchUsers` (AdminUsers); `recoveryRequests`, `recoveryLoading`, `recoveryStatusFilter`, `setRecoveryStatusFilter`, `handleRecoveryStatus`, `fetchRecoveryRequests` (AdminRecovery)

- [ ] **Step 1: Create AdminUsers.tsx**

Extract lines 1546-1665 from AdminView.tsx. Users table with role editing + access-denied message for staff.

Local state: `editingUserId`, `editingRole`, `updatingRole`, `deletingUserId`.

- [ ] **Step 2: Create AdminRecovery.tsx**

Extract lines 1442-1544 from AdminView.tsx. Recovery request table with approve/reject + access-denied for staff.

No local state beyond what's passed as props.

- [ ] **Step 3: Commit**

```bash
git add src/components/admin/AdminUsers.tsx src/components/admin/AdminRecovery.tsx
git commit -m "refactor(admin): extract AdminUsers and AdminRecovery tab components"
```

---

### Task 9: Rewrite AdminView.tsx as thin shell

**Files:**
- Modify: `src/components/AdminView.tsx`

**Interfaces:**
- Consumes: All tab components + useAdminData hook
- Produces: Thin tab router rendering the active tab

- [ ] **Step 1: Rewrite AdminView.tsx**

Replace the entire 1668-line file with a thin composition that:
1. Calls `useAdminData(currentUser)` to get all state + actions
2. Renders a shared header (refresh, export CSV, seed buttons)
3. Switches on `currentTab` to render the appropriate tab component
4. Passes only the needed props to each tab component

Target: < 120 lines.

```typescript
import React from 'react';
import { Loader2, RefreshCw, Database, Download } from 'lucide-react';
import { t } from '../i18n';
import { usePageTitle } from '../hooks/usePageTitle';
import { useAdminData } from './admin/useAdminData';
import { exportOrdersCSV } from './admin/types';
import type { User } from '../types';
import AdminDashboard from './admin/AdminDashboard';
import AdminOrders from './admin/AdminOrders';
import AdminMenu from './admin/AdminMenu';
import AdminCategories from './admin/AdminCategories';
import AdminReviews from './admin/AdminReviews';
import AdminUsers from './admin/AdminUsers';
import AdminRecovery from './admin/AdminRecovery';

interface AdminViewProps {
  activeTab?: 'dashboard' | 'orders' | 'menu' | 'categories' | 'reviews' | 'users' | 'recovery';
  onTabChange?: (tab: 'dashboard' | 'orders' | 'menu' | 'categories' | 'reviews' | 'users' | 'recovery') => void;
  currentUser?: User | null;
}

export default function AdminView({ activeTab, onTabChange, currentUser }: AdminViewProps) {
  usePageTitle("Admin");
  const data = useAdminData(currentUser ?? null);

  const [internalTab, setInternalTab] = React.useState<string>('dashboard');
  const currentTab = activeTab || internalTab;
  const setCurrentTab = onTabChange || setInternalTab;

  return (
    <div className="bg-stone-50 dark:bg-[#171412] dark:text-stone-100 min-h-screen py-16 px-4 sm:px-6 relative selection:bg-lux-gold/30 selection:text-white dark:selection:text-white">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-lux-gold/[0.02] rounded-full blur-[140px] pointer-events-none" />

      {/* Header */}
      <div className="max-w-7xl mx-auto mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-stone-200/80 dark:border-stone-800/80 pb-8 relative z-10">
        {/* ... header content (same as lines 646-694) ... */}
      </div>

      {/* Tab Content */}
      {currentTab === 'dashboard' && <AdminDashboard {...data} />}
      {currentTab === 'orders' && <AdminOrders {...data} />}
      {currentTab === 'menu' && <AdminMenu {...data} />}
      {currentTab === 'categories' && <AdminCategories {...data} />}
      {currentTab === 'reviews' && <AdminReviews {...data} />}
      {currentTab === 'recovery' && <AdminRecovery {...data} />}
      {currentTab === 'users' && <AdminUsers {...data} />}
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `npx tsc --noEmit` — must pass with zero errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/AdminView.tsx src/components/admin/
git commit -m "refactor(admin): rewrite AdminView as thin tab router (1668 -> ~120 lines)"
```

---

## Phase 2: App.tsx Refactor (3 tasks)

### Task 10: Create Header component

**Files:**
- Create: `src/components/Header.tsx`

**Interfaces:**
- Consumes: `currentUser`, `activePage`, `adminTab`, `darkMode`, `locale`, `isAdminMode`, `mobileMenuOpen`, `profileDropdownOpen` + all setters
- Produces: Full header markup (desktop nav, mobile drawer, account dropdown, locale switcher, CTA)

- [ ] **Step 1: Create Header.tsx**

Extract lines 104-650 from App.tsx. This is the largest extracted section — the entire header with desktop navigation, mobile drawer, account dropdown, locale switcher, and CTA button.

Props interface:
```typescript
interface HeaderProps {
  currentUser: User | null;
  activePage: PageType;
  adminTab: string;
  darkMode: boolean;
  locale: Locale;
  isAdminMode: boolean;
  mobileMenuOpen: boolean;
  profileDropdownOpen: boolean;
  onNavigate: (page: PageType) => void;
  onAdminTabChange: (tab: string) => void;
  onToggleDarkMode: () => void;
  onLocaleChange: (locale: Locale) => void;
  onLogout: () => void;
  onMobileMenuToggle: () => void;
  onProfileDropdownToggle: () => void;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/Header.tsx
git commit -m "refactor(app): extract Header component (546 lines)"
```

---

### Task 11: Create Footer component

**Files:**
- Create: `src/components/Footer.tsx`

**Interfaces:**
- Consumes: `isAdminMode`, `darkMode`, `navigateTo`, `setSelectedCake`
- Produces: Customer footer + admin footer

- [ ] **Step 1: Create Footer.tsx**

Extract lines 752-863 from App.tsx. Two footer variants (customer vs admin).

Props interface:
```typescript
interface FooterProps {
  isAdminMode: boolean;
  onNavigate: (page: PageType) => void;
  onClearCake: () => void;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/Footer.tsx
git commit -m "refactor(app): extract Footer component (111 lines)"
```

---

### Task 12: Create AppContent component + rewrite App.tsx

**Files:**
- Create: `src/components/AppContent.tsx`
- Modify: `src/App.tsx`

**Interfaces:**
- Consumes: `activePage`, `currentUser`, all page-specific props
- Produces: Page routing with AnimatePresence transitions

- [ ] **Step 1: Create AppContent.tsx**

Extract lines 652-749 from App.tsx. The page router with AnimatePresence transitions.

```typescript
interface AppContentProps {
  activePage: PageType;
  currentUser: User | null;
  selectedCake: CakeGalleryItem | null;
  prefilledCake: CakeGalleryItem | null;
  adminTab: string;
  onNavigate: (page: PageType) => void;
  onAuthSuccess: (user: User) => void;
  onSelectCake: (cake: CakeGalleryItem) => void;
  onClearSelectedCake: () => void;
  onCommissionCake: (cake: CakeGalleryItem) => void;
  onClearPrefilledCake: () => void;
  onAdminTabChange: (tab: string) => void;
}
```

- [ ] **Step 2: Rewrite App.tsx**

Replace App.tsx with a thin composition root (~80 lines):
1. State declarations (currentUser, activePage, adminTab, locale, darkMode, etc.)
2. Helper functions (navigateTo, handleLogout, handleCommissionCake)
3. Render: Skip link → Header → AppContent → Footer → CakeAssistantBot

```typescript
export default function App() {
  // All useState declarations
  // useEffect for darkMode
  // navigateTo, handleCommissionCake, handleClearPrefilledCake, handleLogout
  // menuItems computation
  // isAdminMode computation

  return (
    <>
      <a href="#main-content" className="sr-only ...">Skip to main content</a>
      <div className={`min-h-screen ...`}>
        <div className="h-1 w-full bg-gradient-to-r ..." />
        <Header {...headerProps} />
        <main id="main-content" className="flex-grow">
          <ErrorBoundary>
            <AppContent {...contentProps} />
          </ErrorBoundary>
        </main>
        <Footer {...footerProps} />
        <ErrorBoundary><CakeAssistantBot /></ErrorBoundary>
      </div>
    </>
  );
}
```

- [ ] **Step 3: Verify build**

Run: `npx tsc --noEmit` — must pass with zero errors.

- [ ] **Step 4: Commit**

```bash
git add src/App.tsx src/components/AppContent.tsx src/components/Header.tsx src/components/Footer.tsx
git commit -m "refactor(app): split App.tsx into Header + Footer + AppContent (868 -> ~80 lines)"
```

---

## Verification

After all tasks:

- [ ] Run `npx tsc --noEmit` — zero errors
- [ ] Run `npm test` — all 232 backend tests pass
- [ ] Run `npm run build` — frontend builds successfully
- [ ] Manually verify: App renders, navigation works, admin tabs switch, dark mode toggles
