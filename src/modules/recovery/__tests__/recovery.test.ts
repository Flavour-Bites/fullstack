import { describe, it, expect, vi } from 'vitest';
import { recoveryService } from '../recovery.service.js';

vi.mock('../recovery.repository.js', () => {
  let callCount = 0;
  return {
    recoveryRepository: {
      findExisting: vi.fn(() => {
        callCount++;
        return callCount > 1
          ? Promise.resolve({ id: 'rec_existing', oldTelegramId: '111', newTelegramId: '222', status: 'pending' })
          : Promise.resolve(null);
      }),
      create: vi.fn((oldId, newId) => Promise.resolve({
        id: 'rec_abc', oldTelegramId: oldId, newTelegramId: newId, status: 'pending',
      })),
      updateStatus: vi.fn((id, status) => Promise.resolve({ id, status })),
      findAll: vi.fn(() => Promise.resolve([])),
    },
  };
});

describe('recoveryService.create', () => {
  it('creates a new recovery request', async () => {
    const result = await recoveryService.create('111', '222');
    expect(result.alreadyExists).toBe(false);
    expect(result.request.oldTelegramId).toBe('111');
    expect(result.request.newTelegramId).toBe('222');
    expect(result.request.status).toBe('pending');
  });

  it('returns alreadyExists for existing pending', async () => {
    const result = await recoveryService.create('111', '222');
    expect(result.alreadyExists).toBe(true);
  });
});

describe('recoveryService.updateStatus', () => {
  it('updates to approved', async () => {
    const result = await recoveryService.updateStatus('rec_abc', 'approved');
    expect(result.status).toBe('approved');
  });

  it('updates to rejected', async () => {
    const result = await recoveryService.updateStatus('rec_abc', 'rejected');
    expect(result.status).toBe('rejected');
  });
});
