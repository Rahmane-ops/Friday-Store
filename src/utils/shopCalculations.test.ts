import test from 'node:test';
import assert from 'node:assert/strict';
import {
  formatFCFA,
  validateSenegalesePhone,
  calculateCartTotals,
  generateWhatsAppOrderLink,
} from './shopCalculations';
import { CartItem, Product, PromoCode } from '../types';

const mockProduct: Product = {
  id: 'prod-1',
  name: 'AuraBuds Pro TWS ANC',
  slug: 'aurabuds-pro-tws-anc',
  category: 'electronique',
  price: 35000,
  description: 'Écouteurs sans fil avec réduction active de bruit hybride.',
  shortDescription: 'Audio spatial & Réduction de Bruit Active.',
  features: ['Réduction Active de Bruit (ANC)', 'Autonomie 32h avec boîtier'],
  images: ['/test.jpg'],
  sizes: ['Standard'],
  colors: [{ name: 'Noir Sidéral', hex: '#1C1917' }],
  inStock: true,
  stockCount: 15,
  isFeatured: true,
  isNew: true,
  rating: 4.9,
  reviewCount: 38,
  sku: 'FS-TWS-01',
};

const mockItem: CartItem = {
  id: 'prod-1-standard-noir',
  product: mockProduct,
  selectedSize: 'Standard',
  selectedColor: { name: 'Noir Sidéral', hex: '#1C1917' },
  quantity: 2,
};

test('formatFCFA formats amounts with thousands separator and suffix', () => {
  assert.equal(formatFCFA(25000), '25 000 FCFA');
  assert.equal(formatFCFA(1500), '1 500 FCFA');
  assert.equal(formatFCFA(0), '0 FCFA');
  assert.equal(formatFCFA(1250000), '1 250 000 FCFA');
});

test('validateSenegalesePhone correctly identifies Senegalese mobile numbers', () => {
  // Valid numbers (including store phones)
  assert.equal(validateSenegalesePhone('770948994'), true);
  assert.equal(validateSenegalesePhone('786642644'), true);
  assert.equal(validateSenegalesePhone('+221770948994'), true);
  assert.equal(validateSenegalesePhone('+221 78 664 26 44'), true);
  assert.equal(validateSenegalesePhone('76 543 21 00'), true);
  assert.equal(validateSenegalesePhone('70 999 88 77'), true);
  assert.equal(validateSenegalesePhone('00221751112233'), true);

  // Invalid numbers
  assert.equal(validateSenegalesePhone(''), false);
  assert.equal(validateSenegalesePhone('12345'), false);
  assert.equal(validateSenegalesePhone('338210000'), false); // Landline not mobile
  assert.equal(validateSenegalesePhone('+33612345678'), false); // French number
});

test('calculateCartTotals computes subtotal, percentage promo, and total', () => {
  const promoPercent: PromoCode = {
    code: 'FRIDAY10',
    discountType: 'percentage',
    value: 10,
    description: '10% de réduction',
  };

  const deliveryFee = 1500;
  // Subtotal = 35000 * 2 = 70000
  // Discount = 70000 * 10% = 7000
  // Total = 70000 - 7000 + 1500 = 64500
  const totals = calculateCartTotals([mockItem], promoPercent, deliveryFee);
  assert.equal(totals.subtotal, 70000);
  assert.equal(totals.discount, 7000);
  assert.equal(totals.deliveryFee, 1500);
  assert.equal(totals.total, 64500);
  assert.equal(totals.itemCount, 2);
});

test('calculateCartTotals handles fixed amount promo code and minOrder threshold', () => {
  const promoFixed: PromoCode = {
    code: 'DAKARVIP',
    discountType: 'fixed',
    value: 5000,
    minOrderAmount: 100000,
    description: '5 000 FCFA dès 100 000 FCFA',
  };

  // Subtotal is 70000, less than minOrderAmount 100000 -> discount must be 0
  const totalsBelow = calculateCartTotals([mockItem], promoFixed, 2000);
  assert.equal(totalsBelow.discount, 0);
  assert.equal(totalsBelow.total, 72000);

  // If quantity is 3 -> subtotal 105000 >= 100000 -> discount = 5000
  const item3: CartItem = { ...mockItem, quantity: 3 };
  const totalsAbove = calculateCartTotals([item3], promoFixed, 2000);
  assert.equal(totalsAbove.subtotal, 105000);
  assert.equal(totalsAbove.discount, 5000);
  assert.equal(totalsAbove.total, 102000);
});

test('generateWhatsAppOrderLink formats proper WhatsApp URL with Senegalese details', () => {
  const link = generateWhatsAppOrderLink({
    storePhone: '221770948994',
    singleProduct: {
      name: 'AuraBuds Pro TWS ANC',
      price: 35000,
      size: 'Standard',
      color: 'Noir Sidéral',
    },
    customer: {
      fullName: 'Amadou Diallo',
      phone: '770948994',
      address: 'Almadies, Dakar',
      paymentMethod: 'wave',
    },
  });

  assert.ok(link.startsWith('https://wa.me/221770948994?text='));
  assert.ok(decodeURIComponent(link).includes('AuraBuds Pro TWS ANC'));
  assert.ok(decodeURIComponent(link).includes('Amadou Diallo'));
  assert.ok(decodeURIComponent(link).includes('Wave Sénégal'));
});
