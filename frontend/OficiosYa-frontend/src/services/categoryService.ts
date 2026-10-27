import { apiFetch } from './api'
import type { Category } from '../types/category'
import { mockCategories } from '../data/mockCategories'

interface ApiCategory {
  id: number
  name: string
  description: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

interface CategoriesResponse {
  success: boolean
  data: ApiCategory[]
}

interface CategoryResponse {
  success: boolean
  data: ApiCategory
}

function mapCategory(category: ApiCategory): Category {
  return {
    id: String(category.id),
    name: category.name,
    description: category.description ?? '',
    active: category.is_active,
  }
}

export const categoryService = {
  async getAll(): Promise<Category[]> {
    try {
      const response = await apiFetch<CategoriesResponse>('/categories')

      if (response && response.success && Array.isArray(response.data)) {
        return response.data
          .filter((category) => category.is_active)
          .map(mapCategory)
      }
    } catch {
      // Fallback a mockCategories en desarrollo u offline
      return mockCategories.filter((category) => category.active)
    }

    return mockCategories.filter((category) => category.active)
  },

  async getById(id: string): Promise<Category | null> {
    try {
      const response = await apiFetch<CategoryResponse>(
        `/categories/${encodeURIComponent(id)}`,
      )

      if (response && response.success && response.data?.is_active) {
        return mapCategory(response.data)
      }
    } catch {
      // Fallback a mockCategories en desarrollo u offline
      return (
        mockCategories.find(
          (category) =>
            (category.id === id || String(category.id) === String(id)) &&
            category.active,
        ) ?? null
      )
    }

    return (
      mockCategories.find(
        (category) =>
          (category.id === id || String(category.id) === String(id)) &&
          category.active,
      ) ?? null
    )
  },
}
