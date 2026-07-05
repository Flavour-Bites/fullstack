import crypto from 'crypto';

export const ALLOWED_IMAGE_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]);

export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

export type ImageUploadInput = {
  fileName: string;
  mimeType: string;
  size: number;
  dataBase64: string;
};

export function validateImageUpload(input: ImageUploadInput) {
  if (!ALLOWED_IMAGE_TYPES.has(input.mimeType)) {
    throw new Error('Please upload a JPG, PNG, WEBP, or GIF image.');
  }

  if (!Number.isFinite(input.size) || input.size <= 0 || input.size > MAX_IMAGE_BYTES) {
    throw new Error('Image must be smaller than 10 MB.');
  }

  const base64 = input.dataBase64.includes(',')
    ? input.dataBase64.split(',').pop() || ''
    : input.dataBase64;
  const byteLength = Buffer.byteLength(base64, 'base64');

  if (byteLength <= 0 || byteLength > MAX_IMAGE_BYTES) {
    throw new Error('Image must be smaller than 10 MB.');
  }

  return { base64, byteLength };
}

function requireCloudinaryEnv() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error('Cloudinary is not configured.');
  }
  return { cloudName, apiKey, apiSecret };
}

function signCloudinaryParams(params: Record<string, string | number>, apiSecret: string) {
  const payload = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join('&');

  return crypto.createHash('sha1').update(`${payload}${apiSecret}`).digest('hex');
}

export async function uploadImageToCloudinary(input: ImageUploadInput) {
  const { cloudName, apiKey, apiSecret } = requireCloudinaryEnv();
  const { base64, byteLength } = validateImageUpload(input);
  const timestamp = Math.floor(Date.now() / 1000);
  const folder = process.env.CLOUDINARY_UPLOAD_FOLDER || 'flavour-bites';
  const params = { folder, timestamp };
  const signature = signCloudinaryParams(params, apiSecret);

  const form = new FormData();
  form.append('file', `data:${input.mimeType};base64,${base64}`);
  form.append('api_key', apiKey);
  form.append('timestamp', String(timestamp));
  form.append('folder', folder);
  form.append('signature', signature);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body: form,
  });

  const body = await response.json();
  if (!response.ok) {
    throw new Error(body?.error?.message || 'Image upload failed.');
  }

  return {
    url: body.secure_url as string,
    publicId: body.public_id as string,
    format: body.format as string,
    bytes: Number(body.bytes || byteLength),
  };
}

export async function deleteImageFromCloudinary(publicId: string) {
  const { cloudName, apiKey, apiSecret } = requireCloudinaryEnv();
  const timestamp = Math.floor(Date.now() / 1000);
  const params = { public_id: publicId, timestamp };
  const signature = signCloudinaryParams(params, apiSecret);

  const form = new FormData();
  form.append('public_id', publicId);
  form.append('api_key', apiKey);
  form.append('timestamp', String(timestamp));
  form.append('signature', signature);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`, {
    method: 'POST',
    body: form,
  });

  const body = await response.json();
  if (!response.ok) {
    throw new Error(body?.error?.message || 'Image deletion failed.');
  }

  return body;
}
