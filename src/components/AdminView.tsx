import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Shield, TrendingUp, Coins, Calendar, ArrowRight, Trash2,
  Sparkles, Check, Loader2, Activity, RefreshCw, User, Mail,
  Phone, MapPin, Search, Filter, FilterX, Edit3, Save, X, Database,
  Users, Star, BarChart2, Download, AlertTriangle, ShieldCheck, Settings,
  ChevronDown, CheckCircle2, Clock, Package, Truck, Inbox,
  Plus, Image, Hash, Pencil, ToggleLeft, ToggleRight, Layers, MessageSquare
} from 'lucide-react';
import { useToast } from './Toast';
import { t } from '../i18n';

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────
interface CakeRequest {
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

interface SystemUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface Stats {
  totalOrders: number;
  totalRevenue: number;
  avgRating: string;
  statusBreakdown: Record<string, number>;
  roleCounts: Record<string, number>;
  totalUsers: number;
  totalReviews: number;
}

import { User as UserType } from '../types';

interface AdminViewProps {
  activeTab?: 'dashboard' | 'orders' | 'menu' | 'categories' | 'reviews' | 'users' | 'recovery';
  onTabChange?: (tab: 'dashboard' | 'orders' | 'menu' | 'categories' | 'reviews' | 'users' | 'recovery') => void;
  currentUser?: UserType | null;
}

interface Category {
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

interface ReviewItem {
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

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────
const STATUS_COLORS: Record<string, string> = {
  Completed: 'bg-emerald-100 dark:bg-emerald-900/40 border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400',
  Ready: 'bg-emerald-100 dark:bg-emerald-900/40 border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400',
  'In Progress': 'bg-blue-100 dark:bg-blue-950/40 border-blue-300 dark:border-blue-800 text-blue-700 dark:text-blue-400',
  Designing: 'bg-purple-100 dark:bg-purple-950/40 border-purple-300 dark:border-purple-800 text-purple-700 dark:text-purple-400',
  Confirmed: 'bg-sky-100 dark:bg-sky-950/40 border-sky-300 dark:border-sky-800 text-sky-700 dark:text-sky-400',
  Quoted: 'bg-orange-100 dark:bg-orange-950/40 border-orange-300 dark:border-orange-800 text-orange-700 dark:text-orange-400',
  Received: 'bg-amber-100 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-700 dark:text-amber-400',
  Pending: 'bg-amber-100 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-700 dark:text-amber-400',
};

const STATUS_ICONS: Record<string, React.ReactNode> = {
  Received: <Inbox className="w-3 h-3" />,
  Pending: <Inbox className="w-3 h-3" />,
  Designing: <Edit3 className="w-3 h-3" />,
  Quoted: <Coins className="w-3 h-3" />,
  Confirmed: <CheckCircle2 className="w-3 h-3" />,
  'In Progress': <Package className="w-3 h-3" />,
  Ready: <Truck className="w-3 h-3" />,
  Completed: <Check className="w-3 h-3" />,
};

const WORKFLOW: string[] = ['Received', 'Designing', 'Quoted', 'Confirmed', 'In Progress', 'Ready', 'Completed'];

function nextStatus(current: string): string | null {
  const idx = WORKFLOW.indexOf(current);
  return idx >= 0 && idx < WORKFLOW.length - 1 ? WORKFLOW[idx + 1] : null;
}

function exportOrdersCSV(requests: CakeRequest[]) {
  const price = (r: CakeRequest) => r.finalPrice ?? r.quotedPrice ?? 0;
  const headers = ['ID', 'Customer', 'Phone', 'Event', 'Guests', 'Delivery Date', 'Flavor', 'Tiers', 'Status', 'Price (ETB)', 'Submitted'];
  const rows = requests.map(r => [
    r.id, r.contactName, r.contactPhone, r.eventType,
    r.guestCount, r.deliveryDate, r.flavor, r.tierCount, r.status,
    price(r), r.requestDate
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

// ─────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────
export default function AdminView({ activeTab, onTabChange, currentUser }: AdminViewProps) {
  const { showToast } = useToast();
  const isAdmin = currentUser?.role === 'admin';

  const [internalTab, setInternalTab] = useState<'dashboard' | 'orders' | 'menu' | 'categories' | 'reviews' | 'users' | 'recovery'>('dashboard');
  const currentTab = activeTab || internalTab;
  const setCurrentTab = onTabChange || setInternalTab;

  // Orders state
  const [requests, setRequests] = useState<CakeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<CakeRequest | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editStatus, setEditStatus] = useState('');
  const [editCost, setEditCost] = useState(0);
  const [editDeposit, setEditDeposit] = useState(0);
  const [updating, setUpdating] = useState(false);

  // Users state (admin only)
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editingRole, setEditingRole] = useState('');
  const [updatingRole, setUpdatingRole] = useState(false);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);

  // Menu state
  const [galleryItems, setGalleryItems] = useState<any[]>([]);
  const [galleryLoading, setGalleryLoading] = useState(false);

  // Stats (admin/staff)
  const [stats, setStats] = useState<Stats | null>(null);

  // Categories state
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [categoryForm, setCategoryForm] = useState({ name: '', slug: '', description: '', color: '', icon: '', sortOrder: 0 });
  const [savingCategory, setSavingCategory] = useState(false);

  // Reviews state
  const [reviewItems, setReviewItems] = useState<ReviewItem[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [editReviewContent, setEditReviewContent] = useState('');
  const [editReviewRating, setEditReviewRating] = useState(5);
  const [savingReview, setSavingReview] = useState(false);

  // Recovery requests state (admin only)
  const [recoveryRequests, setRecoveryRequests] = useState<any[]>([]);
  const [recoveryLoading, setRecoveryLoading] = useState(false);
  const [recoveryStatusFilter, setRecoveryStatusFilter] = useState('all');

  // Gallery CRUD state
  const [showGalleryForm, setShowGalleryForm] = useState(false);
  const [editingGalleryId, setEditingGalleryId] = useState<string | null>(null);
  const [galleryForm, setGalleryForm] = useState({ name: '', description: '', categoryId: '', flavors: '', priceEstimate: '', image: '', servingCount: '', tags: '' });
  const [savingGallery, setSavingGallery] = useState(false);

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

  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const res = await fetch('/api/users');
      const data = await res.json();
      if (data.success) setUsers(data.users || []);
    } catch (e) { /* ignore */ }
    finally { setUsersLoading(false); }
  };

  const fetchGallery = async () => {
    setGalleryLoading(true);
    try {
      const res = await fetch('/api/gallery');
      const data = await res.json();
      if (data.success) setGalleryItems(data.items || []);
    } catch (e) { /* ignore */ }
    finally { setGalleryLoading(false); }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/stats');
      const data = await res.json();
      if (data.success) setStats(data.stats);
    } catch (e) { /* ignore */ }
  };

  const fetchCategories = async () => {
    setCategoriesLoading(true);
    try {
      const res = await fetch('/api/categories?includeInactive=true');
      const data = await res.json();
      if (data.success) setCategories(data.categories || []);
    } catch (e) { /* ignore */ }
    finally { setCategoriesLoading(false); }
  };

  const fetchReviews = async () => {
    setReviewsLoading(true);
    try {
      const res = await fetch('/api/reviews');
      const data = await res.json();
      if (data.success) setReviewItems(data.reviews || []);
    } catch (e) { /* ignore */ }
    finally { setReviewsLoading(false); }
  };

