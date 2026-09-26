// @vitest-environment jsdom
import { describe, it, expect, vi, beforeAll, beforeEach, afterEach } from 'vitest';
import { screen, cleanup } from '@testing-library/react';
import { renderWithQueryClient } from '@test/queryClientWrapper';
import TestimonialsView from '@client/features/core/components/TestimonialsView';
import { t } from '@client/i18n/index';
import { http } from '@client/lib/http';

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
});

beforeEach(() => {
  vi.spyOn(http, 'get').mockResolvedValue({
    data: { success: true, reviews: [] },
  } as any);
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
    expect(screen.getByText(t('testimonials.allTributes'))).toBeInTheDocument();
    expect(screen.getByText(t('testimonials.milestoneCelebrations'))).toBeInTheDocument();
    expect(screen.getByText(t('testimonials.birthdaysParties'))).toBeInTheDocument();
  });

  it('renders community feedback section', () => {
    renderWithQueryClient(<TestimonialsView />);
    expect(screen.getByText('Loved by Our Community')).toBeInTheDocument();
    expect(screen.getByText('Milestones')).toBeInTheDocument();
    expect(screen.getByText('Platters')).toBeInTheDocument();
    expect(screen.getByText('Artistry')).toBeInTheDocument();
    expect(screen.getByText('Dietary')).toBeInTheDocument();
  });
});