// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import GalleryView from '@/features/gallery/components/GalleryView';

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn(() => Promise.resolve(new Response('{"success":true,"items":[]}'))));
});

afterEach(() => {
  vi.unstubAllGlobals();
  cleanup();
});

const noop = () => {};

describe('GalleryView', () => {
  it('renders header section', () => {
    render(<GalleryView selectedCake={null} onClearSelectedCake={noop} onCommissionCake={noop} onSelectCake={noop} />);
    expect(screen.getByText('Custom Cake Gallery')).toBeInTheDocument();
  });
});
