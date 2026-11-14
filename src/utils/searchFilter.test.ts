import test from 'node:test';
import assert from 'node:assert/strict';
import { filterProductsBySearch } from './searchFilter.ts';
import { Product } from '../types/index.ts';

const mockProducts: Product[] = [
  {
    id: 'prod-1',
    name: 'Air Fryer XL 6L Digital',
    slug: 'air-fryer-xl-6l',
    category: 'electromenager',
    price: 45000,
    description: 'Friteuse sans huile idéale pour cuisine dakaroise saine.',
    shortDescription: 'Cuisine croustillante sans huile',
    features: ['Capacité 6 Litres', '8 programmes', 'Écran tactile'],
    images: ['/img/fryer.jpg'],
    sizes: ['6L'],
    colors: [{ name: 'Noir Laqué', hex: '#111' }],
    inStock: true,
    stockCount: 15,
    isFeatured: true,
    isNew: true,
    rating: 4.9,
    reviewCount: 38,
    sku: 'FS-AF-01',
  },
  {
    id: 'prod-2',
    name: 'Écouteurs Sans Fil Pro Bass ANC',
    slug: 'ecouteurs-sans-fil-pro-bass',
    category: 'electronique',
    price: 24000,
    description: 'Réduction active de bruit et autonomie 32h.',
    shortDescription: 'Son haute fidélité',
    features: ['Bluetooth 5.3', 'Autonomie 32h', 'USB-C'],
    images: ['/img/earbuds.jpg'],
    sizes: ['Standard'],
    colors: [{ name: 'Noir Mat', hex: '#222' }],
    inStock: true,
    stockCount: 22,
    isFeatured: true,
    isNew: true,
    rating: 4.8,
    reviewCount: 45,
    sku: 'FS-EAR-01',
  },
  {
    id: 'prod-3',
    name: 'Service d’Assiettes Dorées Céramique 16 Pièces',
    slug: 'service-assiettes-dorees',
    category: 'vaisselle',
    price: 38000,
    description: 'Service de table chic pour vos repas de fête.',
    shortDescription: 'Céramique premium liseré doré',
    features: ['16 pièces', 'Passe au lave-vaisselle'],
    images: ['/img/plates.jpg'],
    sizes: ['16 pièces'],
    colors: [{ name: 'Blanc & Or', hex: '#FAF7EE' }],
    inStock: true,
    stockCount: 8,
    isFeatured: false,
    isNew: false,
    rating: 4.7,
    reviewCount: 19,
    sku: 'FS-VAIS-01',
  },
  {
    id: 'prod-4',
    name: 'Diffuseur d’Arômes Flamme 3D',
    slug: 'diffuseur-aromes-flamme-3d',
    category: 'deco-maison',
    price: 18500,
    description: 'Ambiance chaleureuse avec brume illuminée effet cheminée.',
    shortDescription: 'Humidificateur et veilleuse d’ambiance',
    features: ['Effet flamme LED', 'Arrêt automatique'],
    images: ['/img/diffuser.jpg'],
    sizes: ['Standard'],
    colors: [{ name: 'Noir Charbon', hex: '#1C1C1C' }],
    inStock: true,
    stockCount: 14,
    isFeatured: false,
    isNew: true,
    rating: 4.9,
    reviewCount: 29,
    sku: 'FS-DECO-01',
  },
];

test('filterProductsBySearch returns all products when query is empty and category is "tous"', () => {
  const result = filterProductsBySearch(mockProducts, '', 'tous');
  assert.equal(result.length, 4);
});

test('filterProductsBySearch filters by product name in real-time (case-insensitive)', () => {
  const result = filterProductsBySearch(mockProducts, 'air fryer');
  assert.equal(result.length, 1);
  assert.equal(result[0].id, 'prod-1');

  const partial = filterProductsBySearch(mockProducts, 'écouteur');
  assert.equal(partial.length, 1);
  assert.equal(partial[0].id, 'prod-2');
});

test('filterProductsBySearch filters by category (e.g. electromenager, vaisselle)', () => {
  const electro = filterProductsBySearch(mockProducts, '', 'electromenager');
  assert.equal(electro.length, 1);
  assert.equal(electro[0].id, 'prod-1');

  const vaisselle = filterProductsBySearch(mockProducts, '', 'vaisselle');
  assert.equal(vaisselle.length, 1);
  assert.equal(vaisselle[0].id, 'prod-3');
});

test('filterProductsBySearch matches keywords in description or features', () => {
  const resultDesc = filterProductsBySearch(mockProducts, 'dakaroise');
  assert.equal(resultDesc.length, 1);
  assert.equal(resultDesc[0].id, 'prod-1');

  const resultFeature = filterProductsBySearch(mockProducts, 'bluetooth');
  assert.equal(resultFeature.length, 1);
  assert.equal(resultFeature[0].id, 'prod-2');
});

test('filterProductsBySearch combines category and search query correctly', () => {
  // Diffuseur is in deco-maison
  const match = filterProductsBySearch(mockProducts, 'flamme', 'deco-maison');
  assert.equal(match.length, 1);
  assert.equal(match[0].id, 'prod-4');

  // Query "flamme" but with wrong category "electronique" -> should be empty
  const noMatch = filterProductsBySearch(mockProducts, 'flamme', 'electronique');
  assert.equal(noMatch.length, 0);
});

test('filterProductsBySearch respects maxPrice constraint', () => {
  const budget = filterProductsBySearch(mockProducts, '', 'tous', 25000);
  assert.equal(budget.length, 2); // 24000 and 18500
});

test('filterProductsBySearch normalizes accents so "ecouteurs" matches "Écouteurs"', () => {
  const result = filterProductsBySearch(mockProducts, 'ecouteurs sans fil');
  assert.equal(result.length, 1);
  assert.equal(result[0].id, 'prod-2');
});

test('filterProductsBySearch matches multi-word queries even with different word order', () => {
  const result = filterProductsBySearch(mockProducts, 'digital fryer air');
  assert.equal(result.length, 1);
  assert.equal(result[0].id, 'prod-1');
});

test('filterProductsBySearch returns empty array when query does not match anything', () => {
  const result = filterProductsBySearch(mockProducts, 'chaussure de ski inconnue');
  assert.equal(result.length, 0);
});

