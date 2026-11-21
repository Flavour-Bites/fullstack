// @vitest-environment jsdom
import { describe, it, expect, vi, beforeAll, beforeEach, afterEach } from 'vitest';
import { screen, cleanup } from '@testing-library/react';
import { renderWithQueryClient } from '@test/queryClientWrapper';
import TestimonialsView from '@client/features/core/components/TestimonialsView';
import { http } from '@client/lib/http';

vi.mock('@client/lib/http', () => ({
  http: {
    get: vi.fn(),
  },
}));

const REVIEW = {
  id: 'rev-1',
  rating: 5,
  content: 'A breathtaking three-tier cake for our anniversary.',
  author: 'Saba Tekle',
  eventType: 'Anniversary',
  role: 'Host',
  date: 'March 15, 2026',
  createdAt: '2026-03-15T00:00:00.000Z',
};

beforeAll(() => {
  // Mock IntersectionObserver for framer-motion whileInView
  class IntersectionObserverMock {
    constructor() {}
    disconnect() {}
    observe() {}
    takeRecords() { return []; }
    unobserve() {}
  }
  vi.stubGlobal('IntersectionObserver', IntersectionObserverMock);
  vi.mocked(http.get).mockResolvedValue({
    data: { success: true, reviews: [REVIEW] },
  } as never);
});

afterEach(() => {
  vi.clearAllMocks();
  cleanup();
});

beforeEach(() => {
  vi.mocked(http.get).mockResolvedValue({
    data: { success: true, reviews: [REVIEW] },
  } as never);
});

afterEach(() => {
  vi.restoreAllMocks();
  cleanup();
});

describe('TestimonialsView', () => {
  it('renders header section', () => {
    renderWithQueryClient(<TestimonialsView />);
    expect(screen.getByText('Customer Stories')).toBeInTheDocument();
  });

  it('renders filter buttons', () => {
    renderWithQueryClient(<TestimonialsView />);
    expect(screen.getByText('All Reviews')).toBeInTheDocument();
    expect(screen.getByText('Milestone Celebrations')).toBeInTheDocument();
    expect(screen.getByText('Birthdays & Parties')).toBeInTheDocument();
  });

  it('renders community feedback section', () => {
    renderWithQueryClient(<TestimonialsView />);
    expect(screen.getByText('Loved by Our Community')).toBeInTheDocument();
    expect(screen.getByText('Milestones')).toBeInTheDocument();
    expect(screen.getByText('Platters')).toBeInTheDocument();
    expect(screen.getByText('Artistry')).toBeInTheDocument();
    expect(screen.getByText('Dietary')).toBeInTheDocument();
  });

  it('renders real reviews from the API', async () => {
    renderWithQueryClient(<TestimonialsView />);
    expect(vi.mocked(http.get)).toHaveBeenCalledWith('/api/reviews');
    const review = await screen.findByText(/breathtaking three-tier cake/);
    expect(review).toBeInTheDocument();
    expect(screen.getByText('Saba Tekle')).toBeInTheDocument();
  });
});
