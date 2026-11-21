import { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, RenderOptions } from '@testing-library/react';

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

interface WrapperOptions {
  queryClient?: QueryClient;
}

export function renderWithQueryClient(
  ui: ReactNode,
  { queryClient = createTestQueryClient(), ...renderOptions }: WrapperOptions & Omit<RenderOptions, 'wrapper'> = {}
) {
  return render(ui, {
    wrapper: ({ children }) => (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    ),
    ...renderOptions,
  });
}

export { createTestQueryClient };