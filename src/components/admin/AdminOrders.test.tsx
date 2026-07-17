// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AdminOrders from './AdminOrders';
import { ToastProvider } from '../Toast';

const noop = () => Promise.resolve(true);

const sampleRequests = [
  {
    id: 'req1',
    contactName: 'Alice',
    contactPhone: '0911',
    eventType: 'Birthday',
    guestCount: 20,
    deliveryOption: 'pickup',
    deliveryAddress: 'Addis',
    deliveryDate: '2025-01-15',
    designStyle: 'Modern',
    flavor: 'Chocolate',
    tierCount: 2,
    specialInstructions: null,
    requestDate: '2024-12-01',
    status: 'Received',
    referenceImage: null,
    quotedPrice: 4500,
    finalPrice: 4500,
    depositAmount: 1000,
    remainingBalance: 3500,
    paymentStatus: 'partial',
    createdAt: '2024-12-01',
  },
  {
    id: 'req2',
    contactName: 'Bob',
    contactPhone: '0922',
    eventType: 'Wedding',
    guestCount: 50,
    deliveryOption: 'delivery',
    deliveryAddress: 'Bole',
    deliveryDate: '2025-02-01',
    designStyle: 'Classic',
    flavor: 'Vanilla',
    tierCount: 3,
    specialInstructions: null,
    requestDate: '2024-11-15',
    status: 'Completed',
    referenceImage: null,
    quotedPrice: 8000,
    finalPrice: 8000,
    depositAmount: 3000,
    remainingBalance: 5000,
    paymentStatus: 'partial',
    createdAt: '2024-11-15',
  },
];

const defaultProps = {
  requests: sampleRequests,
  loading: false,
  refreshing: false,
  handleDeleteRequest: noop,
  saveRequestUpdates: noop,
  advanceStatus: noop,
};

describe('AdminOrders', () => {
  it('shows loading with skeleton', () => {
    render(
      <ToastProvider>
        <AdminOrders {...defaultProps} loading={true} requests={[]} />
      </ToastProvider>
    );
    expect(screen.getByPlaceholderText('Search orders...')).toBeInTheDocument();
  });

  it('shows empty state when no requests', () => {
    render(
      <ToastProvider>
        <AdminOrders {...defaultProps} requests={[]} />
      </ToastProvider>
    );
    expect(screen.getByText(/No orders/i)).toBeInTheDocument();
  });

  it('renders order list', () => {
    render(
      <ToastProvider>
        <AdminOrders {...defaultProps} />
      </ToastProvider>
    );
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
    expect(screen.getByText('Birthday')).toBeInTheDocument();
    expect(screen.getByText('Wedding')).toBeInTheDocument();
  });

  it('filters orders by search term', async () => {
    const user = userEvent.setup();
    render(
      <ToastProvider>
        <AdminOrders {...defaultProps} />
      </ToastProvider>
    );
    const searchInput = screen.getByPlaceholderText('Search orders...');
    await user.type(searchInput, 'Alice');
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.queryByText('Bob')).not.toBeInTheDocument();
  });
});
