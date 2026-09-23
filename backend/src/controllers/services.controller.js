import {
    getServices,
    getServiceById,
    createNewService,
    updateExistingService,
    deactivateService,
  } from '../services/services.service.js';
  
  export async function getServicesController(req, res, next) {
    try {
      const includeInactive = req.user?.roles?.includes('ADMIN') === true;
      const categoryId = req.query.categoryId ? Number(req.query.categoryId) : undefined;
  
      const services = await getServices({ categoryId, includeInactive });
      return res.status(200).json({
        success: true,
        data: services,
      });
    } catch (error) {
      next(error);
    }
  }
  
  export async function getServiceByIdController(req, res, next) {
    try {
      const service = await getServiceById(req.params.id);
      return res.status(200).json({
        success: true,
        data: service,
      });
    } catch (error) {
      next(error);
    }
  }
  
  export async function createServiceController(req, res, next) {
    try {
      const service = await createNewService(req.body);
      return res.status(201).json({
        success: true,
        message: 'Servicio creado correctamente',
        data: service,
      });
    } catch (error) {
      next(error);
    }
  }
  
  export async function updateServiceController(req, res, next) {
    try {
      const service = await updateExistingService(req.params.id, req.body);
      return res.status(200).json({
        success: true,
        message: 'Servicio actualizado correctamente',
        data: service,
      });
    } catch (error) {
      next(error);
    }
  }
  
  export async function deactivateServiceController(req, res, next) {
    try {
      const service = await deactivateService(req.params.id);
      return res.status(200).json({
        success: true,
        message: 'Servicio desactivado correctamente',
        data: service,
      });
    } catch (error) {
      next(error);
    }
  }