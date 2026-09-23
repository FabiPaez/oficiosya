import { supabase } from '../config/supabase.js';

export async function findProviderById(providerId) {
  // Verificar primero si tiene el rol PROVIDER
  const { data: roleCheck, error: roleCheckError } = await supabase
    .from('user_roles')
    .select(`
      roles!inner (
        name
      )
    `)
    .eq('user_id', providerId)
    .eq('roles.name', 'PROVIDER')
    .maybeSingle();

  if (roleCheckError) {
    throw roleCheckError;
  }

  if (!roleCheck) {
    return null;
  }

  // Traer datos del perfil del prestador
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, first_name, last_name, phone, profile_image_url, description, city, department, created_at')
    .eq('id', providerId)
    .maybeSingle();

  if (profileError) {
    throw profileError;
  }

  return profile;
}

export async function assignProviderRole(userId) {
  const { data: providerRole, error: roleError } = await supabase
    .from('roles')
    .select('id')
    .eq('name', 'PROVIDER')
    .single();

  if (roleError) {
    throw roleError;
  }

  const { data: existingUserRole, error: checkError } = await supabase
    .from('user_roles')
    .select('user_id')
    .eq('user_id', userId)
    .eq('role_id', providerRole.id)
    .maybeSingle();

  if (checkError) {
    throw checkError;
  }

  if (existingUserRole) {
    return false; // Ya era prestador
  }

  const { error: insertError } = await supabase
    .from('user_roles')
    .insert({
      user_id: userId,
      role_id: providerRole.id,
    });

  if (insertError) {
    throw insertError;
  }

  return true;
}

export async function updateProviderProfile(userId, { description, city, department, phone }) {
  const updates = {};
  if (description !== undefined) updates.description = description;
  if (city !== undefined) updates.city = city;
  if (department !== undefined) updates.department = department;
  if (phone !== undefined) updates.phone = phone;
  updates.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select('id, first_name, last_name, phone, profile_image_url, description, city, department')
    .single();

  if (error) {
    throw error;
  }

  return data;
}