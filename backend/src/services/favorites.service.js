import {
    findFavoritesByUserId,
    findFavoriteRelation,
    addFavoriteRecord,
    removeFavoriteRecord,
  } from '../repositories/favorites.repository.js';
  import { findProviderById } from '../repositories/providers.repository.js';
  import { AppError } from '../utils/AppError.js';
  
  export async function getMyFavorites(userId) {
    return findFavoritesByUserId(userId);
  }
  
  export async function addFavorite(userId, providerId) {
    if (userId === providerId) {
      throw new AppError('No puedes agregarte a ti mismo como favorito', 400);
    }
  
    const provider = await findProviderById(providerId);
    if (!provider) {
      throw new AppError('El prestador no existe o no tiene perfil activo', 404);
    }
  
    const existing = await findFavoriteRelation(userId, providerId);
    if (existing) {
      throw new AppError('El prestador ya se encuentra en tus favoritos', 409);
    }
  
    return addFavoriteRecord(userId, providerId);
  }
  
  export async function removeFavorite(userId, providerId) {
    const existing = await findFavoriteRelation(userId, providerId);
    if (!existing) {
      throw new AppError('El prestador no se encuentra en tus favoritos', 404);
    }
  
    await removeFavoriteRecord(userId, providerId);
    return { providerId };
  }