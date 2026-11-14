import { AppUser, Order } from '../types';

export interface UserOrderStats {
  orders: Order[];
  validOrdersCount: number;
  totalSpent: number;
  averageBasket: number;
}

/**
 * Normalizes a phone string to its core digits (stripping leading 221/00221 if 12+ digits)
 * so guest orders placed with "77 123 45 67" match profiles saved with "+221 77 123 45 67".
 */
export function normalizePhoneKey(phone?: string): string {
  if (!phone) return '';
  const digits = phone.replace(/[^0-9]/g, '');
  if (!digits) return '';
  if (digits.startsWith('00221') && digits.length >= 14) {
    return digits.slice(5);
  }
  if (digits.startsWith('221') && digits.length >= 12) {
    return digits.slice(3);
  }
  return digits;
}

export function formatWhatsAppDigits(phone?: string): string {
  const digits = (phone || '').replace(/[^0-9]/g, '');
  if (!digits) return '';
  if (digits.length === 9) return `221${digits}`;
  if (digits.startsWith('00221')) return digits.slice(2);
  return digits;
}

export function getUserOrdersAndStats(user: AppUser, allOrders: Order[]): UserOrderStats {
  const userEmail = (user.email || '').trim().toLowerCase();
  const userPhoneKey = normalizePhoneKey(user.phone);

  const matchedOrders = allOrders.filter((order) => {
    if (order.userId && order.userId === user.id) return true;
    const orderEmail = (order.customer?.email || '').trim().toLowerCase();
    if (userEmail && orderEmail && orderEmail === userEmail) return true;
    const orderPhoneKey = normalizePhoneKey(order.customer?.phone);
    if (userPhoneKey && orderPhoneKey && orderPhoneKey === userPhoneKey) return true;
    return false;
  });

  const validOrders = matchedOrders.filter((o) => o.status !== 'cancelled');
  const totalSpent = validOrders.reduce((sum, o) => sum + o.total, 0);
  const averageBasket = validOrders.length > 0 ? Math.round(totalSpent / validOrders.length) : 0;

  return {
    orders: matchedOrders,
    validOrdersCount: validOrders.length,
    totalSpent,
    averageBasket,
  };
}
