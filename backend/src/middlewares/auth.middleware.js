import { createClient } from '@supabase/supabase-js';

import env from '../config/env.js';

export async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'Token de autenticación requerido',
      });
    }

    const [type, token] = authHeader.split(' ');

    if (type !== 'Bearer' || !token) {
      return res.status(401).json({
        success: false,
        message: 'Formato de autorización inválido',
      });
    }

    const supabaseAuth = createClient(
      env.supabaseUrl,
      env.supabaseAnonKey,
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      }
    );

    const {
      data: { user },
      error,
    } = await supabaseAuth.auth.getUser();

    if (error || !user) {
      return res.status(401).json({
        success: false,
        message: 'Token inválido o expirado',
      });
    }

    req.user = user;

    next();
  } catch (error) {
    next(error);
  }
}