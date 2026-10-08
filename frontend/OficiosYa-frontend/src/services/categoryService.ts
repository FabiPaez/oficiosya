import { mockCategories } from '../data/mockCategories'
import type { Category } from '../types/category'

export const categoryService = {
  async getAll(): Promise<Category[]> {
    return Promise.resolve(mockCategories.filter((category) => category.active))
  },

  async getById(id: string): Promise<Category | null> {
    const category = mockCategories.find(
      (item) => item.id === id && item.active,
    )

    return Promise.resolve(category ?? null)
  },
}