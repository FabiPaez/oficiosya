import { getMyProfile, updateMyProfile } from '../services/profiles.service.js';

export async function getMyProfileController(req, res, next) {
  try {
    const profile = await getMyProfile(req.user.id);

    return res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateMyProfileController(req, res, next) {
  try {
    const profile = await updateMyProfile(req.user.id, req.body);

    return res.status(200).json({
      success: true,
      message: 'Perfil actualizado correctamente',
      data: profile,
    });
  } catch (error) {
    next(error);
  }
}