import { supabase } from '../config/supabase.js';

export async function createReviewRecord(
  { requestId, reviewerId, reviewedId, rating, comment },
  supabaseClient = supabase,
) {
  const { data, error } = await supabaseClient
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

export async function findReviewById(
  id,
  supabaseClient = supabase,
) {
  const { data: review, error: reviewError } = await supabaseClient
    .from('reviews')
    .select(
      'id, request_id, rating, comment, created_at, reviewer_id, reviewed_id',
    )
    .eq('id', id)
    .maybeSingle();

  if (reviewError) throw reviewError;
  if (!review) return null;

  const { data: reviewer, error: reviewerError } = await supabaseClient
    .from('public_reviewers')
    .select('id, first_name, last_name, profile_image_url')
    .eq('id', review.reviewer_id)
    .maybeSingle();

  if (reviewerError) throw reviewerError;

  return {
    ...review,
    profiles: reviewer,
  };
}

export async function findReviewByRequestId(
  requestId,
  supabaseClient = supabase,
) {
  const { data, error } = await supabaseClient
    .from('reviews')
    .select('*')
    .eq('request_id', requestId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function findReviewsByProviderId(
  providerId,
  supabaseClient = supabase,
) {
  const { data: reviews, error: reviewsError } = await supabaseClient
    .from('reviews')
    .select(
      'id, request_id, rating, comment, created_at, reviewer_id',
    )
    .eq('reviewed_id', providerId)
    .order('created_at', { ascending: false });

  if (reviewsError) throw reviewsError;
  if (!reviews?.length) return [];

  const reviewerIds = [
    ...new Set(reviews.map((review) => review.reviewer_id)),
  ];

  const { data: reviewers, error: reviewersError } = await supabaseClient
    .from('public_reviewers')
    .select('id, first_name, last_name, profile_image_url')
    .in('id', reviewerIds);

  if (reviewersError) throw reviewersError;

  const reviewersById = new Map(
    reviewers.map((reviewer) => [reviewer.id, reviewer]),
  );

  return reviews.map((review) => ({
    ...review,
    profiles: reviewersById.get(review.reviewer_id) ?? null,
  }));
}