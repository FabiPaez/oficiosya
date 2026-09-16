import { createClient } from '@supabase/supabase-js';

import env from '../config/env.js';
import { supabase } from '../config/supabase.js';

export async function optionalAuthenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    // No hay token: continuamos como usuario no autenticado.
    if (!authHeader) {
      return next();
    }

    const [type, token] = authHeader.split(' ');

    // Si el formato no es válido, continuamos como usuario público.
    if (type !== 'Bearer' || !token) {
      return next();
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

    // Token inválido: continuamos como usuario público.
    if (error || !user) {
      return next();
    }

    req.user = user;

    // Obtener los roles del usuario.
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select(`
        roles (
          name
        )
      `)
      .eq('user_id', user.id);

    if (roleError) {
      return next(roleError);
    }

    const userRoles = roleData
      .filter((item) => item.roles)
      .map((item) => item.roles.name);

    req.user.roles = userRoles;

    next();
  } catch (error) {
    next(error);
  }
}
