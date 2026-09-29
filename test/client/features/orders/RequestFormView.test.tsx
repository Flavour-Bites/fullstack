// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from '@client/components/Toast';
import RequestFormView from '@client/features/orders/components/RequestFormView';

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
        staleTime: 0,
      },
    },
  });

function renderWithQueryClient(
  ui: React.ReactElement,
  { queryClient = createTestQueryClient(), ...renderOptions } = {}
) {
  return render(
    <QueryClientProvider client={queryClient}>
      <ToastProvider>{ui}</ToastProvider>
    </QueryClientProvider>,
    renderOptions
  );
}

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn(() => Promise.resolve(new Response('{"success":true}'))));
});

afterEach(() => {
  vi.unstubAllGlobals();
  cleanup();
});

describe('RequestFormView', () => {
  it('renders request form', async () => {
    renderWithQueryClient(<RequestFormView prefilledCake={null} onClearPrefilledCake={vi.fn()} />);
    await waitFor(() => {
      expect(screen.getByText('Request a Custom Cake')).toBeInTheDocument();
    });
  });
});
