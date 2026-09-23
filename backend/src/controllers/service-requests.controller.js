import {
    createServiceRequest,
    getServiceRequestById,
    getMyServiceRequests,
    updateServiceRequestStatus,
  } from '../services/service-requests.service.js';
  
  export async function createServiceRequestController(req, res, next) {
    try {
      const request = await createServiceRequest(req.user.id, req.body);
      return res.status(201).json({
        success: true,
        message: 'Solicitud de servicio creada correctamente',
        data: request,
      });
    } catch (error) {
      next(error);
    }
  }
  
  export async function getServiceRequestByIdController(req, res, next) {
    try {
      const request = await getServiceRequestById(req.params.id, req.user.id, req.user.roles);
      return res.status(200).json({
        success: true,
        data: request,
      });
    } catch (error) {
      next(error);
    }
  }
  
  export async function getMyServiceRequestsController(req, res, next) {
    try {
      const role = req.query.role === 'PROVIDER' ? 'PROVIDER' : 'CLIENT';
      const requests = await getMyServiceRequests(req.user.id, { role });
      return res.status(200).json({
        success: true,
        data: requests,
      });
    } catch (error) {
      next(error);
    }
  }
  
  export async function updateServiceRequestStatusController(req, res, next) {
    try {
      const updated = await updateServiceRequestStatus(
        req.params.id,
        req.user.id,
        req.user.roles,
        req.body.status
      );
      return res.status(200).json({
        success: true,
        message: 'Estado de la solicitud actualizado correctamente',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }