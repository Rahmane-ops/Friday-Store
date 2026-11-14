import { CartItem, PromoCode, CustomerOrderData } from '../types';

/**
 * Formats a numeric amount in FCFA with standard Senegalese / West African spacing.
 * Example: 25000 -> "25 000 FCFA"
 */
export function formatFCFA(amount: number): string {
  const safeAmount = Math.max(0, Math.round(amount));
  const formatted = safeAmount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return `${formatted} FCFA`;
}

/**
 * Validates Senegalese phone numbers:
 * Starts with 70, 75, 76, 77, 78 followed by 7 digits, with optional +221 or 00221 prefix.
 */
export function validateSenegalesePhone(phone: string): boolean {
  if (!phone) return false;
  const cleaned = phone.replace(/[\s\-\(\)\.]/g, '');
  // Match +221 or 00221 followed by 7[05678]XXXXXXX, or just 9 digits starting with 7[05678]
  const regex = /^(?:(?:\+|00)221)?(7[05678]\d{7})$/;
  return regex.test(cleaned);
}

/**
 * Calculates cart subtotal, discount based on promo code, and overall total.
 */
export function calculateCartTotals(
  items: CartItem[],
  promo: PromoCode | null,
  deliveryFee: number = 0
): {
  subtotal: number;
  discount: number;
  deliveryFee: number;
  total: number;
  itemCount: number;
} {
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  let discount = 0;
  if (promo && subtotal > 0) {
    if (!promo.minOrderAmount || subtotal >= promo.minOrderAmount) {
      if (promo.discountType === 'percentage') {
        discount = Math.round((subtotal * promo.value) / 100);
      } else {
        discount = Math.min(subtotal, promo.value);
      }
    }
  }

  const total = Math.max(0, subtotal - discount + deliveryFee);

  return {
    subtotal,
    discount,
    deliveryFee,
    total,
    itemCount,
  };
}

/**
 * Generates an official unique order reference for Friday Store.
 * Example: "FS-26-8491"
 */
export function generateOrderNumber(): string {
  const year = new Date().getFullYear().toString().slice(-2);
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `FS-${year}-${randomNum}`;
}

/**
 * Formats a prefilled WhatsApp message to place an order directly with Friday Store's Dakar team.
 * Target phone e.g.: "221770948994"
 */
export function generateWhatsAppOrderLink(params: {
  storePhone?: string;
  items?: CartItem[];
  singleProduct?: {
    name: string;
    price: number;
    size?: string;
    color?: string;
    sku?: string;
  };
  customer?: Partial<CustomerOrderData>;
  orderNumber?: string;
  total?: number;
}): string {
  const storePhone = params.storePhone || '221770948994';
  let message = '👋 Bonjour Friday Store Dakar !\n\n';

  if (params.orderNumber) {
    message += `📦 *Commande #${params.orderNumber}*\n`;
  }

  if (params.singleProduct) {
    message += `Je souhaite commander cet article :\n`;
    message += `• *${params.singleProduct.name}*\n`;
    message += `  Prix : ${formatFCFA(params.singleProduct.price)}\n`;
    if (params.singleProduct.size) message += `  Taille : ${params.singleProduct.size}\n`;
    if (params.singleProduct.color) message += `  Couleur : ${params.singleProduct.color}\n`;
  } else if (params.items && params.items.length > 0) {
    message += `Je souhaite finaliser ma commande de panier :\n`;
    params.items.forEach((item, index) => {
      message += `${index + 1}. *${item.product.name}* (x${item.quantity})\n`;
      message += `   Taille : ${item.selectedSize} | Couleur : ${item.selectedColor.name}\n`;
      message += `   Prix : ${formatFCFA(item.product.price * item.quantity)}\n`;
    });
  }

  if (params.total !== undefined) {
    message += `\n💰 *Total estimé : ${formatFCFA(params.total)}*\n`;
  }

  if (params.customer?.fullName) {
    message += `\n👤 *Client :* ${params.customer.fullName}\n`;
    if (params.customer.phone) message += `📞 *Téléphone :* ${params.customer.phone}\n`;
    if (params.customer.address) message += `📍 *Adresse/Quartier :* ${params.customer.address}\n`;
    if (params.customer.paymentMethod) {
      const paymentLabels: Record<string, string> = {
        wave: 'Wave Sénégal 📱',
        orange_money: 'Orange Money 🟠',
        cod: 'Paiement à la livraison (Cash) 💵',
      };
      message += `💳 *Paiement souhaité :* ${paymentLabels[params.customer.paymentMethod] || params.customer.paymentMethod}\n`;
    }
  }

  message += `\nPouvez-vous me confirmer la disponibilité et le délai de livraison ? Merci !`;

  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${storePhone}?text=${encodedMessage}`;
}
