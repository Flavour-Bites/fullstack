// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import Header from '@/shared/ui/Header';
import type { User } from '@/types';

const baseProps = {
  currentUser: null as User | null,
  darkMode: false,
  locale: 'en' as const,
  onToggleDarkMode: vi.fn(),
  onToggleLocale: vi.fn(),
  onLogout: vi.fn(),
  onSearchOpen: vi.fn(),
};

const renderWithRouter = (ui: React.ReactElement) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
};

describe('Header', () => {
  it('renders the brand name', () => {
    renderWithRouter(<Header {...baseProps} />);
    expect(screen.getByText('FLAVOUR')).toBeInTheDocument();
    expect(screen.getByText('BITES')).toBeInTheDocument();
  });

  it('renders desktop nav items', () => {
    renderWithRouter(<Header {...baseProps} />);
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Cake Gallery')).toBeInTheDocument();
    expect(screen.getByText('Reviews')).toBeInTheDocument();
  });

  it('shows sign in button when no user', () => {
    renderWithRouter(<Header {...baseProps} />);
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeInTheDocument();
  });

  it('locale switcher toggles locale', async () => {
    const onToggleLocale = vi.fn();
    renderWithRouter(<Header {...baseProps} onToggleLocale={onToggleLocale} />);

    await userEvent.click(screen.getByTitle('Switch language'));
    expect(onToggleLocale).toHaveBeenCalledOnce();
  });

  it('shows mobile menu button and toggles menu', async () => {
    renderWithRouter(<Header {...baseProps} />);

    const toggleBtn = screen.getByLabelText('Toggle menu');
    await userEvent.click(toggleBtn);
    expect(screen.getAllByText('Cake Gallery').length).toBeGreaterThan(0);
  });

  it('book custom cake CTA is visible in public mode', () => {
    renderWithRouter(<Header {...baseProps} />);
    expect(screen.getAllByText('Book Custom Cake').length).toBeGreaterThan(0);
  });

  it('shows user name and initial for logged-in user', () => {
    const user: User = { id: '1', telegramId: '1', name: 'Test User', role: 'customer', createdAt: '2024-01-01' };
    renderWithRouter(<Header {...baseProps} currentUser={user} />);
    expect(screen.getByText('T')).toBeInTheDocument();
    expect(screen.getByText('Test')).toBeInTheDocument();
  });
});
