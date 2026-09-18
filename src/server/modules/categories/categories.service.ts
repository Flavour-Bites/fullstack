import { categoriesRepository } from './categories.repository';
import { categorySchema, categoryUpdateSchema } from '../../api/schemas/categories.schemas';

export const categoriesService = {
  async findAll(includeInactive = false) {
    return categoriesRepository.findAll(includeInactive);
  },

  async create(data: Record<string, unknown>) {
    const validatedData = categorySchema.parse(data);
    return categoriesRepository.create(validatedData as any);
  },

  async update(id: string, data: Record<string, unknown>) {
    const validatedData = categoryUpdateSchema.parse(data);
    return categoriesRepository.update(id, validatedData);
  },

  async delete(id: string) {
    return categoriesRepository.softDelete(id);
  },
};
