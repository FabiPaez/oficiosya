-- Vista pública limitada a prestadores registrados.
-- No expone perfiles de clientes que no tengan el rol PROVIDER.

CREATE OR REPLACE VIEW public.public_provider_profiles AS
SELECT
    p.id,
    p.first_name,
    p.last_name,
    p.phone,
    p.profile_image_url,
    p.description,
    p.city,
    p.department,
    p.created_at
FROM public.profiles AS p
WHERE EXISTS (
    SELECT 1
    FROM public.user_roles AS ur
    INNER JOIN public.roles AS r
        ON r.id = ur.role_id
    WHERE ur.user_id = p.id
      AND r.name = 'PROVIDER'
);

-- Vista de identidad mínima para autores de reseñas.
-- No expone teléfono, domicilio ni descripción del perfil.

CREATE OR REPLACE VIEW public.public_reviewers AS
SELECT
    p.id,
    p.first_name,
    p.last_name,
    p.profile_image_url
FROM public.profiles AS p;

-- Estas vistas solamente permiten lectura.
GRANT SELECT ON public.public_provider_profiles TO anon, authenticated;
GRANT SELECT ON public.public_reviewers TO anon, authenticated;