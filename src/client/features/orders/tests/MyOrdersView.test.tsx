// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, cleanup, waitFor, fireEvent } from '@testing-library/react';
import { renderWithQueryClient } from '@client/lib/tests/renderWithQueryClient';
import MyOrdersView from '@client/features/orders/components/MyOrdersView';
import { ToastProvider } from '@client/components/Toast';
import { http, apiGet } from '@client/lib/http';

vi.mock('@client/lib/http', () => ({
  http: { get: vi.fn() },
  apiGet: vi.fn(),
}));

const REQUEST = {
  id: 'FB-9812A',
  contactName: 'Saba Tekle',
  contactPhone: '+251 911 123 456',
  eventType: 'Anniversary',
  guestCount: 85,
  deliveryOption: 'pickup',
  deliveryAddress: '',
  deliveryDate: '2026-08-01',
  designStyle: 'Three-tier custom cream cake decorated with fresh golden-trimmed roses.',
  flavor: 'Madagascar Vanilla Bean',
  tierCount: 3,
  specialInstructions: 'Safe wrapping for travel.',
  requestDate: 'June 18, 2026',
  status: 'Designing',
  referenceImage: null,
  quotedPrice: 11500,
  depositAmount: 0,
  remainingBalance: 0,
  paymentStatus: 'unpaid',
  createdAt: '2026-06-18T10:00:00.000Z',
};

const EVENT = {
  id: 'ev-1',
  orderId: 'FB-9812A',
  fromStatus: 'Received',
  toStatus: 'Quoted',
  source: 'staff_api',
  note: 'Cake price was set.',
  createdAt: '2026-06-19T08:00:00.000Z',
};

beforeEach(() => {
  vi.mocked(http.get).mockResolvedValue({ data: { success: true, requests: [REQUEST] } });
  vi.mocked(apiGet).mockResolvedValue({ success: true, events: [EVENT] } as never);
});

afterEach(() => {
  vi.clearAllMocks();
  cleanup();
});

function renderOrders() {
  return renderWithQueryClient(
    <ToastProvider>
      <MyOrdersView currentUser={{ id: 'u-1', email: 'a@b.com', name: 'Saba', role: 'customer' }} />
    </ToastProvider>
  );
}

describe('MyOrdersView', () => {
  it('renders page title', async () => {
    renderOrders();
    await waitFor(() => {
      expect(screen.getByText('Order Updates')).toBeInTheDocument();
    });
  });

  it('shows only real order fields, not fabricated data', async () => {
    renderOrders();
    const row = await screen.findByText('FB-9812A');
    expect(screen.getByText('Saba Tekle')).toBeInTheDocument();
    expect(screen.getByText(/Designing/)).toBeInTheDocument();
    expect(screen.queryByText(/sandbox/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Pending/i)).not.toBeInTheDocument();

    fireEvent.click(row);
    expect(await screen.findByText(/\+251 911 123 456/)).toBeInTheDocument();
  });

  it('loads the real status timeline for the selected order', async () => {
    renderOrders();
    const row = await screen.findByText('Saba Tekle');
    fireEvent.click(row);

    await waitFor(() => {
      expect(apiGet).toHaveBeenCalledWith('/api/requests/FB-9812A/timeline');
    });
    expect(await screen.findByText(/Cake price was set\./)).toBeInTheDocument();
    expect(screen.getByText('Quoted')).toBeInTheDocument();
  });
});