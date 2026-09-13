import {
    getCategories,
    getCategoryById,
    createNewCategory,
    updateExistingCategory,
    deactivateCategory,
  } from '../services/categories.service.js';
  
  export async function getCategoriesController(
    req,
    res,
    next
  ) {
    try {
      const includeInactive =
        req.user?.roles?.includes('ADMIN') === true;
  
      const categories = await getCategories({
        includeInactive,
      });
  
      return res.status(200).json({
        success: true,
        data: categories,
      });
    } catch (error) {
      next(error);
    }
  }
  
  export async function getCategoryByIdController(
    req,
    res,
    next
  ) {
    try {
      const category = await getCategoryById(
        req.params.id
      );
  
      return res.status(200).json({
        success: true,
        data: category,
      });
    } catch (error) {
      next(error);
    }
  }
  
  export async function createCategoryController(
    req,
    res,
    next
  ) {
    try {
      const category = await createNewCategory(
        req.body
      );
  
      return res.status(201).json({
        success: true,
        message: 'Categoría creada correctamente',
        data: category,
      });
    } catch (error) {
      next(error);
    }
  }
  
  export async function updateCategoryController(
    req,
    res,
    next
  ) {
    try {
      const category =
        await updateExistingCategory(
          req.params.id,
          req.body
        );
  
      return res.status(200).json({
        success: true,
        message: 'Categoría actualizada correctamente',
        data: category,
      });
    } catch (error) {
      next(error);
    }
  }
  
  export async function deactivateCategoryController(
    req,
    res,
    next
  ) {
    try {
      const category =
        await deactivateCategory(req.params.id);
  
      return res.status(200).json({
        success: true,
        message: 'Categoría desactivada correctamente',
        data: category,
      });
    } catch (error) {
      next(error);
    }
  }