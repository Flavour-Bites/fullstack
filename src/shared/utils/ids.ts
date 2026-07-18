import crypto from 'crypto';

const randomPart = (bytes = 6) => crypto.randomBytes(bytes).toString('hex');

export function makeId(prefix: string) {
  return `${prefix}_${randomPart()}`;
}

/**
 * Generate a UUID v4 order ID with an FB- prefix.
 * crypto.randomUUID() provides 122 bits of random entropy,
 * making collisions practically impossible.
 */
export function makeOrderId() {
  return `FB-${crypto.randomUUID()}`;
}
