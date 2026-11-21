import React from 'react';
import {
  Coins, Check, Edit3, CheckCircle2, Inbox, Package, Truck, XCircle
} from 'lucide-react';
import { STATUS_COLORS, getStatusStyles } from '@shared/constants/orderStatus';

export { STATUS_COLORS, getStatusStyles };

export const STATUS_ICONS: Record<string, React.ReactNode> = {
  Received: React.createElement(Inbox, { className: 'w-3 h-3' }),
  Designing: React.createElement(Edit3, { className: 'w-3 h-3' }),
  Priced: React.createElement(Coins, { className: 'w-3 h-3' }),
  Confirmed: React.createElement(CheckCircle2, { className: 'w-3 h-3' }),
  InProgress: React.createElement(Package, { className: 'w-3 h-3' }),
  Ready: React.createElement(Truck, { className: 'w-3 h-3' }),
  Completed: React.createElement(Check, { className: 'w-3 h-3' }),
  Cancelled: React.createElement(XCircle, { className: 'w-3 h-3' }),
};