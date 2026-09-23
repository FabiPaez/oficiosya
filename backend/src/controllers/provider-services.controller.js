import {
    getProviderServices,
    addServiceToProvider,
    updateProviderService,
    deactivateProviderService,
  } from '../services/provider-services.service.js';
  
  export async function getProviderServicesController(req, res, next) {
    try {
      const isOwnerOrAdmin = req.user?.id === req.params.providerId || req.user?.roles?.includes('ADMIN');
      const services = await getProviderServices(req.params.providerId, { includeInactive: isOwnerOrAdmin });
  
      return res.status(200).json({
        success: true,
        data: services,
      });
    } catch (error) {
      next(error);
    }
  }
  
  export async function createProviderServiceController(req, res, next) {
    try {
      const record = await addServiceToProvider(req.user.id, req.body);
  
      return res.status(201).json({
        success: true,
        message: 'Servicio vinculado correctamente al prestador',
        data: record,
      });
    } catch (error) {
      next(error);
    }
  }
  
  export async function updateProviderServiceController(req, res, next) {
    try {
      const updated = await updateProviderService(req.params.id, req.user.id, req.user.roles, req.body);
  
      return res.status(200).json({
        success: true,
        message: 'Servicio del prestador actualizado correctamente',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }
  
  export async function deactivateProviderServiceController(req, res, next) {
    try {
      const deactivated = await deactivateProviderService(req.params.id, req.user.id, req.user.roles);
  
      return res.status(200).json({
        success: true,
        message: 'Servicio del prestador desactivado correctamente',
        data: deactivated,
      });
    } catch (error) {
      next(error);
    }
  }