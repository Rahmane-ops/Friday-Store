import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import {
  Product,
  CartItem,
  DeliveryZone,
  PromoCode,
  Order,
  OrderTrackingRecord,
  CustomerOrderData,
  OrderStatus,
  ProductCategory,
  AppNotification,
  NotificationSettings,
  CloudinarySettings,
} from '../types';
import { INITIAL_PRODUCTS, DELIVERY_ZONES, PROMO_CODES } from '../data/mockData';
import { calculateCartTotals } from '../utils/shopCalculations';
import { buildValidatedOrderPayloads, sanitizeProductForFirestore } from '../utils/orderValidation';
import {
  buildLowStockNotification,
  buildOrderCreatedNotifications,
  buildOrderStatusNotification,
  dispatchWebhookNotification,
  ORDER_STATUS_LABELS,
} from '../utils/notificationHelpers';
import { db } from '../lib/firebase';
import { OperationType, handleFirestoreError } from '../lib/firestoreError';
import { useAuth } from './AuthContext';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';

interface ShopContextType {
  products: Product[];
  promoCodes: PromoCode[];
  cart: CartItem[];
  deliveryZones: DeliveryZone[];
  selectedZone: DeliveryZone;
  promoCode: PromoCode | null;
  orders: Order[];
  isCartOpen: boolean;
  activeView: string;
  selectedProduct: Product | null;
  toastMessage: string | null;

  // Real-time Search & Filter State
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: ProductCategory;
  setSelectedCategory: (category: ProductCategory) => void;
  clearSearch: () => void;

  // Navigation
  navigateTo: (view: string, product?: Product) => void;
  setIsCartOpen: (isOpen: boolean) => void;
  showToast: (msg: string) => void;

  // Cart Actions
  addToCart: (product: Product, size: string, color: { name: string; hex: string }, quantity?: number) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  applyPromoCode: (code: string) => { success: boolean; message: string };
  removePromoCode: () => void;
  setSelectedZone: (zone: DeliveryZone) => void;

  // Totals
  totals: {
    subtotal: number;
    discount: number;
    deliveryFee: number;
    total: number;
    itemCount: number;
  };

  // Order Actions (Firestore)
  createOrder: (data: CustomerOrderData, userId?: string | null) => Promise<Order>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  trackOrderByNumber: (orderNumber: string) => Promise<OrderTrackingRecord | null>;

  // Admin Product Actions (Firestore)
  addProduct: (product: Product) => Promise<void>;
  updateProduct: (product: Product) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;

