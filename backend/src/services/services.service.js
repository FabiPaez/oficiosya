import {
  findAllServices,
  findServiceById,
  findServiceByCategoryAndName,
  createServiceRecord,
  updateServiceRecord,
} from '../repositories/services.repository.js';

import { findCategoryById } from '../repositories/categories.repository.js';
import { AppError } from '../utils/AppError.js';

export async function getServices(
  { categoryId, includeInactive = false } = {},
  supabaseClient
) {
  const options = { categoryId, includeInactive };

  return supabaseClient
    ? findAllServices(options, supabaseClient)
    : findAllServices(options);
}


export async function getServiceById(
  id,
  supabaseClient,
  { includeInactive = false } = {}
) {
  const service = supabaseClient
    ? await findServiceById(id, supabaseClient)
    : await findServiceById(id);

  if (!service || (!includeInactive && service.is_active === false)) {
    throw new AppError('Servicio no encontrado', 404);
  }

  return service;
}

export async function createNewService(
  { categoryId, name, description },
  supabaseClient
) {
  const category = supabaseClient
    ? await findCategoryById(categoryId, supabaseClient)
    : await findCategoryById(categoryId);

  if (!category) {
    throw new AppError('La categoría asociada no existe', 404);
  }

  const existing = supabaseClient
    ? await findServiceByCategoryAndName(
      categoryId,
      name,
      supabaseClient
    )
    : await findServiceByCategoryAndName(categoryId, name);

  if (existing) {
    throw new AppError(
      'Ya existe un servicio con ese nombre en esta categoría',
      409
    );
  }

  const data = { categoryId, name, description };

  return supabaseClient
    ? createServiceRecord(data, supabaseClient)
    : createServiceRecord(data);
}

export async function updateExistingService(
  id,
  { name, description, isActive },
  supabaseClient
) {
  const service = supabaseClient
    ? await findServiceById(id, supabaseClient)
    : await findServiceById(id);

  if (!service) {
    throw new AppError('Servicio no encontrado', 404);
  }

  if (name !== undefined) {
    const existing = supabaseClient
      ? await findServiceByCategoryAndName(
        service.category_id,
        name,
        supabaseClient
      )
      : await findServiceByCategoryAndName(
        service.category_id,
        name
      );

    if (existing && existing.id !== Number(id)) {
      throw new AppError(
        'Ya existe un servicio con ese nombre en esta categoría',
        409
      );
    }
  }

  const updates = { name, description, isActive };

  return supabaseClient
    ? updateServiceRecord(id, updates, supabaseClient)
    : updateServiceRecord(id, updates);
}

export async function deactivateService(id, supabaseClient) {
  const service = supabaseClient
    ? await findServiceById(id, supabaseClient)
    : await findServiceById(id);

  if (!service) {
    throw new AppError('Servicio no encontrado', 404);
  }

  if (!service.is_active) {
    throw new AppError('El servicio ya está inactivo', 409);
  }

  const updates = { isActive: false };

  return supabaseClient
    ? updateServiceRecord(id, updates, supabaseClient)
    : updateServiceRecord(id, updates);
}