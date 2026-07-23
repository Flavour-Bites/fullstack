// @vitest-environment jsdom
import { describe, it, expect, afterEach, beforeEach, vi } from 'vitest';
import { render, screen, cleanup, waitFor } from '@testing-library/react';
import GalleryView from '@/components/GalleryView';

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn(() =>
    Promise.resolve(new Response(JSON.stringify({ success: true, items: [] }), { headers: { 'Content-Type': 'application/json' } }))
  ));
});

afterEach(() => {
  vi.unstubAllGlobals();
  cleanup();
});

const noop = () => {};

describe('GalleryView', () => {
  it('renders filter category buttons', async () => {
    render(
      <GalleryView
        selectedCake={null}
        onClearSelectedCake={noop}
        onSelectCake={noop}
        onCommissionCake={noop}
      />
    );
    await waitFor(() => {
      expect(screen.getByText('All Collections')).toBeInTheDocument();
    });
    expect(screen.getByText('Bespoke Celebrations')).toBeInTheDocument();
    expect(screen.getByText('Elite Birthdays')).toBeInTheDocument();
  });
});
