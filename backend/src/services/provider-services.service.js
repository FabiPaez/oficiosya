import {
    findServicesByProviderId,
    findProviderServiceById,
    findProviderServiceRelation,
    createProviderServiceRecord,
    updateProviderServiceRecord,
  } from '../repositories/provider-services.repository.js';
  import { findServiceById } from '../repositories/services.repository.js';
  import { findProviderById } from '../repositories/providers.repository.js';
  import { AppError } from '../utils/AppError.js';
  
  export async function getProviderServices(providerId, { includeInactive = false } = {}) {
    const provider = await findProviderById(providerId);
    if (!provider) {
      throw new AppError('Prestador no encontrado', 404);
    }
  
    return findServicesByProviderId(providerId, { includeInactive });
  }
  
  export async function addServiceToProvider(providerId, { serviceId, priceFrom, priceTo, description }) {
    const provider = await findProviderById(providerId);
    if (!provider) {
      throw new AppError('Debes estar registrado como prestador para ofrecer servicios', 403);
    }
  
    const service = await findServiceById(serviceId);
    if (!service || !service.is_active) {
      throw new AppError('El servicio especificado no existe o está inactivo', 404);
    }
  
    const existingRelation = await findProviderServiceRelation(providerId, serviceId);
    if (existingRelation) {
      throw new AppError('Ya tienes vinculado este servicio en tu perfil', 409);
    }
  
    return createProviderServiceRecord({ providerId, serviceId, priceFrom, priceTo, description });
  }
  
  export async function updateProviderService(id, userId, userRoles, updateData) {
    const record = await findProviderServiceById(id);
    if (!record) {
      throw new AppError('Servicio de prestador no encontrado', 404);
    }
  
    const isAdmin = userRoles?.includes('ADMIN');
    const isOwner = record.provider_id === userId;
  
    if (!isOwner && !isAdmin) {
      throw new AppError('No tienes permisos para modificar este servicio', 403);
    }
  
    return updateProviderServiceRecord(id, updateData);
  }
  
  export async function deactivateProviderService(id, userId, userRoles) {
    const record = await findProviderServiceById(id);
    if (!record) {
      throw new AppError('Servicio de prestador no encontrado', 404);
    }
  
    const isAdmin = userRoles?.includes('ADMIN');
    const isOwner = record.provider_id === userId;
  
    if (!isOwner && !isAdmin) {
      throw new AppError('No tienes permisos para desactivar este servicio', 403);
    }
  
    if (!record.is_active) {
      throw new AppError('El servicio ya se encuentra inactivo', 409);
    }
  
    return updateProviderServiceRecord(id, { isActive: false });
  }