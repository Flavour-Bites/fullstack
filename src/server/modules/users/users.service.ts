import { usersRepository } from './users.repository';
import type { Role } from '@prisma/client';
import { ValidationError, AuthorizationError } from '../../platform/errors/index';

export const usersService = {
  async findAll() {
    return usersRepository.findAll();
  },

  async updateRole(targetUserId: string, role: Role, currentUserId: string) {
    if (targetUserId === currentUserId && role !== 'admin') {
      throw new ValidationError('You cannot remove your own admin access.');
    }

    if (role !== 'admin') {
      const adminCount = await usersRepository.countByRole('admin');
      const target = await usersRepository.findById(targetUserId);
      if (target?.role === 'admin' && adminCount <= 1) {
        throw new ValidationError('Cannot demote the last admin.');
      }
    }

    return usersRepository.updateRole(targetUserId, role);
  },

  async delete(targetUserId: string, currentUserId: string) {
    if (targetUserId === currentUserId) {
      throw new AuthorizationError('You cannot delete your own account.');
    }
    return usersRepository.delete(targetUserId);
  },
};