  const fetchRecoveryRequests = async () => {
    setRecoveryLoading(true);
    try {
      const url = recoveryStatusFilter === 'all' ? '/api/recovery' : `/api/recovery?status=${recoveryStatusFilter}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) setRecoveryRequests(data.requests || []);
    } catch (e) { /* ignore */ }
    finally { setRecoveryLoading(false); }
  };

  const handleRecoveryStatus = async (id: string, status: string) => {
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
  };

  const getRecoveryStatusBadge = (status: string) => {
    const base = 'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-mono uppercase font-bold border';
    switch (status) {
      case 'pending':
        return `${base} bg-amber-900/10 border-amber-800 text-amber-400`;
      case 'approved':
        return `${base} bg-emerald-900/10 border-emerald-800 text-emerald-400`;
      case 'rejected':
        return `${base} bg-red-900/10 border-red-800 text-red-400`;
      default:
        return `${base} bg-stone-800 border-stone-700 text-stone-400`;
    }
  };

  useEffect(() => { fetchRequests(true); fetchStats(); }, []);

  useEffect(() => {
    if (currentTab === 'users' && isAdmin) fetchUsers();
    if (currentTab === 'menu') fetchGallery();
    if (currentTab === 'categories') { fetchCategories(); fetchGallery(); }
    if (currentTab === 'reviews') fetchReviews();
    if (currentTab === 'recovery' && isAdmin) fetchRecoveryRequests();
  }, [currentTab, recoveryStatusFilter]);

  // ── Order Actions ──────────────────────────────────────────
  const handleDatabaseSeed = async () => {
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
  };

  const handleDeleteRequest = async (id: string, name: string) => {
    if (!window.confirm(`Delete order from ${name}? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/requests/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showToast('Order Deleted', `${name}'s order has been removed.`, 'warning');
        setSelectedRequest(null);
        fetchRequests(true); fetchStats();
      } else throw new Error(data.error);
    } catch (e: any) { showToast('Delete Failed', e.message, 'error'); }
  };

  const startEditing = (req: CakeRequest) => {
    setEditingId(req.id);
    setEditStatus(req.status);
    setEditCost(req.finalPrice ?? req.quotedPrice ?? 0);
    setEditDeposit(req.depositAmount ?? 0);
  };

