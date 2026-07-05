import { usersRepository } from './users.repository.js';
import type { Role } from '@prisma/client';

export const usersService = {
  async findAll() {
    return usersRepository.findAll();
  },

  async updateRole(targetUserId: string, role: Role, currentUserId: string) {
    if (targetUserId === currentUserId && role !== 'admin') {
      throw new Error('You cannot remove your own admin access.');
    }
    return usersRepository.updateRole(targetUserId, role);
  },

  async delete(targetUserId: string, currentUserId: string) {
    if (targetUserId === currentUserId) {
      throw new Error('You cannot delete your own account.');
    }
    return usersRepository.delete(targetUserId);
  },
};
