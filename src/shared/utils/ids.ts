import crypto from 'crypto';

const randomPart = (bytes = 6) => crypto.randomBytes(bytes).toString('hex');

export function makeId(prefix: string) {
  return `${prefix}_${randomPart()}`;
}

export function makeOrderId() {
  return `FB-${randomPart(3).toUpperCase()}`;
}
