import {
  getCategories,
  getCategoryById,
  createNewCategory,
  updateExistingCategory,
  deactivateCategory,
} from '../services/categories.service.js';

export async function getCategoriesController(req, res, next) {
  try {
    const isAdmin = req.user?.roles?.includes('ADMIN') === true;
    const options = { includeInactive: isAdmin };

    const categories = isAdmin
      ? await getCategories(options, req.supabase)
      : await getCategories(options);

    return res.status(200).json({
      success: true,
      data: categories,
    });
  } catch (error) {
    next(error);
  }
}


export async function getCategoryByIdController(req, res, next) {
  try {
    const isAdmin = req.user?.roles?.includes('ADMIN') === true;

    const category = isAdmin
      ? await getCategoryById(req.params.id, req.supabase, {
        includeInactive: true,
      })
      : await getCategoryById(req.params.id);

    return res.status(200).json({
      success: true,
      data: category,
    });
  } catch (error) {
    next(error);
  }
}

export async function createCategoryController(req, res, next) {
  try {
    const category = await createNewCategory(req.body, req.supabase);

    return res.status(201).json({
      success: true,
      message: 'Categoría creada correctamente',
      data: category,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateCategoryController(req, res, next) {
  try {
    const category = await updateExistingCategory(
      req.params.id,
      req.body,
      req.supabase
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

export async function deactivateCategoryController(req, res, next) {
  try {
    const category = await deactivateCategory(
      req.params.id,
      req.supabase
    );

    return res.status(200).json({
      success: true,
      message: 'Categoría desactivada correctamente',
      data: category,
    });
  } catch (error) {
    next(error);
  }
}