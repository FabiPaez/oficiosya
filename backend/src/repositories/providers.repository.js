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
  const { data: providers, error: providersError } = await supabase
    .from('public_provider_profiles')
    .select(
      'id, first_name, last_name, phone, profile_image_url, description, city, department, created_at',
    )
    .order('first_name', { ascending: true })
    .order('last_name', { ascending: true });

  if (providersError) throw providersError;

  if (!providers?.length) return [];

  const providerIds = providers.map((provider) => provider.id);


  const { data: providerServices, error: associationsError } = await supabase
    .from('provider_services')
    .select('provider_id, service_id, price_from, price_to, description')
    .in('provider_id', providerIds)
    .eq('is_active', true);

  console.log('[DIAGNÓSTICO providers] Asociaciones:', {
    cantidad: providerServices?.length ?? 0,
    datos: providerServices,
    error: associationsError,
  });

  if (associationsError) throw associationsError;



  const serviceIds = [
    new Set(
      (providerServices ?? []).map((item) => Number(item.service_id)),
    ),
  ].filter(Number.isSafeInteger);

  let services = [];


  if (serviceIds.length > 0) {
    const { data, error } = await supabase
      .from('services')
      .select(`
  id,
    category_id,
    name,
    description,
    categories(
      id,
      name
    )
      `)
      .in('id', serviceIds)
      .eq('is_active', true);

    console.log('[DIAGNÓSTICO providers] Servicios:', {
      idsBuscados: serviceIds,
      cantidad: data?.length ?? 0,
      datos: data,
      error,
    });

    if (error) throw error;

    services = data ?? [];
  }



  const servicesById = new Map(
    services.map((service) => [service.id, service]),
  );

  const servicesByProvider = new Map();

  for (const association of providerServices ?? []) {
    const service = servicesById.get(association.service_id);

    if (!service) continue;

    const category = Array.isArray(service.categories)
      ? service.categories[0]
      : service.categories;

    // Evita mostrar servicios cuya categoría no está disponible públicamente.
    if (!category?.name) continue;

    const mappedService = {
      id: service.id,
      name: service.name,
      description: service.description ?? association.description ?? null,
      categoryId: String(service.category_id),
      categoryName: category.name,
      priceFrom: association.price_from,
      priceTo: association.price_to,
    };

    const providerServiceList =
      servicesByProvider.get(association.provider_id) ?? [];

    providerServiceList.push(mappedService);
    servicesByProvider.set(association.provider_id, providerServiceList);
  }

  return providers.map((provider) => {
    const providerServiceList = servicesByProvider.get(provider.id) ?? [];

    const categoriesById = new Map();

    for (const service of providerServiceList) {
      categoriesById.set(service.categoryId, {
        id: service.categoryId,
        name: service.categoryName,
      });
    }

    return {
      provider,
      services: providerServiceList,
      categories: [...categoriesById.values()],
    };
  });
}