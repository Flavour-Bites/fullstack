// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SkeletonLine, SkeletonBlock, SkeletonCard, SkeletonGrid, SkeletonTable } from '../Skeleton';

describe('Skeleton', () => {
  it('renders SkeletonLine', () => {
    const { container } = render(<SkeletonLine />);
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('renders SkeletonBlock', () => {
    const { container } = render(<SkeletonBlock />);
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('renders SkeletonCard', () => {
    const { container } = render(<SkeletonCard />);
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('renders SkeletonGrid with specified item count', () => {
    const { container } = render(<SkeletonGrid items={4} />);
    const pulses = container.querySelectorAll('.animate-pulse');
    expect(pulses.length).toBeGreaterThanOrEqual(4);
  });

  it('renders SkeletonTable with specified rows', () => {
    const { container } = render(<SkeletonTable rows={3} cols={2} />);
    const pulses = container.querySelectorAll('.animate-pulse');
    expect(pulses.length).toBeGreaterThanOrEqual(3);
  });
});
