import {
  findProviderById,
  assignProviderRole,
  updateProviderProfile as updateRepo,
} from '../repositories/providers.repository.js';
import { AppError } from '../utils/AppError.js';

export async function registerAsProvider(userId, providerData) {
  const alreadyProvider = await findProviderById(userId);

  if (alreadyProvider) {
    throw new AppError('El usuario ya se encuentra registrado como prestador', 409);
  }

  // Asigna el rol PROVIDER en user_roles
  await assignProviderRole(userId);

  // Actualiza los datos de perfil asociados al oficio si se enviaron
  const profile = await updateRepo(userId, providerData);

  return profile;
}

export async function getProviderProfile(providerId) {
  const provider = await findProviderById(providerId);

  if (!provider) {
    throw new AppError('Prestador no encontrado', 404);
  }

  return provider;
}

export async function updateProviderProfileService(userId, updateData) {
  const provider = await findProviderById(userId);

  if (!provider) {
    throw new AppError('Perfil de prestador no encontrado', 404);
  }

  return updateRepo(userId, updateData);
}