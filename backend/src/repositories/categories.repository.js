import { supabase } from '../config/supabase.js';

export async function findAllCategories(
  { includeInactive = false } = {},
  supabaseClient = supabase
) {
  let query = supabaseClient
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

export async function findCategoryById(id, supabaseClient = supabase) {
  const { data, error } = await supabaseClient
    .from('categories')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

export async function findCategoryByName(name, supabaseClient = supabase) {
  const { data, error } = await supabaseClient
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
}, supabaseClient = supabase) {
  const { data, error } = await supabaseClient
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
  },
  supabaseClient = supabase
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

  const { data, error } = await supabaseClient
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