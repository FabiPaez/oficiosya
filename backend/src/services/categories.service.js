import {
    findAllCategories,
    findCategoryById,
    findCategoryByName,
    createCategory,
    updateCategory,
  } from '../repositories/categories.repository.js';
  
  import { AppError } from '../utils/AppError.js';
  
  export async function getCategories({
    includeInactive = false,
  } = {}) {
    return findAllCategories({
      includeInactive,
    });
  }
  
  export async function getCategoryById(id) {
    const category = await findCategoryById(id);
  
    if (!category) {
      throw new AppError(
        'Categoría no encontrada',
        404
      );
    }
  
    return category;
  }
  
  export async function createNewCategory({
    name,
    description,
  }) {
    const existingCategory =
      await findCategoryByName(name);
  
    if (existingCategory) {
      throw new AppError(
        'Ya existe una categoría con ese nombre',
        409
      );
    }
  
    return createCategory({
      name,
      description,
    });
  }
  
  export async function updateExistingCategory(
    id,
    {
      name,
      description,
      isActive,
    }
  ) {
    const category = await findCategoryById(id);
  
    if (!category) {
      throw new AppError(
        'Categoría no encontrada',
        404
      );
    }
  
    if (name !== undefined) {
      const existingCategory =
        await findCategoryByName(name);
  
      if (
        existingCategory &&
        existingCategory.id !== Number(id)
      ) {
        throw new AppError(
          'Ya existe una categoría con ese nombre',
          409
        );
      }
    }
  
    return updateCategory(id, {
      name,
      description,
      isActive,
    });
  }
  
  export async function deactivateCategory(id) {
    const category = await findCategoryById(id);
  
    if (!category) {
      throw new AppError(
        'Categoría no encontrada',
        404
      );
    }
  
    if (!category.is_active) {
      throw new AppError(
        'La categoría ya está inactiva',
        409
      );
    }
  
    return updateCategory(id, {
      isActive: false,
    });
  }