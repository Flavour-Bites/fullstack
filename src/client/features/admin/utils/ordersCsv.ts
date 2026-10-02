import type { CakeRequest } from '../types';
import { orderPrice } from '../types';

export function exportOrdersCSV(requests: CakeRequest[]) {
  const headers = ['ID', 'Customer', 'Phone', 'Event', 'Guests', 'Event Date', 'Flavor', 'Tiers', 'Status', 'Price (ETB)', 'Submitted'];
  const rows = requests.map(r => [
    r.id, r.contactName, r.contactPhone, r.eventType,
    r.guestCount, r.eventDate, r.flavor, r.tierCount, r.status,
    orderPrice(r), r.requestDate
  ]);
  const csv = [headers, ...rows].map(row => row.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `flavour-bites-orders-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}