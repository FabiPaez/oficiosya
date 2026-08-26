import {
  registerUser,
  loginUser,
} from '../services/auth.service.js';

export async function register(req, res, next) {
  try {
    const {
      email,
      password,
      firstName,
      lastName,
      phone,
    } = req.body;

    const result = await registerUser({
      email,
      password,
      firstName,
      lastName,
      phone,
    });

    return res.status(201).json({
      success: true,
      message: 'Usuario registrado correctamente',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export async function login(req, res, next) {
  try {
    const {
      email,
      password,
    } = req.body;

    const result = await loginUser({
      email,
      password,
    });

    return res.status(200).json({
      success: true,
      message: 'Inicio de sesión exitoso',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export async function getMe(req, res, next) {
  try {
    return res.status(200).json({
      success: true,
      data: {
        user: req.user,
      },
    });
  } catch (error) {
    next(error);
  }
}