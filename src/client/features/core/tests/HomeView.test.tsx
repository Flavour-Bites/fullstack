// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, cleanup } from '@testing-library/react';
import { renderWithQueryClient } from '@client/lib/tests/renderWithQueryClient';
import HomeView from '@client/features/core/components/HomeView';
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

describe('HomeView', () => {
  it('renders hero section', () => {
    renderWithQueryClient(<HomeView onSelectCake={noop} />);
    expect(screen.getByText('Order a Custom Cake')).toBeInTheDocument();
  });
});