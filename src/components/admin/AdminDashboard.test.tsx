// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ToastProvider } from '../Toast';
import { AdminDashboard } from './AdminDashboard';

const noop = () => Promise.resolve();

const baseProps = {
  requests: [],
  stats: null,
  loading: false,
  seeding: false,
  refreshing: false,
  totalRevenue: 0,
  pendingCount: 0,
  activeCount: 0,
  isAdmin: true,
  handleDatabaseSeed: noop,
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

  it('shows seed demo data button for admin', () => {
    render(
      <ToastProvider>
        <AdminDashboard {...baseProps} />
      </ToastProvider>
    );
    expect(screen.getByText('Seed Demo Data')).toBeInTheDocument();
  });
});
