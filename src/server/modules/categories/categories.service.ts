import { categoriesRepository } from './categories.repository';
import type { CategoryInput, CategoryUpdateInput } from './categories.schemas';

export const categoriesService = {
  async findAll(includeInactive = false) {
    return categoriesRepository.findAll(includeInactive);
  },

  async create(data: CategoryInput) {
    return categoriesRepository.create(data);
  },

  async update(id: string, data: CategoryUpdateInput) {
    return categoriesRepository.update(id, data);
  },

  async delete(id: string) {
    return categoriesRepository.softDelete(id);
  },
};
