import { supabase } from '../config/supabase.js';

export async function findAllServices({ categoryId, includeInactive = false } = {}) {
  let query = supabase
    .from('services')
    .select(`
      id,
      category_id,
      name,
      description,
      is_active,
      created_at,
      updated_at,
      categories (
        id,
        name
      )
    `)
    .order('name', { ascending: true });

  if (!includeInactive) {
    query = query.eq('is_active', true);
  }

  if (categoryId !== undefined) {
    query = query.eq('category_id', categoryId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function findServiceById(id) {
  const { data, error } = await supabase
    .from('services')
    .select(`
      id,
      category_id,
      name,
      description,
      is_active,
      created_at,
      updated_at,
      categories (
        id,
        name
      )
    `)
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function findServiceByCategoryAndName(categoryId, name) {
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('category_id', categoryId)
    .ilike('name', name)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function createServiceRecord({ categoryId, name, description }) {
  const { data, error } = await supabase
    .from('services')
    .insert({
      category_id: categoryId,
      name,
      description: description ?? null,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateServiceRecord(id, { name, description, isActive }) {
  const updates = {};
  if (name !== undefined) updates.name = name;
  if (description !== undefined) updates.description = description;
  if (isActive !== undefined) updates.is_active = isActive;
  updates.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from('services')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}