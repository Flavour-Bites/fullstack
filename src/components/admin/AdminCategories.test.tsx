// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AdminCategories from './AdminCategories';

const noop = () => Promise.resolve(true);

const sampleCategories = [
  { id: 'c1', name: 'Cakes', slug: 'cakes', description: 'All cakes', color: '#000', icon: 'cake', sortOrder: 1, isActive: true },
  { id: 'c2', name: 'Cupcakes', slug: 'cupcakes', description: 'Mini cakes', color: '#111', icon: 'cupcake', sortOrder: 2, isActive: false },
];

describe('AdminCategories', () => {
  it('shows loading state', () => {
    render(
      <AdminCategories
        categories={[]}
        categoriesLoading={true}
        handleSaveCategory={noop}
        handleDeleteCategory={noop}
        handleToggleCategoryActive={noop as any}
        fetchCategories={noop}
      />
    );
    expect(screen.getByText('Categories (0)')).toBeInTheDocument();
  });

  it('shows empty state', () => {
    render(
      <AdminCategories
        categories={[]}
        categoriesLoading={false}
        handleSaveCategory={noop}
        handleDeleteCategory={noop}
        handleToggleCategoryActive={noop as any}
        fetchCategories={noop}
      />
    );
    expect(screen.getByText('Categories (0)')).toBeInTheDocument();
  });

  it('renders categories when provided', () => {
    render(
      <AdminCategories
        categories={sampleCategories}
        categoriesLoading={false}
        handleSaveCategory={noop}
        handleDeleteCategory={noop}
        handleToggleCategoryActive={noop as any}
        fetchCategories={noop}
      />
    );
    expect(screen.getByText('Categories (2)')).toBeInTheDocument();
    expect(screen.getByText('Cakes')).toBeInTheDocument();
    expect(screen.getByText('Cupcakes')).toBeInTheDocument();
  });
});
