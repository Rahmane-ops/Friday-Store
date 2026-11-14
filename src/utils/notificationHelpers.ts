import { AppNotification, NotificationSettings, Order, OrderStatus, Product } from '../types';
import { formatFCFA } from './shopCalculations';
import { sanitizeBoundedString } from './orderValidation';

const STORE_WHATSAPP_NUMBER = '221770948994';

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'En attente de confirmation',
  confirmed: 'Confirmée & En préparation',
  shipping: 'En cours de livraison (Coursier)',
  delivered: 'Livrée avec succès',
  cancelled: 'Annulée',
};

export function buildOrderCreatedNotifications(params: {
  order: Order;
  zoneName: string;
}): AppNotification[] {
  const { order, zoneName } = params;
  const ts = Date.now();
  const rand = Math.floor(100 + Math.random() * 900);
  const itemsCount = order.items.reduce((sum, item) => sum + item.quantity, 0);

  const notifications: AppNotification[] = [
    {
      id: `notif-adm-${ts}-${rand}`,
      recipientScope: 'admin',
      userId: null,
      type: 'order_created',
      title: sanitizeBoundedString(`Nouvelle commande ${order.orderNumber}`, 160),
      message: sanitizeBoundedString(
        `${order.customer.fullName} (${order.customer.phone}) · ${itemsCount} article(s) · ${formatFCFA(order.total)} · ${zoneName}`,
        500
      ),
      orderNumber: order.orderNumber,
      orderId: order.id,
      read: false,
      createdAt: order.createdAt,
    },
  ];

  if (order.userId) {
    notifications.push({
      id: `notif-usr-${ts}-${rand}`,
      recipientScope: 'user',
      userId: order.userId,
      type: 'order_created',
      title: sanitizeBoundedString(`Commande ${order.orderNumber} reçue`, 160),
      message: sanitizeBoundedString(
        `Votre commande de ${formatFCFA(order.total)} (${zoneName}) est bien enregistrée. Un conseiller Dakar va la confirmer.`,
        500
      ),
      orderNumber: order.orderNumber,
      orderId: order.id,
      read: false,
      createdAt: order.createdAt,
    });
  }

  return notifications;
}

export function buildOrderStatusNotification(params: {
  order: Order;
  newStatus: OrderStatus;
  nowIso?: string;
}): AppNotification | null {
  const { order, newStatus } = params;
  if (!order.userId) return null;

  const createdAt = params.nowIso || new Date().toISOString();
  const statusLabel = ORDER_STATUS_LABELS[newStatus] || newStatus;

  let detail = `Le statut de votre commande est maintenant : ${statusLabel}.`;
  if (newStatus === 'confirmed') {
    detail = 'Votre colis a passé le contrôle qualité et est en cours de préparation pour expédition.';
  } else if (newStatus === 'shipping') {
    detail = 'Bonne nouvelle ! Notre coursier est en route avec votre colis. Préparez votre règlement à l’inspection.';
  } else if (newStatus === 'delivered') {
    detail = 'Votre commande a été livrée avec succès. Merci pour votre confiance en Friday Store Dakar !';
  } else if (newStatus === 'cancelled') {
    detail = 'Votre commande a été annulée. Contactez notre support WhatsApp en cas de question.';
  }

  return {
    id: `notif-st-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
    recipientScope: 'user',
    userId: order.userId,
    type: 'order_status',
    title: sanitizeBoundedString(`Commande ${order.orderNumber} : ${statusLabel}`, 160),
    message: sanitizeBoundedString(detail, 500),
    orderNumber: order.orderNumber,
    orderId: order.id,
    read: false,
    createdAt,
  };
}

export function buildLowStockNotification(product: Product, nowIso = new Date().toISOString()): AppNotification | null {
  if (product.stockCount > 5) return null;

  return {
    id: `notif-stk-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
    recipientScope: 'admin',
    userId: null,
    type: 'low_stock',
    title: sanitizeBoundedString(
      product.stockCount === 0
        ? `Rupture de stock : ${product.name}`
        : `Stock critique (${product.stockCount}) : ${product.name}`,
      160
    ),
    message: sanitizeBoundedString(
      `Référence ${product.sku} · Il reste ${product.stockCount} unité(s) en inventaire. Pensez à réapprovisionner.`,
      500
    ),
    read: false,
    createdAt: nowIso,
  };
}

export function generateStatusWhatsAppLink(order: Order, status: OrderStatus): string {
  const digits = (order.customer.phone || '').replace(/\D/g, '');
  const intlPhone =
    digits.startsWith('221')
      ? digits
      : digits.length === 9
      ? `221${digits}`
      : STORE_WHATSAPP_NUMBER;

  const label = ORDER_STATUS_LABELS[status];
  const name = sanitizeBoundedString(order.customer.fullName, 80);
  const text = `Bonjour ${name} 👋,\n\nMise à jour de votre commande *${order.orderNumber}* chez Friday Store Dakar :\n📦 Statut : *${label}*\n💰 Montant : *${formatFCFA(order.total)}*\n\nMerci pour votre confiance !`;

  return `https://wa.me/${intlPhone}?text=${encodeURIComponent(text)}`;
}

export function isValidWebhookUrl(rawUrl: string): boolean {
  const trimmed = rawUrl.trim();
  if (!trimmed) return false;
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}

export async function dispatchWebhookNotification(
  settings: NotificationSettings | null,
  event: 'order.created' | 'order.status_updated' | 'product.low_stock',
  payload: Record<string, unknown>
): Promise<void> {
  if (!settings || !settings.webhookEnabled || !isValidWebhookUrl(settings.webhookUrl)) {
    return;
  }

  if (event === 'order.created' && !settings.notifyOnNewOrder) return;
  if (event === 'order.status_updated' && !settings.notifyOnStatusChange) return;
  if (event === 'product.low_stock' && !settings.notifyOnLowStock) return;

  try {
    await fetch(settings.webhookUrl.trim(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event,
        source: 'friday-store-senegal',
        sentAt: new Date().toISOString(),
        data: payload,
      }),
      keepalive: true,
    });
  } catch (err) {
    // Non-blocking: webhook failure must never break order creation or status updates
    console.warn('Webhook dispatch warning:', err);
  }
}
