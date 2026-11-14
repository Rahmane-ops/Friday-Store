import React, { useState } from 'react';
import {
  Package,
  ShoppingBag,
  TrendingUp,
  AlertTriangle,
  Plus,
  Trash2,
  Edit3,
  CheckCircle2,
  Clock,
  Truck,
  XCircle,
  Tag,
  DollarSign,
  Search,
  Check,
  Users,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Lock,
  UserX,
  UserCheck,
  Mail,
  Phone,
  MapPin,
  ExternalLink,
  MessageCircle,
  Bell,
  Upload,
  ImagePlus,
  CheckCheck,
  Send,
  Link2,
  Cloud,
  ArrowUp,
  ArrowDown,
  Columns,
  FileText,
  ListChecks,
  Eye,
  X,
  CreditCard,
  StickyNote,
  Copy
} from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { useAuth } from '../context/AuthContext';
import { formatFCFA } from '../utils/shopCalculations';
import { generateStatusWhatsAppLink, isValidWebhookUrl } from '../utils/notificationHelpers';
import { uploadProductImageToCloudinary } from '../lib/cloudinaryService';
import { MAX_PRODUCT_IMAGES_COUNT, validateCloudinaryConfig } from '../utils/storageUpload';
import { MAX_RICH_SECTIONS, sanitizeRichSections } from '../utils/richDescription';
import { formatWhatsAppDigits, getUserOrdersAndStats } from '../utils/userDetails';
import { Product, Order, AppUser, OrderStatus, ProductCategory, UserRole, UserStatus, ProductRichSection, RichSectionType } from '../types';

