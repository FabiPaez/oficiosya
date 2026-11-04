import {
  registerAsProvider,
  getProviderProfile,
  updateProviderProfileService,
  listProvidersService,
  deleteProviderService,
} from '../services/providers.service.js';


export async function registerProviderController(req, res, next) {
  try {
    const provider = await registerAsProvider(
      req.supabase,
      req.user.id,
      req.body,
    );

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
    const isOwnProfile = req.params.id === 'me';
    const providerId = isOwnProfile
      ? req.user.id
      : req.params.id;

    const provider = isOwnProfile
      ? await getProviderProfile(providerId, req.supabase)
      : await getProviderProfile(providerId);

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
    const updated = await updateProviderProfileService(
      req.user.id,
      req.body,
      req.supabase,
    );

    return res.status(200).json({
      success: true,
      message: 'Perfil de prestador actualizado correctamente',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
}

export async function listProvidersController(req, res, next) {
  try {
    const providers = await listProvidersService();


    return res.status(200).json({
      success: true,
      data: providers,
    });


  } catch (error) {
    next(error);
  }
}


export async function deleteProviderController(req, res, next) {
  try {
    const { id } = req.params;
    const deleteAccount = req.query.delete_account === 'true';

    const result = await deleteProviderService(
      id,
      req.supabase,
      { deleteAccount },
    );

    return res.status(200).json({
      success: true,
      message: 'Prestador eliminado correctamente',
      data: result,
    });
  } catch (error) {
    next(error);
  }
}
