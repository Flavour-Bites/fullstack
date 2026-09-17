// @vitest-environment jsdom
import { describe, it, expect, vi, beforeAll } from 'vitest';
import { render, screen } from '@testing-library/react';
import TestimonialsView from '@/features/core/components/TestimonialsView';
import { t } from '@/i18n/index';

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

describe('TestimonialsView', () => {
  it('renders header section', () => {
    render(<TestimonialsView />);
    expect(screen.getByText('Customer Stories')).toBeInTheDocument();
  });

  it('renders filter buttons', () => {
    render(<TestimonialsView />);
    expect(screen.getByText(t('testimonials.allTributes'))).toBeInTheDocument();
    expect(screen.getByText(t('testimonials.milestoneCelebrations'))).toBeInTheDocument();
    expect(screen.getByText(t('testimonials.birthdaysParties'))).toBeInTheDocument();
  });

  it('renders community feedback section', () => {
    render(<TestimonialsView />);
    expect(screen.getByText('Loved by Our Community')).toBeInTheDocument();
    expect(screen.getByText('Milestones')).toBeInTheDocument();
    expect(screen.getByText('Platters')).toBeInTheDocument();
    expect(screen.getByText('Artistry')).toBeInTheDocument();
    expect(screen.getByText('Dietary')).toBeInTheDocument();
  });
});
