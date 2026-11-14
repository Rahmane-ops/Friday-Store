import test from 'node:test';
import assert from 'node:assert/strict';
import { buildValidatedOrderPayloads, sanitizeProductForFirestore, BLUEPRINT_LIMITS } from './orderValidation';
import { INITIAL_PRODUCTS, DELIVERY_ZONES, PROMO_CODES } from '../data/mockData';

test('buildValidatedOrderPayloads rejects empty cart', () => {
  const res = buildValidatedOrderPayloads({
    customerData: {
      fullName: 'Awa Ndiaye',
      phone: '77 094 89 94',
      email: 'awa@test.sn',
      address: 'Mermoz Dakar',
      zoneId: DELIVERY_ZONES[0].id,
      paymentMethod: 'wave',
    },
    cart: [],
    zone: DELIVERY_ZONES[0],
    promoCode: null,
  });
  assert.equal(res.ok, false);
});

test('buildValidatedOrderPayloads rejects invalid Senegalese phone', () => {
  const prod = INITIAL_PRODUCTS[0];
  const res = buildValidatedOrderPayloads({
    customerData: {
      fullName: 'Awa Ndiaye',
      phone: '12345',
      email: '',
      address: 'Mermoz Dakar',
      zoneId: DELIVERY_ZONES[0].id,
      paymentMethod: 'cod',
    },
    cart: [{ id: 'i1', product: prod, selectedSize: '6L', selectedColor: prod.colors[0], quantity: 1 }],
    zone: DELIVERY_ZONES[0],
    promoCode: null,
  });
  assert.equal(res.ok, false);
});

test('buildValidatedOrderPayloads creates atomic Order + PII-free OrderTrackingRecord', () => {
  const prod = INITIAL_PRODUCTS[0];
  const res = buildValidatedOrderPayloads({
    customerData: {
      fullName: 'Awa Ndiaye',
      phone: '+221 77 094 89 94',
      email: 'awa@test.sn',
      address: 'Rue 10, Point E, Dakar',
      zoneId: DELIVERY_ZONES[0].id,
      paymentMethod: 'wave',
    },
    cart: [{ id: 'i1', product: prod, selectedSize: '6L', selectedColor: prod.colors[0], quantity: 2 }],
    zone: DELIVERY_ZONES[0],
    promoCode: PROMO_CODES[0], // FRIDAY10 (10%)
    userId: null,
    orderNumberOverride: 'FS-26-9001',
    orderIdOverride: 'ord-test-1',
  });

  assert.equal(res.ok, true);
  if (res.ok) {
    assert.equal(res.order.orderNumber, 'FS-26-9001');
    assert.equal(res.order.userId, null);
    assert.equal(res.order.subtotal, 84000);
    assert.equal(res.order.discount, 8400);
    assert.equal(res.order.deliveryFee, 1500);
    assert.equal(res.order.total, 77100);
    assert.equal(res.order.status, 'pending');

    // Tracking doc must have ZERO PII (no fullName, phone, email, address)
    assert.equal(res.tracking.orderNumber, 'FS-26-9001');
    assert.equal(res.tracking.itemCount, 2);
    assert.equal(res.tracking.total, 77100);
    assert.equal('phone' in res.tracking, false);
    assert.equal('address' in res.tracking, false);
    assert.equal('fullName' in res.tracking, false);
  }
});

test('sanitizeProductForFirestore truncates oversized text and enforces positive stock/inStock sync', () => {
  const base = INITIAL_PRODUCTS[0];
  const sanitized = sanitizeProductForFirestore({
    ...base,
    name: 'A'.repeat(500),
    stockCount: 0,
    inStock: true,
    price: 15000.6,
  });

  assert.equal(sanitized.name.length, BLUEPRINT_LIMITS.NAME_MAX);
  assert.equal(sanitized.inStock, false);
  assert.equal(sanitized.price, 15001);
});
