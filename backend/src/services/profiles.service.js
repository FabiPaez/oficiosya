import {
  findProfileById,
  updateProfile,
} from '../repositories/profiles.repository.js';
import { AppError } from '../utils/AppError.js';

export async function getMyProfile(supabaseClient, userId) {
  const profile = await findProfileById(supabaseClient, userId);

  if (!profile) {
    throw new AppError('Perfil no encontrado', 404);
  }

  return profile;
}

export async function updateMyProfile(supabaseClient, userId, updateData) {
  const profile = await findProfileById(supabaseClient, userId);

  if (!profile) {
    throw new AppError('Perfil no encontrado', 404);
  }

  return updateProfile(supabaseClient, userId, updateData);
}