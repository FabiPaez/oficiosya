import { supabase } from '../config/supabase.js';

export async function findServicesByProviderId(providerId, { includeInactive = false } = {}) {
  let query = supabase
    .from('provider_services')
    .select(`
      id,
      provider_id,
      service_id,
      price_from,
      price_to,
      description,
      is_active,
      created_at,
      updated_at,
      services (
        id,
        name,
        description,
        category_id,
        categories (
          id,
          name
        )
      )
    `)
    .eq('provider_id', providerId);

  if (!includeInactive) {
    query = query.eq('is_active', true);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function findProviderServiceById(id) {
  const { data, error } = await supabase
    .from('provider_services')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function findProviderServiceRelation(providerId, serviceId) {
  const { data, error } = await supabase
    .from('provider_services')
    .select('*')
    .eq('provider_id', providerId)
    .eq('service_id', serviceId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function createProviderServiceRecord({ providerId, serviceId, priceFrom, priceTo, description }) {
  const { data, error } = await supabase
    .from('provider_services')
    .insert({
      provider_id: providerId,
      service_id: serviceId,
      price_from: priceFrom ?? null,
      price_to: priceTo ?? null,
      description: description ?? null,
      is_active: true,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateProviderServiceRecord(id, { priceFrom, priceTo, description, isActive }) {
  const updates = {};
  if (priceFrom !== undefined) updates.price_from = priceFrom;
  if (priceTo !== undefined) updates.price_to = priceTo;
  if (description !== undefined) updates.description = description;
  if (isActive !== undefined) updates.is_active = isActive;
  updates.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from('provider_services')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}