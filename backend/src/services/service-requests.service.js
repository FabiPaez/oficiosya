import {
    createServiceRequestRecord,
    findServiceRequestById,
    findServiceRequestsByUser,
    updateServiceRequestStatusRecord,
  } from '../repositories/service-requests.repository.js';
  import { findProviderById } from '../repositories/providers.repository.js';
  import { findServiceById } from '../repositories/services.repository.js';
  import { AppError } from '../utils/AppError.js';
  
  export async function createServiceRequest(clientId, requestData) {
    const { providerId, serviceId } = requestData;
  
    if (clientId === providerId) {
      throw new AppError('No puedes crear una solicitud de servicio hacia ti mismo', 400);
    }
  
    const provider = await findProviderById(providerId);
    if (!provider) {
      throw new AppError('El prestador especificado no existe o no tiene perfil habilitado', 404);
    }
  
    const service = await findServiceById(serviceId);
    if (!service || !service.is_active) {
      throw new AppError('El servicio especificado no existe o está inactivo', 404);
    }
  
    return createServiceRequestRecord({ clientId, ...requestData });
  }
  
  export async function getServiceRequestById(id, userId, userRoles = []) {
    const request = await findServiceRequestById(id);
    if (!request) {
      throw new AppError('Solicitud de servicio no encontrada', 404);
    }
  
    const isAdmin = userRoles.includes('ADMIN');
    const isParticipant = request.client_id === userId || request.provider_id === userId;
  
    if (!isParticipant && !isAdmin) {
      throw new AppError('No tienes permisos para visualizar esta solicitud', 403);
    }
  
    return request;
  }
  
  export async function getMyServiceRequests(userId, { role = 'CLIENT' } = {}) {
    return findServiceRequestsByUser(userId, { role });
  }
  
  export async function updateServiceRequestStatus(id, userId, userRoles = [], newStatus) {
    const request = await findServiceRequestById(id);
    if (!request) {
      throw new AppError('Solicitud de servicio no encontrada', 404);
    }
  
    const isAdmin = userRoles.includes('ADMIN');
    const isClient = request.client_id === userId;
    const isProvider = request.provider_id === userId;
  
    if (!isClient && !isProvider && !isAdmin) {
      throw new AppError('No tienes permisos para modificar el estado de esta solicitud', 403);
    }
  
    // Regla: el cliente solo puede cancelar si aún está PENDING
    if (isClient && !isProvider && !isAdmin) {
      if (newStatus !== 'CANCELLED') {
        throw new AppError('El cliente solo puede cancelar una solicitud', 400);
      }
      if (request.status !== 'PENDING') {
        throw new AppError('Solo se pueden cancelar solicitudes en estado PENDING', 409);
      }
    }
  
    // Regla: el prestador puede aceptar, rechazar, avanzar o completar
    if (isProvider && !isAdmin) {
      if (newStatus === 'CANCELLED') {
        throw new AppError('El prestador debe RECHAZAR la solicitud en lugar de cancelarla', 400);
      }
    }
  
    return updateServiceRequestStatusRecord(id, newStatus);
  }