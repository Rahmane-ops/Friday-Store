import {
  buildCloudinaryFolder,
  buildCloudinaryUploadEndpoint,
  CloudinaryUploadConfig,
  mapCloudinaryError,
  optimizeCloudinaryUrl,
  validateCloudinaryConfig,
  validateProductImageFile,
} from '../utils/storageUpload';

export interface UploadedImageResult {
  downloadUrl: string;
  publicId: string;
}

interface CloudinaryUploadResponse {
  secure_url?: string;
  public_id?: string;
  error?: { message?: string };
}

export async function uploadProductImageToCloudinary(params: {
  file: File;
  productIdOrSlug: string;
  config: Partial<CloudinaryUploadConfig>;
  onProgress?: (percent: number) => void;
}): Promise<UploadedImageResult> {
  const fileValidation = validateProductImageFile({
    name: params.file.name,
    size: params.file.size,
    type: params.file.type,
  });
  if (!fileValidation.valid) {
    throw new Error(fileValidation.error);
  }

  const configValidation = validateCloudinaryConfig(params.config);
  if (!configValidation.valid) {
    throw new Error(configValidation.error);
  }

  const endpoint = buildCloudinaryUploadEndpoint(configValidation.cloudName);
  const targetFolder = buildCloudinaryFolder(configValidation.folder, params.productIdOrSlug);

  const formData = new FormData();
  formData.append('file', params.file);
  formData.append('upload_preset', configValidation.uploadPreset);
  formData.append('folder', targetFolder);

  return new Promise<UploadedImageResult>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', endpoint, true);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && event.total > 0 && params.onProgress) {
        const pct = Math.min(99, Math.round((event.loaded / event.total) * 100));
        params.onProgress(pct);
      }
    };

    xhr.onload = () => {
      let parsed: CloudinaryUploadResponse = {};
      try {
        parsed = JSON.parse(xhr.responseText || '{}') as CloudinaryUploadResponse;
      } catch {
        // ignore JSON parse failure
      }

      if (xhr.status >= 200 && xhr.status < 300 && parsed.secure_url) {
        if (params.onProgress) params.onProgress(100);
        resolve({
          downloadUrl: optimizeCloudinaryUrl(parsed.secure_url),
          publicId: parsed.public_id || '',
        });
        return;
      }

      const rawError = parsed?.error?.message || `HTTP ${xhr.status}`;
      reject(new Error(mapCloudinaryError(rawError)));
    };

    xhr.onerror = () => {
      reject(
        new Error(
          "Impossible de contacter Cloudinary. Vérifiez votre connexion internet et votre Cloud Name."
        )
      );
    };

    xhr.onabort = () => {
      reject(new Error('Téléversement annulé.'));
    };

    xhr.send(formData);
  });
}
