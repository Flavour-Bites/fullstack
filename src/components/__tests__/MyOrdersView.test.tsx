// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup, waitFor } from '@testing-library/react';
import MyOrdersView from '../MyOrdersView';

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn(() => Promise.resolve(new Response('{"success":true,"requests":[]}'))));
});

afterEach(() => {
  vi.unstubAllGlobals();
  cleanup();
});

describe('MyOrdersView', () => {
  it('renders page title', async () => {
    render(<MyOrdersView currentUser={{ id: '1', email: 'a@b.com', name: 'Test', role: 'customer' }} />);
    await waitFor(() => {
      expect(screen.getByText('Order Updates')).toBeInTheDocument();
    });
  });
});
