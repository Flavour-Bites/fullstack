// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Header from '../Header';
import type { User } from '../../types';

const baseProps = {
  currentUser: null as User | null,
  darkMode: false,
  locale: 'en' as const,
  activePage: 'home' as const,
  adminTab: 'dashboard',
  isAdminMode: false,
  onNavigate: vi.fn(),
  onAdminTabChange: vi.fn(),
  onToggleDarkMode: vi.fn(),
  onToggleLocale: vi.fn(),
  onLogout: vi.fn(),
  onSearchOpen: vi.fn(),
};

describe('Header', () => {
  it('renders the brand name', () => {
    render(<Header {...baseProps} />);
    expect(screen.getByText('FLAVOUR')).toBeInTheDocument();
    expect(screen.getByText('BITES')).toBeInTheDocument();
  });

  it('renders desktop nav items', () => {
    render(<Header {...baseProps} />);
    expect(screen.getByText('HOME')).toBeInTheDocument();
    expect(screen.getByText('CAKE GALLERY')).toBeInTheDocument();
    expect(screen.getByText('REVIEWS')).toBeInTheDocument();
  });

  it('calls onNavigate when nav button is clicked', async () => {
    const onNavigate = vi.fn();
    render(<Header {...baseProps} onNavigate={onNavigate} />);

    await userEvent.click(screen.getByText('HOME'));
    expect(onNavigate).toHaveBeenCalledWith('home');
  });

  it('shows admin tabs when isAdminMode', () => {
    render(<Header {...baseProps} isAdminMode={true} />);
    expect(screen.getByText('DASHBOARD')).toBeInTheDocument();
    expect(screen.getByText('ORDERS')).toBeInTheDocument();
    expect(screen.getByText('MENU')).toBeInTheDocument();
    expect(screen.queryByText('HOME')).not.toBeInTheDocument();
  });

  it('shows admin users tab for admin role', () => {
    const adminUser: User = { id: '1', telegramId: '1', name: 'Admin', role: 'admin', createdAt: '2024-01-01' };
    render(<Header {...baseProps} isAdminMode={true} currentUser={adminUser} />);
    expect(screen.getByText('USERS')).toBeInTheDocument();
    expect(screen.getByText('RECOVERY')).toBeInTheDocument();
  });

  it('hides users and recovery tabs for staff role', () => {
    const staffUser: User = { id: '2', telegramId: '2', name: 'Staff', role: 'staff', createdAt: '2024-01-01' };
    render(<Header {...baseProps} isAdminMode={true} currentUser={staffUser} />);
    expect(screen.queryByText('USERS')).not.toBeInTheDocument();
    expect(screen.queryByText('RECOVERY')).not.toBeInTheDocument();
  });

  it('shows sign in button when no user', () => {
    render(<Header {...baseProps} />);
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeInTheDocument();
  });

  it('locale switcher toggles locale', async () => {
    const onToggleLocale = vi.fn();
    render(<Header {...baseProps} onToggleLocale={onToggleLocale} />);

    await userEvent.click(screen.getByTitle('Switch language'));
    expect(onToggleLocale).toHaveBeenCalledOnce();
  });

  it('shows mobile menu button and toggles menu', async () => {
    render(<Header {...baseProps} />);

    const toggleBtn = screen.getByLabelText('Toggle menu');
    await userEvent.click(toggleBtn);
    expect(screen.getByText('Cake Gallery')).toBeInTheDocument();
  });

  it('book custom cake CTA is visible in public mode', () => {
    render(<Header {...baseProps} />);
    expect(screen.getByText('Book Custom Cake')).toBeInTheDocument();
  });

  it('book custom cake CTA is hidden in admin mode', () => {
    render(<Header {...baseProps} isAdminMode={true} />);
    expect(screen.queryByText('Book Custom Cake')).not.toBeInTheDocument();
  });

  it('shows user name and initial for logged-in user', () => {
    const user: User = { id: '1', telegramId: '1', name: 'Test User', role: 'customer', createdAt: '2024-01-01' };
    render(<Header {...baseProps} currentUser={user} />);
    expect(screen.getByText('T')).toBeInTheDocument();
    expect(screen.getByText('Test')).toBeInTheDocument();
  });
});
