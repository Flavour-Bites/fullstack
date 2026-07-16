// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { ToastProvider } from './Toast';
import AdminView from './AdminView';

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn(() => Promise.resolve(new Response('{"success":true,"requests":[]}'))));
});

afterEach(() => {
  vi.unstubAllGlobals();
  cleanup();
});

const adminUser = { id: '1', telegramId: '1', name: 'Admin', role: 'admin' } as any;

function renderView(props = {}) {
  return render(
    <ToastProvider>
      <AdminView currentUser={adminUser} {...props} />
    </ToastProvider>
  );
}

describe('AdminView', () => {
  it('renders tab navigation buttons', () => {
    renderView();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Orders')).toBeInTheDocument();
    expect(screen.getByText('Menu')).toBeInTheDocument();
    expect(screen.getByText('Categories')).toBeInTheDocument();
    expect(screen.getByText('Reviews')).toBeInTheDocument();
  });

  it('shows dashboard content by default', () => {
    renderView();
    expect(screen.getByText('Total Orders')).toBeInTheDocument();
  });

  it('shows Users and Recovery tabs for admin', () => {
    renderView();
    expect(screen.getByText('Users')).toBeInTheDocument();
    expect(screen.getByText('Recovery')).toBeInTheDocument();
  });

  it('renders system administration badge for admin', () => {
    renderView();
    expect(screen.getByText('System Administration')).toBeInTheDocument();
  });
});
