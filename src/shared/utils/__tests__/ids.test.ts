import { describe, it, expect } from 'vitest';
import { makeId, makeOrderId } from '../ids.js';

describe('makeId', () => {
  it('generates an ID with the correct prefix', () => {
    const id = makeId('usr');
    expect(id.startsWith('usr_')).toBe(true);
  });

  it('generates unique IDs', () => {
    const ids = new Set(Array.from({ length: 100 }, () => makeId('cat')));
    expect(ids.size).toBe(100);
  });
});

describe('makeOrderId', () => {
  it('generates an ID starting with FB-', () => {
    const id = makeOrderId();
    expect(id.startsWith('FB-')).toBe(true);
  });

  it('generates IDs of expected length', () => {
    const id = makeOrderId();
    expect(id.length).toBeGreaterThan(3);
    expect(id.split('-')[1].length).toBe(6);
  });
});
