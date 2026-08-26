import { jest } from '@jest/globals';

const mockFrom = jest.fn();

jest.unstable_mockModule(
  '../../src/config/supabase.js',
  () => ({
    supabase: {
      from: mockFrom,
    },
  })
);

const { authorize } = await import(
  '../../src/middlewares/authorize.middleware.js'
);

describe('authorize middleware', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('debe permitir acceso cuando el usuario tiene el rol requerido', async () => {
    mockFrom.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockResolvedValue({
        data: [
          {
            roles: {
              name: 'CLIENT',
            },
          },
        ],
        error: null,
      }),
    });

    const req = {
      user: {
        id: 'user-123',
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const next = jest.fn();

    const middleware = authorize('CLIENT');

    await middleware(req, res, next);

    expect(next).toHaveBeenCalled();

    expect(req.user.roles).toEqual([
      'CLIENT',
    ]);
  });


  test('debe devolver 403 cuando el usuario no tiene el rol requerido', async () => {
    mockFrom.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockResolvedValue({
        data: [
          {
            roles: {
              name: 'CLIENT',
            },
          },
        ],
        error: null,
      }),
    });

    const req = {
      user: {
        id: 'user-123',
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const next = jest.fn();

    const middleware = authorize('PROVIDER');

    await middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);

    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'No tienes permisos para realizar esta operación',
    });

    expect(next).not.toHaveBeenCalled();
  });

  test('debe permitir acceso si el usuario tiene uno de los roles permitidos', async () => {
    mockFrom.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockResolvedValue({
        data: [
          {
            roles: {
              name: 'CLIENT',
            },
          },
          {
            roles: {
              name: 'PROVIDER',
            },
          },
        ],
        error: null,
      }),
    });
  
    const req = {
      user: {
        id: 'user-123',
      },
    };
  
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  
    const next = jest.fn();
  
    const middleware = authorize(
      'PROVIDER',
      'ADMIN'
    );
  
    await middleware(req, res, next);
  
    expect(next).toHaveBeenCalled();
  
    expect(req.user.roles).toEqual([
      'CLIENT',
      'PROVIDER',
    ]);
  });

  test('debe devolver 401 si no existe req.user', async () => {
    const req = {};
  
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  
    const next = jest.fn();
  
    const middleware = authorize('CLIENT');
  
    await middleware(req, res, next);
  
    expect(res.status).toHaveBeenCalledWith(401);
  
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Usuario no autenticado',
    });
  
    expect(next).not.toHaveBeenCalled();
  });

});