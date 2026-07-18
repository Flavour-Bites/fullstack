// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AdminReviews from '../AdminReviews';

const noopVoid = () => Promise.resolve() as unknown as Promise<void>;
const noopBool = () => Promise.resolve(true);

const sampleReviews = [
  {
    id: 'r1',
    author: 'Alice',
    rating: 5,
    content: 'Absolutely delicious!',
    eventType: 'Birthday',
    role: 'customer',
    userId: null,
    productId: null,
    date: '2024-12-01',
    createdAt: '2024-12-01',
  },
  {
    id: 'r2',
    author: 'Bob',
    rating: 3,
    content: 'It was okay.',
    eventType: 'Wedding',
    role: 'customer',
    userId: null,
    productId: null,
    date: '2024-11-15',
    createdAt: '2024-11-15',
  },
];

describe('AdminReviews', () => {
  it('shows loading state', () => {
    render(
      <AdminReviews
        reviewItems={[]}
        reviewsLoading={true}
        handleDeleteReview={noopBool}
        handleSaveReview={noopBool as any}
        fetchReviews={noopVoid}
      />
    );
    expect(screen.getByText('Reviews (0)')).toBeInTheDocument();
  });

  it('shows empty state', () => {
    render(
      <AdminReviews
        reviewItems={[]}
        reviewsLoading={false}
        handleDeleteReview={noopBool}
        handleSaveReview={noopBool as any}
        fetchReviews={noopVoid}
      />
    );
    expect(screen.getByText(/No reviews/i)).toBeInTheDocument();
  });

  it('renders review items', () => {
    render(
      <AdminReviews
        reviewItems={sampleReviews}
        reviewsLoading={false}
        handleDeleteReview={noopBool}
        handleSaveReview={noopBool as any}
        fetchReviews={noopVoid}
      />
    );
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
    expect(screen.getByText(/Absolutely delicious!/)).toBeInTheDocument();
  });
});
