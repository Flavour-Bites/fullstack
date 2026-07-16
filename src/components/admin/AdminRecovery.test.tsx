// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import AdminRecovery from './AdminRecovery';

const noop = () => Promise.resolve();

const sampleRequests = [
  { id: 'r1', oldTelegramId: '111', newTelegramId: '222', status: 'pending', createdAt: '2024-06-01T00:00:00.000Z' },
  { id: 'r2', oldTelegramId: '333', newTelegramId: '444', status: 'approved', createdAt: '2024-06-15T00:00:00.000Z' },
];

describe('AdminRecovery', () => {
  it('shows access denied for non-admin', () => {
    render(
      <AdminRecovery
        isAdmin={false}
        recoveryRequests={[]}
        recoveryLoading={false}
        recoveryStatusFilter="all"
        setRecoveryStatusFilter={vi.fn()}
        fetchRecoveryRequests={noop}
        handleRecoveryStatus={noop}
      />
    );
    expect(screen.getByText('Admin Access Only')).toBeInTheDocument();
  });

  it('shows loading state for admin', () => {
    render(
      <AdminRecovery
        isAdmin={true}
        recoveryRequests={[]}
        recoveryLoading={true}
        recoveryStatusFilter="all"
        setRecoveryStatusFilter={vi.fn()}
        fetchRecoveryRequests={noop}
        handleRecoveryStatus={noop}
      />
    );
    expect(screen.getByText('Loading recovery requests...')).toBeInTheDocument();
  });

  it('shows empty state', () => {
    render(
      <AdminRecovery
        isAdmin={true}
        recoveryRequests={[]}
        recoveryLoading={false}
        recoveryStatusFilter="all"
        setRecoveryStatusFilter={vi.fn()}
        fetchRecoveryRequests={noop}
        handleRecoveryStatus={noop}
      />
    );
    expect(screen.getByText('No recovery requests found.')).toBeInTheDocument();
  });

  it('renders recovery request rows', () => {
    render(
      <AdminRecovery
        isAdmin={true}
        recoveryRequests={sampleRequests}
        recoveryLoading={false}
        recoveryStatusFilter="all"
        setRecoveryStatusFilter={vi.fn()}
        fetchRecoveryRequests={noop}
        handleRecoveryStatus={noop}
      />
    );
    expect(screen.getByText('111')).toBeInTheDocument();
    expect(screen.getByText('333')).toBeInTheDocument();
    expect(screen.getByText('Approve')).toBeInTheDocument();
    expect(screen.getByText('Reject')).toBeInTheDocument();
  });
});
