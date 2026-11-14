export const ALLOWED_PRODUCT_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
] as const;

export const MAX_PRODUCT_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB
export const MAX_PRODUCT_IMAGES_COUNT = 5;

export interface ImageFileDescriptor {
  name: string;
  size: number;
  type: string;
}

export interface CloudinaryUploadConfig {
  cloudName: string;
  uploadPreset: string;
  folder?: string;
}

export function validateProductImageFile(
  file: ImageFileDescriptor
): { valid: true } | { valid: false; error: string } {
  const mime = (file.type || '').toLowerCase();
  if (!ALLOWED_PRODUCT_IMAGE_TYPES.includes(mime as (typeof ALLOWED_PRODUCT_IMAGE_TYPES)[number])) {
    return {
      valid: false,
      error: `Format non supporté (${file.name}). Utilisez JPG, PNG, WEBP ou AVIF.`,
    };
  }

  if (!Number.isFinite(file.size) || file.size <= 0) {
    return {
      valid: false,
      error: `Le fichier « ${file.name} » semble vide.`,
    };
  }

  if (file.size > MAX_PRODUCT_IMAGE_BYTES) {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    return {
      valid: false,
      error: `L'image « ${file.name} » (${sizeMb} Mo) dépasse la limite de 5 Mo.`,
    };
  }

  return { valid: true };
}

export function sanitizeStorageSegment(raw: string, fallback = 'item'): string {
  const clean = (raw || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64);

  return clean || fallback;
}

export function validateCloudinaryConfig(
  config: Partial<CloudinaryUploadConfig> | null | undefined
): { valid: true; cloudName: string; uploadPreset: string; folder: string } | { valid: false; error: string } {
  const cloudName = (config?.cloudName || '').trim();
  const uploadPreset = (config?.uploadPreset || '').trim();
  const rawFolder = (config?.folder || 'friday-store/products').trim();

  if (!cloudName) {
    return {
      valid: false,
      error: 'Cloud Name Cloudinary manquant. Configurez-le ci-dessous (plan gratuit sans carte bancaire).',
    };
  }

  if (!/^[a-zA-Z0-9_-]{2,100}$/.test(cloudName)) {
    return {
      valid: false,
      error: 'Cloud Name invalide : saisissez uniquement l\'identifiant court (ex: dxyz123abc), sans URL.',
    };
  }

  if (!uploadPreset || uploadPreset.length > 120) {
    return {
      valid: false,
      error: 'Upload Preset Cloudinary manquant ou invalide (doit être en mode « Unsigned »).',
    };
  }

  const folder = rawFolder
    .split('/')
    .map((part) => sanitizeStorageSegment(part, ''))
    .filter(Boolean)
    .join('/')
    .slice(0, 120);

  return {
    valid: true,
    cloudName,
    uploadPreset,
    folder: folder || 'friday-store/products',
  };
}

export function buildCloudinaryUploadEndpoint(cloudName: string): string {
  return `https://api.cloudinary.com/v1_1/${encodeURIComponent(cloudName.trim())}/image/upload`;
}

export function buildCloudinaryFolder(baseFolder: string, productIdOrSlug: string): string {
  const cleanBase = baseFolder
    .split('/')
    .map((part) => sanitizeStorageSegment(part, ''))
    .filter(Boolean)
    .join('/');
  const productSegment = sanitizeStorageSegment(productIdOrSlug, 'produits');
  return cleanBase ? `${cleanBase}/${productSegment}` : `friday-store/${productSegment}`;
}

export function optimizeCloudinaryUrl(url: string): string {
  const trimmed = (url || '').trim();
  if (!isCloudinaryUrl(trimmed)) return trimmed;
  if (trimmed.includes('/image/upload/f_auto') || trimmed.includes('/image/upload/q_auto')) {
    return trimmed;
  }
  return trimmed.replace('/image/upload/', '/image/upload/f_auto,q_auto/');
}

export function isCloudinaryUrl(url: string): boolean {
  return /^https:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\//.test((url || '').trim());
}

export function mapCloudinaryError(rawMessage: string): string {
  const msg = (rawMessage || '').trim();
  const lower = msg.toLowerCase();

  if (lower.includes('whitelisted for unsigned uploads') || lower.includes('unsigned')) {
    return 'Votre Upload Preset Cloudinary doit être configuré en mode « Unsigned » (Non signé) dans Cloudinary → Settings → Upload → Upload presets.';
  }
  if (lower.includes('upload preset not found')) {
    return 'Upload Preset introuvable sur ce compte Cloudinary. Vérifiez l\'orthographe exacte du preset.';
  }
  if (lower.includes('invalid cloud_name') || lower.includes('unknown api key') || lower.includes('cloud name')) {
    return 'Cloud Name Cloudinary introuvable. Vérifiez votre Cloud Name dans le tableau de bord Cloudinary.';
  }
  if (lower.includes('file size too large')) {
    return 'Fichier trop volumineux pour votre limite Cloudinary.';
  }
  if (!msg) {
    return "Erreur réseau lors de l'envoi vers Cloudinary. Vérifiez votre connexion internet.";
  }
  return `Erreur Cloudinary : ${msg}`;
}
