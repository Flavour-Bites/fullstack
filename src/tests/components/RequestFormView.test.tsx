// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup, waitFor } from '@testing-library/react';
import { ToastProvider } from '@/components/Toast';
import RequestFormView from '@/components/RequestFormView';

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn(() => Promise.resolve(new Response('{"success":true}'))));
});

afterEach(() => {
  vi.unstubAllGlobals();
  cleanup();
});

describe('RequestFormView', () => {
  it('renders request form', async () => {
    render(
      <ToastProvider>
        <RequestFormView prefilledCake={null} onClearPrefilledCake={vi.fn()} />
      </ToastProvider>
    );
    await waitFor(() => {
      expect(screen.getByText('Request a Custom Cake')).toBeInTheDocument();
    });
  });
});
