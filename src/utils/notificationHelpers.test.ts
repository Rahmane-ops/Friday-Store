import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildLowStockNotification,
  buildOrderCreatedNotifications,
  buildOrderStatusNotification,
  generateStatusWhatsAppLink,
  isValidWebhookUrl,
} from './notificationHelpers';
import { Order, Product } from '../types';

const sampleOrder: Order = {
  id: 'ord-100',
  orderNumber: 'FS-26-9012',
  userId: 'uid-client-1',
  createdAt: '2026-11-13T12:00:00.000Z',
  customer: {
    fullName: 'Mariama Ndiaye',
    phone: '77 094 89 94',
    email: 'mariama@example.sn',
    address: 'Mermoz Pyrotechnie, Dakar',
    zoneId: 'dakar-centre',
    paymentMethod: 'wave',
  },
  items: [
    {
      id: 'item-1',
      selectedSize: '6L',
      selectedColor: { name: 'Noir', hex: '#000' },
      quantity: 2,
      product: {
        id: 'p1',
        name: 'AirFry Pro',
        slug: 'airfry-pro',
        category: 'electromenager',
        price: 40000,
        description: 'Desc',
        shortDescription: 'Short',
        features: [],
        images: ['/assets/images/product_airfryer_digital_1793989489237.jpg'],
        sizes: ['6L'],
        colors: [{ name: 'Noir', hex: '#000' }],
        inStock: true,
        stockCount: 10,
        isFeatured: true,
        isNew: false,
        rating: 4.9,
        reviewCount: 20,
        sku: 'FS-101',
      },
    },
  ],
  subtotal: 80000,
  discount: 0,
  deliveryFee: 2000,
  total: 82000,
  status: 'pending',
};

test('buildOrderCreatedNotifications emits admin and user notifications when signed in', () => {
  const list = buildOrderCreatedNotifications({ order: sampleOrder, zoneName: 'Dakar Centre' });
  assert.equal(list.length, 2);
  assert.equal(list[0].recipientScope, 'admin');
  assert.equal(list[0].userId, null);
  assert.equal(list[1].recipientScope, 'user');
  assert.equal(list[1].userId, 'uid-client-1');
  assert.equal(list[0].orderNumber, 'FS-26-9012');
});

test('buildOrderCreatedNotifications emits only admin notification for guest orders', () => {
  const guestOrder: Order = { ...sampleOrder, userId: null };
  const list = buildOrderCreatedNotifications({ order: guestOrder, zoneName: 'Dakar Centre' });
  assert.equal(list.length, 1);
  assert.equal(list[0].recipientScope, 'admin');
});

test('buildOrderStatusNotification formats status update notification for signed-in buyer', () => {
  const notif = buildOrderStatusNotification({ order: sampleOrder, newStatus: 'shipping' });
  assert.ok(notif);
  assert.equal(notif.recipientScope, 'user');
  assert.equal(notif.type, 'order_status');
  assert.match(notif.title, /FS-26-9012/);
  assert.match(notif.message, /coursier est en route/i);
});

test('buildLowStockNotification triggers only when stockCount <= 5', () => {
  const baseProd = sampleOrder.items[0].product as Product;
  assert.equal(buildLowStockNotification({ ...baseProd, stockCount: 12 }), null);
  const alert = buildLowStockNotification({ ...baseProd, stockCount: 3 });
  assert.ok(alert);
  assert.equal(alert.type, 'low_stock');
  assert.match(alert.title, /Stock critique \(3\)/);
});

test('generateStatusWhatsAppLink targets customer Senegalese 221 number', () => {
  const url = generateStatusWhatsAppLink(sampleOrder, 'shipping');
  assert.ok(url.startsWith('https://wa.me/221770948994?text='));
});

test('isValidWebhookUrl allows http/https and rejects javascript/empty URLs', () => {
  assert.equal(isValidWebhookUrl('https://hook.eu1.make.com/abc123'), true);
  assert.equal(isValidWebhookUrl('javascript:alert(1)'), false);
  assert.equal(isValidWebhookUrl(''), false);
});
