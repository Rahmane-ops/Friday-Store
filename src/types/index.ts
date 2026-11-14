export type ViewMode = 'home' | 'shop' | 'product-detail' | 'checkout' | 'about' | 'contact' | 'faq' | 'tracking' | 'admin' | 'user-console' | 'strategy-guide';

export type UserRole = 'admin' | 'user' | 'manager';
export type UserStatus = 'active' | 'suspended';

export interface AppUser {
  id: string;
  email: string;
  displayName: string;
  phone: string;
  role: UserRole;
  status: UserStatus;
  address?: string;
  city?: string;
  createdAt: string;
  avatarUrl?: string;
  lastLogin?: string;
}

export type ProductCategory = 'electronique' | 'electromenager' | 'vaisselle' | 'deco-maison' | 'gadgets' | 'tous';

export interface ProductVariant {
  sizes: string[];
  colors: { name: string; hex: string }[];
}

export type RichSectionType = 'text' | 'image' | 'split' | 'highlights';

export interface ProductRichSection {
  id: string;
  type: RichSectionType;
  title?: string;
  body?: string;
  imageUrl?: string;
  imageCaption?: string;
  imagePosition?: 'left' | 'right';
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  category: 'electronique' | 'electromenager' | 'vaisselle' | 'deco-maison' | 'gadgets';
  price: number; // In FCFA
  originalPrice?: number; // Optional compare price in FCFA
  description: string;
  shortDescription: string;
  richSections?: ProductRichSection[];
  features: string[];
  images: string[];
  sizes: string[];
  colors: { name: string; hex: string }[];
  inStock: boolean;
  stockCount: number;
  isFeatured: boolean;
  isNew: boolean;
  rating: number;
  reviewCount: number;
  sku: string;
}

export interface CartItem {
  id: string; // unique item id (product.id + size + color)
  product: Product;
  selectedSize: string;
  selectedColor: { name: string; hex: string };
  quantity: number;
}

export interface DeliveryZone {
  id: string;
  name: string;
  area: string;
  price: number;
  estimatedDelay: string;
}

export interface PromoCode {
  code: string;
  discountType: 'percentage' | 'fixed';
  value: number; // e.g. 10 for 10%, or 3000 for 3000 FCFA
  minOrderAmount?: number;
  description: string;
}

export type PaymentMethod = 'wave' | 'orange_money' | 'cod';

export interface CustomerOrderData {
  fullName: string;
  phone: string;
  email: string;
  address: string;
  zoneId: string;
  notes?: string;
  paymentMethod: PaymentMethod;
}

export type OrderStatus = 'pending' | 'confirmed' | 'shipping' | 'delivered' | 'cancelled';

export interface Order {
  id: string;
  orderNumber: string;
  userId?: string | null;
  createdAt: string;
  customer: CustomerOrderData;
  items: CartItem[];
  subtotal: number;
  discount: number;
  deliveryFee: number;
  total: number;
  appliedPromo?: string;
  status: OrderStatus;
}

export interface OrderTrackingRecord {
  orderNumber: string;
  orderId: string;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  total: number;
  itemCount: number;
  paymentMethod: PaymentMethod;
  zoneName: string;
}

export interface CustomerReview {
  id: string;
  author: string;
  city: string;
  rating: number;
  comment: string;
  date: string;
  verified: boolean;
  productName?: string;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: 'livraison' | 'paiement' | 'produits' | 'retours';
}

export type NotificationRecipientScope = 'admin' | 'user';
export type NotificationType = 'order_created' | 'order_status' | 'low_stock' | 'system';

export interface AppNotification {
  id: string;
  recipientScope: NotificationRecipientScope;
  userId?: string | null;
  type: NotificationType;
  title: string;
  message: string;
  orderNumber?: string;
  orderId?: string;
  read: boolean;
  createdAt: string;
}

export interface NotificationSettings {
  id: string;
  webhookEnabled: boolean;
  webhookUrl: string;
  notifyOnNewOrder: boolean;
  notifyOnStatusChange: boolean;
  notifyOnLowStock: boolean;
  updatedAt: string;
}

export interface CloudinarySettings {
  id: string;
  cloudName: string;
  uploadPreset: string;
  folder?: string;
  updatedAt: string;
}

