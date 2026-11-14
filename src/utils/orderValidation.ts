import {
  CartItem,
  CustomerOrderData,
  DeliveryZone,
  Order,
  OrderTrackingRecord,
  Product,
  PromoCode,
} from '../types';
import { calculateCartTotals, generateOrderNumber, validateSenegalesePhone } from './shopCalculations';
import { sanitizeRichSections } from './richDescription';

export const BLUEPRINT_LIMITS = {
  ID_MAX: 128,
  NAME_MAX: 160,
  SHORT_TEXT_MAX: 240,
  DESCRIPTION_MAX: 5000,
  ADDRESS_MAX: 300,
  URL_MAX: 1000,
  PHONE_MAX: 32,
  EMAIL_MAX: 160,
  MAX_ORDER_ITEMS: 50,
} as const;

export function sanitizeBoundedString(value: string | undefined | null, maxLength: number): string {
  if (!value) return '';
  return value.trim().slice(0, maxLength);
}

export function buildValidatedOrderPayloads(params: {
  customerData: CustomerOrderData;
  cart: CartItem[];
  zone: DeliveryZone;
  promoCode: PromoCode | null;
  userId?: string | null;
  orderNumberOverride?: string;
  orderIdOverride?: string;
}): {
  ok: true;
  order: Order;
  tracking: OrderTrackingRecord;
} | {
  ok: false;
  error: string;
} {
  const { customerData, cart, zone, promoCode, userId } = params;

  if (!cart || cart.length === 0) {
    return { ok: false, error: 'Votre panier est vide.' };
  }
  if (cart.length > BLUEPRINT_LIMITS.MAX_ORDER_ITEMS) {
    return { ok: false, error: `Maximum ${BLUEPRINT_LIMITS.MAX_ORDER_ITEMS} lignes d'articles par commande.` };
  }

  const fullName = sanitizeBoundedString(customerData.fullName, BLUEPRINT_LIMITS.NAME_MAX);
  const phone = sanitizeBoundedString(customerData.phone, BLUEPRINT_LIMITS.PHONE_MAX);
  const email = sanitizeBoundedString(customerData.email, BLUEPRINT_LIMITS.EMAIL_MAX);
  const address = sanitizeBoundedString(customerData.address, BLUEPRINT_LIMITS.ADDRESS_MAX);
  const notes = sanitizeBoundedString(customerData.notes, BLUEPRINT_LIMITS.SHORT_TEXT_MAX);

  if (!fullName || !address || !validateSenegalesePhone(phone)) {
    return { ok: false, error: 'Coordonnées de livraison invalides.' };
  }

  const sanitizedItems: CartItem[] = cart.map((item) => {
    const { richSections: _omitRich, ...productWithoutRich } = item.product;
    return {
      id: sanitizeBoundedString(item.id, BLUEPRINT_LIMITS.ID_MAX),
      product: {
        ...productWithoutRich,
        name: sanitizeBoundedString(item.product.name, BLUEPRINT_LIMITS.NAME_MAX),
        shortDescription: sanitizeBoundedString(item.product.shortDescription, BLUEPRINT_LIMITS.SHORT_TEXT_MAX),
        description: sanitizeBoundedString(item.product.description, BLUEPRINT_LIMITS.DESCRIPTION_MAX),
        images: (item.product.images || []).slice(0, 5).map((img) => sanitizeBoundedString(img, BLUEPRINT_LIMITS.URL_MAX)),
      },
      selectedSize: sanitizeBoundedString(item.selectedSize, 80) || 'Standard',
      selectedColor: {
        name: sanitizeBoundedString(item.selectedColor?.name, 80) || 'Standard',
        hex: sanitizeBoundedString(item.selectedColor?.hex, 16) || '#10332C',
      },
      quantity: Math.max(1, Math.min(99, Math.round(item.quantity))),
    };
  });

  const totals = calculateCartTotals(sanitizedItems, promoCode, zone.price);
  if (totals.total <= 0) {
    return { ok: false, error: 'Le montant total de la commande doit être supérieur à 0 FCFA.' };
  }

  const nowIso = new Date().toISOString();
  const orderNumber = params.orderNumberOverride || generateOrderNumber();
  const orderId = params.orderIdOverride || `ord-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;

  const cleanCustomer: CustomerOrderData = {
    fullName,
    phone,
    email,
    address,
    zoneId: sanitizeBoundedString(zone.id, 64),
    paymentMethod: customerData.paymentMethod,
    ...(notes ? { notes } : {}),
  };

  const order: Order = {
    id: orderId,
    orderNumber,
    userId: userId || null,
    createdAt: nowIso,
    customer: cleanCustomer,
    items: sanitizedItems,
    subtotal: totals.subtotal,
    discount: totals.discount,
    deliveryFee: totals.deliveryFee,
    total: totals.total,
    ...(promoCode ? { appliedPromo: promoCode.code } : {}),
    status: 'pending',
  };

  const tracking: OrderTrackingRecord = {
    orderNumber,
    orderId,
    status: 'pending',
    createdAt: nowIso,
    updatedAt: nowIso,
    total: totals.total,
    itemCount: totals.itemCount,
    paymentMethod: customerData.paymentMethod,
    zoneName: sanitizeBoundedString(zone.name, BLUEPRINT_LIMITS.NAME_MAX),
  };

  return { ok: true, order, tracking };
}

export function sanitizeProductForFirestore(product: Product): Product {
  const safePrice = Math.max(0, Math.round(Number(product.price) || 0));
  const safeOrig = product.originalPrice ? Math.max(safePrice, Math.round(Number(product.originalPrice))) : undefined;
  const safeStock = Math.max(0, Math.round(Number(product.stockCount) || 0));
  const cleanRichSections = sanitizeRichSections(product.richSections);

  return {
    ...product,
    id: sanitizeBoundedString(product.id, BLUEPRINT_LIMITS.ID_MAX),
    name: sanitizeBoundedString(product.name, BLUEPRINT_LIMITS.NAME_MAX),
    slug: sanitizeBoundedString(product.slug, BLUEPRINT_LIMITS.NAME_MAX),
    shortDescription: sanitizeBoundedString(product.shortDescription, BLUEPRINT_LIMITS.SHORT_TEXT_MAX),
    description: sanitizeBoundedString(product.description, BLUEPRINT_LIMITS.DESCRIPTION_MAX),
    ...(cleanRichSections.length > 0 ? { richSections: cleanRichSections } : {}),
    features: (product.features || []).slice(0, 12).map((f) => sanitizeBoundedString(f, BLUEPRINT_LIMITS.SHORT_TEXT_MAX)),
    images: (product.images || []).slice(0, 5).map((img) => sanitizeBoundedString(img, BLUEPRINT_LIMITS.URL_MAX)),
    sizes: (product.sizes || []).slice(0, 10).map((s) => sanitizeBoundedString(s, 80)),
    colors: (product.colors || []).slice(0, 10).map((c) => ({
      name: sanitizeBoundedString(c.name, 80),
      hex: sanitizeBoundedString(c.hex, 16),
    })),
    price: safePrice,
    ...(safeOrig ? { originalPrice: safeOrig } : {}),
    stockCount: safeStock,
    inStock: safeStock > 0,
    sku: sanitizeBoundedString(product.sku, 64),
  };
}
