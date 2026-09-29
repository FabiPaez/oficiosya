import { supabase } from '../config/supabase.js';

export async function createReviewRecord({
  requestId,
  reviewerId,
  reviewedId,
  rating,
  comment,
}) {
  const { data, error } = await supabase
    .from('reviews')
    .insert({
      request_id: requestId,
      reviewer_id: reviewerId,
      reviewed_id: reviewedId,
      rating,
      comment: comment ?? null,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function findReviewById(id) {
  const { data, error } = await supabase
    .from('reviews')
    .select(`
      id,
      request_id,
      rating,
      comment,
      created_at,
      reviewer_id,
      reviewed_id,
      profiles!reviews_reviewer_id_fkey (
        first_name,
        last_name,
        profile_image_url
      )
    `)
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function findReviewByRequestId(requestId) {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('request_id', requestId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function findReviewsByProviderId(providerId) {
  const { data, error } = await supabase
    .from('reviews')
    .select(`
      id,
      request_id,
      rating,
      comment,
      created_at,
      reviewer_id,
      profiles!reviews_reviewer_id_fkey (
        first_name,
        last_name,
        profile_image_url
      )
    `)
    .eq('reviewed_id', providerId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}