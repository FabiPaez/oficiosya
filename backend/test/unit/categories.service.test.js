import { jest } from '@jest/globals';

// Mocks del repositorio
const mockFindAllCategories = jest.fn();
const mockFindCategoryById = jest.fn();
const mockFindCategoryByName = jest.fn();
const mockCreateCategory = jest.fn();
const mockUpdateCategory = jest.fn();

jest.unstable_mockModule('../../src/repositories/categories.repository.js', () => ({
  findAllCategories: mockFindAllCategories,
  findCategoryById: mockFindCategoryById,
  findCategoryByName: mockFindCategoryByName,
  createCategory: mockCreateCategory,
  updateCategory: mockUpdateCategory,
}));

// Import dinámico del servicio tras declarar los mocks
const {
  getCategories,
  getCategoryById,
  createNewCategory,
  updateExistingCategory,
  deactivateCategory,
} = await import('../../src/services/categories.service.js');

describe('Categories Service (Unit Tests)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getCategories', () => {
    test('debe retornar lista de categorías respetando el parámetro includeInactive', async () => {
      const mockData = [{ id: 1, name: 'Electricidad', is_active: true }];
      mockFindAllCategories.mockResolvedValue(mockData);

      const result = await getCategories({ includeInactive: false });

      expect(mockFindAllCategories).toHaveBeenCalledWith({ includeInactive: false });
      expect(result).toEqual(mockData);
    });
  });

  describe('getCategoryById', () => {
    test('debe retornar la categoría si existe', async () => {
      const mockCategory = { id: 1, name: 'Electricidad' };
      mockFindCategoryById.mockResolvedValue(mockCategory);

      const result = await getCategoryById(1);

      expect(mockFindCategoryById).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockCategory);
    });

    test('debe lanzar AppError con status 404 si no existe', async () => {
      mockFindCategoryById.mockResolvedValue(null);

      await expect(getCategoryById(999)).rejects.toMatchObject({
        statusCode: 404,
        message: 'Categoría no encontrada',
      });
    });
  });

  describe('createNewCategory', () => {
    test('debe crear la categoría si el nombre no existe', async () => {
      mockFindCategoryByName.mockResolvedValue(null);
      mockCreateCategory.mockResolvedValue({ id: 3, name: 'Gasista' });

      const result = await createNewCategory({ name: 'Gasista', description: 'Gas' });

      expect(mockFindCategoryByName).toHaveBeenCalledWith('Gasista');
      expect(mockCreateCategory).toHaveBeenCalledWith({ name: 'Gasista', description: 'Gas' });
      expect(result.id).toBe(3);
    });

    test('debe lanzar AppError con status 409 si el nombre ya existe', async () => {
      mockFindCategoryByName.mockResolvedValue({ id: 1, name: 'Gasista' });

      await expect(
        createNewCategory({ name: 'Gasista', description: 'Gas' })
      ).rejects.toMatchObject({
        statusCode: 409,
        message: 'Ya existe una categoría con ese nombre',
      });
      expect(mockCreateCategory).not.toHaveBeenCalled();
    });
  });

  describe('updateExistingCategory', () => {
    test('debe actualizar si la categoría existe y el nombre no colisiona', async () => {
      mockFindCategoryById.mockResolvedValue({ id: 1, name: 'Original' });
      mockFindCategoryByName.mockResolvedValue(null);
      mockUpdateCategory.mockResolvedValue({ id: 1, name: 'Modificado' });

      const result = await updateExistingCategory(1, { name: 'Modificado' });

      expect(result.name).toBe('Modificado');
    });

    test('debe lanzar 404 si la categoría a actualizar no existe', async () => {
      mockFindCategoryById.mockResolvedValue(null);

      await expect(
        updateExistingCategory(999, { name: 'Nuevo' })
      ).rejects.toMatchObject({
        statusCode: 404,
        message: 'Categoría no encontrada',
      });
    });

    test('debe lanzar 409 si el nuevo nombre pertenece a otra categoría', async () => {
      mockFindCategoryById.mockResolvedValue({ id: 1, name: 'Original' });
      mockFindCategoryByName.mockResolvedValue({ id: 2, name: 'EnUso' });

      await expect(
        updateExistingCategory(1, { name: 'EnUso' })
      ).rejects.toMatchObject({
        statusCode: 409,
        message: 'Ya existe una categoría con ese nombre',
      });
    });
  });

  describe('deactivateCategory', () => {
    test('debe desactivar la categoría si está activa', async () => {
      mockFindCategoryById.mockResolvedValue({ id: 1, is_active: true });
      mockUpdateCategory.mockResolvedValue({ id: 1, is_active: false });

      const result = await deactivateCategory(1);

      expect(mockUpdateCategory).toHaveBeenCalledWith(1, { isActive: false });
      expect(result.is_active).toBe(false);
    });

    test('debe lanzar 409 si ya se encuentra inactiva', async () => {
      mockFindCategoryById.mockResolvedValue({ id: 1, is_active: false });

      await expect(deactivateCategory(1)).rejects.toMatchObject({
        statusCode: 409,
        message: 'La categoría ya está inactiva',
      });
    });
  });
});