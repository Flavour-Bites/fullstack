import React from 'react';
import {
  Package, Coins, Clock, Activity, BarChart2, Sparkles,
  Database, Users, Loader2, RefreshCw
} from 'lucide-react';
import { useToast } from '../Toast';
import { t } from '../../i18n';
import { WORKFLOW } from './types';
import type { CakeRequest, Stats } from './types';

interface AdminDashboardProps {
  requests: CakeRequest[];
  stats: Stats | null;
  loading: boolean;
  seeding: boolean;
  refreshing: boolean;
  totalRevenue: number;
  pendingCount: number;
  activeCount: number;
  isAdmin: boolean;
  handleDatabaseSeed: () => Promise<void>;
  fetchRequests: (silent?: boolean) => Promise<void>;
  fetchStats: () => Promise<void>;
}

export function AdminDashboard({
  requests,
  stats,
  loading,
  seeding,
  refreshing,
  totalRevenue,
  pendingCount,
  activeCount,
  isAdmin,
  handleDatabaseSeed,
  fetchRequests,
  fetchStats,
}: AdminDashboardProps) {
  return (
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
  );
}
