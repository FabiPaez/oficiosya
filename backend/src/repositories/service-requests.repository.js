import { supabase } from '../config/supabase.js';

export async function createServiceRequestRecord({
  clientId,
  providerId,
  serviceId,
  title,
  description,
  address,
  city,
  requestedDate,
}) {
  const { data, error } = await supabase
    .from('service_requests')
    .insert({
      client_id: clientId,
      provider_id: providerId,
      service_id: serviceId,
      title,
      description,
      address: address ?? null,
      city: city ?? null,
      requested_date: requestedDate ?? null,
      status: 'PENDING',
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function findServiceRequestById(id) {
  const { data, error } = await supabase
    .from('service_requests')
    .select(`
      id,
      title,
      description,
      address,
      city,
      requested_date,
      status,
      created_at,
      updated_at,
      client_id,
      provider_id,
      service_id,
      services (
        id,
        name
      )
    `)
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function findServiceRequestsByUser(userId, { role = 'CLIENT' } = {}) {
  let query = supabase
    .from('service_requests')
    .select(`
      id,
      title,
      description,
      address,
      city,
      requested_date,
      status,
      created_at,
      updated_at,
      client_id,
      provider_id,
      service_id,
      services (
        id,
        name
      )
    `)
    .order('created_at', { ascending: false });

  if (role === 'PROVIDER') {
    query = query.eq('provider_id', userId);
  } else {
    query = query.eq('client_id', userId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function updateServiceRequestStatusRecord(id, status) {
  const { data, error } = await supabase
    .from('service_requests')
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}