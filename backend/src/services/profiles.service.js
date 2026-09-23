import { findProfileById, updateProfile } from '../repositories/profiles.repository.js';
import { AppError } from '../utils/AppError.js';

export async function getMyProfile(userId) {
  const profile = await findProfileById(userId);

  if (!profile) {
    throw new AppError('Perfil no encontrado', 404);
  }

  return profile;
}

export async function updateMyProfile(userId, updateData) {
  const profile = await findProfileById(userId);

  if (!profile) {
    throw new AppError('Perfil no encontrado', 404);
  }

  return updateProfile(userId, updateData);
}