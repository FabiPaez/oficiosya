
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

export async function getProviderServices(
  providerId,
  { includeInactive = false } = {},
  supabaseClient,
) {
  const provider = supabaseClient
    ? await findProviderById(providerId, supabaseClient)
    : await findProviderById(providerId);

  if (!provider) {
    throw new AppError('Prestador no encontrado', 404);
  }

  return supabaseClient
    ? findServicesByProviderId(
        providerId,
        { includeInactive },
        supabaseClient,
      )
    : findServicesByProviderId(providerId, { includeInactive });
}

export async function addServiceToProvider(
  providerId,
  { serviceId, priceFrom, priceTo, description },
  supabaseClient,
) {
  const provider = supabaseClient
    ? await findProviderById(providerId, supabaseClient)
    : await findProviderById(providerId);

  if (!provider) {
    throw new AppError(
      'Debes estar registrado como prestador para ofrecer servicios',
      403,
    );
  }

  const service = supabaseClient
    ? await findServiceById(serviceId, supabaseClient)
    : await findServiceById(serviceId);

  if (!service || !service.is_active) {
    throw new AppError(
      'El servicio especificado no existe o está inactivo',
      404,
    );
  }

  const existingRelation = supabaseClient
    ? await findProviderServiceRelation(
        providerId,
        serviceId,
        supabaseClient,
      )
    : await findProviderServiceRelation(providerId, serviceId);

  if (existingRelation) {
    throw new AppError(
      'Ya tienes vinculado este servicio en tu perfil',
      409,
    );
  }

  const record = {
    providerId,
    serviceId,
    priceFrom,
    priceTo,
    description,
  };

  return supabaseClient
    ? createProviderServiceRecord(record, supabaseClient)
    : createProviderServiceRecord(record);
}

export async function updateProviderService(
  id,
  userId,
  userRoles,
  updateData,
  supabaseClient,
) {
  const record = supabaseClient
    ? await findProviderServiceById(id, supabaseClient)
    : await findProviderServiceById(id);

  if (!record) {
    throw new AppError('Servicio de prestador no encontrado', 404);
  }

  const isAdmin = userRoles?.includes('ADMIN');
  const isOwner = record.provider_id === userId;

  if (!isOwner && !isAdmin) {
    throw new AppError(
      'No tienes permisos para modificar este servicio',
      403,
    );
  }

  return supabaseClient
    ? updateProviderServiceRecord(id, updateData, supabaseClient)
    : updateProviderServiceRecord(id, updateData);
}

export async function deactivateProviderService(
  id,
  userId,
  userRoles,
  supabaseClient,
) {
  const record = supabaseClient
    ? await findProviderServiceById(id, supabaseClient)
    : await findProviderServiceById(id);

  if (!record) {
    throw new AppError('Servicio de prestador no encontrado', 404);
  }

  const isAdmin = userRoles?.includes('ADMIN');
  const isOwner = record.provider_id === userId;

  if (!isOwner && !isAdmin) {
    throw new AppError(
      'No tienes permisos para desactivar este servicio',
      403,
    );
  }

  if (!record.is_active) {
    throw new AppError('El servicio ya se encuentra inactivo', 409);
  }

  return supabaseClient
    ? updateProviderServiceRecord(
        id,
        { isActive: false },
        supabaseClient,
      )
    : updateProviderServiceRecord(id, { isActive: false });
}