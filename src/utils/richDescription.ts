import { Product, ProductRichSection, RichSectionType } from '../types';

export const MAX_RICH_SECTIONS = 12;

const VALID_SECTION_TYPES: RichSectionType[] = ['text', 'image', 'split', 'highlights'];

export function isSafeRichImageUrl(url: string | undefined | null): boolean {
  const clean = (url || '').trim();
  if (!clean || clean.length > 1000) return false;
  if (clean.startsWith('/assets/')) return true;
  try {
    const parsed = new URL(clean);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}

export function sanitizeRichSections(
  sections: ProductRichSection[] | undefined | null
): ProductRichSection[] {
  if (!Array.isArray(sections)) return [];

  const sanitized: ProductRichSection[] = [];

  for (let i = 0; i < Math.min(sections.length, MAX_RICH_SECTIONS); i += 1) {
    const raw = sections[i];
    if (!raw || typeof raw !== 'object') continue;

    const type: RichSectionType = VALID_SECTION_TYPES.includes(raw.type) ? raw.type : 'text';
    const title = (raw.title || '').trim().slice(0, 160);
    const body = (raw.body || '').trim().slice(0, 2000);
    const rawImg = (raw.imageUrl || '').trim().slice(0, 1000);
    const imageUrl = isSafeRichImageUrl(rawImg) ? rawImg : '';
    const imageCaption = (raw.imageCaption || '').trim().slice(0, 200);
    const imagePosition: 'left' | 'right' = raw.imagePosition === 'right' ? 'right' : 'left';

    const hasContent = Boolean(title || body || imageUrl);
    if (!hasContent) continue;

    const section: ProductRichSection = {
      id: (raw.id || `sec-${i + 1}`).trim().slice(0, 64) || `sec-${i + 1}`,
      type,
      ...(title ? { title } : {}),
      ...(body ? { body } : {}),
      ...(imageUrl ? { imageUrl } : {}),
      ...(imageCaption ? { imageCaption } : {}),
      ...(type === 'split' ? { imagePosition } : {}),
    };

    sanitized.push(section);
  }

  return sanitized;
}

export type ParsedInlineNode =
  | { kind: 'heading'; text: string }
  | { kind: 'paragraph'; text: string }
  | { kind: 'image'; url: string; caption?: string };

export function parseInlineRichDescription(rawDescription: string): ParsedInlineNode[] {
  const normalized = (rawDescription || '').replace(/\r\n/g, '\n').trim();
  if (!normalized) return [];

  const lines = normalized.split('\n');
  const nodes: ParsedInlineNode[] = [];
  let paragraphBuffer: string[] = [];

  const flushParagraph = () => {
    if (paragraphBuffer.length > 0) {
      nodes.push({ kind: 'paragraph', text: paragraphBuffer.join(' ').trim() });
      paragraphBuffer = [];
    }
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) {
      flushParagraph();
      continue;
    }

    const imageMatch = line.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
    if (imageMatch) {
      const caption = imageMatch[1].trim();
      const url = imageMatch[2].trim();
      if (isSafeRichImageUrl(url)) {
        flushParagraph();
        nodes.push({ kind: 'image', url, ...(caption ? { caption } : {}) });
        continue;
      }
    }

    if (line.startsWith('## ')) {
      flushParagraph();
      const text = line.replace(/^##\s+/, '').trim();
      if (text) {
        nodes.push({ kind: 'heading', text });
      }
      continue;
    }

    paragraphBuffer.push(line);
  }

  flushParagraph();
  return nodes;
}

export function resolveProductRichSections(product: Product): ProductRichSection[] {
  const explicit = sanitizeRichSections(product.richSections);
  if (explicit.length > 0) {
    return explicit;
  }

  const secondaryImage = product.images?.[1] || product.images?.[0];
  if (!secondaryImage) return [];

  const autoSections: ProductRichSection[] = [
    {
      id: `auto-split-${product.id}`,
      type: 'split',
      title: `Pourquoi choisir « ${product.name} » ?`,
      body:
        product.shortDescription ||
        'Conçu pour un usage quotidien fiable au Sénégal, testé avant expédition par nos équipes à Dakar.',
      imageUrl: secondaryImage,
      imageCaption: `Présentation visuelle · Réf. ${product.sku}`,
      imagePosition: 'right',
    },
  ];

  if (product.images && product.images.length > 2) {
    autoSections.push({
      id: `auto-gallery-${product.id}`,
      type: 'image',
      title: 'Vue détaillée sous un autre angle',
      imageUrl: product.images[2],
      imageCaption: `${product.name} — Finitions et qualité vérifiées à Dakar`,
    });
  }

  return autoSections;
}
