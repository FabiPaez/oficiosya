export async function findProfileById(supabaseClient, userId) {
  const { data, error } = await supabaseClient
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

export async function updateProfile(
  supabaseClient,
  userId,
  {
    firstName,
    lastName,
    phone,
    profileImageUrl,
    description,
    city,
    department,
  }
) {
  const updates = {};

  if (firstName !== undefined) updates.first_name = firstName;
  if (lastName !== undefined) updates.last_name = lastName;
  if (phone !== undefined) updates.phone = phone;
  if (profileImageUrl !== undefined) updates.profile_image_url = profileImageUrl;
  if (description !== undefined) updates.description = description;
  if (city !== undefined) updates.city = city;
  if (department !== undefined) updates.department = department;

  updates.updated_at = new Date().toISOString();

  const { data, error } = await supabaseClient
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}