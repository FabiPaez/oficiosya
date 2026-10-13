import { supabase } from '../config/supabase.js';

export async function findProviderById(
  providerId,
  supabaseClient = supabase,
) {
  const { data, error } = await supabaseClient
    .from('public_provider_profiles')
    .select(
      'id, first_name, last_name, phone, profile_image_url, description, city, department, created_at',
    )
    .eq('id', providerId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

export async function updateProviderProfile(
  userId,
  { description, city, department, phone },
  supabaseClient = supabase,
) {
  const updates = {};

  if (description !== undefined) updates.description = description;
  if (city !== undefined) updates.city = city;
  if (department !== undefined) updates.department = department;
  if (phone !== undefined) updates.phone = phone;

  updates.updated_at = new Date().toISOString();

  const { data, error } = await supabaseClient
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select(
      'id, first_name, last_name, phone, profile_image_url, description, city, department',
    )
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function registerProvider(supabaseClient, providerData) {
  const { data, error } = await supabaseClient.rpc(
    'register_as_provider',
    {
      p_provider_data: providerData,
    },
  );

  if (error) {
    throw error;
  }

  return Array.isArray(data) ? data[0] ?? null : data;
}

export async function listProviders() {
const { data, error } = await supabase
.from('public_provider_profiles')
.select(
'id, first_name, last_name, phone, profile_image_url, description, city, department, created_at',
)
.order('first_name', { ascending: true })
.order('last_name', { ascending: true });

if (error) throw error;

return data ?? [];
}