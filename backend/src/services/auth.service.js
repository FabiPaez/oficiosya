import { supabase } from '../config/supabase.js';
import { AppError } from '../utils/AppError.js';

export async function registerUser({
  email,
  password,
  firstName,
  lastName,
  phone,
}) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    if (
      error.message.toLowerCase().includes('already registered')
    ) {
      throw new AppError(
        'El email ya está registrado',
        409
      );
    }

    throw error;
  }

  const user = data.user;

  if (!user) {
    throw new AppError(
      'No se pudo crear el usuario',
      500
    );
  }

  const { error: profileError } = await supabase
    .from('profiles')
    .insert({
      id: user.id,
      first_name: firstName,
      last_name: lastName,
      phone: phone ?? null,
    });

  if (profileError) {
    throw profileError;
  }

  const { data: clientRole, error: roleError } = await supabase
    .from('roles')
    .select('id')
    .eq('name', 'CLIENT')
    .single();

  if (roleError) {
    throw roleError;
  }

  const { error: userRoleError } = await supabase
    .from('user_roles')
    .insert({
      user_id: user.id,
      role_id: clientRole.id,
    });

  if (userRoleError) {
    throw userRoleError;
  }

  return {
    user,
    session: data.session,
  };
};

export async function loginUser({
  email,
  password,
}) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error('SUPABASE LOGIN ERROR:', error);
  
    throw new AppError(
      error.message,
      401
    );
  }

  if (!data.user || !data.session) {
    throw new AppError(
      'No se pudo iniciar sesión',
      401
    );
  }

  return {
    user: data.user,
    session: data.session,
  };
}