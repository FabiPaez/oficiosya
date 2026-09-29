import { supabase } from '../config/supabase.js';

export async function findFavoritesByUserId(userId) {
  const { data, error } = await supabase
    .from('favorites')
    .select(`
      created_at,
      provider_id,
      profiles!favorites_provider_id_fkey (
        id,
        first_name,
        last_name,
        phone,
        profile_image_url,
        description,
        city,
        department
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function findFavoriteRelation(userId, providerId) {
  const { data, error } = await supabase
    .from('favorites')
    .select('*')
    .eq('user_id', userId)
    .eq('provider_id', providerId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function addFavoriteRecord(userId, providerId) {
  const { data, error } = await supabase
    .from('favorites')
    .insert({
      user_id: userId,
      provider_id: providerId,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function removeFavoriteRecord(userId, providerId) {
  const { error } = await supabase
    .from('favorites')
    .delete()
    .eq('user_id', userId)
    .eq('provider_id', providerId);

  if (error) throw error;
  return true;
}