// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, cleanup } from '@testing-library/react';
import { renderWithQueryClient } from '@test/queryClientWrapper';
import GalleryView from '@client/features/gallery/components/GalleryView';
import { http } from '@client/lib/http';

beforeEach(() => {
  vi.spyOn(http, 'get').mockResolvedValue({
    data: { success: true, items: [] },
  } as any);
});

afterEach(() => {
  vi.restoreAllMocks();
  cleanup();
});

const noop = () => {};

describe('GalleryView', () => {
  it('renders header section', () => {
    renderWithQueryClient(<GalleryView selectedCake={null} onClearSelectedCake={noop} onCommissionCake={noop} onSelectCake={noop} />);
    expect(screen.getByText('Custom Cake Gallery')).toBeInTheDocument();
  });
});