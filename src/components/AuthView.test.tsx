// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ToastProvider } from './Toast';
import AuthView from './AuthView';

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn());
  localStorage.clear();
});

afterEach(() => {
  vi.unstubAllGlobals();
  cleanup();
});

function renderAuthView(props = {}) {
  return render(
    <ToastProvider>
      <AuthView onAuthSuccess={vi.fn()} {...props} />
    </ToastProvider>
  );
}

describe('AuthView', () => {
  it('renders the telegram login step by default', () => {
    renderAuthView();
    expect(screen.getByText('Sign In')).toBeInTheDocument();
    expect(screen.getByText(/Sign in with Telegram/i)).toBeInTheDocument();
  });

  it('renders custom title and subtitle', () => {
    renderAuthView({ title: 'Custom Title', subtitle: 'Custom Subtitle' });
    expect(screen.getByText('Custom Title')).toBeInTheDocument();
    expect(screen.getByText('Custom Subtitle')).toBeInTheDocument();
  });

  it('transitions to password step when needsPassword is returned', async () => {
    const mockFetch = vi.fn(() =>
      Promise.resolve(new Response(JSON.stringify({
        success: true, needsPassword: true, telegramId: '12345'
      }), { headers: { 'Content-Type': 'application/json' } }))
    );
    vi.stubGlobal('fetch', mockFetch);

    renderAuthView();

    const telegramData = { id: 12345, first_name: 'Test', auth_date: Date.now(), hash: 'abc' };
    await (window as any).onTelegramAuth(telegramData);

    await waitFor(() => {
      expect(screen.getByText('Enter Your Password')).toBeInTheDocument();
    });
  });

  it('calls onAuthSuccess on successful login without password', async () => {
    const onAuthSuccess = vi.fn();
    const mockFetch = vi.fn(() =>
      Promise.resolve(new Response(JSON.stringify({
        success: true, token: 'jwt-token', user: { id: '1', name: 'Test', role: 'customer' }
      }), { headers: { 'Content-Type': 'application/json' } }))
    );
    vi.stubGlobal('fetch', mockFetch);

    renderAuthView({ onAuthSuccess });

    await (window as any).onTelegramAuth({ id: 12345, first_name: 'Test', auth_date: Date.now(), hash: 'abc' });

    await waitFor(() => {
      expect(onAuthSuccess).toHaveBeenCalledWith({ id: '1', name: 'Test', role: 'customer' });
    });
  });

  it('submits password and calls onAuthSuccess', async () => {
    const onAuthSuccess = vi.fn();
    const mockFetch = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({
        success: true, needsPassword: true, telegramId: '12345'
      }), { headers: { 'Content-Type': 'application/json' } }))
      .mockResolvedValueOnce(new Response(JSON.stringify({
        success: true, token: 'jwt-token-2', user: { id: '1', name: 'Test', role: 'admin' }
      }), { headers: { 'Content-Type': 'application/json' } }));
    vi.stubGlobal('fetch', mockFetch);

    renderAuthView({ onAuthSuccess });

    await (window as any).onTelegramAuth({ id: 12345, first_name: 'Test', auth_date: Date.now(), hash: 'abc' });

    await waitFor(() => {
      expect(screen.getByText('Enter Your Password')).toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText('Your password');
    await userEvent.type(input, 'mypassword');
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(onAuthSuccess).toHaveBeenCalledWith({ id: '1', name: 'Test', role: 'admin' });
    });
  });

  it('shows back button in password step', async () => {
    const mockFetch = vi.fn(() =>
      Promise.resolve(new Response(JSON.stringify({
        success: true, needsPassword: true, telegramId: '12345'
      }), { headers: { 'Content-Type': 'application/json' } }))
    );
    vi.stubGlobal('fetch', mockFetch);

    renderAuthView();

    await (window as any).onTelegramAuth({ id: 12345, first_name: 'Test', auth_date: Date.now(), hash: 'abc' });

    await waitFor(() => {
      expect(screen.getByText('Use a different Telegram account')).toBeInTheDocument();
    });
  });
});
