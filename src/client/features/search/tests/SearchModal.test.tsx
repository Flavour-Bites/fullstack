// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, fireEvent, cleanup } from '@testing-library/react';
import { renderWithQueryClient } from '@client/lib/tests/renderWithQueryClient';
import SearchModal from '@client/features/search/components/SearchModal';
import { apiGet } from '@client/lib/http';

vi.mock('@client/lib/http', () => ({
  apiGet: vi.fn(),
}));

const CAKES = [
  {
    id: 'bc-01',
    name: 'Chocolate and Fig',
    description: 'Rich dark chocolate cake with salted caramel.',
    categoryId: 'cat-birthday',
    category: { id: 'cat-birthday', name: 'Birthday', slug: 'birthday', color: '#d4a373', icon: 'party-popper' },
    flavors: ['Salted Caramel Pecan', 'Double Dark Belgian Chocolate'],
    priceEstimate: '2,400 ETB',
    image: '/gallery_birthday.png',
    servingCount: '15 - 20 guests',
    tags: ['Birthday', 'Chocolate', 'Fruity', 'Gold Leaf'],
  },
  {
    id: 'wc-01',
    name: 'The Victorian Dream',
    description: 'A four-tier celebration cake with fresh roses.',
    categoryId: 'cat-celebration',
    category: { id: 'cat-celebration', name: 'Celebration', slug: 'celebration', color: '#c5a880', icon: 'sparkles' },
    flavors: ['Strawberry & Cream', 'Madagascar Vanilla Bean'],
    priceEstimate: '11,500 ETB',
    image: '/gallery_wedding.png',
    servingCount: '75 - 100 guests',
    tags: ['Celebration', 'Floral', 'Gold Leaf', 'Classic'],
  },
];

beforeEach(() => {
  vi.mocked(apiGet).mockResolvedValue({ success: true, items: CAKES } as never);
});

afterEach(() => {
  vi.clearAllMocks();
  cleanup();
});

const noop = () => {};

describe('SearchModal', () => {
  it('searches the real catalog served by /api/gallery', async () => {
    renderWithQueryClient(<SearchModal isOpen onClose={noop} />);
    const input = screen.getByPlaceholderText(/Search cakes/i);
    fireEvent.change(input, { target: { value: 'vanilla' } });
    expect(apiGet).toHaveBeenCalledWith('/api/gallery');
    expect(await screen.findByText('The Victorian Dream')).toBeInTheDocument();
    expect(screen.queryByText('Chocolate and Fig')).not.toBeInTheDocument();
  });

  it('keeps FAQs searchable alongside cakes', async () => {
    renderWithQueryClient(<SearchModal isOpen onClose={noop} />);
    const input = screen.getByPlaceholderText(/Search cakes/i);
    fireEvent.change(input, { target: { value: 'store' } });
    expect(await screen.findByText(/How do I store my cake/i)).toBeInTheDocument();
  });
});