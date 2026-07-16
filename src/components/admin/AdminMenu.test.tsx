// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AdminMenu from './AdminMenu';
import { ToastProvider } from '../Toast';

const noop = () => Promise.resolve(true);

const sampleItem = {
  id: 'g1',
  name: 'Chocolate Cake',
  description: 'Rich dark chocolate',
  categoryId: 'cat1',
  category: { name: 'Cakes', id: 'cat1' },
  flavors: ['Chocolate'],
  priceEstimate: '4,500 ETB',
  image: 'https://example.com/cake.jpg',
  servingCount: '10-15',
  tags: ['birthday'],
};

const sampleCategories = [
  { id: 'cat1', name: 'Cakes', isActive: true },
  { id: 'cat2', name: 'Cupcakes', isActive: true },
  { id: 'cat3', name: 'Pastries', isActive: false },
];

describe('AdminMenu', () => {
  it('shows loading state', () => {
    render(
      <ToastProvider>
        <AdminMenu
          galleryItems={[]}
          galleryLoading={true}
          categories={[]}
          handleSaveGalleryItem={noop}
          handleDeleteGalleryItem={noop}
        />
      </ToastProvider>
    );
    expect(screen.getByText('Cake Menu (0 items)')).toBeInTheDocument();
  });

  it('shows empty state', () => {
    render(
      <ToastProvider>
        <AdminMenu
          galleryItems={[]}
          galleryLoading={false}
          categories={[]}
          handleSaveGalleryItem={noop}
          handleDeleteGalleryItem={noop}
        />
      </ToastProvider>
    );
    expect(screen.getByText('No gallery items yet.')).toBeInTheDocument();
  });

  it('renders gallery items when provided', () => {
    render(
      <ToastProvider>
        <AdminMenu
          galleryItems={[sampleItem]}
          galleryLoading={false}
          categories={sampleCategories}
          handleSaveGalleryItem={noop}
          handleDeleteGalleryItem={noop}
        />
      </ToastProvider>
    );
    expect(screen.getByText('Chocolate Cake')).toBeInTheDocument();
    expect(screen.getByText('4,500 ETB')).toBeInTheDocument();
  });

  it('shows form on add button click', async () => {
    const user = userEvent.setup();
    render(
      <ToastProvider>
        <AdminMenu
          galleryItems={[]}
          galleryLoading={false}
          categories={sampleCategories}
          handleSaveGalleryItem={noop}
          handleDeleteGalleryItem={noop}
        />
      </ToastProvider>
    );
    await user.click(screen.getByText('Add Gallery Item'));
    expect(screen.getByText('Save Changes')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });
});
