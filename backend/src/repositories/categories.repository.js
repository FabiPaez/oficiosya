import { supabase } from '../config/supabase.js';

export async function findAllCategories({
  includeInactive = false,
} = {}) {
  let query = supabase
    .from('categories')
    .select('*')
    .order('name', { ascending: true });

  if (!includeInactive) {
    query = query.eq('is_active', true);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return data;
}

export async function findCategoryById(id) {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

export async function findCategoryByName(name) {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .ilike('name', name)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

export async function createCategory({
  name,
  description,
}) {
  const { data, error } = await supabase
    .from('categories')
    .insert({
      name,
      description: description ?? null,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function updateCategory(
  id,
  {
    name,
    description,
    isActive,
  }
) {
  const updates = {};

  if (name !== undefined) {
    updates.name = name;
  }

  if (description !== undefined) {
    updates.description = description;
  }

  if (isActive !== undefined) {
    updates.is_active = isActive;
  }

  const { data, error } = await supabase
    .from('categories')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}