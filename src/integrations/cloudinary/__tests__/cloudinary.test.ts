import { describe, it, expect } from 'vitest';
import { validateImageUpload, ALLOWED_IMAGE_TYPES, MAX_IMAGE_BYTES } from '../cloudinaryClient.js';

describe('validateImageUpload', () => {
  const validInput = {
    fileName: 'cake.jpg',
    mimeType: 'image/jpeg',
    size: 500000,
    dataBase64: Buffer.alloc(100).toString('base64'),
  };

  it('returns base64 and byteLength for valid input', () => {
    const result = validateImageUpload(validInput);
    expect(result.base64).toBeTruthy();
    expect(result.byteLength).toBe(100);
  });

  it('throws for invalid mime type', () => {
    expect(() =>
      validateImageUpload({ ...validInput, mimeType: 'image/svg+xml' })
    ).toThrow('Please upload a JPG, PNG, WEBP, or GIF image.');
  });

  it('throws for oversized image', () => {
    expect(() =>
      validateImageUpload({ ...validInput, size: MAX_IMAGE_BYTES + 1 })
    ).toThrow('Image must be smaller than 10 MB.');
  });

  it('validates ALLOWED_IMAGE_TYPES', () => {
    expect(ALLOWED_IMAGE_TYPES.has('image/jpeg')).toBe(true);
    expect(ALLOWED_IMAGE_TYPES.has('image/png')).toBe(true);
    expect(ALLOWED_IMAGE_TYPES.has('image/webp')).toBe(true);
    expect(ALLOWED_IMAGE_TYPES.has('image/gif')).toBe(true);
    expect(ALLOWED_IMAGE_TYPES.has('image/bmp')).toBe(false);
  });
});
