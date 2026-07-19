// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import TestimonialsView from '../TestimonialsView';

describe('TestimonialsView', () => {
  it('renders header section', () => {
    render(<TestimonialsView />);
    expect(screen.getByText('Our Celebration Tributes')).toBeInTheDocument();
  });

  it('renders filter buttons', () => {
    render(<TestimonialsView />);
    expect(screen.getByText('All Tributes')).toBeInTheDocument();
    expect(screen.getByText('Milestone Celebrations')).toBeInTheDocument();
    expect(screen.getByText('Birthdays & Parties')).toBeInTheDocument();
  });

  it('renders community feedback section', () => {
    render(<TestimonialsView />);
    expect(screen.getByText('Loved by Our Commited Hosts')).toBeInTheDocument();
  });
});
