import { supabase } from '../config/supabase.js';

export async function findFavoritesByUserId(
  userId,
  supabaseClient = supabase,
) {
  const { data: favorites, error: favoritesError } = await supabaseClient
    .from('favorites')
    .select('created_at, provider_id')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (favoritesError) {
    throw favoritesError;
  }

  if (!favorites?.length) {
    return [];
  }

  const providerIds = favorites.map((favorite) => favorite.provider_id);

  const { data: providers, error: providersError } = await supabaseClient
    .from('public_provider_profiles')
    .select(
      'id, first_name, last_name, phone, profile_image_url, description, city, department',
    )
    .in('id', providerIds);

  if (providersError) {
    throw providersError;
  }

  const providersById = new Map(
    providers.map((provider) => [provider.id, provider]),
  );

  return favorites.map((favorite) => ({
    ...favorite,
    profiles: providersById.get(favorite.provider_id) ?? null,
  }));
}

export async function findFavoriteRelation(
  userId,
  providerId,
  supabaseClient = supabase,
) {
  const { data, error } = await supabaseClient
    .from('favorites')
    .select('*')
    .eq('user_id', userId)
    .eq('provider_id', providerId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function addFavoriteRecord(
  userId,
  providerId,
  supabaseClient = supabase,
) {
  const { data, error } = await supabaseClient
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

export async function removeFavoriteRecord(
  userId,
  providerId,
  supabaseClient = supabase,
) {
  const { error } = await supabaseClient
    .from('favorites')
    .delete()
    .eq('user_id', userId)
    .eq('provider_id', providerId);

  if (error) throw error;
  return true;
}