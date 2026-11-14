import test from 'node:test';
import assert from 'node:assert/strict';
import { AppUser, Order } from '../types';
import {
  formatWhatsAppDigits,
  getUserOrdersAndStats,
  normalizePhoneKey,
} from './userDetails';

const baseUser: AppUser = {
  id: 'uid-123',
  email: 'Fatou.Diop@Example.com',
  displayName: 'Fatou Diop',
  phone: '+221 77 123 45 67',
  role: 'user',
  status: 'active',
  address: 'Almadies Zone 12',
  city: 'Dakar',
  createdAt: '2026-01-10T10:00:00.000Z',
};

const makeOrder = (overrides: Partial<Order>): Order => ({
  id: overrides.id || 'ord-1',
  orderNumber: overrides.orderNumber || 'FS-1001',
  items: [],
  customer: {
    fullName: 'Fatou Diop',
    phone: '77 000 00 00',
    email: 'other@example.com',
    address: 'Dakar',
    zoneId: 'dakar-plateau',
    paymentMethod: 'cod',
    ...overrides.customer,
  },
  subtotal: overrides.total ?? 10000,
  deliveryFee: 0,
  discount: 0,
  total: overrides.total ?? 10000,
  status: overrides.status || 'confirmed',
  createdAt: '2026-02-01T12:00:00.000Z',
  ...overrides,
});

test('normalizePhoneKey unifies local 9-digit and +221 Senegalese phone numbers', () => {
  assert.equal(normalizePhoneKey('+221 77 123 45 67'), '771234567');
  assert.equal(normalizePhoneKey('77 123 45 67'), '771234567');
  assert.equal(normalizePhoneKey('00221771234567'), '771234567');
});

test('formatWhatsAppDigits outputs international 221 format', () => {
  assert.equal(formatWhatsAppDigits('77 123 45 67'), '221771234567');
  assert.equal(formatWhatsAppDigits('+221 77 123 45 67'), '221771234567');
  assert.equal(formatWhatsAppDigits(''), '');
});

test('getUserOrdersAndStats correlates by userId, email, and normalized phone and excludes cancelled from spend', () => {
  const orders: Order[] = [
    makeOrder({ id: 'o1', userId: 'uid-123', total: 25000, status: 'delivered' }),
    makeOrder({
      id: 'o2',
      customer: {
        fullName: 'Fatou',
        phone: '78 999 88 77',
        email: 'fatou.diop@example.com',
        address: 'Dakar',
        zoneId: 'dakar',
        paymentMethod: 'wave',
      },
      total: 15000,
      status: 'confirmed',
    }),
    makeOrder({
      id: 'o3',
      customer: {
        fullName: 'Fatou',
        phone: '77 123 45 67',
        email: '',
        address: 'Dakar',
        zoneId: 'dakar',
        paymentMethod: 'cod',
      },
      total: 50000,
      status: 'cancelled',
    }),
    makeOrder({
      id: 'o4',
      userId: 'other-uid',
      customer: {
        fullName: 'Moussa',
        phone: '76 555 44 33',
        email: 'moussa@example.com',
        address: 'Thies',
        zoneId: 'thies',
        paymentMethod: 'cod',
      },
      total: 90000,
      status: 'delivered',
    }),
  ];

  const stats = getUserOrdersAndStats(baseUser, orders);
  assert.equal(stats.orders.length, 3);
  assert.equal(stats.validOrdersCount, 2);
  assert.equal(stats.totalSpent, 40000);
  assert.equal(stats.averageBasket, 20000);
});
