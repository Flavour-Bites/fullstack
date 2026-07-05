import { describe, it, expect, vi } from 'vitest';
import { usersService } from '../users.service.js';

const mockUsers = [
  { id: 'usr_001', name: 'Admin', role: 'admin', telegramId: '1', telegramUsername: 'admin', notifyViaTelegram: false, createdAt: new Date() },
  { id: 'usr_002', name: 'Staff', role: 'staff', telegramId: '2', telegramUsername: 'staff', notifyViaTelegram: false, createdAt: new Date() },
  { id: 'usr_003', name: 'Customer', role: 'customer', telegramId: '3', telegramUsername: 'cust', notifyViaTelegram: false, createdAt: new Date() },
];

vi.mock('../users.repository.js', () => ({
  usersRepository: {
    findAll: vi.fn(() => Promise.resolve(mockUsers)),
    updateRole: vi.fn((id, role) => Promise.resolve({ ...mockUsers.find(u => u.id === id), role })),
    delete: vi.fn((id) => Promise.resolve(mockUsers.find(u => u.id === id))),
  },
}));

describe('usersService.findAll', () => {
  it('returns all users', async () => {
    const users = await usersService.findAll();
    expect(users).toHaveLength(3);
  });
});

describe('usersService.updateRole', () => {
  it('updates user role', async () => {
    const user = await usersService.updateRole('usr_002', 'admin', 'usr_001');
    expect(user.role).toBe('admin');
  });

  it('throws when admin tries to remove own admin role', async () => {
    await expect(usersService.updateRole('usr_001', 'customer', 'usr_001'))
      .rejects.toThrow('You cannot remove your own admin access');
  });

  it('allows admin to change own role to admin (noop)', async () => {
    const user = await usersService.updateRole('usr_001', 'admin', 'usr_001');
    expect(user.role).toBe('admin');
  });
});

describe('usersService.delete', () => {
  it('deletes a user', async () => {
    const user = await usersService.delete('usr_003', 'usr_001');
    expect(user?.id).toBe('usr_003');
  });

  it('throws when deleting own account', async () => {
    await expect(usersService.delete('usr_001', 'usr_001'))
      .rejects.toThrow('You cannot delete your own account');
  });
});
