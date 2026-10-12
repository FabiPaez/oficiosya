import {
  findProviderById,
  registerProvider,
  updateProviderProfile as updateRepo,
} from '../repositories/providers.repository.js';
import { AppError } from '../utils/AppError.js';

export async function registerAsProvider(
  supabaseClient,
  userId,
  providerData,
) {
  try {
    const profile = await registerProvider(
      supabaseClient,
      providerData,
    );

    if (!profile) {
      throw new AppError(
        'No se pudo obtener el perfil del prestador',
        500,
      );
    }

    return profile;
  } catch (error) {
    const isAlreadyProvider =
      error?.details === 'PROVIDER_ALREADY_REGISTERED' ||
      error?.message === 'PROVIDER_ALREADY_REGISTERED';

    if (isAlreadyProvider) {
      throw new AppError(
        'El usuario ya se encuentra registrado como prestador',
        409,
      );
    }

    throw error;
  }
}


export async function getProviderProfile(
  providerId,
  supabaseClient,
) {
  const provider = await findProviderById(
    providerId,
    supabaseClient,
  );

  if (!provider) {
    throw new AppError('Prestador no encontrado', 404);
  }

  return provider;
}

export async function updateProviderProfileService(
  userId,
  updateData,
  supabaseClient,
) {
  const provider = await findProviderById(
    userId,
    supabaseClient,
  );

  if (!provider) {
    throw new AppError(
      'Perfil de prestador no encontrado',
      404,
    );
  }

  return updateRepo(userId, updateData, supabaseClient);
}