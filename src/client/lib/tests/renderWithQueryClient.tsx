import { render } from '@testing-library/react';
import type { ReactElement } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Renders inside a fresh, retry-free QueryClient so component tests stay
// hermetic: failed network calls surface as errors instead of retrying. Tests
// that render data-driven views mock the http layer and assert on fixtures.
export function renderWithQueryClient(ui: ReactElement, options?: Parameters<typeof render>[1]) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>, options);
}