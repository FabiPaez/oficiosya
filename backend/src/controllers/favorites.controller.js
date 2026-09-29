import {
    getMyFavorites,
    addFavorite,
    removeFavorite,
  } from '../services/favorites.service.js';
  
  export async function getMyFavoritesController(req, res, next) {
    try {
      const favorites = await getMyFavorites(req.user.id);
      return res.status(200).json({
        success: true,
        data: favorites,
      });
    } catch (error) {
      next(error);
    }
  }
  
  export async function addFavoriteController(req, res, next) {
    try {
      const favorite = await addFavorite(req.user.id, req.body.providerId);
      return res.status(201).json({
        success: true,
        message: 'Prestador agregado a favoritos',
        data: favorite,
      });
    } catch (error) {
      next(error);
    }
  }
  
  export async function removeFavoriteController(req, res, next) {
    try {
      const result = await removeFavorite(req.user.id, req.params.providerId);
      return res.status(200).json({
        success: true,
        message: 'Prestador eliminado de favoritos',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }