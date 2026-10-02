// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, cleanup } from '@testing-library/react';
import { renderWithQueryClient } from '@test/queryClientWrapper';
import HomeView from '@client/features/core/components/HomeView';
import { http } from '@client/lib/http';

beforeEach(() => {
  vi.spyOn(http, 'get').mockImplementation((url: string) => {
    if (url.includes('/api/products')) {
      return Promise.resolve({ data: { success: true, items: [] } } as any);
    }
    if (url.includes('/api/reviews')) {
      return Promise.resolve({ data: { success: true, reviews: [] } } as any);
    }
    return Promise.resolve({ data: { success: true } } as any);
  });
});

afterEach(() => {
  vi.restoreAllMocks();
  cleanup();
});

const noop = () => {};

describe('HomeView', () => {
  it('renders hero section', () => {
    renderWithQueryClient(<HomeView onSelectCake={noop} />);
    expect(screen.getByText('Order a Custom Cake')).toBeInTheDocument();
  });

});