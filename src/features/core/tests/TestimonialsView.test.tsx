// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import TestimonialsView from '@/features/core/components/TestimonialsView';

describe('TestimonialsView', () => {
  it('renders header section', () => {
    render(<TestimonialsView />);
    expect(screen.getByText('What Our Customers Say')).toBeInTheDocument();
  });

  it('renders filter buttons', () => {
    render(<TestimonialsView />);
    expect(screen.getByText('All Reviews')).toBeInTheDocument();
    expect(screen.getByText('Milestone Celebrations')).toBeInTheDocument();
    expect(screen.getByText('Birthdays & Parties')).toBeInTheDocument();
  });

  it('renders community feedback section', () => {
    render(<TestimonialsView />);
    expect(screen.getByText('Loved by Our Customers')).toBeInTheDocument();
  });
});
