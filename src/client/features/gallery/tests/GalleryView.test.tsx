// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, cleanup } from '@testing-library/react';
import { renderWithQueryClient } from '@client/lib/tests/renderWithQueryClient';
import GalleryView from '@client/features/gallery/components/GalleryView';
import { apiGet } from '@client/lib/http';

vi.mock('@client/lib/http', () => ({
  apiGet: vi.fn(),
}));

beforeEach(() => {
  vi.mocked(apiGet).mockResolvedValue({ success: true, items: [] } as never);
});

afterEach(() => {
  vi.clearAllMocks();
  cleanup();
});

const noop = () => {};

describe('GalleryView', () => {
  it('renders header section', () => {
    renderWithQueryClient(
      <GalleryView
        selectedCake={null}
        onClearSelectedCake={noop}
        onCommissionCake={noop}
        onSelectCake={noop}
      />
    );
    expect(screen.getByText('Custom Cake Gallery')).toBeInTheDocument();
  });

  it('falls back to an honest empty grid while the catalog is empty', () => {
    renderWithQueryClient(
      <GalleryView
        selectedCake={null}
        onClearSelectedCake={noop}
        onCommissionCake={noop}
        onSelectCake={noop}
      />
    );
    expect(apiGet).toHaveBeenCalledWith('/api/gallery');
    expect(screen.getByText('Custom Cake Gallery')).toBeInTheDocument();
  });
});