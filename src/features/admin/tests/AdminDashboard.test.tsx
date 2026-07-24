// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ToastProvider } from '@/shared/ui/Toast';
import { AdminDashboard } from '@/features/admin/components/AdminDashboard';

const noop = () => Promise.resolve();

const baseProps = {
  requests: [],
  stats: null,
  loading: false,
  refreshing: false,
  totalRevenue: 0,
  pendingCount: 0,
  activeCount: 0,
  isAdmin: true,
  fetchRequests: noop,
  fetchStats: noop,
};

describe('AdminDashboard', () => {
  it('renders stat cards', () => {
    render(
      <ToastProvider>
        <AdminDashboard {...baseProps} />
      </ToastProvider>
    );
    expect(screen.getByText('Total Orders')).toBeInTheDocument();
    expect(screen.getByText('Total Revenue')).toBeInTheDocument();
    expect(screen.getByText('Pending Review')).toBeInTheDocument();
    expect(screen.getByText('Currently Active')).toBeInTheDocument();
  });

  it('shows loading indicator when loading', () => {
    render(
      <ToastProvider>
        <AdminDashboard {...baseProps} loading={true} requests={[]} />
      </ToastProvider>
    );
    const values = screen.getAllByText('…');
    expect(values.length).toBeGreaterThanOrEqual(3);
  });

});
