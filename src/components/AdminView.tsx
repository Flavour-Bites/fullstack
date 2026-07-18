import React, { useState, useEffect } from 'react';
import {
  Package, Image, Layers, Users, ShieldCheck, Star,
  BarChart2, RefreshCw, Download, Loader2
} from 'lucide-react';
import { useToast } from './Toast';
import { t } from '../i18n';
import { usePageTitle } from '../hooks/usePageTitle';
import { useAdminData } from './admin/useAdminData';
import { AdminDashboard } from './admin/AdminDashboard';
import AdminOrders from './admin/AdminOrders';
import AdminMenu from './admin/AdminMenu';
import AdminCategories from './admin/AdminCategories';
import AdminReviews from './admin/AdminReviews';
import AdminUsers from './admin/AdminUsers';
import AdminRecovery from './admin/AdminRecovery';
import type { User } from '../types';
import { exportOrdersCSV } from './admin/types';

interface AdminViewProps {
  activeTab?: 'dashboard' | 'orders' | 'menu' | 'categories' | 'reviews' | 'users' | 'recovery';
  onTabChange?: (tab: 'dashboard' | 'orders' | 'menu' | 'categories' | 'reviews' | 'users' | 'recovery') => void;
  currentUser?: User | null;
}

const TABS = [
  { key: 'dashboard', label: 'Dashboard', icon: BarChart2 },
  { key: 'orders', label: t('admin.orders'), icon: Package },
  { key: 'menu', label: t('admin.menu'), icon: Image },
  { key: 'categories', label: 'Categories', icon: Layers },
  { key: 'reviews', label: 'Reviews', icon: Star },
  { key: 'users', label: t('admin.users'), icon: Users },
  { key: 'recovery', label: 'Recovery', icon: ShieldCheck },
] as const;

export default function AdminView({ activeTab, onTabChange, currentUser }: AdminViewProps) {
  usePageTitle("Admin");
  const { showToast } = useToast();

  const [internalTab, setInternalTab] = useState<'dashboard' | 'orders' | 'menu' | 'categories' | 'reviews' | 'users' | 'recovery'>('dashboard');
  const currentTab = activeTab || internalTab;
  const setCurrentTab = onTabChange || setInternalTab;

  const admin = useAdminData(currentUser || null);
  const { requests, loading, refreshing, isAdmin, stats, totalRevenue, pendingCount, activeCount } = admin;

  useEffect(() => {
    if (currentTab === 'users' && isAdmin) admin.fetchUsers();
    if (currentTab === 'menu') admin.fetchGallery();
    if (currentTab === 'categories') { admin.fetchCategories(); admin.fetchGallery(); }
    if (currentTab === 'reviews') admin.fetchReviews();
    if (currentTab === 'recovery' && isAdmin) admin.fetchRecoveryRequests();
  }, [currentTab]);

  const refreshAll = () => { admin.fetchRequests(); admin.fetchStats(); };

  return (
    <div className="bg-stone-50 dark:bg-[#171412] dark:text-stone-100 min-h-screen py-16 px-4 sm:px-6 relative selection:bg-lux-gold/30 selection:text-white dark:selection:text-white">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-lux-gold/[0.02] rounded-full blur-[140px] pointer-events-none" />

      {/* Header */}
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
            onClick={refreshAll}
            disabled={refreshing}
            className="px-4 py-2.5 bg-stone-100 dark:bg-stone-900 hover:bg-stone-200 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white border border-stone-300 dark:border-stone-800 rounded-sm font-mono text-[10px] uppercase font-bold tracking-wider flex items-center gap-2 transition-all cursor-pointer"
          >
            {refreshing ? <Loader2 className="w-3.5 h-3.5 animate-spin text-lux-gold" /> : <RefreshCw className="w-3.5 h-3.5" />}
            Refresh
          </button>

          <button
            onClick={() => exportOrdersCSV(requests)}
            disabled={requests.length === 0}
            className="px-4 py-2.5 bg-stone-100 dark:bg-stone-900 hover:bg-stone-200 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white border border-stone-300 dark:border-stone-800 rounded-sm font-mono text-[10px] uppercase font-bold tracking-wider flex items-center gap-2 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Download className="w-3.5 h-3.5" />
            {t('admin.exportCSV')}
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="max-w-7xl mx-auto mb-8 relative z-10">
        <nav className="flex flex-wrap gap-1.5 border-b border-stone-200 dark:border-stone-800 pb-px">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setCurrentTab(key as any)}
              className={`px-4 py-3 text-[10px] uppercase font-mono font-bold tracking-wider flex items-center gap-2 transition-all cursor-pointer border-b-2 -mb-px ${
                currentTab === key
                  ? 'text-lux-gold border-lux-gold'
                  : 'text-stone-400 dark:text-stone-500 border-transparent hover:text-stone-600 dark:hover:text-stone-300'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto relative z-10">
        {currentTab === 'dashboard' && (
          <AdminDashboard
            requests={requests}
            stats={stats}
            loading={loading}
            refreshing={refreshing}
            totalRevenue={totalRevenue}
            pendingCount={pendingCount}
            activeCount={activeCount}
            isAdmin={isAdmin}
            fetchRequests={admin.fetchRequests}
            fetchStats={admin.fetchStats}
          />
        )}

        {currentTab === 'orders' && (
          <AdminOrders
            requests={requests}
            loading={loading}
            refreshing={refreshing}
            handleDeleteRequest={admin.handleDeleteRequest}
            saveRequestUpdates={admin.saveRequestUpdates}
            advanceStatus={admin.advanceStatus}
          />
        )}

        {currentTab === 'menu' && (
          <AdminMenu
            galleryItems={admin.galleryItems}
            galleryLoading={admin.galleryLoading}
            categories={admin.categories}
            handleSaveGalleryItem={admin.handleSaveGalleryItem}
            handleDeleteGalleryItem={admin.handleDeleteGalleryItem}
          />
        )}

        {currentTab === 'categories' && (
          <AdminCategories
            categories={admin.categories}
            categoriesLoading={admin.categoriesLoading}
            handleSaveCategory={admin.handleSaveCategory}
            handleDeleteCategory={admin.handleDeleteCategory}
            handleToggleCategoryActive={admin.handleToggleCategoryActive}
            fetchCategories={admin.fetchCategories}
          />
        )}

        {currentTab === 'reviews' && (
          <AdminReviews
            reviewItems={admin.reviewItems}
            reviewsLoading={admin.reviewsLoading}
            handleDeleteReview={admin.handleDeleteReview}
            handleSaveReview={admin.handleSaveReview}
            fetchReviews={admin.fetchReviews}
          />
        )}

        {currentTab === 'users' && (
          <AdminUsers
            users={admin.users}
            usersLoading={admin.usersLoading}
            isAdmin={isAdmin}
            currentUser={currentUser || null}
            saveUserRole={admin.saveUserRole}
            deleteUser={admin.deleteUser}
            fetchUsers={admin.fetchUsers}
          />
        )}

        {currentTab === 'recovery' && (
          <AdminRecovery
            isAdmin={isAdmin}
            recoveryRequests={admin.recoveryRequests}
            recoveryLoading={admin.recoveryLoading}
            recoveryStatusFilter={admin.recoveryStatusFilter}
            setRecoveryStatusFilter={admin.setRecoveryStatusFilter}
            fetchRecoveryRequests={admin.fetchRecoveryRequests}
            handleRecoveryStatus={admin.handleRecoveryStatus}
          />
        )}
      </div>
    </div>
  );
}
