import { describe, it, expect } from 'vitest';
import { slugifyCategoryName, categoryDisplayName } from '../categories.js';

describe('slugifyCategoryName', () => {
  it('lowercases and replaces spaces with hyphens', () => {
    expect(slugifyCategoryName('Celebration Cakes')).toBe('celebration-cakes');
  });

  it('removes special characters', () => {
    expect(slugifyCategoryName("Kids' Party!")).toBe('kids-party');
  });

  it('trims leading/trailing hyphens', () => {
    expect(slugifyCategoryName('  --Birthday--  ')).toBe('birthday');
  });

  it('handles single word', () => {
    expect(slugifyCategoryName('Treats')).toBe('treats');
  });
});

describe('categoryDisplayName', () => {
  it('pascal-cases a slug', () => {
    expect(categoryDisplayName('celebration-cakes')).toBe('Celebration Cakes');
  });

  it('handles single word', () => {
    expect(categoryDisplayName('birthday')).toBe('Birthday');
  });
});
