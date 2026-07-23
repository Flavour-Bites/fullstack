// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup, waitFor } from '@testing-library/react';
import { ToastProvider } from '@/shared/ui/Toast';
import ProfileView from '@/features/users/components/ProfileView';

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn(() => Promise.resolve(new Response('{"success":true,"requests":[]}'))));
});

afterEach(() => {
  vi.unstubAllGlobals();
  cleanup();
});

const mockUser = { id: '1', telegramId: '1', name: 'Test User', role: 'customer' } as any;

describe('ProfileView', () => {
  it('renders user profile section', async () => {
    render(
      <ToastProvider>
        <ProfileView currentUser={mockUser} onLogout={vi.fn()} />
      </ToastProvider>
    );
    await waitFor(() => {
      expect(screen.getByText('Your Profile')).toBeInTheDocument();
    });
  });
});
