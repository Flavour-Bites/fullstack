import { categoriesRepository } from './categories.repository';

export const categoriesService = {
  async findAll(includeInactive = false) {
    return categoriesRepository.findAll(includeInactive);
  },

  async create(data: Record<string, unknown>) {
    return categoriesRepository.create(data as any);
  },

  async update(id: string, data: Record<string, unknown>) {
    return categoriesRepository.update(id, data);
  },

  async delete(id: string) {
    return categoriesRepository.softDelete(id);
  },
};
