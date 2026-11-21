import { getPrisma } from '../../platform/config/prisma';
import type { Prisma } from '@prisma/client';

export const businessAvailabilityRepository = {
  async findFirst() {
    const prisma = getPrisma();
    return prisma.businessAvailabilityPolicy.findFirst();
  },

  async update(id: string, data: Prisma.BusinessAvailabilityPolicyUpdateInput) {
    const prisma = getPrisma();
    return prisma.businessAvailabilityPolicy.update({
      where: { id },
      data,
    });
  },
};

