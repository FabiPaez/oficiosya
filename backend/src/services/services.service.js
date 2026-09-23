import {
    findAllServices,
    findServiceById,
    findServiceByCategoryAndName,
    createServiceRecord,
    updateServiceRecord,
  } from '../repositories/services.repository.js';
  import { findCategoryById } from '../repositories/categories.repository.js';
  import { AppError } from '../utils/AppError.js';
  
  export async function getServices({ categoryId, includeInactive = false } = {}) {
    return findAllServices({ categoryId, includeInactive });
  }
  
  export async function getServiceById(id) {
    const service = await findServiceById(id);
    if (!service) {
      throw new AppError('Servicio no encontrado', 404);
    }
    return service;
  }
  
  export async function createNewService({ categoryId, name, description }) {
    const category = await findCategoryById(categoryId);
    if (!category) {
      throw new AppError('La categoría asociada no existe', 404);
    }
  
    const existing = await findServiceByCategoryAndName(categoryId, name);
    if (existing) {
      throw new AppError('Ya existe un servicio con ese nombre en esta categoría', 409);
    }
  
    return createServiceRecord({ categoryId, name, description });
  }
  
  export async function updateExistingService(id, { name, description, isActive }) {
    const service = await findServiceById(id);
    if (!service) {
      throw new AppError('Servicio no encontrado', 404);
    }
  
    if (name !== undefined) {
      const existing = await findServiceByCategoryAndName(service.category_id, name);
      if (existing && existing.id !== Number(id)) {
        throw new AppError('Ya existe un servicio con ese nombre en esta categoría', 409);
      }
    }
  
    return updateServiceRecord(id, { name, description, isActive });
  }
  
  export async function deactivateService(id) {
    const service = await findServiceById(id);
    if (!service) {
      throw new AppError('Servicio no encontrado', 404);
    }
  
    if (!service.is_active) {
      throw new AppError('El servicio ya está inactivo', 409);
    }
  
    return updateServiceRecord(id, { isActive: false });
  }