// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import HomeView from '@/components/HomeView';

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
    render(<HomeView onNavigate={noop} onSelectCake={noop} />);
    expect(screen.getByText('Start Your Request Setup')).toBeInTheDocument();
  });

  it('renders features section', () => {
    render(<HomeView onNavigate={noop} onSelectCake={noop} />);
    expect(screen.getByText('Bespoke Custom Cake in 3 Steps')).toBeInTheDocument();
  });
});
