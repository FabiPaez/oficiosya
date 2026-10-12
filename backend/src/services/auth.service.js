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
    options: {
      data: {
        firstName,
        lastName,
        phone: phone ?? null,
      },
    },
  });

  if (error) {
    if (error.message.toLowerCase().includes('already registered')) {
      throw new AppError('El email ya está registrado', 409);
    }

    throw error;
  }

  const user = data.user;

  if (!user) {
    throw new AppError('No se pudo crear el usuario', 500);
  }

  return {
    user,
    session: data.session,
  };
}

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