  // Automatic Real-time Notifications & Push
  notifications: AppNotification[];
  unreadNotificationsCount: number;
  notificationSettings: NotificationSettings;
  browserPushPermission: NotificationPermission | 'unsupported';
  browserPushEnabled: boolean;
  requestBrowserPushPermission: () => Promise<boolean>;
  toggleBrowserPush: (enabled: boolean) => void;
  markNotificationRead: (notificationId: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  saveNotificationSettings: (patch: Partial<NotificationSettings>) => Promise<void>;
  sendTestNotification: () => Promise<void>;

  // Cloudinary Image Hosting Settings (Firestore /settings/cloudinary + env defaults)
  cloudinarySettings: CloudinarySettings;
  saveCloudinarySettings: (patch: Partial<CloudinarySettings>) => Promise<void>;
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'friday_store_cart_v2';
const GUEST_ORDERS_STORAGE_KEY = 'friday_store_guest_orders_v3';
const PUSH_PREF_STORAGE_KEY = 'friday_store_push_enabled_v1';

const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  id: 'notifications',
  webhookEnabled: false,
  webhookUrl: '',
  notifyOnNewOrder: true,
  notifyOnStatusChange: true,
  notifyOnLowStock: true,
  updatedAt: new Date().toISOString(),
};

const DEFAULT_CLOUDINARY_SETTINGS: CloudinarySettings = {
  id: 'cloudinary',
  cloudName: (import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || '').trim(),
  uploadPreset: (import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || '').trim(),
  folder: (import.meta.env.VITE_CLOUDINARY_FOLDER || 'friday-store/products').trim(),
  updatedAt: new Date().toISOString(),
};

export const ShopProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, isAdmin, authReady } = useAuth();

  // Products streamed from Firestore (falls back to INITIAL_PRODUCTS until seeded in Firestore)
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [firestoreProductsCount, setFirestoreProductsCount] = useState<number | null>(null);
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>(PROMO_CODES);
  const [firestorePromosCount, setFirestorePromosCount] = useState<number | null>(null);
  const seededOnceRef = useRef(false);

  // Notifications & Push state
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(
    DEFAULT_NOTIFICATION_SETTINGS
  );
  const [cloudinarySettings, setCloudinarySettings] = useState<CloudinarySettings>(
    DEFAULT_CLOUDINARY_SETTINGS
  );
  const seenNotificationIdsRef = useRef<Set<string> | null>(null);
  const [browserPushPermission, setBrowserPushPermission] = useState<
    NotificationPermission | 'unsupported'
  >(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) return 'unsupported';
    return Notification.permission;
  });
  const [browserPushEnabled, setBrowserPushEnabled] = useState<boolean>(() => {
    try {
      return localStorage.getItem(PUSH_PREF_STORAGE_KEY) !== 'false';
    } catch {
      return true;
    }
  });

  // Cart state (client-side persisted across page reloads)
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Orders state: Firestore real-time stream for signed-in users & admins; local session receipts for guests
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      localStorage.removeItem('friday_store_orders_v2'); // purge legacy mock seed orders
      const saved = localStorage.getItem(GUEST_ORDERS_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Active view & navigation
  const [activeView, setActiveView] = useState<string>('home');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [deliveryZones] = useState<DeliveryZone[]>(DELIVERY_ZONES);
  const [selectedZone, setSelectedZone] = useState<DeliveryZone>(DELIVERY_ZONES[0]);
  const [promoCode, setPromoCode] = useState<PromoCode | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory>('tous');

  const clearSearch = () => {
    setSearchQuery('');
    setSelectedCategory('tous');
  };

  // Persist cart locally
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (e) {
      console.warn('LocalStorage error saving cart', e);
    }
  }, [cart]);

  // 1. Live Firestore listener for public catalog (/products)
  useEffect(() => {
    const path = 'products';
    const unsubscribe = onSnapshot(
      collection(db, path),
      (snapshot) => {
        setFirestoreProductsCount(snapshot.size);
        if (snapshot.empty) {
          setProducts(INITIAL_PRODUCTS);
        } else {
          const list = snapshot.docs.map((d) => d.data() as Product);
          list.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
          setProducts(list);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, path);
      }
    );
    return () => unsubscribe();
  }, []);

  // 2. Live Firestore listener for active promo codes (/promoCodes)
  useEffect(() => {
    const path = 'promoCodes';
    const unsubscribe = onSnapshot(
      collection(db, path),
      (snapshot) => {
        setFirestorePromosCount(snapshot.size);
        if (snapshot.empty) {
          setPromoCodes(PROMO_CODES);
        } else {
          const list = snapshot.docs.map((d) => d.data() as PromoCode);
          setPromoCodes(list);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, path);
      }
    );
    return () => unsubscribe();
  }, []);

  // 3. Auto-seed initial catalog & promo codes to Firestore on first Admin login if empty
  useEffect(() => {
    if (!authReady || !isAdmin || seededOnceRef.current) return;
    if (firestoreProductsCount === null || firestorePromosCount === null) return;
    if (firestoreProductsCount > 0 && firestorePromosCount > 0) return;

    seededOnceRef.current = true;
    const seedInitialData = async () => {
      const batch = writeBatch(db);
      if (firestoreProductsCount === 0) {
        INITIAL_PRODUCTS.forEach((prod) => {
          const clean = sanitizeProductForFirestore(prod);
          batch.set(doc(db, 'products', clean.id), clean);
        });
      }
      if (firestorePromosCount === 0) {
        PROMO_CODES.forEach((promo) => {
          batch.set(doc(db, 'promoCodes', promo.code.toUpperCase()), {
            ...promo,
            active: true,
          });
        });
      }
      try {
        await batch.commit();
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, 'products/seed');
      }
    };
    seedInitialData();
  }, [authReady, isAdmin, firestoreProductsCount, firestorePromosCount]);

  // 4. Live Firestore listener for Orders (Admin sees all; signed-in User sees only their own)
  useEffect(() => {
    if (!authReady) return;

    if (!currentUser) {
      // Guest: keep local device orders only
      try {
        const saved = localStorage.getItem(GUEST_ORDERS_STORAGE_KEY);
        setOrders(saved ? JSON.parse(saved) : []);
      } catch {
        setOrders([]);
      }
      return;
    }

    const path = 'orders';
    const ordersQuery = isAdmin
      ? collection(db, path)
      : query(collection(db, path), where('userId', '==', currentUser.id));

    const unsubscribe = onSnapshot(
      ordersQuery,
      (snapshot) => {
        const list = snapshot.docs.map((d) => d.data() as Order);
        list.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
        setOrders(list);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, path);
      }
    );

    return () => unsubscribe();
  }, [authReady, currentUser, isAdmin]);

  // 5. Live Firestore listener for automatic Notifications (/notifications)
  useEffect(() => {
    if (!authReady || !currentUser) {
      setNotifications([]);
      seenNotificationIdsRef.current = null;
      return;
    }

    const path = 'notifications';
    const notifQuery = isAdmin
      ? query(collection(db, path), where('recipientScope', '==', 'admin'))
      : query(
          collection(db, path),
          where('recipientScope', '==', 'user'),
          where('userId', '==', currentUser.id)
        );

    const unsubscribe = onSnapshot(
      notifQuery,
      (snapshot) => {
        const list = snapshot.docs.map((d) => d.data() as AppNotification);
        list.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));

        if (seenNotificationIdsRef.current === null) {
          seenNotificationIdsRef.current = new Set(list.map((n) => n.id));
        } else {
          const newUnread = list.filter(
            (n) => !n.read && !seenNotificationIdsRef.current!.has(n.id)
          );
          list.forEach((n) => seenNotificationIdsRef.current!.add(n.id));

          if (newUnread.length > 0) {
            const latest = newUnread[0];
            showToast(`🔔 ${latest.title}`);
            if (
              browserPushEnabled &&
              typeof window !== 'undefined' &&
              'Notification' in window &&
              Notification.permission === 'granted'
            ) {
              try {
                new Notification(latest.title, {
                  body: latest.message,
                  icon: '/assets/aistudio/icone_friday_13e5679f.jpg',
                });
              } catch {
                // ignore browser notification runtime issues
              }
            }
          }
        }

        setNotifications(list);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, path);
      }
    );

    return () => unsubscribe();
  }, [authReady, currentUser, isAdmin, browserPushEnabled]);

  // 6. Live Firestore listener for Admin notification/webhook settings (/settings/notifications)
  useEffect(() => {
    if (!authReady || !isAdmin) {
      setNotificationSettings(DEFAULT_NOTIFICATION_SETTINGS);
      return;
    }

    const path = 'settings/notifications';
    const unsubscribe = onSnapshot(
      doc(db, 'settings', 'notifications'),
      (snap) => {
        if (snap.exists()) {
          setNotificationSettings(snap.data() as NotificationSettings);
        } else {
          setNotificationSettings(DEFAULT_NOTIFICATION_SETTINGS);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, path);
      }
    );

    return () => unsubscribe();
  }, [authReady, isAdmin]);

  // 7. Live Firestore listener for Admin Cloudinary media settings (/settings/cloudinary)
  useEffect(() => {
    if (!authReady || !isAdmin) {
      setCloudinarySettings(DEFAULT_CLOUDINARY_SETTINGS);
      return;
    }

    const path = 'settings/cloudinary';
    const unsubscribe = onSnapshot(
      doc(db, 'settings', 'cloudinary'),
      (snap) => {
        if (snap.exists()) {
          setCloudinarySettings(snap.data() as CloudinarySettings);
        } else {
          setCloudinarySettings(DEFAULT_CLOUDINARY_SETTINGS);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, path);
      }
    );

    return () => unsubscribe();
  }, [authReady, isAdmin]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 3500);
  };

  const navigateTo = (view: string, product?: Product) => {
    if (product) {
      setSelectedProduct(product);
    }
    setActiveView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const addToCart = (
    product: Product,
    size: string,
    color: { name: string; hex: string },
    quantity = 1
  ) => {
    const itemId = `${product.id}-${size}-${color.name}`;
    setCart((prev) => {
      const existing = prev.find((item) => item.id === itemId);
      if (existing) {
        return prev.map((item) =>
          item.id === itemId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        return [
          ...prev,
          {
            id: itemId,
            product,
            selectedSize: size,
            selectedColor: color,
            quantity,
          },
        ];
      }
    });
    showToast(`« ${product.name} » ajouté au panier !`);
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== itemId));
    showToast('Article retiré du panier.');
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => {
    setCart([]);
    setPromoCode(null);
  };

  const applyPromoCode = (codeStr: string) => {
    const cleanCode = codeStr.trim().toUpperCase();
    const found = promoCodes.find((p) => p.code.toUpperCase() === cleanCode);
    if (!found) {
      return { success: false, message: 'Code promo invalide.' };
    }

    const currentSubtotal = cart.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );

    if (found.minOrderAmount && currentSubtotal < found.minOrderAmount) {
      return {
        success: false,
        message: `Montant minimum de ${found.minOrderAmount.toLocaleString()} FCFA requis pour ce code.`,
      };
    }

    setPromoCode(found);
    showToast(`Code promo ${found.code} appliqué avec succès !`);
    return { success: true, message: found.description };
  };

  const removePromoCode = () => {
    setPromoCode(null);
    showToast('Code promo retiré.');
  };

  const totals = calculateCartTotals(cart, promoCode, selectedZone.price);

  const createOrder = async (
    customerData: CustomerOrderData,
    userId?: string | null
  ): Promise<Order> => {
    const zone = deliveryZones.find((z) => z.id === customerData.zoneId) || selectedZone;
    const built = buildValidatedOrderPayloads({
      customerData,
      cart,
      zone,
      promoCode,
      userId: userId ?? currentUser?.id ?? null,
    });

    if (!built.ok) {
      throw new Error(built.error);
    }

    const { order, tracking } = built;
    const autoNotifs = buildOrderCreatedNotifications({ order, zoneName: zone.name });

    const batch = writeBatch(db);
    batch.set(doc(db, 'orders', order.id), order);
    batch.set(doc(db, 'orderTracking', tracking.orderNumber), tracking);
    autoNotifs.forEach((n) => {
      batch.set(doc(db, 'notifications', n.id), n);
    });

    try {
      await batch.commit();
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `orders/${order.id}`);
    }

    dispatchWebhookNotification(notificationSettings, 'order.created', {
      orderNumber: order.orderNumber,
      orderId: order.id,
      customerName: order.customer.fullName,
      customerPhone: order.customer.phone,
      zone: zone.name,
      total: order.total,
      paymentMethod: order.customer.paymentMethod,
      itemCount: tracking.itemCount,
    });

    if (!currentUser) {
      setOrders((prev) => {
        const next = [order, ...prev].slice(0, 20);
        try {
          localStorage.setItem(GUEST_ORDERS_STORAGE_KEY, JSON.stringify(next));
        } catch {
          // ignore quota error
        }
        return next;
      });
    }

    clearCart();
    return order;
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    const target = orders.find((o) => o.id === orderId);
    const nowIso = new Date().toISOString();

    try {
      if (target) {
        const batch = writeBatch(db);
        batch.update(doc(db, 'orders', orderId), { status });
        batch.update(doc(db, 'orderTracking', target.orderNumber), {
          status,
          updatedAt: nowIso,
        });

        const clientNotif = buildOrderStatusNotification({
          order: target,
          newStatus: status,
          nowIso,
        });
        if (clientNotif) {
          batch.set(doc(db, 'notifications', clientNotif.id), clientNotif);
        }

        await batch.commit();

        dispatchWebhookNotification(notificationSettings, 'order.status_updated', {
          orderNumber: target.orderNumber,
          orderId,
          status,
          statusLabel: ORDER_STATUS_LABELS[status],
          customerName: target.customer.fullName,
          customerPhone: target.customer.phone,
          total: target.total,
        });
      } else {
        await updateDoc(doc(db, 'orders', orderId), { status });
      }
      showToast(`Statut mis à jour : ${ORDER_STATUS_LABELS[status] || status}`);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `orders/${orderId}`);
    }
  };

  const trackOrderByNumber = async (orderNumber: string): Promise<OrderTrackingRecord | null> => {
    const clean = orderNumber.trim().toUpperCase();
    if (!clean) return null;
    const path = `orderTracking/${clean}`;
    try {
      const snap = await getDoc(doc(db, 'orderTracking', clean));
      if (snap.exists()) {
        return snap.data() as OrderTrackingRecord;
      }
      return null;
    } catch (err) {
      // Invalid IDs (like phone numbers) shouldn't throw a crash in OrderTrackingPage
      const msg = err instanceof Error ? err.message : '';
      if (msg.includes('permission-denied') || msg.includes('Missing or insufficient permissions')) {
        return null;
      }
      handleFirestoreError(err, OperationType.GET, path);
    }
  };

  const addProduct = async (product: Product) => {
    const clean = sanitizeProductForFirestore(product);
    const path = `products/${clean.id}`;
    try {
      await setDoc(doc(db, 'products', clean.id), clean);
      const lowStockNotif = buildLowStockNotification(clean);
      const alreadyAlerted = notifications.some(
        (n) => !n.read && n.type === 'low_stock' && n.message.includes(clean.sku)
      );
      if (lowStockNotif && isAdmin && !alreadyAlerted) {
        await setDoc(doc(db, 'notifications', lowStockNotif.id), lowStockNotif);
        dispatchWebhookNotification(notificationSettings, 'product.low_stock', {
          productId: clean.id,
          name: clean.name,
          sku: clean.sku,
          stockCount: clean.stockCount,
        });
      }
      showToast(`Produit « ${clean.name} » ajouté au catalogue !`);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, path);
    }
  };

  const updateProduct = async (product: Product) => {
    const clean = sanitizeProductForFirestore(product);
    const path = `products/${clean.id}`;
    try {
      await setDoc(doc(db, 'products', clean.id), clean);
      const lowStockNotif = buildLowStockNotification(clean);
      const alreadyAlerted = notifications.some(
        (n) => !n.read && n.type === 'low_stock' && n.message.includes(clean.sku)
      );
      if (lowStockNotif && isAdmin && !alreadyAlerted) {
        await setDoc(doc(db, 'notifications', lowStockNotif.id), lowStockNotif);
        dispatchWebhookNotification(notificationSettings, 'product.low_stock', {
          productId: clean.id,
          name: clean.name,
          sku: clean.sku,
          stockCount: clean.stockCount,
        });
      }
      showToast(`Produit « ${clean.name} » modifié avec succès.`);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, path);
    }
  };

  const deleteProduct = async (id: string) => {
    const path = `products/${id}`;
    try {
      await deleteDoc(doc(db, 'products', id));
      showToast('Produit supprimé du catalogue.');
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, path);
    }
  };

  const requestBrowserPushPermission = async (): Promise<boolean> => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      setBrowserPushPermission('unsupported');
      showToast('Les notifications navigateur ne sont pas supportées sur cet appareil.');
      return false;
    }

    const permission = await Notification.requestPermission();
    setBrowserPushPermission(permission);
    if (permission === 'granted') {
      toggleBrowserPush(true);
      try {
        new Notification('Alertes Friday Store activées', {
          body: 'Vous recevrez désormais les notifications de commandes et livraisons en temps réel.',
          icon: '/assets/aistudio/icone_friday_13e5679f.jpg',
        });
      } catch {
        // ignore
      }
      showToast('Notifications navigateur activées !');
      return true;
    }

    showToast('Permission de notification refusée par le navigateur.');
    return false;
  };

  const toggleBrowserPush = (enabled: boolean) => {
    setBrowserPushEnabled(enabled);
    try {
      localStorage.setItem(PUSH_PREF_STORAGE_KEY, String(enabled));
    } catch {
      // ignore
    }
  };

  const markNotificationRead = async (notificationId: string) => {
    const path = `notifications/${notificationId}`;
    try {
      await updateDoc(doc(db, 'notifications', notificationId), { read: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, path);
    }
  };

  const markAllNotificationsRead = async () => {
    const unread = notifications.filter((n) => !n.read);
    if (unread.length === 0) return;

    const batch = writeBatch(db);
    unread.forEach((n) => {
      batch.update(doc(db, 'notifications', n.id), { read: true });
    });
    try {
      await batch.commit();
      showToast('Toutes les notifications ont été marquées comme lues.');
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, 'notifications/batch');
    }
  };

  const deleteNotification = async (notificationId: string) => {
    const path = `notifications/${notificationId}`;
    try {
      await deleteDoc(doc(db, 'notifications', notificationId));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, path);
    }
  };

  const saveNotificationSettings = async (patch: Partial<NotificationSettings>) => {
    if (!isAdmin) return;
    const next: NotificationSettings = {
      ...notificationSettings,
      ...patch,
      id: 'notifications',
      webhookUrl: (patch.webhookUrl ?? notificationSettings.webhookUrl).trim().slice(0, 500),
      updatedAt: new Date().toISOString(),
    };
    const path = 'settings/notifications';
    try {
      await setDoc(doc(db, 'settings', 'notifications'), next);
      setNotificationSettings(next);
      showToast('Paramètres de notifications automatiques enregistrés !');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
  };

  const sendTestNotification = async () => {
    if (!currentUser) return;
    const id = `notif-test-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
    const notif: AppNotification = {
      id,
      recipientScope: isAdmin ? 'admin' : 'user',
      userId: isAdmin ? null : currentUser.id,
      type: 'system',
      title: 'Test de notification en direct',
      message: 'Vos alertes automatiques Firestore + navigateur fonctionnent parfaitement sur Friday Store.',
      read: false,
      createdAt: new Date().toISOString(),
    };
    try {
      await setDoc(doc(db, 'notifications', id), notif);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `notifications/${id}`);
    }
  };

  const saveCloudinarySettings = async (patch: Partial<CloudinarySettings>) => {
    if (!isAdmin) return;
    const next: CloudinarySettings = {
      id: 'cloudinary',
      cloudName: (patch.cloudName ?? cloudinarySettings.cloudName).trim().slice(0, 100),
      uploadPreset: (patch.uploadPreset ?? cloudinarySettings.uploadPreset).trim().slice(0, 120),
      folder: (patch.folder ?? cloudinarySettings.folder ?? 'friday-store/products').trim().slice(0, 120),
      updatedAt: new Date().toISOString(),
    };
    const path = 'settings/cloudinary';
    try {
      await setDoc(doc(db, 'settings', 'cloudinary'), next);
      setCloudinarySettings(next);
      showToast('Configuration Cloudinary enregistrée !');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
  };

  const unreadNotificationsCount = notifications.filter((n) => !n.read).length;

  return (
    <ShopContext.Provider
      value={{
        products,
        promoCodes,
        cart,
        deliveryZones,
        selectedZone,
        promoCode,
        orders,
        isCartOpen,
        activeView,
        selectedProduct,
        toastMessage,
        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory,
        clearSearch,
        navigateTo,
        setIsCartOpen,
        showToast,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        applyPromoCode,
        removePromoCode,
        setSelectedZone,
        totals,
        createOrder,
        updateOrderStatus,
        trackOrderByNumber,
        addProduct,
        updateProduct,
        deleteProduct,
        notifications,
        unreadNotificationsCount,
        notificationSettings,
        browserPushPermission,
        browserPushEnabled,
        requestBrowserPushPermission,
        toggleBrowserPush,
        markNotificationRead,
        markAllNotificationsRead,
        deleteNotification,
        saveNotificationSettings,
        sendTestNotification,
        cloudinarySettings,
        saveCloudinarySettings,
      }}
    >
      {children}
    </ShopContext.Provider>
  );
};

export const useShop = () => {
  const context = useContext(ShopContext);
  if (!context) {
    throw new Error('useShop must be used within a ShopProvider');
  }
  return context;
};
