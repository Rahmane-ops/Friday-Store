import test from 'node:test';
import assert from 'node:assert/strict';
import {
  isSafeRichImageUrl,
  MAX_RICH_SECTIONS,
  parseInlineRichDescription,
  resolveProductRichSections,
  sanitizeRichSections,
} from './richDescription';
import { INITIAL_PRODUCTS } from '../data/mockData';

test('isSafeRichImageUrl allows https, http, and /assets/ paths while blocking javascript/data URIs', () => {
  assert.equal(isSafeRichImageUrl('https://res.cloudinary.com/demo/image/upload/v1/item.jpg'), true);
  assert.equal(isSafeRichImageUrl('/assets/images/product_airfryer_digital_1793989489237.jpg'), true);
  assert.equal(isSafeRichImageUrl('javascript:alert(1)'), false);
  assert.equal(isSafeRichImageUrl('data:text/html,<script>'), false);
});

test('sanitizeRichSections bounds count to MAX_RICH_SECTIONS and strips unsafe URLs', () => {
  const input = Array.from({ length: 16 }, (_, idx) => ({
    id: `sec-${idx}`,
    type: 'split' as const,
    title: `Bloc ${idx}`,
    body: 'Contenu descriptif détaillé',
    imageUrl: idx === 0 ? 'javascript:bad()' : 'https://res.cloudinary.com/demo/image/upload/v1/ok.jpg',
    imagePosition: 'right' as const,
  }));

  const cleaned = sanitizeRichSections(input);
  assert.equal(cleaned.length, MAX_RICH_SECTIONS);
  assert.equal(cleaned[0].imageUrl, undefined);
  assert.equal(cleaned[1].imageUrl, 'https://res.cloudinary.com/demo/image/upload/v1/ok.jpg');
});

test('parseInlineRichDescription extracts headings, paragraphs, and markdown images cleanly', () => {
  const raw = [
    '## Performance au quotidien',
    'Cuisson rapide et homogène sans huile ajoutée.',
    '',
    '![Vue intérieure du panier](https://res.cloudinary.com/demo/image/upload/v1/basket.webp)',
    '',
    'Facile à nettoyer après chaque repas.',
  ].join('\n');

  const parsed = parseInlineRichDescription(raw);
  assert.deepEqual(parsed, [
    { kind: 'heading', text: 'Performance au quotidien' },
    { kind: 'paragraph', text: 'Cuisson rapide et homogène sans huile ajoutée.' },
    {
      kind: 'image',
      url: 'https://res.cloudinary.com/demo/image/upload/v1/basket.webp',
      caption: 'Vue intérieure du panier',
    },
    { kind: 'paragraph', text: 'Facile à nettoyer après chaque repas.' },
  ]);
});

test('resolveProductRichSections returns dynamic fallback showcase when explicit richSections are empty', () => {
  const base = { ...INITIAL_PRODUCTS[0], richSections: undefined };
  const resolved = resolveProductRichSections(base);
  assert.equal(resolved.length, 1);
  assert.equal(resolved[0].type, 'split');
  assert.equal(resolved[0].imageUrl, base.images[0]);
});
