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


export async function updateProviderCategories(
  providerId,
  categoryIds,
  supabaseClient,
) {
  if (!Array.isArray(categoryIds)) {
    throw new Error('La lista de categorías no es válida.');
  }

  if (
    categoryIds.length === 0 ||
    categoryIds.length > 10 ||
    categoryIds.some(
      (id) => !Number.isSafeInteger(id) || id <= 0,
    ) ||
    new Set(categoryIds).size !== categoryIds.length
  ) {
    throw new Error(
      'Las categorías seleccionadas no son válidas.',
    );
  }

  const { error } = await supabaseClient.rpc(
    'replace_provider_categories',
    {
      p_provider_id: providerId,
      p_category_ids: categoryIds,
    },
  );

  if (error) {
    throw error;
  }
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

  // 1. Obtener las categorías asignadas directamente a cada prestador.
  const {
    data: providerCategories,
    error: providerCategoriesError,
  } = await supabase
    .from('provider_categories')
    .select('provider_id, category_id')
    .in('provider_id', providerIds);

  if (providerCategoriesError) throw providerCategoriesError;

  // 2. Consultar únicamente las categorías activas.
  const categoryIds = [
    ...new Set(
      (providerCategories ?? []).map((item) => Number(item.category_id)),
    ),
  ].filter(Number.isSafeInteger);

  let categories = [];

  if (categoryIds.length > 0) {
    const { data, error } = await supabase
      .from('categories')
      .select('id, name')
      .in('id', categoryIds)
      .eq('is_active', true);

    if (error) throw error;

    categories = data ?? [];
  }

  const categoriesById = new Map(
    categories.map((category) => [
      String(category.id),
      {
        id: String(category.id),
        name: category.name,
      },
    ]),
  );

  const categoriesByProvider = new Map();

  for (const association of providerCategories ?? []) {
    const category = categoriesById.get(String(association.category_id));

    // No exponer categorías inactivas o que no estén disponibles públicamente.
    if (!category) continue;

    const providerCategoryList =
      categoriesByProvider.get(association.provider_id) ?? [];

    providerCategoryList.push(category);
    categoriesByProvider.set(
      association.provider_id,
      providerCategoryList,
    );
  }

  // 3. Obtener los servicios asociados, independientemente de las categorías.
  const { data: providerServices, error: associationsError } = await supabase
    .from('provider_services')
    .select('provider_id, service_id, price_from, price_to, description')
    .in('provider_id', providerIds)
    .eq('is_active', true);

  if (associationsError) throw associationsError;

  const serviceIds = [
    ...new Set(
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
        categories (
          id,
          name
        )
      `)
      .in('id', serviceIds)
      .eq('is_active', true);

    if (error) throw error;

    services = data ?? [];
  }

  const servicesById = new Map(
    services.map((service) => [Number(service.id), service]),
  );

  const servicesByProvider = new Map();

  for (const association of providerServices ?? []) {
    const service = servicesById.get(Number(association.service_id));

    if (!service) continue;

    const category = Array.isArray(service.categories)
      ? service.categories[0]
      : service.categories;

    // Evitar mostrar servicios cuya categoría no esté disponible públicamente.
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

  // 4. Devolver categorías y servicios como datos independientes.
  return providers.map((provider) => ({
    provider,
    services: servicesByProvider.get(provider.id) ?? [],
    categories: categoriesByProvider.get(provider.id) ?? [],
  }));
}