import { Product, ProductCategory } from '../types';

/**
 * Remove accents for forgiving search (e.g. écouteurs -> ecouteurs)
 */
function normalizeString(str: string): string {
  return (str || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

/**
 * Category friendly names to include in search
 */
const CATEGORY_SYNONYMS: Record<string, string[]> = {
  electromenager: ['electromenager', 'cuisine', 'friteuse', 'airfryer', 'air fryer', 'air fry', 'cuisson', 'four', 'appareil'],
  electronique: ['electronique', 'high-tech', 'hightech', 'tech', 'audio', 'bluetooth', 'sans fil', 'ecouteur', 'airpod', 'projecteur', 'cinema'],
  vaisselle: ['vaisselle', 'assiette', 'table', 'service', 'couvert', 'tasse', 'verre', 'plat', 'ceramique'],
  'deco-maison': ['deco', 'decoration', 'maison', 'salon', 'chambre', 'diffuseur', 'flamme', 'lampe', 'lumiere', 'ambiance', 'humidificateur'],
  gadgets: ['gadget', 'gadgets', 'tendance', 'pratique', 'mixeur', 'usb', 'blender', 'distributeur', 'eau', 'portable']
};

/**
 * Pure filter function used for real-time search across the Header and Shop page
 */
export function filterProductsBySearch(
  products: Product[],
  query: string,
  category: ProductCategory = 'tous',
  maxPrice: number = Infinity
): Product[] {
  const normalizedQuery = normalizeString(query);

  return products.filter((product) => {
    // 1. Category matching
    const matchesCategory = category === 'tous' || product.category === category;
    if (!matchesCategory) return false;

    // 2. Max price threshold
    if (product.price > maxPrice) return false;

    // 3. If query is empty, it matches
    if (!normalizedQuery) return true;

    // Prepare full normalized searchable text
    const categoryTerms = CATEGORY_SYNONYMS[product.category] || [];
    const searchableText = normalizeString([
      product.name,
      product.category,
      categoryTerms.join(' '),
      product.description || '',
      product.shortDescription || '',
      ...(product.features || [])
    ].join(' '));

    // Support multi-word queries: every token should match
    const tokens = normalizedQuery.split(/\s+/).filter(Boolean);
    const allTokensMatch = tokens.every((token) => searchableText.includes(token));

    // Also support exact query or spaceless match (e.g. "airfryer" matches "air fryer")
    const spacelessQuery = normalizedQuery.replace(/\s+/g, '');
    const spacelessText = searchableText.replace(/\s+/g, '');
    const spacelessMatch = spacelessText.includes(spacelessQuery);

    return allTokensMatch || spacelessMatch;
  });
}

