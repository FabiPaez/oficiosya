import {
  findAllCategories,
  findCategoryById,
  findCategoryByName,
  createCategory,
  updateCategory,
} from '../repositories/categories.repository.js';

import { AppError } from '../utils/AppError.js';

export async function getCategories(
  { includeInactive = false } = {},
  supabaseClient
) {
  const options = { includeInactive };

  return supabaseClient
    ? findAllCategories(options, supabaseClient)
    : findAllCategories(options);
}


export async function getCategoryById(
  id,
  supabaseClient,
  { includeInactive = false } = {}
) {
  const category = supabaseClient
    ? await findCategoryById(id, supabaseClient)
    : await findCategoryById(id);

  if (!category || (!includeInactive && category.is_active === false)) {
    throw new AppError('Categoría no encontrada', 404);
  }

  return category;
}

export async function createNewCategory(
  { name, description },
  supabaseClient
) {
  const existingCategory = supabaseClient
    ? await findCategoryByName(name, supabaseClient)
    : await findCategoryByName(name);

  if (existingCategory) {
    throw new AppError(
      'Ya existe una categoría con ese nombre',
      409
    );
  }

  const data = { name, description };

  return supabaseClient
    ? createCategory(data, supabaseClient)
    : createCategory(data);
}

export async function updateExistingCategory(
  id,
  { name, description, isActive },
  supabaseClient
) {
  const category = supabaseClient
    ? await findCategoryById(id, supabaseClient)
    : await findCategoryById(id);

  if (!category) {
    throw new AppError('Categoría no encontrada', 404);
  }

  if (name !== undefined) {
    const existingCategory = supabaseClient
      ? await findCategoryByName(name, supabaseClient)
      : await findCategoryByName(name);

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

  const updates = { name, description, isActive };

  return supabaseClient
    ? updateCategory(id, updates, supabaseClient)
    : updateCategory(id, updates);
}

export async function deactivateCategory(id, supabaseClient) {
  const category = supabaseClient
    ? await findCategoryById(id, supabaseClient)
    : await findCategoryById(id);

  if (!category) {
    throw new AppError('Categoría no encontrada', 404);
  }

  if (!category.is_active) {
    throw new AppError(
      'La categoría ya está inactiva',
      409
    );
  }

  const updates = { isActive: false };

  return supabaseClient
    ? updateCategory(id, updates, supabaseClient)
    : updateCategory(id, updates);
}