export const AdminPage: React.FC = () => {
  const {
    products,
    orders,
    updateOrderStatus,
    addProduct,
    updateProduct,
    deleteProduct,
    showToast,
    navigateTo,
    notifications,
    unreadNotificationsCount,
    notificationSettings,
    markNotificationRead,
    markAllNotificationsRead,
    deleteNotification,
    saveNotificationSettings,
    sendTestNotification,
    browserPushPermission,
    requestBrowserPushPermission,
    cloudinarySettings,
    saveCloudinarySettings,
    deliveryZones,
  } = useShop();
  const {
    currentUser,
    isAdmin,
    users,
    updateUserRole,
    updateUserStatus,
    deleteUser,
    openAuthModal,
    adminAuthDeletionReady,
  } = useAuth();

  const [activeTab, setActiveTab] = useState<'kpis' | 'products' | 'users' | 'orders' | 'notifications'>('kpis');
  const [orderFilter, setOrderFilter] = useState<string>('all');
  const [orderSearch, setOrderSearch] = useState('');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [confirmDeleteUserId, setConfirmDeleteUserId] = useState<string | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [userSearch, setUserSearch] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState<string>('all');

  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadingSectionId, setUploadingSectionId] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [manualImageInput, setManualImageInput] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [showQuickCloudinarySetup, setShowQuickCloudinarySetup] = useState(false);

  const [webhookForm, setWebhookForm] = useState({
    webhookEnabled: notificationSettings.webhookEnabled,
    webhookUrl: notificationSettings.webhookUrl,
    notifyOnNewOrder: notificationSettings.notifyOnNewOrder,
    notifyOnStatusChange: notificationSettings.notifyOnStatusChange,
    notifyOnLowStock: notificationSettings.notifyOnLowStock,
  });

  const [cloudinaryForm, setCloudinaryForm] = useState({
    cloudName: cloudinarySettings.cloudName,
    uploadPreset: cloudinarySettings.uploadPreset,
    folder: cloudinarySettings.folder || 'friday-store/products',
  });

  React.useEffect(() => {
    setWebhookForm({
      webhookEnabled: notificationSettings.webhookEnabled,
      webhookUrl: notificationSettings.webhookUrl,
      notifyOnNewOrder: notificationSettings.notifyOnNewOrder,
      notifyOnStatusChange: notificationSettings.notifyOnStatusChange,
      notifyOnLowStock: notificationSettings.notifyOnLowStock,
    });
  }, [notificationSettings]);

  React.useEffect(() => {
    setCloudinaryForm({
      cloudName: cloudinarySettings.cloudName,
      uploadPreset: cloudinarySettings.uploadPreset,
      folder: cloudinarySettings.folder || 'friday-store/products',
    });
  }, [cloudinarySettings]);

  const cloudinaryCheck = validateCloudinaryConfig(cloudinarySettings);
  const isCloudinaryReady = cloudinaryCheck.valid;

  // Form state for creating / editing product
  const [productForm, setProductForm] = useState<{
    name: string;
    category: 'electronique' | 'electromenager' | 'vaisselle' | 'deco-maison' | 'gadgets';
    price: number;
    originalPrice: number;
    shortDescription: string;
    description: string;
    featuresText: string;
    richSections: ProductRichSection[];
    stockCount: number;
    sizes: string;
    colors: string;
    images: string[];
  }>({
    name: '',
    category: 'electromenager',
    price: 35000,
    originalPrice: 45000,
    shortDescription: '',
    description: '',
    featuresText: 'Testé et garanti 14 jours\nLivraison express Dakar & Régions',
    richSections: [],
    stockCount: 20,
    sizes: 'Standard, Pack Familial',
    colors: 'Noir Mat (#18181B), Blanc (#F9FAFB)',
    images: ['/assets/images/product_airfryer_digital_1793989489237.jpg'],
  });

  // RESTRICTION CHECK: If current user is not admin
  if (!isAdmin) {
    return (
      <div className="max-w-2xl mx-auto my-16 p-8 sm:p-10 rounded-3xl bg-white border border-rose-200 shadow-xl space-y-6 text-center animate-in fade-in duration-200">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto shadow-xs">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold uppercase tracking-wider">
            Restrictions de Sécurité Actives
          </span>
          <h2 className="text-2xl font-black text-[#10332C] tracking-tight">
            Accès Refusé à la Console Administrateur
          </h2>
          <p className="text-xs sm:text-sm text-[#4A635B] max-w-lg mx-auto leading-relaxed">
            {currentUser ? (
              <>
                Vous êtes actuellement connecté(e) avec le compte <strong>{currentUser.displayName}</strong> avec le rôle{' '}
                <span className="font-bold text-[#10332C]">Client ({currentUser.role})</span>. Les utilisateurs standards ont accès exclusivement à leur <strong>Console Utilisateur</strong> et ne peuvent pas modifier le catalogue ou consulter les commandes globales.
              </>
            ) : (
              'Vous devez vous authentifier avec un compte administrateur autorisé pour accéder à la console de gestion.'
            )}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          {!currentUser ? (
            <button
              onClick={() => openAuthModal('login')}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#10332C] hover:bg-[#0C241F] text-[#C99E69] hover:text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-md border border-[#C99E69]/30 flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4" />
              Connexion Administrateur
            </button>
          ) : (
            <button
              onClick={() => navigateTo('user-console')}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#10332C] hover:bg-[#0C241F] text-[#C99E69] hover:text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-md"
            >
              Aller à ma Console Client
            </button>
          )}
          <button
            onClick={() => navigateTo('home')}
            className="w-full sm:w-auto px-5 py-3 rounded-xl bg-white border border-[#D5E5DE] text-[#10332C] font-bold text-xs hover:bg-[#F8FAF9] transition-colors"
          >
            Retour à la boutique
          </button>
        </div>
      </div>
    );
  }

  // KPI calculations
  const totalRevenue = orders.reduce((sum, ord) => sum + (ord.status !== 'cancelled' ? ord.total : 0), 0);
  const totalOrders = orders.length;
  const avgBasket = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;
  const lowStockProducts = products.filter((p) => p.stockCount <= 10);
  const totalCustomers = users.filter((u) => u.role === 'user').length;
  const suspendedUsersCount = users.filter((u) => u.status === 'suspended').length;

  const selectedOrder: Order | null = selectedOrderId
    ? orders.find((o) => o.id === selectedOrderId) || null
    : null;

  const selectedUser: AppUser | null = selectedUserId
    ? users.find((u) => u.id === selectedUserId) || null
    : null;

  const handlePermanentDeleteUser = async (userId: string) => {
    setDeletingUserId(userId);
    try {
      const result = await deleteUser(userId);
      setConfirmDeleteUserId(null);
      if (selectedUserId === userId) {
        setSelectedUserId(null);
      }
      if (!result.success) {
        showToast(result.error || 'Impossible de supprimer cet utilisateur.');
        return;
      }
      if (result.authDeleted) {
        showToast('Compte, données Firestore et identifiants Firebase Auth supprimés définitivement.');
      } else {
        showToast(
          'Profil Firestore et accès révoqués définitivement (les identifiants Auth seront purgés automatiquement à toute tentative de reconnexion).'
        );
      }
    } finally {
      setDeletingUserId(null);
    }
  };

  const filteredOrders = orders.filter((o) => {
    const matchesStatus = orderFilter === 'all' || o.status === orderFilter;
    const q = orderSearch.trim().toLowerCase();
    if (!q) return matchesStatus;
    const matchesQuery =
      o.orderNumber.toLowerCase().includes(q) ||
      o.customer.fullName.toLowerCase().includes(q) ||
      o.customer.phone.toLowerCase().includes(q) ||
      (o.customer.email || '').toLowerCase().includes(q) ||
      o.customer.address.toLowerCase().includes(q) ||
      o.customer.zoneId.toLowerCase().includes(q);
    return matchesStatus && matchesQuery;
  });

  const filteredUsers = users.filter((u) => {
    const q = userSearch.toLowerCase();
    return (
      u.displayName.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.phone.includes(q) ||
      u.role.toLowerCase().includes(q)
    );
  });

  const filteredProducts = products.filter((p) => {
    const matchesCategory = productCategoryFilter === 'all' || p.category === productCategoryFilter;
    const matchesSearch =
      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.sku.toLowerCase().includes(productSearch.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    setUploadProgress(null);
    setUploadingSectionId(null);
    setUploadError(null);
    setManualImageInput('');
    setProductForm({
      name: '',
      category: 'electromenager',
      price: 35000,
      originalPrice: 45000,
      shortDescription: '',
      description: '',
      featuresText: 'Testé et garanti 14 jours\nLivraison express Dakar & Régions',
      richSections: [],
      stockCount: 20,
      sizes: 'Standard, Pack Familial',
      colors: 'Noir Mat (#18181B), Blanc (#F9FAFB)',
      images: ['/assets/images/product_airfryer_digital_1793989489237.jpg'],
    });
    setProductModalOpen(true);
  };

  const handleOpenEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setUploadProgress(null);
    setUploadingSectionId(null);
    setUploadError(null);
    setManualImageInput('');
    setProductForm({
      name: prod.name,
      category: prod.category,
      price: prod.price,
      originalPrice: prod.originalPrice || prod.price,
      shortDescription: prod.shortDescription,
      description: prod.description,
      featuresText: (prod.features || []).join('\n'),
      richSections: Array.isArray(prod.richSections)
        ? prod.richSections.map((sec) => ({ ...sec }))
        : [],
      stockCount: prod.stockCount,
      sizes: prod.sizes.join(', '),
      colors: prod.colors.map((c) => `${c.name} (${c.hex})`).join(', '),
      images: prod.images.length > 0 ? [...prod.images] : ['/assets/images/product_airfryer_digital_1793989489237.jpg'],
    });
    setProductModalOpen(true);
  };

  const handleUploadFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    if (fileArray.length === 0) return;

    if (!isCloudinaryReady) {
      setShowQuickCloudinarySetup(true);
      setUploadError(
        'Configurez votre Cloud Name et Upload Preset Cloudinary (gratuit) ci-dessous avant de téléverser.'
      );
      return;
    }

    const remainingSlots = MAX_PRODUCT_IMAGES_COUNT - productForm.images.length;
    if (remainingSlots <= 0) {
      setUploadError(`Maximum ${MAX_PRODUCT_IMAGES_COUNT} images par produit.`);
      return;
    }

    setUploadError(null);
    const toUpload = fileArray.slice(0, remainingSlots);
    const productKey = editingProduct?.id || productForm.name || `prod-${Date.now()}`;

    try {
      for (let i = 0; i < toUpload.length; i += 1) {
        setUploadProgress(0);
        const result = await uploadProductImageToCloudinary({
          file: toUpload[i],
          productIdOrSlug: productKey,
          config: cloudinarySettings,
          onProgress: (pct) => setUploadProgress(pct),
        });
        setProductForm((prev) => {
          const nextImages = prev.images.filter(Boolean);
          if (nextImages.length >= MAX_PRODUCT_IMAGES_COUNT) return prev;
          return { ...prev, images: [...nextImages, result.downloadUrl] };
        });
      }
      showToast(`${toUpload.length} image(s) téléversée(s) sur Cloudinary !`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erreur d'upload Cloudinary.";
      setUploadError(msg);
      showToast(msg);
    } finally {
      setUploadProgress(null);
    }
  };

  const handleSaveCloudinarySettings = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const check = validateCloudinaryConfig(cloudinaryForm);
    if (!check.valid) {
      setUploadError(check.error);
      showToast(check.error);
      return;
    }
    await saveCloudinarySettings({
      cloudName: check.cloudName,
      uploadPreset: check.uploadPreset,
      folder: check.folder,
    });
    setUploadError(null);
    setShowQuickCloudinarySetup(false);
  };

  const handleRemoveImage = (index: number) => {
    if (productForm.images.length <= 1) {
      showToast('Chaque produit doit conserver au moins 1 image.');
      return;
    }
    setProductForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, idx) => idx !== index),
    }));
  };

  const handleSetPrimaryImage = (index: number) => {
    if (index === 0) return;
    setProductForm((prev) => {
      const copy = [...prev.images];
      const [chosen] = copy.splice(index, 1);
      return { ...prev, images: [chosen, ...copy] };
    });
  };

  const handleAddManualImageUrl = () => {
    const clean = manualImageInput.trim();
    if (!clean) return;
    if (productForm.images.length >= MAX_PRODUCT_IMAGES_COUNT) {
      showToast(`Maximum ${MAX_PRODUCT_IMAGES_COUNT} images autorisées.`);
      return;
    }
    setProductForm((prev) => ({
      ...prev,
      images: [...prev.images, clean],
    }));
    setManualImageInput('');
  };

  const handleAddRichSection = (type: RichSectionType) => {
    if (productForm.richSections.length >= MAX_RICH_SECTIONS) {
      showToast(`Maximum ${MAX_RICH_SECTIONS} blocs dynamiques autorisés par fiche produit.`);
      return;
    }

    const fallbackImg = productForm.images[1] || productForm.images[0] || '';
    const nextSection: ProductRichSection = {
      id: `sec-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      type,
      title:
        type === 'split'
          ? 'Design pensé pour votre quotidien'
          : type === 'image'
            ? 'Zoom sur les finitions'
            : type === 'highlights'
              ? 'Ce que vous recevez dans le coffret'
              : 'À propos de ce modèle',
      body:
        type === 'highlights'
          ? 'Prise standard adaptée\nNotice illustrée incluse\nGarantie échange Dakar 14 jours'
          : type === 'image'
            ? ''
            : 'Décrivez ici les bénéfices concrets, dimensions, matériaux ou conseils d’utilisation.',
      ...(type === 'image' || type === 'split' ? { imageUrl: fallbackImg } : {}),
      ...(type === 'split' ? { imagePosition: productForm.richSections.length % 2 === 0 ? 'right' : 'left' } : {}),
    };

    setProductForm((prev) => ({
      ...prev,
      richSections: [...prev.richSections, nextSection],
    }));
  };

  const handleUpdateRichSection = (id: string, patch: Partial<ProductRichSection>) => {
    setProductForm((prev) => ({
      ...prev,
      richSections: prev.richSections.map((sec) => (sec.id === id ? { ...sec, ...patch } : sec)),
    }));
  };

  const handleMoveRichSection = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= productForm.richSections.length) return;
    setProductForm((prev) => {
      const next = [...prev.richSections];
      const [moved] = next.splice(index, 1);
      next.splice(target, 0, moved);
      return { ...prev, richSections: next };
    });
  };

  const handleRemoveRichSection = (id: string) => {
    setProductForm((prev) => ({
      ...prev,
      richSections: prev.richSections.filter((sec) => sec.id !== id),
    }));
  };

  const handleUploadSectionImage = async (sectionId: string, file: File) => {
    if (!isCloudinaryReady) {
      setShowQuickCloudinarySetup(true);
      setUploadError(
        'Configurez votre Cloud Name et Upload Preset Cloudinary (gratuit) avant de téléverser une image de section.'
      );
      return;
    }

    setUploadError(null);
    setUploadingSectionId(sectionId);
    const productKey = editingProduct?.id || productForm.name || `prod-${Date.now()}`;

    try {
      const result = await uploadProductImageToCloudinary({
        file,
        productIdOrSlug: `${productKey}-rich`,
        config: cloudinarySettings,
      });
      handleUpdateRichSection(sectionId, { imageUrl: result.downloadUrl });
      showToast('Image de section téléversée sur Cloudinary !');
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erreur d'upload Cloudinary.";
      setUploadError(msg);
      showToast(msg);
    } finally {
      setUploadingSectionId(null);
    }
  };

  const handleInsertDescriptionImageTag = (imageUrl: string, idx: number) => {
    const cleanUrl = imageUrl.trim();
    if (!cleanUrl) return;
    const tag = `\n\n![${productForm.name || 'Aperçu produit'} — Vue ${idx + 1}](${cleanUrl})\n`;
    setProductForm((prev) => ({
      ...prev,
      description: `${prev.description.trimEnd()}${tag}`.slice(0, 5000),
    }));
    showToast('Image insérée dans la description longue !');
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (uploadProgress !== null || uploadingSectionId !== null) {
      showToast('Veuillez patienter la fin du téléversement des images.');
      return;
    }
    if (productForm.images.length === 0) {
      showToast('Ajoutez au moins une image produit.');
      return;
    }

    const parsedSizes = productForm.sizes.split(',').map((s) => s.trim()).filter(Boolean);
    const parsedColors = productForm.colors.split(',').map((raw) => {
      const match = raw.match(/^(.*?)(?:\s*\((.*?)\))?$/);
      const name = match && match[1] ? match[1].trim() : 'Standard';
      const hex = match && match[2] ? match[2].trim() : '#171717';
      return { name, hex };
    });
    const parsedFeatures = productForm.featuresText
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);
    const finalFeatures =
      parsedFeatures.length > 0
        ? parsedFeatures
        : ['Testé et garanti 14 jours', 'Livraison express Dakar & Régions'];
    const cleanedRichSections = sanitizeRichSections(productForm.richSections);

    try {
      if (editingProduct) {
        const updated: Product = {
          ...editingProduct,
          name: productForm.name,
          category: productForm.category,
          price: Number(productForm.price),
          originalPrice: Number(productForm.originalPrice),
          shortDescription: productForm.shortDescription,
          description: (productForm.description || productForm.shortDescription || productForm.name).slice(0, 5000),
          features: finalFeatures,
          richSections: cleanedRichSections,
          stockCount: Number(productForm.stockCount),
          inStock: Number(productForm.stockCount) > 0,
          sizes: parsedSizes,
          colors: parsedColors,
          images: productForm.images,
        };
        await updateProduct(updated);
      } else {
        const newProd: Product = {
          id: `prod-${Date.now()}`,
          name: productForm.name,
          slug: productForm.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || `prod-${Date.now()}`,
          category: productForm.category,
          price: Number(productForm.price),
          originalPrice: Number(productForm.originalPrice),
          shortDescription: productForm.shortDescription,
          description: (productForm.description || productForm.shortDescription || productForm.name).slice(0, 5000),
          features: finalFeatures,
          richSections: cleanedRichSections,
          stockCount: Number(productForm.stockCount),
          inStock: Number(productForm.stockCount) > 0,
          sizes: parsedSizes,
          colors: parsedColors,
          images: productForm.images,
          isFeatured: false,
          isNew: true,
          rating: 5.0,
          reviewCount: 1,
          sku: `FS-${Math.floor(100 + Math.random() * 900)}`,
        };
        await addProduct(newProd);
      }
      setProductModalOpen(false);
    } catch {
      showToast("Erreur lors de l'enregistrement du produit dans Firestore.");
    }
  };

  const handleSaveWebhookSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (webhookForm.webhookEnabled && !isValidWebhookUrl(webhookForm.webhookUrl)) {
      showToast('Veuillez saisir une URL Webhook HTTP/HTTPS valide.');
      return;
    }
    await saveNotificationSettings(webhookForm);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#EAF2EE] gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#5CD1A9] inline-block animate-pulse" />
            <span className="text-xs font-mono uppercase tracking-widest text-[#10332C] font-bold">
              Console d'Administration Globale · Friday Store Dakar
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#10332C] mt-1">
            Tableau de Bord &amp; Contrôle de Gestion
          </h1>
          <p className="text-xs text-[#4A635B] mt-1">
            Connecté en tant que <strong>{currentUser?.displayName}</strong> (Super Administrateur)
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleOpenAddProduct}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#10332C] to-[#1A4C40] hover:from-[#0C241F] hover:to-[#143D34] text-[#C99E69] hover:text-white font-bold text-xs flex items-center gap-2 transition-colors shrink-0 shadow-md border border-[#C99E69]/30"
          >
            <Plus className="w-4 h-4" />
            Ajouter un produit
          </button>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex items-center gap-2 border-b border-[#EAF2EE] overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('kpis')}
          className={`py-3 px-5 text-xs font-bold border-b-2 transition-all whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'kpis'
              ? 'text-[#10332C] border-[#10332C]'
              : 'text-[#4A635B] border-transparent hover:text-[#10332C]'
          }`}
        >
          <TrendingUp className="w-4 h-4 text-[#C99E69]" />
          Vue d'Ensemble &amp; KPIs
        </button>

        <button
          onClick={() => setActiveTab('products')}
          className={`py-3 px-5 text-xs font-bold border-b-2 transition-all whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'products'
              ? 'text-[#10332C] border-[#10332C]'
              : 'text-[#4A635B] border-transparent hover:text-[#10332C]'
          }`}
        >
          <Package className="w-4 h-4 text-[#C99E69]" />
          Gestion des Produits ({products.length})
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`py-3 px-5 text-xs font-bold border-b-2 transition-all whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'users'
              ? 'text-[#10332C] border-[#10332C]'
              : 'text-[#4A635B] border-transparent hover:text-[#10332C]'
          }`}
        >
          <Users className="w-4 h-4 text-[#5CD1A9]" />
          Gestion des Utilisateurs ({users.length})
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`py-3 px-5 text-xs font-bold border-b-2 transition-all whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'orders'
              ? 'text-[#10332C] border-[#10332C]'
              : 'text-[#4A635B] border-transparent hover:text-[#10332C]'
          }`}
        >
          <ShoppingBag className="w-4 h-4 text-[#C99E69]" />
          Gestion des Commandes ({orders.length})
        </button>

        <button
          onClick={() => setActiveTab('notifications')}
          className={`py-3 px-5 text-xs font-bold border-b-2 transition-all whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'notifications'
              ? 'text-[#10332C] border-[#10332C]'
              : 'text-[#4A635B] border-transparent hover:text-[#10332C]'
          }`}
        >
          <Bell className="w-4 h-4 text-[#C99E69]" />
          Alertes, Webhooks &amp; Cloudinary
          {unreadNotificationsCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-mono">
              {unreadNotificationsCount}
            </span>
          )}
        </button>
      </div>

      {/* TAB 1: KPIS & OVERVIEW */}
      {activeTab === 'kpis' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-5 rounded-2xl bg-white border border-[#D5E5DE] shadow-sm space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#4A635B]">Chiffre d'Affaires</span>
                <DollarSign className="w-4 h-4 text-[#5CD1A9]" />
              </div>
              <p className="text-2xl font-black text-[#10332C] font-mono">{formatFCFA(totalRevenue)}</p>
              <span className="text-[11px] text-[#10332C] font-semibold">Wave + Orange Money + Cash</span>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-[#D5E5DE] shadow-sm space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#4A635B]">Commandes Totales</span>
                <ShoppingBag className="w-4 h-4 text-[#C99E69]" />
              </div>
              <p className="text-2xl font-black text-[#10332C] font-mono">{totalOrders}</p>
              <span className="text-[11px] text-neutral-500 font-medium">Dakar &amp; Régions</span>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-[#D5E5DE] shadow-sm space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#4A635B]">Clients Enregistrés</span>
                <Users className="w-4 h-4 text-[#10332C]" />
              </div>
              <p className="text-2xl font-black text-[#10332C] font-mono">{totalCustomers}</p>
              <span className="text-[11px] text-[#4A635B] font-medium">
                {suspendedUsersCount > 0 ? `${suspendedUsersCount} suspendu(s)` : 'Tous actifs'}
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-[#D5E5DE] shadow-sm space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#4A635B]">Alertes Stock Faible</span>
                <AlertTriangle className="w-4 h-4 text-amber-500" />
              </div>
              <p className="text-2xl font-black text-[#10332C] font-mono">{lowStockProducts.length}</p>
              <span className="text-[11px] text-amber-600 font-semibold">Moins de 10 unités restantes</span>
            </div>
          </div>

          {/* Quick Shortcuts */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div
              onClick={() => setActiveTab('products')}
              className="p-6 rounded-2xl bg-[#F8FAF9] hover:bg-[#EBF4F0] border border-[#D5E5DE] cursor-pointer transition-all space-y-2"
            >
              <Package className="w-6 h-6 text-[#10332C]" />
              <h4 className="font-bold text-[#10332C]">Gestion Complète Produits</h4>
              <p className="text-xs text-[#4A635B]">
                Ajouter, modifier prix FCFA, gérer le stock en direct et les options variantes.
              </p>
            </div>

            <div
              onClick={() => setActiveTab('users')}
              className="p-6 rounded-2xl bg-[#F8FAF9] hover:bg-[#EBF4F0] border border-[#D5E5DE] cursor-pointer transition-all space-y-2"
            >
              <Users className="w-6 h-6 text-[#5CD1A9]" />
              <h4 className="font-bold text-[#10332C]">Gestion des Utilisateurs</h4>
              <p className="text-xs text-[#4A635B]">
                Promouvoir des admins, bloquer/suspendre des comptes et surveiller les restrictions.
              </p>
            </div>

            <div
              onClick={() => setActiveTab('orders')}
              className="p-6 rounded-2xl bg-[#F8FAF9] hover:bg-[#EBF4F0] border border-[#D5E5DE] cursor-pointer transition-all space-y-2"
            >
              <Truck className="w-6 h-6 text-[#C99E69]" />
              <h4 className="font-bold text-[#10332C]">Expéditions &amp; Coursiers</h4>
              <p className="text-xs text-[#4A635B]">
                Modifier les statuts en direct et échanger avec les clients sur WhatsApp.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PRODUCTS MANAGEMENT */}
      {activeTab === 'products' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder="Rechercher par nom, SKU..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-[#D5E5DE] text-xs text-[#10332C]"
                />
              </div>

              <select
                value={productCategoryFilter}
                onChange={(e) => setProductCategoryFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-white border border-[#D5E5DE] text-xs text-[#10332C]"
              >
                <option value="all">Toutes les catégories</option>
                <option value="electromenager">Électroménager</option>
                <option value="electronique">Électronique &amp; Tech</option>
                <option value="vaisselle">Vaisselle &amp; Cuisine</option>
                <option value="deco-maison">Déco Maison</option>
                <option value="gadgets">Gadgets du Quotidien</option>
              </select>
            </div>

            <span className="text-xs text-[#4A635B] font-mono">
              {filteredProducts.length} produit(s)
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((prod) => (
              <div
                key={prod.id}
                className="p-5 rounded-2xl bg-white border border-[#D5E5DE] shadow-sm flex flex-col justify-between space-y-4"
              >
                <div className="flex gap-4">
                  <img
                    src={prod.images[0]}
                    alt={prod.name}
                    className="w-16 h-16 rounded-xl object-cover bg-neutral-100 shrink-0 border border-[#EAF2EE]"
                  />
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] text-[#C99E69] uppercase tracking-wider font-bold block">
                      {prod.category} · {prod.sku}
                    </span>
                    <h3 className="text-sm font-bold text-[#10332C] truncate">{prod.name}</h3>
                    <p className="text-xs text-[#10332C] font-mono font-bold mt-1">
                      {formatFCFA(prod.price)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-3 border-t border-[#EAF2EE]">
                  <div className="flex items-center gap-2">
                    <span className={`text-[11px] font-mono ${prod.stockCount <= 5 ? 'text-rose-600 font-bold' : 'text-neutral-500'}`}>
                      Stock: {prod.stockCount}
                    </span>
                    {/* Quick stock +/- */}
                    <button
                      onClick={() => updateProduct({ ...prod, stockCount: Math.max(0, prod.stockCount - 1) })}
                      className="px-1.5 py-0.5 rounded bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-[10px]"
                      title="Diminuer stock"
                    >
                      -1
                    </button>
                    <button
                      onClick={() => updateProduct({ ...prod, stockCount: prod.stockCount + 5 })}
                      className="px-1.5 py-0.5 rounded bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-[10px]"
                      title="Ajouter 5 unités"
                    >
                      +5
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenEditProduct(prod)}
                      className="p-2 rounded-lg text-neutral-500 hover:text-[#10332C] hover:bg-[#EBF4F0] transition-colors"
                      title="Modifier produit"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Supprimer le produit "${prod.name}" ?`)) {
                          deleteProduct(prod.id);
                          showToast('Produit supprimé.');
                        }
                      }}
                      className="p-2 rounded-lg text-neutral-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Supprimer produit"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: USERS MANAGEMENT (RBAC) */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Rechercher par nom, email, téléphone..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-[#D5E5DE] text-xs text-[#10332C]"
              />
            </div>

            <div className="flex items-center gap-2 text-xs text-[#4A635B]">
              <span className="font-semibold">{users.length} utilisateurs au total</span>
              <span>· {users.filter((u) => u.role === 'admin').length} admin(s)</span>
              <span className="hidden sm:inline font-mono text-neutral-500">
                · Cliquez sur une ligne pour voir la fiche
              </span>
            </div>
          </div>

          {adminAuthDeletionReady === false && (
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <strong>Note Firebase Auth Admin :</strong> lors d&apos;une suppression par l&apos;admin, le profil Firestore, les notifications et l&apos;accès sont immédiatement révoqués et purgés, et toute tentative de reconnexion détruit automatiquement les identifiants Auth restants. Pour effacer les identifiants Firebase Auth à la seconde même côté serveur sans attendre la reconnexion, configurez <code className="font-mono bg-amber-100 px-1 rounded">FIREBASE_SERVICE_ACCOUNT_JSON</code> dans les secrets serveur.
              </div>
            </div>
          )}

          <div className="overflow-x-auto rounded-3xl border border-[#D5E5DE] bg-white shadow-sm">
            <table className="w-full text-left text-xs text-[#2D453D]">
              <thead className="bg-[#F8FAF9] text-[#10332C] uppercase text-[10px] tracking-wider border-b border-[#EAF2EE] font-bold">
                <tr>
                  <th className="p-4">Utilisateur</th>
                  <th className="p-4">Contact</th>
                  <th className="p-4">Localisation</th>
                  <th className="p-4">Rôle (RBAC)</th>
                  <th className="p-4">Statut</th>
                  <th className="p-4 text-right">Actions &amp; Détails</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAF2EE] font-medium">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-xs text-[#6A887E]">
                      Aucun utilisateur ne correspond à votre recherche.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => (
                    <tr
                      key={u.id}
                      onClick={() => setSelectedUserId(u.id)}
                      className="hover:bg-[#EBF4F0]/55 transition-colors cursor-pointer"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          {u.avatarUrl ? (
                            <img
                              src={u.avatarUrl}
                              alt={u.displayName}
                              className="w-8 h-8 rounded-full object-cover border border-[#D5E5DE] shrink-0"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                                u.role === 'admin' ? 'bg-[#10332C] text-[#C99E69]' : 'bg-[#EBF4F0] text-[#10332C]'
                              }`}
                            >
                              {u.displayName.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <strong className="text-[#10332C] text-sm block">{u.displayName}</strong>
                            <span className="text-[10px] text-neutral-400 font-mono">ID: {u.id}</span>
                          </div>
                        </div>
                      </td>

                      <td className="p-4">
                        <p className="text-[#10332C]">{u.email}</p>
                        <p className="text-neutral-500 font-mono">{u.phone || 'Non renseigné'}</p>
                      </td>

                      <td className="p-4">
                        <p className="text-[#2D453D]">{u.city || 'Dakar'}</p>
                        <p className="text-[11px] text-neutral-400 truncate max-w-xs">{u.address || '—'}</p>
                      </td>

                      <td className="p-4" onClick={(e) => e.stopPropagation()}>
                        <select
                          value={u.role}
                          onChange={(e) => {
                            const newR = e.target.value as UserRole;
                            updateUserRole(u.id, newR);
                            showToast(`Rôle de ${u.displayName} modifié en "${newR}".`);
                          }}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${
                            u.role === 'admin'
                              ? 'bg-[#10332C] text-[#C99E69] border-[#C99E69]/40'
                              : 'bg-white text-[#10332C] border-[#D5E5DE]'
                          }`}
                        >
                          <option value="user">👤 Client (Restreint)</option>
                          <option value="admin">👑 Administrateur</option>
                        </select>
                      </td>

                      <td className="p-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1 ${
                            u.status === 'active'
                              ? 'bg-[#EBF4F0] text-[#10332C] border border-[#5CD1A9]/40'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {u.status === 'active' ? (
                            <>
                              <CheckCircle2 className="w-3 h-3 text-[#5CD1A9]" />
                              Actif
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3 text-rose-600" />
                              Suspendu
                            </>
                          )}
                        </span>
                      </td>

                      <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedUserId(u.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#10332C] hover:bg-[#0C241F] text-[#C99E69] hover:text-white font-bold text-xs transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            Détails
                          </button>

                          {u.status === 'active' ? (
                            <button
                              onClick={() => {
                                updateUserStatus(u.id, 'suspended');
                                showToast(`Compte de ${u.displayName} suspendu avec succès.`);
                              }}
                              className="px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 text-[11px] font-bold transition-colors"
                              title="Suspendre ce compte"
                            >
                              Suspendre
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                updateUserStatus(u.id, 'active');
                                showToast(`Compte de ${u.displayName} réactivé.`);
                              }}
                              className="px-2.5 py-1.5 rounded-lg bg-[#EBF4F0] hover:bg-[#D5E5DE] text-[#10332C] text-[11px] font-bold transition-colors"
                              title="Réactiver ce compte"
                            >
                              Réactiver
                            </button>
                          )}

                          {confirmDeleteUserId === u.id ? (
                            <div className="inline-flex items-center gap-1">
                              <button
                                type="button"
                                disabled={deletingUserId === u.id}
                                onClick={() => handlePermanentDeleteUser(u.id)}
                                className="px-2 py-1 rounded-lg bg-rose-600 text-white text-[11px] font-bold hover:bg-rose-700 disabled:opacity-50"
                              >
                                {deletingUserId === u.id ? 'Suppression...' : 'Confirmer'}
                              </button>
                              <button
                                type="button"
                                disabled={deletingUserId === u.id}
                                onClick={() => setConfirmDeleteUserId(null)}
                                className="px-2 py-1 rounded-lg bg-neutral-100 text-[#2D453D] text-[11px] font-semibold hover:bg-neutral-200 disabled:opacity-50"
                              >
                                Annuler
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteUserId(u.id)}
                              className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                              title="Supprimer l'utilisateur"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: ORDERS MANAGEMENT */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#2D453D] font-semibold">Filtrer par statut :</span>
                <select
                  value={orderFilter}
                  onChange={(e) => setOrderFilter(e.target.value)}
                  className="bg-white border border-[#D5E5DE] rounded-xl px-3 py-1.5 text-xs text-[#10332C] font-medium shadow-xs focus:outline-none focus:border-[#10332C]"
                >
                  <option value="all">Toutes les commandes</option>
                  <option value="pending">En attente (Pending)</option>
                  <option value="confirmed">Confirmée</option>
                  <option value="shipping">En cours de livraison (Coursier)</option>
                  <option value="delivered">Livrée (Succès)</option>
                  <option value="cancelled">Annulée</option>
                </select>
              </div>
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-[#6A887E] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  placeholder="Rechercher réf, client, tél..."
                  className="pl-8 pr-3 py-1.5 bg-white border border-[#D5E5DE] rounded-xl text-xs text-[#10332C] focus:outline-none focus:border-[#10332C] w-56"
                />
              </div>
            </div>
            <span className="text-xs text-neutral-500 font-mono">
              {filteredOrders.length} commande(s) · Cliquez sur une ligne pour voir les détails
            </span>
          </div>

          <div className="overflow-x-auto rounded-3xl border border-[#D5E5DE] bg-white shadow-sm">
            <table className="w-full text-left text-xs text-[#2D453D]">
              <thead className="bg-[#F8FAF9] text-[#10332C] uppercase text-[10px] tracking-wider border-b border-[#EAF2EE] font-bold">
                <tr>
                  <th className="p-4">Réf &amp; Date</th>
                  <th className="p-4">Client &amp; Téléphone</th>
                  <th className="p-4">Adresse &amp; Zone</th>
                  <th className="p-4">Articles</th>
                  <th className="p-4">Paiement &amp; Total</th>
                  <th className="p-4">Statut Actuel</th>
                  <th className="p-4 text-right">Actions &amp; Détails</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAF2EE] font-medium">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-xs text-[#6A887E]">
                      Aucune commande ne correspond à vos critères.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((ord) => (
                    <tr
                      key={ord.id}
                      onClick={() => setSelectedOrderId(ord.id)}
                      className="hover:bg-[#EBF4F0]/55 transition-colors cursor-pointer"
                    >
                      <td className="p-4">
                        <span className="font-mono text-[#10332C] font-bold block">{ord.orderNumber}</span>
                        <span className="text-[10px] text-neutral-400">
                          {new Date(ord.createdAt).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </td>
                      <td className="p-4">
                        <strong className="text-[#10332C] block">{ord.customer.fullName}</strong>
                        <span className="text-neutral-500 font-mono">{ord.customer.phone}</span>
                      </td>
                      <td className="p-4">
                        <p className="max-w-xs text-[11px] text-[#2D453D] truncate">{ord.customer.address}</p>
                        <span className="text-[10px] text-[#C99E69] font-bold block">{ord.customer.zoneId}</span>
                      </td>
                      <td className="p-4 font-mono font-semibold text-[#10332C]">
                        {ord.items.reduce((sum, item) => sum + item.quantity, 0)} article(s)
                      </td>
                      <td className="p-4">
                        <span className="font-mono text-[#10332C] font-bold block">{formatFCFA(ord.total)}</span>
                        <span className="text-[10px] text-neutral-500 uppercase">{ord.customer.paymentMethod}</span>
                      </td>
                      <td className="p-4" onClick={(e) => e.stopPropagation()}>
                        <select
                          value={ord.status}
                          onChange={(e) => {
                            updateOrderStatus(ord.id, e.target.value as OrderStatus);
                            showToast(`Statut de la commande ${ord.orderNumber} mis à jour.`);
                          }}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold focus:outline-none border ${
                            ord.status === 'delivered'
                              ? 'bg-[#EBF4F0] text-[#10332C] border-[#5CD1A9]'
                              : ord.status === 'shipping'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : ord.status === 'confirmed'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : ord.status === 'cancelled'
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : 'bg-neutral-100 text-neutral-700 border-neutral-300'
                          }`}
                        >
                          <option value="pending">En attente</option>
                          <option value="confirmed">Confirmée</option>
                          <option value="shipping">En livraison</option>
                          <option value="delivered">Livrée (Succès)</option>
                          <option value="cancelled">Annulée</option>
                        </select>
                      </td>
                      <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="inline-flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedOrderId(ord.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#10332C] hover:bg-[#0C241F] text-[#C99E69] hover:text-white font-bold text-xs transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            Détails
                          </button>
                          <a
                            href={generateStatusWhatsAppLink(ord, ord.status)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#EBF4F0] hover:bg-[#10332C] text-[#10332C] hover:text-[#C99E69] font-bold text-xs transition-colors"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            WhatsApp
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: NOTIFICATIONS & AUTOMATISATION */}
      {activeTab === 'notifications' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Real-Time Alerts Feed */}
          <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-[#D5E5DE] shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#EAF2EE]">
              <div>
                <h3 className="text-base font-bold text-[#10332C] flex items-center gap-2">
                  <Bell className="w-4 h-4 text-[#C99E69]" />
                  Journal d&apos;Alertes Boutique en Direct
                </h3>
                <p className="text-xs text-[#4A635B]">
                  Nouvelles commandes clients et alertes stock faible synchronisées via Firestore.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => sendTestNotification()}
                  className="px-3 py-1.5 rounded-xl bg-[#EBF4F0] hover:bg-[#D5E5DE] text-[#10332C] font-bold text-xs flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  Tester
                </button>
                {unreadNotificationsCount > 0 && (
                  <button
                    type="button"
                    onClick={() => markAllNotificationsRead()}
                    className="px-3 py-1.5 rounded-xl bg-[#10332C] text-[#C99E69] hover:text-white font-bold text-xs flex items-center gap-1.5"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    Tout lire
                  </button>
                )}
              </div>
            </div>

            {notifications.length === 0 ? (
              <div className="py-12 text-center text-xs text-[#6A887E]">
                Aucune alerte enregistrée pour le moment. Cliquez sur « Tester » pour vérifier le flux temps réel.
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[520px] overflow-y-auto pr-1">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`p-4 rounded-2xl border transition-colors flex items-start justify-between gap-3 ${
                      !n.read
                        ? 'bg-[#EBF4F0]/55 border-[#10332C]/25'
                        : 'bg-[#F8FAF9] border-[#EAF2EE]'
                    }`}
                  >
                    <div
                      onClick={() => !n.read && markNotificationRead(n.id)}
                      className="flex items-start gap-3 flex-1 cursor-pointer"
                    >
                      <div className="mt-0.5 shrink-0">
                        {n.type === 'low_stock' ? (
                          <AlertTriangle className="w-4 h-4 text-amber-600" />
                        ) : (
                          <ShoppingBag className="w-4 h-4 text-[#10332C]" />
                        )}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-bold text-[#10332C]">{n.title}</p>
                          {!n.read && (
                            <span className="px-1.5 py-0.5 rounded bg-rose-600 text-white text-[9px] font-bold uppercase">
                              Nouveau
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#4A635B]">{n.message}</p>
                        <p className="text-[10px] text-[#8EA89F] font-mono">
                          {new Date(n.createdAt).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => deleteNotification(n.id)}
                      className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-600 hover:bg-rose-50 shrink-0"
                      title="Supprimer la notification"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right: Browser Push & External Webhook Config */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-[#D5E5DE] shadow-sm space-y-3">
              <h4 className="text-sm font-bold text-[#10332C]">Alertes Push Navigateur (Admin)</h4>
              <p className="text-xs text-[#4A635B] leading-relaxed">
                Recevez une alerte système sur votre ordinateur ou smartphone dès qu&apos;un client passe commande, même lorsque l&apos;onglet est réduit.
              </p>
              <div className="flex items-center justify-between pt-2">
                <span className="text-xs font-mono font-bold text-[#10332C]">
                  Statut :{' '}
                  {browserPushPermission === 'granted'
                    ? 'Autorisées ✓'
                    : browserPushPermission === 'denied'
                    ? 'Bloquées'
                    : browserPushPermission === 'unsupported'
                    ? 'Non supporté'
                    : 'En attente'}
                </span>
                {browserPushPermission !== 'granted' && browserPushPermission !== 'unsupported' && (
                  <button
                    type="button"
                    onClick={() => requestBrowserPushPermission()}
                    className="px-4 py-2 rounded-xl bg-[#10332C] text-[#C99E69] hover:text-white font-bold text-xs"
                  >
                    Activer maintenant
                  </button>
                )}
              </div>
            </div>

            <form
              onSubmit={handleSaveWebhookSettings}
              className="bg-white p-6 rounded-3xl border border-[#D5E5DE] shadow-sm space-y-4 text-xs"
            >
              <div className="flex items-center gap-2">
                <Link2 className="w-4 h-4 text-[#C99E69]" />
                <h4 className="text-sm font-bold text-[#10332C]">
                  Webhook Automatique (WhatsApp / Email / Make)
                </h4>
              </div>
              <p className="text-[#4A635B] leading-relaxed">
                Connectez un scénario Make, Zapier, n8n ou API WhatsApp Business pour déclencher automatiquement un message client ou un e-mail lors de chaque événement.
              </p>

              <label className="flex items-center justify-between p-3 rounded-xl bg-[#F8FAF9] border border-[#EAF2EE] cursor-pointer">
                <span className="font-bold text-[#10332C]">Activer l&apos;envoi Webhook automatique</span>
                <input
                  type="checkbox"
                  checked={webhookForm.webhookEnabled}
                  onChange={(e) =>
                    setWebhookForm((prev) => ({ ...prev, webhookEnabled: e.target.checked }))
                  }
                  className="accent-[#10332C] w-4 h-4"
                />
              </label>

              <div className="space-y-1">
                <label className="font-bold text-[#2D453D]">URL du Webhook (POST JSON)</label>
                <input
                  type="url"
                  value={webhookForm.webhookUrl}
                  onChange={(e) =>
                    setWebhookForm((prev) => ({ ...prev, webhookUrl: e.target.value }))
                  }
                  placeholder="https://hook.eu1.make.com/..."
                  className="w-full px-3 py-2.5 rounded-xl bg-[#F8FAF9] border border-[#D5E5DE] text-[#10332C] font-mono focus:outline-none focus:border-[#10332C]"
                />
              </div>

              <div className="space-y-2 pt-1">
                <span className="font-bold text-[#2D453D] block">Événements déclencheurs :</span>
                <label className="flex items-center gap-2 text-[#2D453D]">
                  <input
                    type="checkbox"
                    checked={webhookForm.notifyOnNewOrder}
                    onChange={(e) =>
                      setWebhookForm((prev) => ({ ...prev, notifyOnNewOrder: e.target.checked }))
                    }
                    className="accent-[#10332C]"
                  />
                  Nouvelle commande reçue (order.created)
                </label>
                <label className="flex items-center gap-2 text-[#2D453D]">
                  <input
                    type="checkbox"
                    checked={webhookForm.notifyOnStatusChange}
                    onChange={(e) =>
                      setWebhookForm((prev) => ({ ...prev, notifyOnStatusChange: e.target.checked }))
                    }
                    className="accent-[#10332C]"
                  />
                  Changement de statut livraison (order.status_updated)
                </label>
                <label className="flex items-center gap-2 text-[#2D453D]">
                  <input
                    type="checkbox"
                    checked={webhookForm.notifyOnLowStock}
                    onChange={(e) =>
                      setWebhookForm((prev) => ({ ...prev, notifyOnLowStock: e.target.checked }))
                    }
                    className="accent-[#10332C]"
                  />
                  Alerte stock critique &le; 5 unités (product.low_stock)
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#10332C] to-[#1A4C40] text-[#C99E69] hover:text-white font-bold text-xs shadow-md"
              >
                Enregistrer la configuration Webhook
              </button>
            </form>

            {/* Cloudinary Free Image Hosting Configuration */}
            <form
              onSubmit={handleSaveCloudinarySettings}
              className="bg-white p-6 rounded-3xl border border-[#D5E5DE] shadow-sm space-y-4 text-xs"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Cloud className="w-4 h-4 text-[#10332C]" />
                  <h4 className="text-sm font-bold text-[#10332C]">
                    Hébergement Images Gratuit (Cloudinary)
                  </h4>
                </div>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    isCloudinaryReady
                      ? 'bg-[#EBF4F0] text-[#10332C]'
                      : 'bg-amber-50 text-amber-800 border border-amber-200'
                  }`}
                >
                  {isCloudinaryReady ? 'Connecté ✓' : 'À configurer'}
                </span>
              </div>
              <p className="text-[#4A635B] leading-relaxed">
                Remplace Firebase Storage sans carte bancaire : créez un compte gratuit sur{' '}
                <strong className="text-[#10332C]">cloudinary.com</strong>, puis créez un{' '}
                <strong className="text-[#10332C]">Upload Preset en mode « Unsigned »</strong> dans Settings → Upload.
              </p>

              <div className="space-y-1">
                <label className="font-bold text-[#2D453D]">Cloud Name</label>
                <input
                  type="text"
                  value={cloudinaryForm.cloudName}
                  onChange={(e) =>
                    setCloudinaryForm((prev) => ({ ...prev, cloudName: e.target.value }))
                  }
                  placeholder="Ex: dfridaystore221"
                  className="w-full px-3 py-2.5 rounded-xl bg-[#F8FAF9] border border-[#D5E5DE] text-[#10332C] font-mono focus:outline-none focus:border-[#10332C]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#2D453D]">Upload Preset (mode Unsigned)</label>
                <input
                  type="text"
                  value={cloudinaryForm.uploadPreset}
                  onChange={(e) =>
                    setCloudinaryForm((prev) => ({ ...prev, uploadPreset: e.target.value }))
                  }
                  placeholder="Ex: friday_products_unsigned"
                  className="w-full px-3 py-2.5 rounded-xl bg-[#F8FAF9] border border-[#D5E5DE] text-[#10332C] font-mono focus:outline-none focus:border-[#10332C]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#2D453D]">Dossier Cloudinary (optionnel)</label>
                <input
                  type="text"
                  value={cloudinaryForm.folder}
                  onChange={(e) =>
                    setCloudinaryForm((prev) => ({ ...prev, folder: e.target.value }))
                  }
                  placeholder="friday-store/products"
                  className="w-full px-3 py-2.5 rounded-xl bg-[#F8FAF9] border border-[#D5E5DE] text-[#10332C] font-mono focus:outline-none focus:border-[#10332C]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-[#10332C] hover:bg-[#0C241F] text-[#C99E69] hover:text-white font-bold text-xs shadow-md"
              >
                Enregistrer Cloudinary
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Add / Edit Product Modal */}
      {productModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-white border border-[#D5E5DE] rounded-3xl p-6 text-[#10332C] space-y-4 max-h-[90vh] overflow-y-auto shadow-2xl">
            <h3 className="text-lg font-bold text-[#10332C]">
              {editingProduct ? 'Modifier le produit' : 'Ajouter un nouveau produit dropshipping'}
            </h3>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-[#2D453D] font-bold">Nom du produit *</label>
                <input
                  type="text"
                  required
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  placeholder="Ex: Friteuse Sans Huile 6L Digitale"
                  className="w-full px-3 py-2.5 rounded-xl bg-[#F8FAF9] border border-[#D5E5DE] text-[#10332C] focus:outline-none focus:border-[#10332C]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[#2D453D] font-bold">Rayon / Catégorie *</label>
                  <select
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value as any })}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#F8FAF9] border border-[#D5E5DE] text-[#10332C] focus:outline-none focus:border-[#10332C]"
                  >
                    <option value="electromenager">Électroménager</option>
                    <option value="electronique">Électronique &amp; Tech</option>
                    <option value="vaisselle">Vaisselle &amp; Cuisine</option>
                    <option value="deco-maison">Déco Maison</option>
                    <option value="gadgets">Gadgets du Quotidien</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[#2D453D] font-bold">Stock disponible *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={productForm.stockCount}
                    onChange={(e) => setProductForm({ ...productForm, stockCount: Number(e.target.value) })}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#F8FAF9] border border-[#D5E5DE] text-[#10332C] focus:outline-none focus:border-[#10332C]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[#2D453D] font-bold">Prix en FCFA *</label>
                  <input
                    type="number"
                    required
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: Number(e.target.value) })}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#F8FAF9] border border-[#D5E5DE] text-[#10332C] font-mono focus:outline-none focus:border-[#10332C]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[#2D453D] font-bold">Prix barré (promo)</label>
                  <input
                    type="number"
                    value={productForm.originalPrice}
                    onChange={(e) => setProductForm({ ...productForm, originalPrice: Number(e.target.value) })}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#F8FAF9] border border-[#D5E5DE] text-[#10332C] font-mono focus:outline-none focus:border-[#10332C]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[#2D453D] font-bold">Description courte</label>
                <input
                  type="text"
                  value={productForm.shortDescription}
                  onChange={(e) => setProductForm({ ...productForm, shortDescription: e.target.value })}
                  placeholder="Ex: Capacité 6L, écran tactile LCD & cuisson saine"
                  className="w-full px-3 py-2.5 rounded-xl bg-[#F8FAF9] border border-[#D5E5DE] text-[#10332C] focus:outline-none focus:border-[#10332C]"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <label className="text-[#2D453D] font-bold">
                    Description longue &amp; dynamique (images intégrées possibles)
                  </label>
                  <span className="text-[10px] font-mono text-[#6A887E]">
                    {productForm.description.length}/5000
                  </span>
                </div>
                <textarea
                  rows={5}
                  maxLength={5000}
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  placeholder={
                    "Rédigez une description complète.\nAstuce : utilisez « ## Titre » pour les sous-titres et « ![Légende](https://...) » pour insérer une image dans le texte."
                  }
                  className="w-full px-3 py-2.5 rounded-xl bg-[#F8FAF9] border border-[#D5E5DE] text-[#10332C] focus:outline-none focus:border-[#10332C] leading-relaxed"
                />
                {productForm.images.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                    <span className="text-[10px] text-[#6A887E] font-medium">
                      Insérer une photo dans le texte :
                    </span>
                    {productForm.images.map((imgUrl, idx) => (
                      <button
                        key={`inline-pick-${idx}`}
                        type="button"
                        onClick={() => handleInsertDescriptionImageTag(imgUrl, idx)}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-[#EBF4F0] hover:bg-[#D5E5DE] text-[#10332C] text-[10px] font-bold transition-colors"
                      >
                        <img src={imgUrl} alt="" className="w-3.5 h-3.5 rounded object-cover" />
                        + Photo #{idx + 1}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-[#2D453D] font-bold">
                  Points forts &amp; caractéristiques (1 ligne par point)
                </label>
                <textarea
                  rows={3}
                  value={productForm.featuresText}
                  onChange={(e) => setProductForm({ ...productForm, featuresText: e.target.value })}
                  placeholder={"Testé et garanti 14 jours\nLivraison express Dakar & Régions\nFaible consommation électrique"}
                  className="w-full px-3 py-2 rounded-xl bg-[#F8FAF9] border border-[#D5E5DE] text-[#10332C] focus:outline-none focus:border-[#10332C]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[#2D453D] font-bold">Options / Modèles (séparées par des virgules)</label>
                <input
                  type="text"
                  value={productForm.sizes}
                  onChange={(e) => setProductForm({ ...productForm, sizes: e.target.value })}
                  placeholder="Ex: Standard 6L, Pack Familial 8L"
                  className="w-full px-3 py-2.5 rounded-xl bg-[#F8FAF9] border border-[#D5E5DE] text-[#10332C] focus:outline-none focus:border-[#10332C]"
                />
              </div>

              <div className="space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <label className="text-[#2D453D] font-bold flex items-center gap-1.5">
                    <span>
                      Photos du produit (Cloudinary · {productForm.images.length}/{MAX_PRODUCT_IMAGES_COUNT})
                    </span>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                        isCloudinaryReady
                          ? 'bg-[#EBF4F0] text-[#10332C]'
                          : 'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}
                    >
                      {isCloudinaryReady ? cloudinarySettings.cloudName : 'À connecter'}
                    </span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowQuickCloudinarySetup((prev) => !prev)}
                    className="text-[10px] font-bold text-[#10332C] underline hover:text-[#C99E69]"
                  >
                    {showQuickCloudinarySetup ? 'Masquer config' : 'Configurer Cloudinary'}
                  </button>
                </div>

                {/* Inline Cloudinary Quick Config when missing or requested */}
                {(!isCloudinaryReady || showQuickCloudinarySetup) && (
                  <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[11px] font-bold text-amber-950 flex items-center gap-1.5">
                        <Cloud className="w-3.5 h-3.5 text-amber-700" />
                        Connexion Cloudinary gratuite (sans carte bancaire)
                      </p>
                      <span className="text-[10px] text-amber-800 font-mono">Preset Unsigned</span>
                    </div>
                    <p className="text-[10px] text-amber-900 leading-relaxed">
                      Dans Cloudinary : copiez votre <strong>Cloud Name</strong>, puis allez dans{' '}
                      <strong>Settings → Upload → Upload presets → Add</strong> et choisissez Signing Mode :{' '}
                      <strong>Unsigned</strong>.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={cloudinaryForm.cloudName}
                        onChange={(e) =>
                          setCloudinaryForm((prev) => ({ ...prev, cloudName: e.target.value }))
                        }
                        placeholder="Cloud Name (ex: dfriday221)"
                        className="px-2.5 py-2 rounded-xl bg-white border border-amber-300 text-[#10332C] font-mono text-[11px] focus:outline-none focus:border-[#10332C]"
                      />
                      <input
                        type="text"
                        value={cloudinaryForm.uploadPreset}
                        onChange={(e) =>
                          setCloudinaryForm((prev) => ({ ...prev, uploadPreset: e.target.value }))
                        }
                        placeholder="Upload Preset Unsigned"
                        className="px-2.5 py-2 rounded-xl bg-white border border-amber-300 text-[#10332C] font-mono text-[11px] focus:outline-none focus:border-[#10332C]"
                      />
                    </div>
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => handleSaveCloudinarySettings()}
                        className="px-3 py-1.5 rounded-lg bg-[#10332C] text-[#C99E69] hover:text-white font-bold text-[11px]"
                      >
                        Enregistrer &amp; Activer l&apos;upload
                      </button>
                    </div>
                  </div>
                )}

                {/* Drag & Drop / File Upload Zone */}
                <label
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragOver(true);
                  }}
                  onDragLeave={() => setIsDragOver(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragOver(false);
                    if (e.dataTransfer.files) {
                      handleUploadFiles(e.dataTransfer.files);
                    }
                  }}
                  className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 border-dashed cursor-pointer transition-colors ${
                    isDragOver
                      ? 'border-[#10332C] bg-[#EBF4F0]'
                      : 'border-[#D5E5DE] bg-[#F8FAF9] hover:border-[#10332C]/50'
                  }`}
                >
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/avif"
                    multiple
                    disabled={uploadProgress !== null || productForm.images.length >= MAX_PRODUCT_IMAGES_COUNT}
                    onChange={(e) => {
                      if (e.target.files) {
                        handleUploadFiles(e.target.files);
                        e.target.value = '';
                      }
                    }}
                    className="hidden"
                  />
                  <div className="w-9 h-9 rounded-xl bg-white border border-[#D5E5DE] flex items-center justify-center text-[#10332C]">
                    {uploadProgress !== null ? (
                      <Upload className="w-4 h-4 animate-bounce text-[#C99E69]" />
                    ) : (
                      <ImagePlus className="w-4 h-4 text-[#10332C]" />
                    )}
                  </div>
                  <div className="text-center">
                    <span className="font-bold text-[#10332C] block">
                      {uploadProgress !== null
                        ? `Téléversement Cloudinary : ${uploadProgress}%`
                        : 'Cliquez ou glissez-déposez vos photos ici'}
                    </span>
                    <span className="text-[10px] text-[#6A887E]">
                      JPG, PNG, WEBP, AVIF (max 5 Mo) · Optimisation WebP automatique via Cloudinary CDN
                    </span>
                  </div>
                  {uploadProgress !== null && (
                    <div className="w-full max-w-xs h-1.5 bg-[#EAF2EE] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#10332C] transition-all duration-150"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  )}
                </label>

                {uploadError && (
                  <p className="text-[11px] text-rose-700 bg-rose-50 border border-rose-200 rounded-xl p-2.5">
                    {uploadError}
                  </p>
                )}

                {/* Uploaded Images Preview Strip */}
                {productForm.images.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                    {productForm.images.map((imgUrl, idx) => (
                      <div
                        key={`${imgUrl}-${idx}`}
                        className="relative group rounded-xl overflow-hidden border border-[#D5E5DE] bg-white aspect-square"
                      >
                        <img
                          src={imgUrl}
                          alt={`Aperçu ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                        {idx === 0 ? (
                          <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-[#10332C] text-[#C99E69] text-[9px] font-bold">
                            Principale
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleSetPrimaryImage(idx)}
                            className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-black/70 text-white text-[9px] font-semibold opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            Définir #1
                          </button>
                        )}
                        {productForm.images.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(idx)}
                            className="absolute top-1 right-1 p-1 rounded-lg bg-rose-600 text-white opacity-90 hover:opacity-100"
                            aria-label={`Supprimer l'image ${idx + 1}`}
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Optional Manual URL Fallback */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={manualImageInput}
                    onChange={(e) => setManualImageInput(e.target.value)}
                    placeholder="Ou coller une URL d'image externe..."
                    className="flex-1 px-3 py-2 rounded-xl bg-[#F8FAF9] border border-[#D5E5DE] text-[#10332C] focus:outline-none focus:border-[#10332C]"
                  />
                  <button
                    type="button"
                    onClick={handleAddManualImageUrl}
                    className="px-3 py-2 rounded-xl bg-[#EBF4F0] hover:bg-[#D5E5DE] text-[#10332C] font-bold"
                  >
                    Ajouter URL
                  </button>
                </div>
              </div>

              {/* Dynamic Visual Rich Sections Builder */}
              <div className="space-y-3 pt-3 border-t border-[#EAF2EE]">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <label className="text-[#2D453D] font-bold block">
                      Blocs de description visuelle ({productForm.richSections.length}/{MAX_RICH_SECTIONS})
                    </label>
                    <p className="text-[10px] text-[#6A887E]">
                      Ajoutez des sections photo + texte, grandes bannières ou listes illustrées affichées sous la fiche produit.
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleAddRichSection('split')}
                    disabled={productForm.richSections.length >= MAX_RICH_SECTIONS}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#EBF4F0] hover:bg-[#D5E5DE] text-[#10332C] font-bold text-[11px] disabled:opacity-50"
                  >
                    <Columns className="w-3.5 h-3.5" /> + Photo &amp; Texte
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddRichSection('image')}
                    disabled={productForm.richSections.length >= MAX_RICH_SECTIONS}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#EBF4F0] hover:bg-[#D5E5DE] text-[#10332C] font-bold text-[11px] disabled:opacity-50"
                  >
                    <ImagePlus className="w-3.5 h-3.5" /> + Grande Image
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddRichSection('text')}
                    disabled={productForm.richSections.length >= MAX_RICH_SECTIONS}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#EBF4F0] hover:bg-[#D5E5DE] text-[#10332C] font-bold text-[11px] disabled:opacity-50"
                  >
                    <FileText className="w-3.5 h-3.5" /> + Paragraphe
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddRichSection('highlights')}
                    disabled={productForm.richSections.length >= MAX_RICH_SECTIONS}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#EBF4F0] hover:bg-[#D5E5DE] text-[#10332C] font-bold text-[11px] disabled:opacity-50"
                  >
                    <ListChecks className="w-3.5 h-3.5" /> + Points Forts
                  </button>
                </div>

                {productForm.richSections.length === 0 ? (
                  <div className="p-3 rounded-2xl bg-[#F8FAF9] border border-dashed border-[#D5E5DE] text-[11px] text-[#6A887E]">
                    Aucun bloc personnalisé ajouté. Sans bloc manuel, la boutique affiche automatiquement un bloc visuel à partir de la galerie photo du produit.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {productForm.richSections.map((sec, idx) => (
                      <div
                        key={sec.id}
                        className="p-3.5 rounded-2xl bg-[#F8FAF9] border border-[#D5E5DE] space-y-2.5"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="px-2 py-0.5 rounded-md bg-[#10332C] text-[#C99E69] text-[10px] font-bold uppercase tracking-wider">
                            Bloc #{idx + 1} ·{' '}
                            {sec.type === 'split'
                              ? 'Photo + Texte'
                              : sec.type === 'image'
                                ? 'Grande Image'
                                : sec.type === 'highlights'
                                  ? 'Points Forts'
                                  : 'Texte'}
                          </span>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleMoveRichSection(idx, -1)}
                              disabled={idx === 0}
                              className="p-1 rounded-lg bg-white border border-[#D5E5DE] text-[#10332C] disabled:opacity-40"
                              aria-label="Monter le bloc"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMoveRichSection(idx, 1)}
                              disabled={idx === productForm.richSections.length - 1}
                              className="p-1 rounded-lg bg-white border border-[#D5E5DE] text-[#10332C] disabled:opacity-40"
                              aria-label="Descendre le bloc"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveRichSection(sec.id)}
                              className="p-1 rounded-lg bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-100"
                              aria-label="Supprimer le bloc"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <input
                          type="text"
                          value={sec.title || ''}
                          onChange={(e) => handleUpdateRichSection(sec.id, { title: e.target.value })}
                          placeholder="Titre de la section..."
                          className="w-full px-3 py-2 rounded-xl bg-white border border-[#D5E5DE] text-[#10332C] font-semibold focus:outline-none focus:border-[#10332C]"
                        />

                        {sec.type !== 'image' && (
                          <textarea
                            rows={sec.type === 'highlights' ? 3 : 2}
                            value={sec.body || ''}
                            onChange={(e) => handleUpdateRichSection(sec.id, { body: e.target.value })}
                            placeholder={
                              sec.type === 'highlights'
                                ? 'Un point fort par ligne...'
                                : 'Contenu détaillé du bloc...'
                            }
                            className="w-full px-3 py-2 rounded-xl bg-white border border-[#D5E5DE] text-[#10332C] focus:outline-none focus:border-[#10332C]"
                          />
                        )}

                        {(sec.type === 'image' || sec.type === 'split') && (
                          <div className="space-y-2 p-2.5 rounded-xl bg-white border border-[#EAF2EE]">
                            <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
                              {sec.imageUrl && (
                                <img
                                  src={sec.imageUrl}
                                  alt={sec.imageCaption || 'Aperçu section'}
                                  className="w-16 h-16 rounded-xl object-cover border border-[#D5E5DE] shrink-0"
                                />
                              )}
                              <div className="flex-1 w-full space-y-1.5">
                                <div className="flex gap-1.5">
                                  <input
                                    type="text"
                                    value={sec.imageUrl || ''}
                                    onChange={(e) =>
                                      handleUpdateRichSection(sec.id, { imageUrl: e.target.value })
                                    }
                                    placeholder="URL de l'image ou téléverser..."
                                    className="flex-1 px-2.5 py-1.5 rounded-lg bg-[#F8FAF9] border border-[#D5E5DE] text-[11px] text-[#10332C] focus:outline-none focus:border-[#10332C]"
                                  />
                                  <label className="px-2.5 py-1.5 rounded-lg bg-[#10332C] text-[#C99E69] hover:text-white font-bold text-[11px] cursor-pointer shrink-0 inline-flex items-center gap-1">
                                    <Upload className="w-3 h-3" />
                                    {uploadingSectionId === sec.id ? 'Envoi...' : 'Cloudinary'}
                                    <input
                                      type="file"
                                      accept="image/jpeg,image/png,image/webp,image/avif"
                                      disabled={uploadingSectionId !== null}
                                      onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                          handleUploadSectionImage(sec.id, file);
                                          e.target.value = '';
                                        }
                                      }}
                                      className="hidden"
                                    />
                                  </label>
                                </div>

                                <input
                                  type="text"
                                  value={sec.imageCaption || ''}
                                  onChange={(e) =>
                                    handleUpdateRichSection(sec.id, { imageCaption: e.target.value })
                                  }
                                  placeholder="Légende sous la photo (optionnel)"
                                  className="w-full px-2.5 py-1.5 rounded-lg bg-[#F8FAF9] border border-[#D5E5DE] text-[11px] text-[#10332C] focus:outline-none focus:border-[#10332C]"
                                />
                              </div>
                            </div>

                            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                              {productForm.images.length > 0 && (
                                <div className="flex flex-wrap items-center gap-1">
                                  <span className="text-[10px] text-[#6A887E]">Depuis galerie :</span>
                                  {productForm.images.map((galUrl, gIdx) => (
                                    <button
                                      key={`gal-sec-${sec.id}-${gIdx}`}
                                      type="button"
                                      onClick={() =>
                                        handleUpdateRichSection(sec.id, { imageUrl: galUrl })
                                      }
                                      className={`px-1.5 py-0.5 rounded border text-[10px] font-bold ${
                                        sec.imageUrl === galUrl
                                          ? 'bg-[#10332C] text-[#C99E69] border-[#10332C]'
                                          : 'bg-[#F8FAF9] text-[#10332C] border-[#D5E5DE]'
                                      }`}
                                    >
                                      #{gIdx + 1}
                                    </button>
                                  ))}
                                </div>
                              )}

                              {sec.type === 'split' && (
                                <div className="flex items-center gap-1 text-[10px]">
                                  <span className="text-[#6A887E]">Position :</span>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleUpdateRichSection(sec.id, { imagePosition: 'left' })
                                    }
                                    className={`px-2 py-0.5 rounded font-bold border ${
                                      sec.imagePosition !== 'right'
                                        ? 'bg-[#10332C] text-white border-[#10332C]'
                                        : 'bg-[#F8FAF9] text-[#4A635B] border-[#D5E5DE]'
                                    }`}
                                  >
                                    Image à gauche
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleUpdateRichSection(sec.id, { imagePosition: 'right' })
                                    }
                                    className={`px-2 py-0.5 rounded font-bold border ${
                                      sec.imagePosition === 'right'
                                        ? 'bg-[#10332C] text-white border-[#10332C]'
                                        : 'bg-[#F8FAF9] text-[#4A635B] border-[#D5E5DE]'
                                    }`}
                                  >
                                    Image à droite
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-[#EAF2EE]">
                <button
                  type="button"
                  onClick={() => setProductModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-neutral-100 text-[#2D453D] font-semibold hover:bg-neutral-200 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={uploadProgress !== null || uploadingSectionId !== null}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#10332C] to-[#1A4C40] text-[#C99E69] font-bold hover:text-white transition-colors shadow-md border border-[#C99E69]/30 disabled:opacity-50"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Order Detail Inspection Modal */}
      {selectedOrder && (() => {
        const zone = deliveryZones.find((z) => z.id === selectedOrder.customer.zoneId);
        const paymentLabel =
          selectedOrder.customer.paymentMethod === 'wave'
            ? 'Wave Mobile Money'
            : selectedOrder.customer.paymentMethod === 'orange_money'
              ? 'Orange Money'
              : 'Paiement à la livraison (Cash)';
        const totalUnits = selectedOrder.items.reduce((sum, item) => sum + item.quantity, 0);

        return (
          <div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
            onClick={() => setSelectedOrderId(null)}
          >
            <div
              className="w-full max-w-3xl bg-white border border-[#D5E5DE] rounded-3xl p-6 sm:p-7 text-[#10332C] space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-[#EAF2EE]">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#10332C] text-[#C99E69] text-[10px] font-bold uppercase tracking-wider">
                      Détails Commande
                    </span>
                    <span className="text-[11px] font-mono text-[#6A887E]">ID: {selectedOrder.id}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl sm:text-2xl font-black font-mono text-[#10332C]">
                      {selectedOrder.orderNumber}
                    </h3>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(selectedOrder.orderNumber);
                        showToast(`Numéro ${selectedOrder.orderNumber} copié !`);
                      }}
                      className="p-1.5 rounded-lg bg-[#F8FAF9] hover:bg-[#EBF4F0] border border-[#D5E5DE] text-[#10332C]"
                      title="Copier le numéro de commande"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-xs text-[#4A635B]">
                    Passée le{' '}
                    {new Date(selectedOrder.createdAt).toLocaleDateString('fr-FR', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>

                <div className="flex items-center gap-2.5">
                  <select
                    value={selectedOrder.status}
                    onChange={(e) => {
                      updateOrderStatus(selectedOrder.id, e.target.value as OrderStatus);
                      showToast(`Statut de ${selectedOrder.orderNumber} mis à jour.`);
                    }}
                    className={`px-3 py-2 rounded-xl text-xs font-bold focus:outline-none border ${
                      selectedOrder.status === 'delivered'
                        ? 'bg-[#EBF4F0] text-[#10332C] border-[#5CD1A9]'
                        : selectedOrder.status === 'shipping'
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : selectedOrder.status === 'confirmed'
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : selectedOrder.status === 'cancelled'
                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                        : 'bg-neutral-100 text-neutral-700 border-neutral-300'
                    }`}
                  >
                    <option value="pending">En attente</option>
                    <option value="confirmed">Confirmée</option>
                    <option value="shipping">En livraison</option>
                    <option value="delivered">Livrée (Succès)</option>
                    <option value="cancelled">Annulée</option>
                  </select>

                  <button
                    type="button"
                    onClick={() => setSelectedOrderId(null)}
                    className="p-2 rounded-xl bg-[#F8FAF9] hover:bg-[#EAF2EE] text-[#4A635B] hover:text-[#10332C] transition-colors"
                    aria-label="Fermer les détails de la commande"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Customer & Delivery Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* Client Card */}
                <div className="p-4 rounded-2xl bg-[#F8FAF9] border border-[#EAF2EE] space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-bold text-[#10332C] uppercase text-[11px] tracking-wider flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-[#C99E69]" />
                      Informations Client
                    </h4>
                    <span className="px-2 py-0.5 rounded-full bg-white border border-[#D5E5DE] text-[10px] font-semibold text-[#4A635B]">
                      {selectedOrder.userId ? 'Compte client vérifié' : 'Achat invité'}
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <p className="text-sm font-extrabold text-[#10332C]">{selectedOrder.customer.fullName}</p>
                    <a
                      href={`tel:${selectedOrder.customer.phone.replace(/\s+/g, '')}`}
                      className="flex items-center gap-1.5 font-mono font-semibold text-[#10332C] hover:text-[#C99E69]"
                    >
                      <Phone className="w-3.5 h-3.5 text-[#5CD1A9]" />
                      {selectedOrder.customer.phone}
                    </a>
                    <p className="flex items-center gap-1.5 text-[#4A635B]">
                      <Mail className="w-3.5 h-3.5 text-[#C99E69]" />
                      {selectedOrder.customer.email || 'Aucun email fourni'}
                    </p>
                  </div>
                </div>

                {/* Delivery & Payment Card */}
                <div className="p-4 rounded-2xl bg-[#F8FAF9] border border-[#EAF2EE] space-y-3">
                  <h4 className="font-bold text-[#10332C] uppercase text-[11px] tracking-wider flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#C99E69]" />
                    Livraison &amp; Paiement
                  </h4>

                  <div className="space-y-1.5">
                    <p className="font-bold text-[#10332C] leading-snug">{selectedOrder.customer.address}</p>
                    <p className="text-[11px] text-[#4A635B]">
                      Zone :{' '}
                      <strong className="text-[#10332C]">
                        {zone ? `${zone.name} (${zone.area}) · ${zone.estimatedDelay}` : selectedOrder.customer.zoneId}
                      </strong>
                    </p>
                    <p className="flex items-center gap-1.5 text-[#10332C] font-semibold pt-0.5">
                      <CreditCard className="w-3.5 h-3.5 text-[#5CD1A9]" />
                      {paymentLabel}
                    </p>
                  </div>
                </div>
              </div>

              {/* Customer Delivery Notes */}
              {selectedOrder.customer.notes && (
                <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 flex items-start gap-2.5 text-xs text-amber-950">
                  <StickyNote className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block text-[11px] uppercase tracking-wider text-amber-900">
                      Notes / Instructions du client pour le coursier :
                    </span>
                    <p className="mt-0.5 leading-relaxed">{selectedOrder.customer.notes}</p>
                  </div>
                </div>
              )}

              {/* Ordered Items Table */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-[#10332C] text-sm flex items-center gap-2">
                    <Package className="w-4 h-4 text-[#C99E69]" />
                    Articles commandés ({totalUnits} unité{totalUnits > 1 ? 's' : ''})
                  </h4>
                </div>

                <div className="space-y-2.5">
                  {selectedOrder.items.map((item, idx) => (
                    <div
                      key={`${item.id}-${idx}`}
                      className="p-3.5 rounded-2xl bg-[#F8FAF9] border border-[#EAF2EE] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={item.product.images?.[0] || '/assets/images/product_airfryer_digital_1793989489237.jpg'}
                          alt={item.product.name}
                          className="w-14 h-14 rounded-xl object-cover bg-white border border-[#D5E5DE] shrink-0"
                        />
                        <div className="min-w-0 space-y-1">
                          <p className="font-bold text-[#10332C] text-sm truncate">{item.product.name}</p>
                          <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#4A635B]">
                            <span className="font-mono text-[#6A887E]">SKU: {item.product.sku}</span>
                            <span>·</span>
                            <span>
                              Option : <strong className="text-[#10332C]">{item.selectedSize}</strong>
                            </span>
                            <span>·</span>
                            <span className="inline-flex items-center gap-1">
                              Couleur :
                              <span
                                className="w-3 h-3 rounded-full border border-black/15 inline-block"
                                style={{ backgroundColor: item.selectedColor?.hex || '#171717' }}
                              />
                              <strong className="text-[#10332C]">{item.selectedColor?.name || 'Standard'}</strong>
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex sm:flex-col items-center sm:items-end justify-between gap-1 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#EAF2EE]">
                        <span className="text-[11px] text-[#4A635B] font-mono">
                          {item.quantity} × {formatFCFA(item.product.price)}
                        </span>
                        <strong className="text-sm font-mono font-extrabold text-[#10332C]">
                          {formatFCFA(item.product.price * item.quantity)}
                        </strong>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Financial Breakdown */}
              <div className="p-5 rounded-2xl bg-[#EBF4F0]/60 border border-[#D5E5DE] space-y-2 text-xs">
                <div className="flex items-center justify-between text-[#4A635B]">
                  <span>Sous-total articles</span>
                  <span className="font-mono font-semibold text-[#10332C]">
                    {formatFCFA(selectedOrder.subtotal)}
                  </span>
                </div>
                {selectedOrder.discount > 0 && (
                  <div className="flex items-center justify-between text-emerald-700 font-semibold">
                    <span>
                      Remise {selectedOrder.appliedPromo ? `(Code ${selectedOrder.appliedPromo})` : ''}
                    </span>
                    <span className="font-mono">-{formatFCFA(selectedOrder.discount)}</span>
                  </div>
                )}
                <div className="flex items-center justify-between text-[#4A635B]">
                  <span>Frais de livraison ({zone?.name || selectedOrder.customer.zoneId})</span>
                  <span className="font-mono font-semibold text-[#10332C]">
                    {selectedOrder.deliveryFee === 0 ? 'Gratuit' : formatFCFA(selectedOrder.deliveryFee)}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-2.5 border-t border-[#D5E5DE] text-sm font-black text-[#10332C]">
                  <span>Total de la commande</span>
                  <span className="text-lg font-mono">{formatFCFA(selectedOrder.total)}</span>
                </div>
              </div>

              {/* Modal Footer Actions */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#EAF2EE]">
                <a
                  href={`tel:${selectedOrder.customer.phone.replace(/\s+/g, '')}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white border border-[#D5E5DE] hover:border-[#10332C] text-[#10332C] font-bold text-xs transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-[#5CD1A9]" />
                  Appeler le client
                </a>

                <div className="flex items-center gap-2 ml-auto">
                  <a
                    href={generateStatusWhatsAppLink(selectedOrder, selectedOrder.status)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-white font-bold text-xs transition-colors shadow-sm"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Notifier sur WhatsApp
                  </a>
                  <button
                    type="button"
                    onClick={() => setSelectedOrderId(null)}
                    className="px-4 py-2.5 rounded-xl bg-[#10332C] text-[#C99E69] hover:text-white font-bold text-xs transition-colors"
                  >
                    Fermer
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* User Detail Inspection Modal */}
      {selectedUser && (() => {
        const cleanUserPhone = (selectedUser.phone || '').replace(/\s+/g, '');
        const {
          orders: userOrdersList,
          totalSpent,
          averageBasket,
        } = getUserOrdersAndStats(selectedUser, orders);
        const waDigits = formatWhatsAppDigits(selectedUser.phone);

        return (
          <div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
            onClick={() => {
              setSelectedUserId(null);
              setConfirmDeleteUserId(null);
            }}
          >
            <div
              className="w-full max-w-3xl bg-white border border-[#D5E5DE] rounded-3xl p-6 sm:p-7 text-[#10332C] space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-[#EAF2EE]">
                <div className="flex items-center gap-4">
                  {selectedUser.avatarUrl ? (
                    <img
                      src={selectedUser.avatarUrl}
                      alt={selectedUser.displayName}
                      className="w-14 h-14 rounded-2xl object-cover border border-[#C99E69]/40 shadow-sm shrink-0"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl border shadow-sm shrink-0 ${
                        selectedUser.role === 'admin'
                          ? 'bg-[#10332C] text-[#C99E69] border-[#C99E69]/40'
                          : 'bg-[#EBF4F0] text-[#10332C] border-[#D5E5DE]'
                      }`}
                    >
                      {selectedUser.displayName.charAt(0).toUpperCase()}
                    </div>
                  )}

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-xl font-black text-[#10332C]">{selectedUser.displayName}</h3>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          selectedUser.role === 'admin'
                            ? 'bg-[#10332C] text-[#C99E69]'
                            : 'bg-[#EBF4F0] text-[#10332C]'
                        }`}
                      >
                        {selectedUser.role === 'admin' ? 'Administrateur' : 'Client'}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          selectedUser.status === 'active'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-700'
                        }`}
                      >
                        {selectedUser.status === 'active' ? 'Compte Actif' : 'Compte Suspendu'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] font-mono text-[#6A887E]">
                      <span>UID: {selectedUser.id}</span>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(selectedUser.id);
                          showToast('UID utilisateur copié !');
                        }}
                        className="p-1 rounded bg-[#F8FAF9] hover:bg-[#EBF4F0] border border-[#D5E5DE] text-[#10332C]"
                        title="Copier l'UID Firebase"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedUserId(null);
                    setConfirmDeleteUserId(null);
                  }}
                  className="p-2 rounded-xl bg-[#F8FAF9] hover:bg-[#EAF2EE] text-[#4A635B] hover:text-[#10332C] transition-colors"
                  aria-label="Fermer la fiche utilisateur"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Contact & Account Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-[#F8FAF9] border border-[#EAF2EE] space-y-2.5">
                  <h4 className="font-bold text-[#10332C] uppercase text-[11px] tracking-wider flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-[#C99E69]" />
                    Coordonnées &amp; Livraison
                  </h4>
                  <div className="space-y-1.5">
                    <a
                      href={`mailto:${selectedUser.email}`}
                      className="flex items-center gap-2 font-semibold text-[#10332C] hover:text-[#C99E69] break-all"
                    >
                      <Mail className="w-3.5 h-3.5 text-[#C99E69] shrink-0" />
                      {selectedUser.email}
                    </a>
                    <div className="flex items-center gap-2 font-mono font-semibold text-[#10332C]">
                      <Phone className="w-3.5 h-3.5 text-[#5CD1A9] shrink-0" />
                      {selectedUser.phone ? (
                        <a href={`tel:${cleanUserPhone}`} className="hover:text-[#C99E69]">
                          {selectedUser.phone}
                        </a>
                      ) : (
                        <span className="text-[#6A887E] font-sans font-normal">Téléphone non renseigné</span>
                      )}
                    </div>
                    <div className="flex items-start gap-2 text-[#4A635B] pt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-[#C99E69] shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-[#10332C]">
                          {selectedUser.city || 'Dakar'}
                        </p>
                        <p className="text-[11px]">
                          {selectedUser.address || 'Aucune adresse enregistrée'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#F8FAF9] border border-[#EAF2EE] space-y-2.5">
                  <h4 className="font-bold text-[#10332C] uppercase text-[11px] tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#5CD1A9]" />
                    Activité &amp; Gestion du Compte
                  </h4>
                  <div className="space-y-2 text-[11px] text-[#4A635B]">
                    <p className="flex items-center justify-between">
                      <span>Inscription :</span>
                      <strong className="text-[#10332C] font-mono">
                        {new Date(selectedUser.createdAt).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </strong>
                    </p>
                    <p className="flex items-center justify-between">
                      <span>Dernière connexion :</span>
                      <strong className="text-[#10332C] font-mono">
                        {selectedUser.lastLogin
                          ? new Date(selectedUser.lastLogin).toLocaleDateString('fr-FR', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : 'Non disponible'}
                      </strong>
                    </p>
                    <div className="flex items-center justify-between gap-2 pt-1.5 border-t border-[#EAF2EE]">
                      <span className="font-semibold text-[#10332C]">Rôle :</span>
                      <select
                        value={selectedUser.role}
                        onChange={(e) => {
                          const newR = e.target.value as UserRole;
                          updateUserRole(selectedUser.id, newR);
                          showToast(`Rôle de ${selectedUser.displayName} modifié en "${newR}".`);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-white border border-[#D5E5DE] text-[#10332C] font-bold text-xs"
                      >
                        <option value="user">👤 Client</option>
                        <option value="admin">👑 Administrateur</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* User Orders KPIs & History */}
              <div className="space-y-3">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3.5 rounded-2xl bg-[#EBF4F0]/60 border border-[#D5E5DE]">
                    <span className="text-[10px] uppercase tracking-wider text-[#4A635B] font-bold block">
                      Total Commandes
                    </span>
                    <strong className="text-lg font-mono font-black text-[#10332C]">
                      {userOrdersList.length}
                    </strong>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-[#EBF4F0]/60 border border-[#D5E5DE]">
                    <span className="text-[10px] uppercase tracking-wider text-[#4A635B] font-bold block">
                      Total Dépensé (validé)
                    </span>
                    <strong className="text-lg font-mono font-black text-[#10332C]">
                      {formatFCFA(totalSpent)}
                    </strong>
                  </div>
                  <div className="col-span-2 sm:col-span-1 p-3.5 rounded-2xl bg-[#EBF4F0]/60 border border-[#D5E5DE]">
                    <span className="text-[10px] uppercase tracking-wider text-[#4A635B] font-bold block">
                      Panier Moyen
                    </span>
                    <strong className="text-lg font-mono font-black text-[#10332C]">
                      {formatFCFA(averageBasket)}
                    </strong>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-bold text-[#10332C] text-sm flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-[#C99E69]" />
                    Historique des commandes ({userOrdersList.length})
                  </h4>

                  {userOrdersList.length === 0 ? (
                    <div className="p-5 rounded-2xl bg-[#F8FAF9] border border-dashed border-[#D5E5DE] text-center text-xs text-[#6A887E]">
                      Aucune commande associée à cet utilisateur pour le moment.
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                      {userOrdersList.map((ord) => (
                        <button
                          key={ord.id}
                          type="button"
                          onClick={() => {
                            setConfirmDeleteUserId(null);
                            setSelectedUserId(null);
                            setSelectedOrderId(ord.id);
                          }}
                          className="w-full text-left p-3.5 rounded-2xl bg-[#F8FAF9] hover:bg-[#EBF4F0] border border-[#EAF2EE] hover:border-[#10332C]/25 flex flex-wrap items-center justify-between gap-2 text-xs transition-colors"
                        >
                          <div>
                            <strong className="font-mono text-[#10332C] text-sm block">
                              {ord.orderNumber}
                            </strong>
                            <span className="text-[11px] text-[#4A635B]">
                              {new Date(ord.createdAt).toLocaleDateString('fr-FR', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })}{' '}
                              · {ord.items.reduce((s, it) => s + it.quantity, 0)} article(s)
                            </span>
                          </div>
                          <div className="flex items-center gap-2.5">
                            <span className="px-2 py-0.5 rounded-full bg-white border border-[#D5E5DE] text-[10px] font-bold uppercase text-[#10332C]">
                              {ord.status}
                            </span>
                            <strong className="font-mono font-extrabold text-[#10332C]">
                              {formatFCFA(ord.total)}
                            </strong>
                            <Eye className="w-3.5 h-3.5 text-[#6A887E]" />
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Footer Actions */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-[#EAF2EE]">
                <div className="flex flex-wrap items-center gap-2">
                  {selectedUser.status === 'active' ? (
                    <button
                      type="button"
                      onClick={() => {
                        updateUserStatus(selectedUser.id, 'suspended');
                        showToast(`Compte de ${selectedUser.displayName} suspendu.`);
                      }}
                      className="px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 font-bold text-xs"
                    >
                      Suspendre le compte
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        updateUserStatus(selectedUser.id, 'active');
                        showToast(`Compte de ${selectedUser.displayName} réactivé.`);
                      }}
                      className="px-3.5 py-2 rounded-xl bg-[#EBF4F0] hover:bg-[#D5E5DE] text-[#10332C] border border-[#5CD1A9]/40 font-bold text-xs"
                    >
                      Réactiver le compte
                    </button>
                  )}

                  {confirmDeleteUserId === selectedUser.id ? (
                    <div className="inline-flex items-center gap-1.5">
                      <button
                        type="button"
                        disabled={deletingUserId === selectedUser.id}
                        onClick={() => handlePermanentDeleteUser(selectedUser.id)}
                        className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs inline-flex items-center gap-1.5 disabled:opacity-50"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        {deletingUserId === selectedUser.id ? 'Suppression...' : 'Confirmer la suppression'}
                      </button>
                      <button
                        type="button"
                        disabled={deletingUserId === selectedUser.id}
                        onClick={() => setConfirmDeleteUserId(null)}
                        className="px-3 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-[#2D453D] font-semibold text-xs disabled:opacity-50"
                      >
                        Annuler
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteUserId(selectedUser.id)}
                      className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs inline-flex items-center gap-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Supprimer
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2 ml-auto">
                  {cleanUserPhone && (
                    <>
                      <a
                        href={`tel:${cleanUserPhone}`}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-[#D5E5DE] hover:border-[#10332C] text-[#10332C] font-bold text-xs"
                      >
                        <Phone className="w-3.5 h-3.5 text-[#5CD1A9]" />
                        Appeler
                      </a>
                      <a
                        href={`https://wa.me/${waDigits}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-white font-bold text-xs shadow-xs"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        WhatsApp
                      </a>
                    </>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedUserId(null);
                      setConfirmDeleteUserId(null);
                    }}
                    className="px-4 py-2 rounded-xl bg-[#10332C] text-[#C99E69] hover:text-white font-bold text-xs transition-colors"
                  >
                    Fermer
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

    </div>
  );
};
