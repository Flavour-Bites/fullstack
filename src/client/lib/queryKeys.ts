export const queryKeys = {
  gallery: {
    all: ['gallery'] as const,
    detail: (id: string) => ['gallery', id] as const,
  },
  reviews: {
    all: ['reviews'] as const,
    detail: (id: string) => ['reviews', id] as const,
  },
  orders: {
    all: ['orders'] as const,
    detail: (id: string) => ['orders', id] as const,
  },
  categories: {
    all: ['categories'] as const,
  },
  admin: {
    stats: ['admin', 'stats'] as const,
    users: ['admin', 'users'] as const,
    recovery: ['admin', 'recovery'] as const,
  },
  users: {
    all: ['users'] as const,
    detail: (id: string) => ['users', id] as const,
  },
} as const;