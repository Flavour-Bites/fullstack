// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import HomeView from '@/features/core/components/HomeView';

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn(() => Promise.resolve(new Response('{"success":true,"items":[]}'))));
});

afterEach(() => {
  vi.unstubAllGlobals();
  cleanup();
});

const noop = () => {};

describe('HomeView', () => {
  it('renders hero section', () => {
    render(<HomeView onSelectCake={noop} />);
    expect(screen.getByText('Order a Custom Cake')).toBeInTheDocument();
  });

  
});
