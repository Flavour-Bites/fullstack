import { QueryClient } from '@tanstack/react-query';

// Single app-wide query client: caches server state, dedupes concurrent
// readers of the same resource, and transparently refetches stale data.
// Created once at module scope so every consumer shares one cache.
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});