  const saveRequestUpdates = async (id: string, name: string) => {
    setUpdating(true);
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
        if (selectedRequest?.id === id) setSelectedRequest({ ...selectedRequest, status: editStatus, quotedPrice: editCost });
        setEditingId(null);
        fetchRequests(true); fetchStats();
      } else throw new Error(data.error);
    } catch (e: any) { showToast('Update Failed', e.message, 'error'); }
    finally { setUpdating(false); }
  };

  const advanceStatus = async (req: CakeRequest, next: string) => {
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
        if (selectedRequest?.id === req.id) setSelectedRequest({ ...req, status: next });
      }
    } catch (e: any) { showToast('Failed', e.message, 'error'); }
  };

  // ── User Role Actions (Admin Only) ────────────────────────
  const saveUserRole = async (userId: string, userName: string) => {
    setUpdatingRole(true);
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: editingRole })
      });
      const data = await res.json();
      if (data.success) {
        showToast('Role Updated', `${userName} is now a ${editingRole}.`, 'success');
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: editingRole } : u));
        setEditingUserId(null);
        fetchStats();
      } else throw new Error(data.error);
    } catch (e: any) { showToast('Role Update Failed', e.message, 'error'); }
    finally { setUpdatingRole(false); }
  };

  const deleteUser = async (userId: string, userName: string) => {
    if (!window.confirm(`Delete user "${userName}"? All their data will be removed.`)) return;
    setDeletingUserId(userId);
    try {
      const res = await fetch(`/api/users/${userId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showToast('User Deleted', `${userName} has been removed from the system.`, 'warning');
        setUsers(prev => prev.filter(u => u.id !== userId));
        fetchStats();
      } else throw new Error(data.error);
    } catch (e: any) { showToast('Delete Failed', e.message, 'error'); }
    finally { setDeletingUserId(null); }
  };

  // ── Category Actions ─────────────────────────────────────
  const handleSaveCategory = async () => {
    if (!categoryForm.name.trim()) { showToast('Validation', 'Name is required.', 'error'); return; }
    setSavingCategory(true);
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
          setEditingCategoryId(null);
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
      setShowCategoryForm(false);
      setCategoryForm({ name: '', slug: '', description: '', color: '', icon: '', sortOrder: 0 });
      fetchCategories();
    } catch (e: any) { showToast('Failed', e.message, 'error'); }
    finally { setSavingCategory(false); }
  };

  const handleDeleteCategory = async (id: string, name: string) => {
    if (!window.confirm(`Delete category "${name}"? Gallery items in it will become uncategorized.`)) return;
    try {
      const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showToast('Category Deleted', `"${name}" removed.`, 'warning');
        fetchCategories();
      } else throw new Error(data.error);
    } catch (e: any) { showToast('Delete Failed', e.message, 'error'); }
  };

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

  const handleToggleCategoryActive = async (cat: Category) => {
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
  };

  // ── Review Actions ───────────────────────────────────────
  const handleDeleteReview = async (id: string, author: string) => {
    if (!window.confirm(`Delete review by ${author}? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/reviews/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showToast('Review Deleted', `Review by ${author} removed.`, 'warning');
        setEditingReviewId(null);
        fetchReviews();
      } else throw new Error(data.error);
    } catch (e: any) { showToast('Delete Failed', e.message, 'error'); }
  };

  const handleSaveReview = async (id: string) => {
    setSavingReview(true);
    try {
      const res = await fetch(`/api/reviews/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: editReviewContent, rating: editReviewRating }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('Review Updated', 'Review updated successfully.', 'success');
        setEditingReviewId(null);
        fetchReviews();
      } else throw new Error(data.error);
    } catch (e: any) { showToast('Update Failed', e.message, 'error'); }
    finally { setSavingReview(false); }
  };

  // ── Gallery CRUD Actions ────────────────────────────────
  const handleSaveGalleryItem = async () => {
    if (!galleryForm.name.trim() || !galleryForm.priceEstimate.trim()) {
      showToast('Validation', 'Name and price are required.', 'error'); return;
    }
    setSavingGallery(true);
    try {
      const body: Record<string, unknown> = {
        name: galleryForm.name,
        description: galleryForm.description,
        categoryId: galleryForm.categoryId || undefined,
        flavors: galleryForm.flavors.split(',').map(f => f.trim()).filter(Boolean),
        priceEstimate: galleryForm.priceEstimate,
        image: galleryForm.image || undefined,
        servingCount: galleryForm.servingCount || undefined,
        tags: galleryForm.tags.split(',').map(t => t.trim()).filter(Boolean),
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
          setEditingGalleryId(null);
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
      setShowGalleryForm(false);
      setGalleryForm({ name: '', description: '', categoryId: '', flavors: '', priceEstimate: '', image: '', servingCount: '', tags: '' });
      fetchGallery();
    } catch (e: any) { showToast('Failed', e.message, 'error'); }
    finally { setSavingGallery(false); }
  };

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

  const handleDeleteGalleryItem = async (id: string, name: string) => {
    if (!window.confirm(`Delete gallery item "${name}"? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/gallery/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showToast('Gallery Item Deleted', `"${name}" removed.`, 'warning');
        fetchGallery();
      } else throw new Error(data.error);
    } catch (e: any) { showToast('Delete Failed', e.message, 'error'); }
  };

  // ── Derived Values ─────────────────────────────────────────
  const orderPrice = (r: CakeRequest) => r.finalPrice ?? r.quotedPrice ?? 0;
  const totalRevenue = requests.reduce((s, r) => s + orderPrice(r), 0);
  const pendingCount = requests.filter(r => r.status === 'Received' || r.status === 'Pending').length;
  const activeCount = requests.filter(r => ['Designing', 'Quoted', 'Confirmed', 'In Progress'].includes(r.status)).length;

  const filteredRequests = requests.filter(r => {
    const q = searchTerm.toLowerCase();
    const matchesSearch = r.contactName.toLowerCase().includes(q) || r.id.toLowerCase().includes(q) || r.flavor.toLowerCase().includes(q) || r.eventType.toLowerCase().includes(q);
    if (statusFilter === 'all') return matchesSearch;
    if (statusFilter === 'pending') return matchesSearch && (r.status === 'Received' || r.status === 'Pending');
    if (statusFilter === 'active') return matchesSearch && ['Designing', 'Quoted', 'Confirmed', 'In Progress'].includes(r.status);
    if (statusFilter === 'completed') return matchesSearch && (r.status === 'Ready' || r.status === 'Completed');
    return matchesSearch && r.status.toLowerCase() === statusFilter.toLowerCase();
  });

  // ─────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────
  return (
    <div className="bg-stone-50 dark:bg-[#171412] dark:text-stone-100 min-h-screen py-16 px-4 sm:px-6 relative selection:bg-lux-gold/30 selection:text-white dark:selection:text-white">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-lux-gold/[0.02] rounded-full blur-[140px] pointer-events-none" />

      {/* ── Header ────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-stone-200/80 dark:border-stone-800/80 pb-8 relative z-10">
        <div className="text-left">
          <div className="flex items-center gap-2.5 mb-2">
            <span className="w-2.5 h-2.5 rounded-full bg-lux-gold animate-pulse" />
            <span className="text-[10px] uppercase tracking-[0.35em] text-lux-gold font-mono font-bold">
              {isAdmin ? 'System Administration' : 'Bakery Operations'}
            </span>
          </div>
          <h1 className="text-4xl font-serif text-stone-900 dark:text-white font-medium italic">
            {t('admin.staffWorkspace')}
          </h1>
          <p className="text-xs text-stone-400 dark:text-stone-400 font-light mt-1 max-w-xl font-sans">
            {isAdmin
              ? 'Manage orders, users, menu items, and system settings for Flavour Bites.'
              : 'Manage cake orders, update statuses, and view the menu. Contact the admin for account or system changes.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => { fetchRequests(); fetchStats(); }}
            disabled={refreshing}
            className="px-4 py-2.5 bg-stone-100 dark:bg-stone-900 hover:bg-stone-200 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white border border-stone-300 dark:border-stone-800 rounded-sm font-mono text-[10px] uppercase font-bold tracking-wider flex items-center gap-2 transition-all cursor-pointer"
          >
            {refreshing ? <Loader2 className="w-3.5 h-3.5 animate-spin text-lux-gold" /> : <RefreshCw className="w-3.5 h-3.5" />}
            Refresh
          </button>

          {/* Export CSV — both staff and admin can export */}
          <button
            onClick={() => exportOrdersCSV(filteredRequests)}
            disabled={filteredRequests.length === 0}
            className="px-4 py-2.5 bg-stone-100 dark:bg-stone-900 hover:bg-stone-200 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white border border-stone-300 dark:border-stone-800 rounded-sm font-mono text-[10px] uppercase font-bold tracking-wider flex items-center gap-2 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Download className="w-3.5 h-3.5" />
            {t('admin.exportCSV')}
          </button>

          {isAdmin && (
            <button
              onClick={handleDatabaseSeed}
              disabled={seeding}
              className="px-4 py-2.5 bg-lux-gold/10 hover:bg-lux-gold text-lux-gold hover:text-stone-950 border border-lux-gold/25 hover:border-lux-gold rounded-sm font-mono text-[10px] uppercase font-bold tracking-wider flex items-center gap-2 transition-all cursor-pointer"
            >
              {seeding ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Database className="w-3.5 h-3.5" />}
              Seed Demo Data
            </button>
          )}
        </div>
      </div>

      {/* ── Dashboard Tab ─────────────────────────────────── */}
      {currentTab === 'dashboard' && (
        <div className="space-y-8 animate-fade">

          {/* Stat Cards */}
          <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-4 relative z-10 font-sans">
            {[
              { label: t('admin.totalOrders'), value: loading ? '…' : requests.length, sub: 'All time cake orders', icon: <Package className="w-4 h-4 text-lux-gold" />, accent: 'from-lux-gold/60' },
              { label: t('admin.totalRevenue'), value: loading ? '…' : `${totalRevenue.toLocaleString()} ETB`, sub: 'Based on quoted prices', icon: <Coins className="w-4 h-4 text-emerald-400" />, accent: 'from-emerald-500/60' },
              { label: 'Pending Review', value: loading ? '…' : pendingCount, sub: 'Orders waiting for action', icon: <Clock className="w-4 h-4 text-amber-400" />, accent: 'from-amber-500/60' },
              { label: 'Currently Active', value: loading ? '…' : activeCount, sub: 'In design or baking', icon: <Activity className="w-4 h-4 text-blue-400" />, accent: 'from-blue-500/60' },
            ].map((card) => (
              <div key={card.label} className="bg-white/90 dark:bg-[#1e1a17]/90 border border-stone-200 dark:border-stone-200/80 dark:border-stone-800/80 p-5 rounded-sm shadow-xl relative overflow-hidden text-left">
                <div className="flex justify-between items-start mb-3">
                  <span className="text-[10px] uppercase tracking-wider text-stone-400 dark:text-stone-400 font-mono">{card.label}</span>
                  {card.icon}
                </div>
                <span className="text-2xl font-serif text-stone-900 dark:text-white font-medium block">{card.value}</span>
                <span className="text-[10px] text-stone-400 dark:text-stone-500 font-light mt-1 block">{card.sub}</span>
                <div className={`absolute bottom-0 left-0 right-0 h-[1.5px] bg-gradient-to-r ${card.accent} to-transparent`} />
              </div>
            ))}
          </div>

          {/* Bakery Status Board (both staff and admin) */}
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10 font-sans">

            {/* Order Pipeline — live status breakdown */}
            <div className="bg-white dark:bg-[#1e1a17] border border-stone-200 dark:border-stone-800 p-6 rounded-sm space-y-4 text-left">
              <h3 className="font-sans text-sm font-semibold text-stone-700 dark:text-stone-200 flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-lux-gold" /> Order Pipeline
              </h3>
              <div className="space-y-2.5">
                {WORKFLOW.map((s) => {
                  const count = requests.filter(r => r.status === s).length;
                  const pct = requests.length ? Math.round((count / requests.length) * 100) : 0;
                  return (
                    <div key={s}>
                      <div className="flex justify-between text-[10px] font-mono mb-1">
                        <span className="text-stone-400 dark:text-stone-400">{s}</span>
                        <span className="text-stone-600 dark:text-stone-300 font-semibold">{count}</span>
                      </div>
                      <div className="h-1.5 bg-stone-200 dark:bg-stone-800 rounded-full overflow-hidden">
                        <div className="h-full bg-lux-gold/70 rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bakery Info Panel */}
            <div className="bg-white dark:bg-[#1e1a17] border border-stone-200 dark:border-stone-800 p-6 rounded-sm space-y-4 text-left">
              <h3 className="font-sans text-sm font-semibold text-stone-700 dark:text-stone-200 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-lux-gold" /> Bakery Status
              </h3>
              <div className="space-y-2.5 text-[11px] font-mono">
                {[
                  { label: 'Head Baker', value: 'Yodit Ashenafi', color: 'text-stone-700 dark:text-stone-200' },
                  { label: 'Oven Temperature', value: '175°C — Optimal', color: 'text-emerald-400', dot: true },
                  { label: 'Ingredients Stock', value: '98% — Fully stocked', color: 'text-emerald-400', dot: true },
                  { label: 'Delivery Van', value: 'On standby — Bole depot', color: 'text-stone-600 dark:text-stone-300' },
                  { label: 'Active Promo', value: 'GOLDENBLOOM10 (10% off)', color: 'text-lux-gold' },
                ].map(row => (
                  <div key={row.label} className="flex justify-between border-b border-stone-200/50 dark:border-stone-800/50 pb-2">
                    <span className="text-stone-400 dark:text-stone-400">{row.label}</span>
                    <span className={`${row.color} flex items-center gap-1.5`}>
                      {row.dot && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />}
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Admin-only: System Health + User Breakdown */}
          {isAdmin && (
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10 font-sans">

              {/* System Health */}
              <div className="bg-white dark:bg-[#1e1a17] border border-stone-200 dark:border-stone-800 p-6 rounded-sm space-y-4 text-left">
                <h3 className="font-sans text-sm font-semibold text-stone-700 dark:text-stone-200 flex items-center gap-2">
                  <Database className="w-4 h-4 text-lux-gold" /> System Health
                </h3>
                <div className="space-y-2.5 text-[11px] font-mono">
                  {[
                    { label: 'Database', value: 'PostgreSQL via Neon (Serverless)', color: 'text-stone-700 dark:text-stone-200' },
                    { label: 'Connection', value: 'Online & Operational', color: 'text-emerald-400', dot: true },
                    { label: 'ORM', value: 'Prisma Client', color: 'text-stone-600 dark:text-stone-300' },
                    { label: 'Auth', value: 'JWT Cookies (7d expiry)', color: 'text-stone-600 dark:text-stone-300' },
                    { label: 'Rate Limiting', value: '100 req / 15 min window', color: 'text-stone-600 dark:text-stone-300' },
                  ].map(row => (
                    <div key={row.label} className="flex justify-between border-b border-stone-200/50 dark:border-stone-800/50 pb-2">
                      <span className="text-stone-400 dark:text-stone-400">{row.label}</span>
                      <span className={`${row.color} flex items-center gap-1.5`}>
                        {row.dot && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />}
                        {row.value}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={handleDatabaseSeed}
                    disabled={seeding}
                    className="px-3 py-1.5 bg-lux-gold text-stone-950 hover:bg-white text-[9px] uppercase font-mono font-bold tracking-widest rounded-sm flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    {seeding ? <Loader2 className="w-3 h-3 animate-spin" /> : <Database className="w-3 h-3" />}
                    Seed Demo Data
                  </button>
                  <button
                    onClick={() => { fetchRequests(); fetchStats(); }}
                    disabled={refreshing}
                    className="px-3 py-1.5 bg-stone-100 dark:bg-stone-900 border border-stone-300 dark:border-stone-800 text-stone-700 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white text-[9px] uppercase font-mono font-bold tracking-widest rounded-sm flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    {refreshing ? <Loader2 className="w-3 h-3 animate-spin text-lux-gold" /> : <RefreshCw className="w-3 h-3" />}
                    Verify Connection
                  </button>
                </div>
              </div>

              {/* User Breakdown */}
              <div className="bg-white dark:bg-[#1e1a17] border border-stone-200 dark:border-stone-800 p-6 rounded-sm space-y-4 text-left">
                <h3 className="font-sans text-sm font-semibold text-stone-700 dark:text-stone-200 flex items-center gap-2">
                  <Users className="w-4 h-4 text-lux-gold" /> {t('admin.totalUsers')}
                  <span className="ml-auto text-[10px] font-mono text-stone-400 dark:text-stone-400">{stats?.totalUsers ?? '…'} total</span>
                </h3>
                <div className="space-y-3">
                  {[
                    { role: 'admin', label: 'Admins', color: 'bg-lux-gold' },
                    { role: 'staff', label: 'Bakery Staff', color: 'bg-blue-500' },
                    { role: 'customer', label: 'Customers', color: 'bg-stone-500' },
                  ].map(({ role, label, color }) => {
                    const count = stats?.roleCounts[role] ?? 0;
                    const total = stats?.totalUsers || 1;
                    return (
                      <div key={role}>
                        <div className="flex justify-between text-[10px] font-mono mb-1">
                          <span className="text-stone-400 dark:text-stone-400">{label}</span>
                          <span className="text-stone-600 dark:text-stone-300 font-semibold">{count}</span>
                        </div>
                        <div className="h-1.5 bg-stone-200 dark:bg-stone-800 rounded-full overflow-hidden">
                          <div className={`h-full ${color} rounded-full transition-all duration-700`} style={{ width: `${Math.round((count / total) * 100)}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="flex gap-4 pt-2 text-[10px] font-mono border-t border-stone-200 dark:border-stone-800">
                  <div>
                    <span className="text-stone-400 dark:text-stone-400 block">{t('admin.totalReviews')}</span>
                    <span className="text-stone-700 dark:text-stone-200 font-semibold">{stats?.totalReviews ?? '…'}</span>
                  </div>
                  <div>
                    <span className="text-stone-400 dark:text-stone-400 block">{t('admin.avgRating')}</span>
                    <span className="text-lux-gold font-semibold">{stats?.avgRating ?? '…'} ★</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Orders Tab ────────────────────────────────────── */}
      {currentTab === 'orders' && (
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10 items-start">

          {/* Left: order list */}
          <div className="lg:col-span-7 space-y-5">

            {/* Search & Filter */}
            <div className="bg-stone-50 dark:bg-[#1d1916] p-4 border border-stone-200/60 dark:border-stone-800/60 rounded-sm space-y-4 font-sans">
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="relative flex-grow w-full">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 dark:text-stone-400" />
                  <input
                    type="text"
                    placeholder={t('admin.searchOrders')}
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full bg-stone-100 dark:bg-[#15110f] border border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-200 focus:outline-none focus:ring-1 focus:ring-lux-gold pl-9 pr-3 py-2.5 text-xs rounded-xs"
                  />
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                  <Filter className="w-3.5 h-3.5 text-stone-400 dark:text-stone-400 shrink-0" />
                  <select
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value)}
                    className="bg-stone-100 dark:bg-[#15110f] border border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-300 focus:outline-none focus:ring-1 focus:ring-lux-gold py-2.5 px-3 text-xs rounded-xs font-mono font-bold flex-grow sm:flex-grow-0"
                  >
                    <option value="all">{t('admin.allStatuses')}</option>
                    <option value="pending">Pending</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    {WORKFLOW.map(s => <option key={s} value={s.toLowerCase()}>{s}</option>)}
                  </select>
                </div>
              </div>
              {(searchTerm || statusFilter !== 'all') && (
                <div className="flex items-center justify-between pt-1 border-t border-stone-200/50 dark:border-stone-800/50">
                  <span className="text-[10px] text-stone-400 dark:text-stone-400 font-mono">
                    Showing <strong className="text-lux-gold">{filteredRequests.length}</strong> matching orders
                  </span>
                  <button onClick={() => { setSearchTerm(''); setStatusFilter('all'); }} className="text-[9px] uppercase font-mono text-stone-400 dark:text-stone-400 hover:text-lux-gold flex items-center gap-1 cursor-pointer">
                    <FilterX className="w-3 h-3" /> Clear
                  </button>
                </div>
              )}
            </div>

            {/* Order List */}
            {loading ? (
              <div className="bg-stone-50 dark:bg-[#1d1916] text-center p-16 border border-stone-200/60 dark:border-stone-800/60 rounded-sm">
                <Loader2 className="w-7 h-7 animate-spin text-lux-gold mx-auto mb-3" />
                <p className="text-xs text-stone-400 dark:text-stone-400 font-mono uppercase tracking-widest">{t('admin.loadingOrders')}</p>
              </div>
            ) : filteredRequests.length === 0 ? (
              <div className="bg-stone-50 dark:bg-[#1d1916] text-center p-16 border border-stone-200/60 dark:border-stone-800/60 rounded-sm">
                <Shield className="w-10 h-10 text-stone-400 dark:text-stone-500 mx-auto mb-3" />
                <p className="text-sm font-serif text-stone-600 dark:text-stone-300 italic">{t('admin.noOrders')}</p>
                <p className="text-xs text-stone-400 dark:text-stone-500 mt-1">Try changing your filters or seed some demo data.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredRequests.map(req => {
                  const isSelected = selectedRequest?.id === req.id;
                  const isEditing = editingId === req.id;
                  const next = nextStatus(req.status);
                  return (
                    <motion.div
                      key={req.id}
                      layoutId={`order-${req.id}`}
                      onClick={() => { if (!isEditing) setSelectedRequest(req); }}
                      className={`bg-white/95 dark:bg-[#1e1a17]/95 border text-left rounded-sm p-5 transition-all cursor-pointer relative ${
                        isSelected ? 'border-lux-gold shadow-lg shadow-lux-gold/5 bg-stone-100 dark:bg-[#221d19]' : 'border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700'
                      }`}
                    >
                      {isSelected && <div className="absolute top-0 bottom-0 left-0 w-1 bg-lux-gold rounded-l-sm" />}

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-xs font-semibold text-lux-gold">{req.id}</span>
                          <span className="text-[9px] uppercase tracking-wider font-mono text-stone-500 dark:text-stone-400 bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 px-2 py-0.5 rounded-sm">{req.eventType}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-mono uppercase font-bold border flex items-center gap-1 ${STATUS_COLORS[req.status] || 'bg-stone-100 dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300'}`}>
                            {STATUS_ICONS[req.status]}
                            {req.status}
                          </span>
                          <span className="text-[11px] font-mono font-bold text-stone-600 dark:text-stone-300">
                            {orderPrice(req) ? `${orderPrice(req).toLocaleString()} ETB` : 'Unquoted'}
                          </span>
                        </div>
                      </div>

                      <h3 className="font-serif text-base text-stone-900 dark:text-white font-medium mb-1">{req.contactName}</h3>
                      <div className="font-sans text-[11px] text-stone-400 dark:text-stone-400 font-light flex flex-wrap gap-x-4 gap-y-1 mb-3 pb-3 border-b border-stone-200/60 dark:border-stone-800/60">
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3 text-lux-gold" /> {req.deliveryDate}</span>
                        <span>{req.tierCount} tier • {req.guestCount} guests</span>
                        <span className="text-lux-gold">{req.flavor}</span>
                      </div>

                      <div className="flex items-center justify-between gap-2">
                        <div className="flex gap-2 flex-wrap">
                          {next && (
                            <button
                              onClick={e => { e.stopPropagation(); advanceStatus(req, next); }}
                              className="bg-lux-gold/10 hover:bg-lux-gold text-lux-gold hover:text-stone-950 text-[9px] font-mono tracking-wider font-bold py-1 px-2.5 rounded-xs border border-lux-gold/20 flex items-center gap-1 transition-all"
                            >
                              <ArrowRight className="w-3 h-3" /> Mark as {next}
                            </button>
                          )}
                        </div>
                        <div className="flex gap-1">
                          <button onClick={e => { e.stopPropagation(); startEditing(req); }} className="p-1 px-2 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-400 dark:text-stone-400 hover:text-lux-gold rounded-xs border border-stone-200 dark:border-stone-800 text-[10px] font-mono flex items-center gap-1">
                            <Edit3 className="w-3 h-3" /> Edit
                          </button>
                          <button onClick={e => { e.stopPropagation(); handleDeleteRequest(req.id, req.contactName); }} className="p-1.5 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-400 dark:text-stone-500 hover:text-red-400 rounded-xs border border-stone-200 dark:border-stone-800">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Inline edit form */}
                      {isEditing && (
                        <div onClick={e => e.stopPropagation()} className="mt-4 p-4 border-t border-stone-200/70 dark:border-stone-800/70 bg-stone-100/50 dark:bg-stone-900/50 space-y-4 rounded-xs">
                          <h4 className="text-[10px] uppercase tracking-wider font-mono text-stone-400 dark:text-stone-400 font-bold">{t('admin.editOrder')}</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                              <label className="text-[9px] uppercase tracking-wider font-mono text-stone-400 dark:text-stone-400 block mb-1">{t('admin.statusLabel')}</label>
                              <select value={editStatus} onChange={e => setEditStatus(e.target.value)} className="w-full bg-stone-100 dark:bg-[#15110f] border border-stone-200 dark:border-stone-800 p-2 text-xs text-stone-700 dark:text-stone-200 focus:outline-none rounded-xs">
                                {WORKFLOW.map(s => <option key={s} value={s}>{s}</option>)}
                              </select>
                            </div>
                            <div>
                              <label className="text-[9px] uppercase tracking-wider font-mono text-stone-400 dark:text-stone-400 block mb-1">{t('admin.quotedPrice')}</label>
                              <input type="number" value={editCost} onChange={e => setEditCost(Math.max(0, Number(e.target.value)))} className="w-full bg-stone-100 dark:bg-[#15110f] border border-stone-200 dark:border-stone-800 p-2 text-xs text-stone-700 dark:text-stone-200 focus:outline-none rounded-xs" />
                            </div>
                            <div>
                              <label className="text-[9px] uppercase tracking-wider font-mono text-stone-400 dark:text-stone-400 block mb-1">Deposit (ETB)</label>
                              <input type="number" value={editDeposit} onChange={e => setEditDeposit(Math.max(0, Number(e.target.value)))} className="w-full bg-stone-100 dark:bg-[#15110f] border border-stone-200 dark:border-stone-800 p-2 text-xs text-stone-700 dark:text-stone-200 focus:outline-none rounded-xs" />
                            </div>
                          </div>
                          <div className="flex justify-end gap-2">
                            <button onClick={() => setEditingId(null)} className="px-3 py-1.5 text-[10px] font-mono font-bold uppercase bg-stone-200 dark:bg-stone-800 text-stone-500 dark:text-stone-400 hover:bg-stone-300 dark:hover:bg-stone-700 rounded-sm">{t('admin.cancelEdit')}</button>
                            <button onClick={() => saveRequestUpdates(req.id, req.contactName)} disabled={updating} className="px-3.5 py-1.5 text-[10px] font-mono font-bold uppercase bg-lux-gold text-stone-950 hover:bg-white rounded-sm flex items-center gap-1">
                              {updating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />} {t('admin.saveChanges')}
                            </button>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right: order detail sidebar */}
          <div className="lg:col-span-5 relative">
            <AnimatePresence mode="wait">
              {selectedRequest ? (
                <motion.div
                  key={selectedRequest.id}
                  initial={{ opacity: 0, x: 25 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -15 }}
                  className="bg-white/95 dark:bg-[#1e1a17]/95 border border-lux-gold/30 dark:border-[#c5a880]/30 rounded-sm shadow-2xl sticky top-6"
                >
                  <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-lux-gold via-white to-transparent" />
                  <div className="p-6 space-y-5">
                    <div className="flex justify-between items-start border-b border-stone-200 dark:border-stone-800 pb-4">
                      <div>
                        <span className="text-[9px] uppercase tracking-widest font-mono text-lux-gold block mb-1">Order Details</span>
                        <h2 className="font-serif text-xl text-stone-900 dark:text-white font-medium">{selectedRequest.contactName}</h2>
                        <p className="text-[10px] text-stone-400 dark:text-stone-400 font-mono mt-1">{selectedRequest.id} • {selectedRequest.requestDate}</p>
                      </div>
                      <button onClick={() => setSelectedRequest(null)} className="p-1.5 rounded-sm hover:bg-stone-200 dark:hover:bg-stone-800 text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white"><X className="w-4 h-4" /></button>
                    </div>

                    <div className="space-y-2 bg-stone-100 dark:bg-[#15110f] p-3 border border-stone-200 dark:border-stone-800 rounded-xs text-xs">
                      <div className="flex items-center gap-2 text-stone-600 dark:text-stone-300"><Mail className="w-4 h-4 text-lux-gold shrink-0" /> {selectedRequest.userId ? 'via Telegram' : 'No contact email'}</div>
                      <div className="flex items-center gap-2 text-stone-600 dark:text-stone-300"><Phone className="w-4 h-4 text-lux-gold shrink-0" /> {selectedRequest.contactPhone}</div>
                      <div className="flex items-center gap-2 text-stone-600 dark:text-stone-300">
                        <MapPin className="w-4 h-4 text-lux-gold shrink-0" />
                        {selectedRequest.deliveryOption === 'pickup' ? 'Studio Pickup — Bole' : selectedRequest.deliveryAddress || 'Delivery'}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="bg-stone-100 dark:bg-[#15110f] p-3 border border-stone-200 dark:border-stone-800 rounded-xs">
                        <span className="text-[9px] uppercase text-stone-400 dark:text-stone-400 font-mono block">Tiers</span>
                        <span className="text-stone-100 font-serif text-sm">{selectedRequest.tierCount} Tier</span>
                      </div>
                      <div className="bg-stone-100 dark:bg-[#15110f] p-3 border border-stone-200 dark:border-stone-800 rounded-xs">
                        <span className="text-[9px] uppercase text-stone-400 dark:text-stone-400 font-mono block">Guests</span>
                        <span className="text-stone-100 font-serif text-sm">{selectedRequest.guestCount}</span>
                      </div>
                      <div className="bg-stone-100 dark:bg-[#15110f] p-3 border border-stone-200 dark:border-stone-800 rounded-xs col-span-2">
                        <span className="text-[9px] uppercase text-stone-400 dark:text-stone-400 font-mono block">Flavor</span>
                        <span className="text-lux-gold font-serif text-sm">{selectedRequest.flavor}</span>
                      </div>
                    </div>

                    {selectedRequest.designStyle && (
                      <div>
                        <h4 className="text-[9px] uppercase tracking-wider font-mono text-stone-400 dark:text-stone-400 font-bold mb-2">Design Notes</h4>
                        <div className="p-3 border border-stone-200 dark:border-stone-800 bg-stone-100 dark:bg-[#15110f] rounded-xs text-stone-600 dark:text-stone-300 text-xs font-light leading-relaxed italic">
                          "{selectedRequest.designStyle}"
                        </div>
                      </div>
                    )}

                    {selectedRequest.specialInstructions && (
                      <div>
                        <h4 className="text-[9px] uppercase tracking-wider font-mono text-stone-400 dark:text-stone-400 font-bold mb-2">Special Instructions</h4>
                        <div className="p-3 border border-stone-200 dark:border-stone-800 bg-stone-100 dark:bg-[#15110f] rounded-xs text-stone-600 dark:text-stone-300 text-xs font-light leading-relaxed">
                          {selectedRequest.specialInstructions}
                        </div>
                      </div>
                    )}

                    <div className="border-t border-stone-200 dark:border-stone-800 pt-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-[9px] uppercase font-mono text-stone-400 dark:text-stone-400 block">Quoted Price</span>
                          <span className="text-lg font-mono font-bold text-lux-gold">
                            {orderPrice(selectedRequest) ? `${orderPrice(selectedRequest).toLocaleString()} ETB` : 'Not quoted yet'}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => startEditing(selectedRequest)} className="px-3 py-2 bg-stone-100 dark:bg-stone-900 hover:bg-lux-gold text-stone-700 dark:text-stone-200 hover:text-stone-950 font-mono text-[10px] uppercase font-bold rounded-sm border border-stone-200 dark:border-stone-800 transition-all cursor-pointer">
                            Edit
                          </button>
                          <button onClick={() => handleDeleteRequest(selectedRequest.id, selectedRequest.contactName)} className="p-2 border border-stone-200 dark:border-stone-800 hover:border-red-800 bg-red-950/20 text-red-400 rounded-sm cursor-pointer">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-3 text-left">
                        <div className="bg-stone-100 dark:bg-[#15110f] p-2.5 border border-stone-200 dark:border-stone-800 rounded-xs">
                          <span className="text-[8px] uppercase font-mono text-stone-400 dark:text-stone-400 block">Deposit</span>
                          <span className="text-xs font-mono font-bold text-stone-700 dark:text-stone-200">{selectedRequest.depositAmount.toLocaleString()} ETB</span>
                        </div>
                        <div className="bg-stone-100 dark:bg-[#15110f] p-2.5 border border-stone-200 dark:border-stone-800 rounded-xs">
                          <span className="text-[8px] uppercase font-mono text-stone-400 dark:text-stone-400 block">Balance</span>
                          <span className="text-xs font-mono font-bold text-stone-700 dark:text-stone-200">{selectedRequest.remainingBalance.toLocaleString()} ETB</span>
                        </div>
                        <div className="bg-stone-100 dark:bg-[#15110f] p-2.5 border border-stone-200 dark:border-stone-800 rounded-xs">
                          <span className="text-[8px] uppercase font-mono text-stone-400 dark:text-stone-400 block">Status</span>
                          <span className={`text-[10px] font-mono font-bold uppercase ${selectedRequest.paymentStatus === 'paid' ? 'text-emerald-400' : selectedRequest.paymentStatus === 'partial' ? 'text-amber-400' : 'text-stone-500'}`}>
                            {selectedRequest.paymentStatus}
                          </span>
                        </div>
                      </div>
                      {selectedRequest.depositPaidAt && (
                        <div className="text-[9px] font-mono text-stone-400 dark:text-stone-500">
                          Deposit paid: {new Date(selectedRequest.depositPaidAt).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="bg-white/95 dark:bg-[#1e1a17]/95 border border-dashed border-stone-300 dark:border-stone-800 rounded-sm py-24 text-center sticky top-6">
                  <Shield className="w-10 h-10 text-stone-600 mx-auto mb-3" />
                  <h3 className="font-serif text-stone-400 dark:text-stone-400 italic">{t('admin.selectOrder')}</h3>
                  <p className="text-xs text-stone-400 dark:text-stone-500 max-w-xs mx-auto mt-1 font-light px-6">Click any order on the left to view full details and manage it.</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* ── Menu Tab (with CRUD) ──────────────────────────── */}
      {currentTab === 'menu' && (
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
                    {categories.filter(c => c.isActive).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
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
                <button onClick={handleSaveGalleryItem} disabled={savingGallery} className="px-3.5 py-1.5 text-[10px] font-mono font-bold uppercase bg-lux-gold text-stone-950 hover:bg-white rounded-sm flex items-center gap-1">
                  {savingGallery ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />} {t('admin.saveChanges')}
                </button>
              </div>
            </div>
          )}

          {galleryLoading ? (
            <div className="text-center py-20 bg-stone-50 dark:bg-[#1d1916] border border-stone-200 dark:border-stone-800 rounded-sm">
              <Loader2 className="w-7 h-7 animate-spin text-lux-gold mx-auto mb-2" />
              <p className="text-xs text-stone-400 dark:text-stone-400 font-mono">{t('admin.loadingMenu')}</p>
            </div>
          ) : galleryItems.length === 0 ? (
            <div className="text-center py-20 bg-stone-50 dark:bg-[#1d1916] border border-stone-200 dark:border-stone-800 rounded-sm">
              <Image className="w-10 h-10 text-stone-400 dark:text-stone-500 mx-auto mb-3" />
              <p className="text-sm font-serif text-stone-600 dark:text-stone-300 italic">No gallery items yet.</p>
              <p className="text-xs text-stone-400 dark:text-stone-500 mt-1">Add your first cake to the menu.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {galleryItems.map(item => (
                <div key={item.id} className="bg-[#1e1a17] border border-stone-200 dark:border-stone-800 rounded-sm overflow-hidden group">
                  <img src={item.image} alt={item.name} className="h-44 w-full object-cover grayscale brightness-75 group-hover:grayscale-0 group-hover:brightness-100 transition-all duration-300" referrerPolicy="no-referrer" />
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[9px] uppercase tracking-widest font-mono text-lux-gold bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 px-2 py-0.5 rounded-sm">{item.category?.name ?? item.categoryId}</span>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => startEditGalleryItem(item)} className="p-1 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-400 dark:text-stone-400 hover:text-lux-gold rounded-xs border border-stone-200 dark:border-stone-800" title={t('admin.editGalleryItem')}>
                          <Pencil className="w-3 h-3" />
                        </button>
                        <button onClick={() => handleDeleteGalleryItem(item.id, item.name)} className="p-1 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-400 dark:text-stone-500 hover:text-red-400 rounded-xs border border-stone-200 dark:border-stone-800" title={t('admin.deleteGalleryItem')}>
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
      )}

      {/* ── Categories Tab ────────────────────────────────── */}
      {currentTab === 'categories' && (
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

          {/* Create/Edit Form */}
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
                <button onClick={handleSaveCategory} disabled={savingCategory} className="px-3.5 py-1.5 text-[10px] font-mono font-bold uppercase bg-lux-gold text-stone-950 hover:bg-white rounded-sm flex items-center gap-1">
                  {savingCategory ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />} {t('admin.saveChanges')}
                </button>
              </div>
            </div>
          )}

          {categoriesLoading ? (
            <div className="text-center py-16 bg-stone-50 dark:bg-[#1d1916] border border-stone-200 dark:border-stone-800 rounded-sm">
              <Loader2 className="w-7 h-7 animate-spin text-lux-gold mx-auto mb-2" />
              <p className="text-xs text-stone-400 dark:text-stone-400 font-mono">{t('admin.loadingCategories')}</p>
            </div>
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
                            <button onClick={() => startEditCategory(cat)} className="p-1.5 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-400 dark:text-stone-400 hover:text-lux-gold rounded-xs border border-stone-200 dark:border-stone-800" title={t('admin.editCategory')}>
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => handleDeleteCategory(cat.id, cat.name)} className="p-1.5 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-400 dark:text-stone-500 hover:text-red-400 rounded-xs border border-stone-200 dark:border-stone-800" title={t('admin.deleteCategory')}>
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
      )}

      {/* ── Reviews Tab ────────────────────────────────────── */}
      {currentTab === 'reviews' && (
        <div className="max-w-7xl mx-auto space-y-5 relative z-10 font-sans">
          <div className="flex justify-between items-center bg-stone-50 dark:bg-[#1d1916] p-5 border border-stone-200 dark:border-stone-800 rounded-sm">
            <h2 className="font-serif text-xl text-stone-900 dark:text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-lux-gold" /> {t('admin.reviews')} ({reviewItems.length})
            </h2>
          </div>

          {reviewsLoading ? (
            <div className="text-center py-16 bg-stone-50 dark:bg-[#1d1916] border border-stone-200 dark:border-stone-800 rounded-sm">
              <Loader2 className="w-7 h-7 animate-spin text-lux-gold mx-auto mb-2" />
              <p className="text-xs text-stone-400 dark:text-stone-400 font-mono">{t('admin.loadingReviews')}</p>
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
                          className="p-1.5 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-400 dark:text-stone-400 hover:text-lux-gold rounded-xs border border-stone-200 dark:border-stone-800"
                          title={t('admin.editReview')}
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleDeleteReview(rev.id, rev.author)} className="p-1.5 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-400 dark:text-stone-500 hover:text-red-400 rounded-xs border border-stone-200 dark:border-stone-800" title={t('admin.deleteReview')}>
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
                          <button onClick={() => handleSaveReview(rev.id)} disabled={savingReview} className="px-3.5 py-1.5 text-[10px] font-mono font-bold uppercase bg-lux-gold text-stone-950 hover:bg-white rounded-sm flex items-center gap-1">
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
      )}

      {/* ── Recovery Tab (Admin Only) ────────────────────── */}
      {currentTab === 'recovery' && (
        isAdmin ? (
          <div className="max-w-7xl mx-auto space-y-5 relative z-10 font-sans">
            <div className="flex justify-between items-center bg-stone-50 dark:bg-[#1d1916] p-5 border border-stone-200 dark:border-stone-800 rounded-sm">
              <h2 className="font-serif text-xl text-stone-900 dark:text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-lux-gold" /> {t('admin.recoveryRequests')} ({recoveryRequests.length})
              </h2>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 text-[10px] font-mono">
                  {['all', 'pending', 'approved', 'rejected'].map(s => (
                    <button
                      key={s}
                      onClick={() => setRecoveryStatusFilter(s)}
                      className={`px-2 py-1 uppercase tracking-wider cursor-pointer border transition-colors ${
                        recoveryStatusFilter === s
                          ? 'bg-lux-gold text-stone-950 border-lux-gold font-bold'
                          : 'bg-transparent text-stone-400 dark:text-stone-400 border-stone-200 dark:border-stone-800 hover:text-lux-gold'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
                <button onClick={fetchRecoveryRequests} className="text-stone-400 hover:text-lux-gold p-1 cursor-pointer" title="Refresh">
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {recoveryLoading ? (
              <div className="text-center py-16 bg-stone-50 dark:bg-[#1d1916] border border-stone-200 dark:border-stone-800 rounded-sm">
                <Loader2 className="w-7 h-7 animate-spin text-lux-gold mx-auto mb-2" />
                <p className="text-xs text-stone-400 dark:text-stone-400 font-mono">Loading recovery requests...</p>
              </div>
            ) : recoveryRequests.length === 0 ? (
              <div className="text-center py-16 bg-stone-50 dark:bg-[#1d1916] border border-stone-200 dark:border-stone-800 rounded-sm">
                <ShieldCheck className="w-10 h-10 text-stone-400 dark:text-stone-500 mx-auto mb-3" />
                <p className="text-sm font-serif text-stone-600 dark:text-stone-300 italic">No recovery requests found.</p>
              </div>
            ) : (
              <div className="bg-[#1e1a17] border border-stone-200 dark:border-stone-800 rounded-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-stone-100 dark:bg-[#15110f] text-stone-400 dark:text-stone-400 uppercase font-mono tracking-wider font-semibold border-b border-stone-200 dark:border-stone-800">
                      <tr>
                        <th className="px-5 py-4">Old Telegram ID</th>
                        <th className="px-5 py-4">New Telegram ID</th>
                        <th className="px-5 py-4">Status</th>
                        <th className="px-5 py-4">Created</th>
                        <th className="px-5 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-800/60">
                      {recoveryRequests.map((req: any) => (
                        <tr key={req.id} className="hover:bg-white/5 transition-colors">
                          <td className="px-5 py-4 font-mono text-stone-900 dark:text-white text-sm">{req.oldTelegramId}</td>
                          <td className="px-5 py-4 font-mono text-stone-900 dark:text-white text-sm">{req.newTelegramId}</td>
                          <td className="px-5 py-4">
                            <span className={getRecoveryStatusBadge(req.status)}>
                              {req.status === 'approved' ? <ShieldCheck className="w-3 h-3" /> : req.status === 'rejected' ? <X className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                              {req.status}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-stone-500 font-mono text-[10px]">{new Date(req.createdAt).toLocaleDateString()}</td>
                          <td className="px-5 py-4">
                            <div className="flex items-center justify-end gap-2">
                              {req.status === 'pending' && (
                                <>
                                  <button
                                    onClick={() => handleRecoveryStatus(req.id, 'approved')}
                                    className="px-2.5 py-1 bg-emerald-600 text-white font-mono text-[9px] uppercase font-bold rounded-xs flex items-center gap-1 hover:bg-emerald-500 cursor-pointer"
                                  >
                                    <ShieldCheck className="w-3 h-3" /> Approve
                                  </button>
                                  <button
                                    onClick={() => handleRecoveryStatus(req.id, 'rejected')}
                                    className="px-2.5 py-1 bg-red-700 text-white font-mono text-[9px] uppercase font-bold rounded-xs flex items-center gap-1 hover:bg-red-600 cursor-pointer"
                                  >
                                    <X className="w-3 h-3" /> Reject
                                  </button>
                                </>
                              )}
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
        ) : (
          <div className="max-w-md mx-auto py-20 bg-white dark:bg-[#1d1916] border border-stone-200 dark:border-stone-800 rounded-sm text-center relative z-10 font-sans shadow-xl">
            <ShieldCheck className="w-12 h-12 text-lux-gold/30 mx-auto mb-4" />
            <h3 className="font-serif text-lg text-stone-900 dark:text-white font-medium mb-2">Admin Access Only</h3>
            <p className="text-xs text-stone-400 dark:text-stone-400 max-w-xs mx-auto leading-relaxed">
              Recovery request management is restricted to system administrators.
            </p>
          </div>
        )
      )}

      {/* ── Users Tab (Admin Only) ────────────────────────── */}
      {currentTab === 'users' && (
        isAdmin ? (
          <div className="max-w-7xl mx-auto space-y-5 relative z-10 font-sans">
            <div className="flex justify-between items-center bg-stone-50 dark:bg-[#1d1916] p-5 border border-stone-200 dark:border-stone-800 rounded-sm">
              <h2 className="font-serif text-xl text-stone-900 dark:text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-lux-gold" /> {t('admin.totalUsers')} ({users.length})
              </h2>
              <button onClick={fetchUsers} className="text-[10px] uppercase font-mono text-stone-400 dark:text-stone-400 hover:text-lux-gold flex items-center gap-1 cursor-pointer">
                <RefreshCw className="w-3 h-3" /> Refresh
              </button>
            </div>

            {usersLoading ? (
              <div className="text-center py-16 bg-stone-50 dark:bg-[#1d1916] border border-stone-200 dark:border-stone-800 rounded-sm">
                <Loader2 className="w-7 h-7 animate-spin text-lux-gold mx-auto mb-2" />
                <p className="text-xs text-stone-400 dark:text-stone-400 font-mono">{t('admin.loadingUsers')}</p>
              </div>
            ) : (
              <div className="bg-[#1e1a17] border border-stone-200 dark:border-stone-800 rounded-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-stone-100 dark:bg-[#15110f] text-stone-400 dark:text-stone-400 uppercase font-mono tracking-wider font-semibold border-b border-stone-200 dark:border-stone-800">
                      <tr>
                        <th className="px-5 py-4">Name</th>
                        <th className="px-5 py-4">Email</th>
                        <th className="px-5 py-4">Role</th>
                        <th className="px-5 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-800/60">
                      {users.map(u => (
                        <tr key={u.id} className="hover:bg-white/5 transition-colors">
                          <td className="px-5 py-4 font-serif italic text-stone-900 dark:text-white text-sm">{u.name}</td>
                          <td className="px-5 py-4 text-stone-600 dark:text-stone-300 font-light">{u.email || '—'}</td>
                          <td className="px-5 py-4">
                            {editingUserId === u.id ? (
                              <select
                                value={editingRole}
                                onChange={e => setEditingRole(e.target.value)}
                                className="bg-stone-100 dark:bg-[#15110f] border border-lux-gold text-stone-700 dark:text-stone-200 py-1 px-2 text-xs rounded-xs font-mono"
                              >
                                <option value="customer">Customer</option>
                                <option value="staff">Bakery Staff</option>
                                <option value="admin">System Admin</option>
                              </select>
                            ) : (
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono uppercase font-bold border ${
                                u.role === 'admin' ? 'bg-lux-gold/10 border-lux-gold text-lux-gold'
                                : u.role === 'staff' ? 'bg-blue-900/10 border-blue-800 text-blue-400'
                                : 'bg-stone-100 dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300'
                              }`}>
                                {u.role === 'admin' ? 'System Admin' : u.role === 'staff' ? 'Bakery Staff' : 'Customer'}
                              </span>
                            )}
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center justify-end gap-2">
                              {editingUserId === u.id ? (
                                <>
                                  <button
                                    onClick={() => saveUserRole(u.id, u.name)}
                                    disabled={updatingRole}
                                    className="px-2.5 py-1 bg-lux-gold text-stone-950 font-mono text-[9px] uppercase font-bold rounded-xs flex items-center gap-1"
                                  >
                                    {updatingRole ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />} Save
                                  </button>
                                  <button onClick={() => setEditingUserId(null)} className="px-2.5 py-1 bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-300 font-mono text-[9px] uppercase font-bold rounded-xs">
                                    Cancel
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    onClick={() => { setEditingUserId(u.id); setEditingRole(u.role); }}
                                    className="p-1.5 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-400 dark:text-stone-400 hover:text-lux-gold rounded-xs border border-stone-200 dark:border-stone-800 transition-colors"
                                    title="Change role"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>
                                  {u.id !== currentUser?.id && (
                                    <button
                                      onClick={() => deleteUser(u.id, u.name)}
                                      disabled={deletingUserId === u.id}
                                      className="p-1.5 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-400 dark:text-stone-500 hover:text-red-400 rounded-xs border border-stone-200 dark:border-stone-800 transition-colors"
                                      title="Delete user"
                                    >
                                      {deletingUserId === u.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                                    </button>
                                  )}
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Warning notice about role changes */}
            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 rounded-sm p-4 flex items-start gap-3">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-800/80 dark:text-amber-300/80 font-sans font-light leading-relaxed">
                <strong>Role changes take effect immediately.</strong> Promoting a user to <em>Bakery Staff</em> grants access to the Orders and Menu management tabs. Promoting to <em>System Admin</em> grants full system access including this Users panel. Demoting yourself is blocked to prevent lockout.
              </p>
            </div>
          </div>
        ) : (
          // Staff sees an access-denied message for users tab
          <div className="max-w-md mx-auto py-20 bg-white dark:bg-[#1d1916] border border-stone-200 dark:border-stone-800 rounded-sm text-center relative z-10 font-sans shadow-xl">
            <ShieldCheck className="w-12 h-12 text-lux-gold/30 mx-auto mb-4" />
            <h3 className="font-serif text-lg text-stone-900 dark:text-white font-medium mb-2">Admin Access Only</h3>
            <p className="text-xs text-stone-400 dark:text-stone-400 max-w-xs mx-auto leading-relaxed">
              User management is restricted to system administrators. Contact your admin if you need account changes.
            </p>
          </div>
        )
      )}
    </div>
  );
}
