import { createClient } from '@supabase/supabase-js';
import env from '../../src/config/env.js';

/**
 * Cliente con Service Role Key: bypassa RLS para poder hacer hard-delete de las filas creadas durante los tests.
 *
 * IMPORTANTE:
 * - Nunca usar este cliente ni la Service Role Key en el código
 *   de la app real (src/), solo en tests.
 */
const supabaseAdmin = createClient(
  env.supabaseUrl,
  env.supabaseServiceRoleKey
);

/**
 * Borra (hard delete) categorías por id. Pensado para usarse en un afterEach/afterAll de los tests de integración, para que
 * ninguna fila creada durante un test quede persistida. * *
 *  @param {number[]} ids */

export async function deleteCategoriesByIds(ids) {
  if (!ids || ids.length === 0) return;

  const { error } = await supabaseAdmin
    .from('categories')
    .delete()
    .in('id', ids);

  if (error) {
    // No hacemos que falle el test por un error de limpieza,
    // pero lo dejamos visible en la consola para no perderlo de vista.
    console.error('[cleanup] Error borrando categorías de test:', error.message);
  }
}

// Agregamos la función removeProviderRoleByUserIds para remover el rol PROVIDER en user_roles
//para que el usuario de prueba vuelva a ser puramente CLIENT

export async function removeProviderRoleByUserIds(userIds) {
  if (!userIds || userIds.length === 0) return;

  const { data: roleData } = await supabaseAdmin
    .from('roles')
    .select('id')
    .eq('name', 'PROVIDER')
    .maybeSingle();

  if (roleData) {
    const { error } = await supabaseAdmin
      .from('user_roles')
      .delete()
      .eq('role_id', roleData.id)
      .in('user_id', userIds);

    if (error) {
      console.error('Error al limpiar rol PROVIDER en db-cleanup:', error);
    }
  }
}

//función para eliminar servicios creados por ID

export async function deleteServicesByIds(serviceIds) {
  if (!serviceIds || serviceIds.length === 0) return;

  const { error } = await supabaseAdmin
    .from('services')
    .delete()
    .in('id', serviceIds);

  if (error) {
    console.error('Error al limpiar services en db-cleanup:', error);
  }
}

//función para eliminar provider_services creados por ID
export async function deleteProviderServicesByIds(ids) {
  if (!ids || ids.length === 0) return;

  const { error } = await supabaseAdmin
    .from('provider_services')
    .delete()
    .in('id', ids);

  if (error) {
    console.error('Error al limpiar provider_services en db-cleanup:', error);
  }
}

//función para eliminar services_requests creados por ID
export async function deleteServiceRequestsByIds(ids) {
  if (!ids || ids.length === 0) return;

  const { error } = await supabaseAdmin
    .from('service_requests')
    .delete()
    .in('id', ids);

  if (error) {
    console.error('Error al limpiar service_requests en db-cleanup:', error);
  }
}