import { apiFetch } from './api'
import type { Category } from '../types/category'

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
    const response = await apiFetch<CategoriesResponse>('/categories')


    if (!response.success) {
      throw new Error('No se pudieron obtener las categorías.')
    }

    return response.data
      .filter((category) => category.is_active)
      .map(mapCategory)


  },

  async getById(id: string): Promise<Category | null> {
    const response = await apiFetch<CategoryResponse>(
      `/categories/${encodeURIComponent(id)}`,
    )


    if (!response.success || !response.data.is_active) {
      return null
    }

    return mapCategory(response.data)


  },
}
