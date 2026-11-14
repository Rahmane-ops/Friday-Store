import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildCloudinaryFolder,
  buildCloudinaryUploadEndpoint,
  isCloudinaryUrl,
  mapCloudinaryError,
  MAX_PRODUCT_IMAGE_BYTES,
  optimizeCloudinaryUrl,
  validateCloudinaryConfig,
  validateProductImageFile,
} from './storageUpload';

test('validateProductImageFile accepts valid JPG/PNG/WEBP/AVIF under 5MB', () => {
  assert.deepEqual(
    validateProductImageFile({ name: 'airfryer.webp', size: 850_000, type: 'image/webp' }),
    { valid: true }
  );
  assert.deepEqual(
    validateProductImageFile({ name: 'photo.jpg', size: 1_200_000, type: 'image/jpeg' }),
    { valid: true }
  );
});

test('validateProductImageFile rejects unsupported MIME types and oversized files', () => {
  const badType = validateProductImageFile({ name: 'doc.pdf', size: 120_000, type: 'application/pdf' });
  assert.equal(badType.valid, false);

  const tooBig = validateProductImageFile({
    name: 'huge.png',
    size: MAX_PRODUCT_IMAGE_BYTES + 1,
    type: 'image/png',
  });
  assert.equal(tooBig.valid, false);
});

test('validateCloudinaryConfig enforces valid cloudName and uploadPreset', () => {
  const ok = validateCloudinaryConfig({
    cloudName: 'fridaystore-sn',
    uploadPreset: 'friday_unsigned',
    folder: 'Friday Store/Produits',
  });
  assert.equal(ok.valid, true);
  if (ok.valid) {
    assert.equal(ok.cloudName, 'fridaystore-sn');
    assert.equal(ok.uploadPreset, 'friday_unsigned');
    assert.equal(ok.folder, 'friday-store/produits');
  }

  const badUrl = validateCloudinaryConfig({
    cloudName: 'https://res.cloudinary.com/demo',
    uploadPreset: 'preset',
  });
  assert.equal(badUrl.valid, false);

  const emptyPreset = validateCloudinaryConfig({
    cloudName: 'demo',
    uploadPreset: '  ',
  });
  assert.equal(emptyPreset.valid, false);
});

test('buildCloudinaryUploadEndpoint and buildCloudinaryFolder build clean Cloudinary targets', () => {
  assert.equal(
    buildCloudinaryUploadEndpoint('fridaystore-sn'),
    'https://api.cloudinary.com/v1_1/fridaystore-sn/image/upload'
  );
  assert.equal(
    buildCloudinaryFolder('friday-store/products', 'Écouteurs Sans Fil Pro'),
    'friday-store/products/ecouteurs-sans-fil-pro'
  );
});

test('optimizeCloudinaryUrl injects f_auto,q_auto only once on Cloudinary URLs', () => {
  const raw = 'https://res.cloudinary.com/demo/image/upload/v17000000/friday-store/airfryer.jpg';
  const optimized = optimizeCloudinaryUrl(raw);
  assert.equal(
    optimized,
    'https://res.cloudinary.com/demo/image/upload/f_auto,q_auto/v17000000/friday-store/airfryer.jpg'
  );
  assert.equal(optimizeCloudinaryUrl(optimized), optimized);
  assert.equal(isCloudinaryUrl(optimized), true);
  assert.equal(isCloudinaryUrl('/assets/images/product_airfryer_digital_1793989489237.jpg'), false);
});

test('mapCloudinaryError returns helpful French guidance for unsigned preset errors', () => {
  const msg = mapCloudinaryError('Upload preset must be whitelisted for unsigned uploads');
  assert.match(msg, /Unsigned/i);
});
