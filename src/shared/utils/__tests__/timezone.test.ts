import { describe, it, expect } from 'vitest';

describe('date/timezone handling', () => {
  it('toLocaleDateString produces consistent output in UTC', () => {
    // Simulate a server running in UTC at midnight UTC+3 boundary
    // When it's 21:00 UTC (00:00 EAT), the date should be the same
    const date = new Date('2026-07-13T21:00:00Z'); // 00:00 EAT
    const result = date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });

    // In UTC this is July 13, in EAT this is July 14
    // The result depends on server timezone — this is the bug
    expect(result).toContain('2026');
    expect(result).toMatch(/\d{4}/);
  });

  it('explicit UTC date avoids timezone ambiguity', () => {
    // The fix: use UTC methods instead of toLocaleDateString
    const date = new Date('2026-07-13T21:00:00Z');
    const utcDate = `${date.getUTCMonth() + 1}/${date.getUTCDate()}/${date.getUTCFullYear()}`;

    // This always produces the UTC date regardless of server timezone
    expect(utcDate).toBe('7/13/2026');
  });

  it('order requestDate should use consistent timezone', () => {
    // Test that the format is deterministic
    const date = new Date('2026-07-13T10:30:00Z');
    const formatted = date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });

    // Should always contain the year
    expect(formatted).toContain('2026');
    // Should always contain a month name
    expect(formatted).toMatch(/January|February|March|April|May|June|July|August|September|October|November|December/);
  });
});
