import { supabase } from '../config/supabase.js';

export function authorize(...allowedRoles) {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Usuario no autenticado',
        });
      }

      const { data, error } = await supabase
        .from('user_roles')
        .select(`
          roles (
            name
          )
        `)
        .eq('user_id', req.user.id);

      if (error) {
        return next(error);
      }

      const userRoles = data
        .filter((item) => item.roles)
        .map((item) => item.roles.name);

      const hasRole = allowedRoles.some(
        (role) => userRoles.includes(role)
      );

      if (!hasRole) {
        return res.status(403).json({
          success: false,
          message:
            'No tienes permisos para realizar esta operación',
        });
      }

      req.user.roles = userRoles;

      next();
    } catch (error) {
      next(error);
    }
  };
}