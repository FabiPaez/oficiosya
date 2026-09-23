import {
  registerAsProvider,
  getProviderProfile,
  updateProviderProfileService,
} from '../services/providers.service.js';

export async function registerProviderController(req, res, next) {
  try {
    const provider = await registerAsProvider(req.user.id, req.body);

    return res.status(201).json({
      success: true,
      message: 'Registro como prestador exitoso',
      data: provider,
    });
  } catch (error) {
    next(error);
  }
}

export async function getProviderProfileController(req, res, next) {
  try {
    const providerId = req.params.id === 'me' ? req.user.id : req.params.id;
    const provider = await getProviderProfile(providerId);

    return res.status(200).json({
      success: true,
      data: provider,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateProviderProfileController(req, res, next) {
  try {
    const updated = await updateProviderProfileService(req.user.id, req.body);

    return res.status(200).json({
      success: true,
      message: 'Perfil de prestador actualizado correctamente',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
}