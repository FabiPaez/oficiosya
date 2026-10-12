
BEGIN;

-- =========================================================
-- 1. Función auxiliar segura para verificar roles
-- =========================================================

CREATE OR REPLACE FUNCTION public.current_user_has_role(p_role text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles AS ur
    JOIN public.roles AS r ON r.id = ur.role_id
    WHERE ur.user_id = auth.uid()
      AND r.name = p_role
  );
$function$;

ALTER FUNCTION public.current_user_has_role(text) OWNER TO postgres;

REVOKE ALL ON FUNCTION public.current_user_has_role(text)
  FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.current_user_has_role(text)
  TO anon, authenticated;


-- =========================================================
-- 2. Corregir la vista pública de autores de reseñas
-- =========================================================

CREATE OR REPLACE VIEW public.public_reviewers AS
SELECT DISTINCT
  p.id,
  p.first_name,
  p.last_name,
  p.profile_image_url
FROM public.profiles AS p
JOIN public.reviews AS rv
  ON rv.reviewer_id = p.id;

ALTER VIEW public.public_reviewers OWNER TO postgres;

-- =========================================================
-- 3. Retirar privilegios directos excesivos
-- =========================================================

REVOKE ALL PRIVILEGES ON TABLE
  public.profiles,
  public.roles,
  public.user_roles,
  public.categories,
  public.services,
  public.provider_services,
  public.service_requests,
  public.reviews,
  public.favorites
FROM PUBLIC, anon, authenticated;

REVOKE ALL PRIVILEGES ON SEQUENCE
  public.categories_id_seq,
  public.provider_services_id_seq,
  public.reviews_id_seq,
  public.roles_id_seq,
  public.service_requests_id_seq,
  public.services_id_seq
FROM PUBLIC, anon, authenticated;

-- Las vistas públicas son únicamente de lectura para los clientes de la API.
REVOKE ALL PRIVILEGES ON TABLE
  public.public_provider_profiles,
  public.public_reviewers
FROM PUBLIC, anon, authenticated;


-- =========================================================
-- 4. Permisos mínimos de lectura
-- =========================================================

GRANT SELECT ON public.roles,
  public.categories,
  public.services,
  public.provider_services,
  public.reviews
TO anon, authenticated;

GRANT SELECT ON public.profiles,
  public.user_roles,
  public.service_requests,
  public.favorites
TO authenticated;

GRANT SELECT ON TABLE
  public.public_provider_profiles,
  public.public_reviewers
TO anon, authenticated;


-- =========================================================
-- 5. Permisos de escritura limitados por operación
-- =========================================================

-- Cada usuario solo podrá modificar campos permitidos
-- de su propio perfil; RLS limitará la fila.
GRANT UPDATE (
  first_name,
  last_name,
  phone,
  profile_image_url,
  description,
  city,
  department,
  updated_at
) ON public.profiles TO authenticated;

-- Las operaciones administrativas se limitarán por RLS.
GRANT INSERT, UPDATE, DELETE
  ON public.categories, public.services
  TO authenticated;

-- Prestadores: alta y edición de sus servicios.
GRANT INSERT (
  provider_id,
  service_id,
  price_from,
  price_to,
  description,
  is_active
) ON public.provider_services TO authenticated;

GRANT UPDATE (
  price_from,
  price_to,
  description,
  is_active,
  updated_at
) ON public.provider_services TO authenticated;

-- Solicitudes: alta propia en estado PENDING y actualización
-- del estado. RLS restringirá las filas y las transiciones.
GRANT INSERT (
  client_id,
  provider_id,
  service_id,
  title,
  description,
  address,
  city,
  requested_date,
  status
) ON public.service_requests TO authenticated;

GRANT UPDATE (
  status,
  updated_at
) ON public.service_requests TO authenticated;

-- Reseñas: insertar solo los campos propios de una reseña.
GRANT INSERT (
  request_id,
  reviewer_id,
  reviewed_id,
  rating,
  comment
) ON public.reviews TO authenticated;

-- Favoritos: solo agregar y eliminar.
GRANT INSERT (
  user_id,
  provider_id
) ON public.favorites TO authenticated;

GRANT DELETE ON public.favorites TO authenticated;


-- =========================================================
-- 6. Permisos de secuencias para IDs autogenerados
-- =========================================================

GRANT USAGE ON SEQUENCE
  public.categories_id_seq,
  public.services_id_seq,
  public.provider_services_id_seq,
  public.service_requests_id_seq,
  public.reviews_id_seq
TO authenticated;


-- =========================================================
-- 7. Activar RLS en las nueve tablas
-- =========================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.provider_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;


-- =========================================================
-- 8. PROFILES
-- =========================================================

CREATE POLICY profiles_select_own
ON public.profiles
FOR SELECT TO authenticated
USING (id = (SELECT auth.uid()));

CREATE POLICY profiles_update_own
ON public.profiles
FOR UPDATE TO authenticated
USING (id = (SELECT auth.uid()))
WITH CHECK (id = (SELECT auth.uid()));


-- =========================================================
-- 9. ROLES y USER_ROLES
-- =========================================================

CREATE POLICY roles_select_all
ON public.roles
FOR SELECT TO anon, authenticated
USING (true);

CREATE POLICY user_roles_select_own
ON public.user_roles
FOR SELECT TO authenticated
USING (user_id = (SELECT auth.uid()));

CREATE POLICY user_roles_select_admin
ON public.user_roles
FOR SELECT TO authenticated
USING (
  (SELECT public.current_user_has_role('ADMIN'))
);


-- =========================================================
-- 10. CATEGORIES
-- =========================================================

CREATE POLICY categories_select_active_or_admin
ON public.categories
FOR SELECT TO anon, authenticated
USING (
  is_active = true
  OR (SELECT public.current_user_has_role('ADMIN'))
);

CREATE POLICY categories_admin_insert
ON public.categories
FOR INSERT TO authenticated
WITH CHECK (
  (SELECT public.current_user_has_role('ADMIN'))
);

CREATE POLICY categories_admin_update
ON public.categories
FOR UPDATE TO authenticated
USING (
  (SELECT public.current_user_has_role('ADMIN'))
)
WITH CHECK (
  (SELECT public.current_user_has_role('ADMIN'))
);

CREATE POLICY categories_admin_delete
ON public.categories
FOR DELETE TO authenticated
USING (
  (SELECT public.current_user_has_role('ADMIN'))
);


-- =========================================================
-- 11. SERVICES
-- =========================================================

CREATE POLICY services_select_active_or_admin
ON public.services
FOR SELECT TO anon, authenticated
USING (
  is_active = true
  OR (SELECT public.current_user_has_role('ADMIN'))
);

CREATE POLICY services_admin_insert
ON public.services
FOR INSERT TO authenticated
WITH CHECK (
  (SELECT public.current_user_has_role('ADMIN'))
);

CREATE POLICY services_admin_update
ON public.services
FOR UPDATE TO authenticated
USING (
  (SELECT public.current_user_has_role('ADMIN'))
)
WITH CHECK (
  (SELECT public.current_user_has_role('ADMIN'))
);

CREATE POLICY services_admin_delete
ON public.services
FOR DELETE TO authenticated
USING (
  (SELECT public.current_user_has_role('ADMIN'))
);


-- =========================================================
-- 12. PROVIDER_SERVICES
-- =========================================================

CREATE POLICY provider_services_select_visible
ON public.provider_services
FOR SELECT TO anon, authenticated
USING (
  is_active = true
  OR provider_id = (SELECT auth.uid())
  OR (SELECT public.current_user_has_role('ADMIN'))
);

CREATE POLICY provider_services_insert_owner
ON public.provider_services
FOR INSERT TO authenticated
WITH CHECK (
  provider_id = (SELECT auth.uid())
  AND (SELECT public.current_user_has_role('PROVIDER'))
  AND is_active = true
  AND EXISTS (
    SELECT 1
    FROM public.services AS s
    WHERE s.id = service_id
      AND s.is_active = true
  )
);

CREATE POLICY provider_services_insert_admin
ON public.provider_services
FOR INSERT TO authenticated
WITH CHECK (
  (SELECT public.current_user_has_role('ADMIN'))
);

CREATE POLICY provider_services_update_owner
ON public.provider_services
FOR UPDATE TO authenticated
USING (
  provider_id = (SELECT auth.uid())
  AND (SELECT public.current_user_has_role('PROVIDER'))
)
WITH CHECK (
  provider_id = (SELECT auth.uid())
  AND (SELECT public.current_user_has_role('PROVIDER'))
);

CREATE POLICY provider_services_update_admin
ON public.provider_services
FOR UPDATE TO authenticated
USING (
  (SELECT public.current_user_has_role('ADMIN'))
)
WITH CHECK (
  (SELECT public.current_user_has_role('ADMIN'))
);


-- =========================================================
-- 13. SERVICE_REQUESTS
-- =========================================================

CREATE POLICY service_requests_select_participants_admin
ON public.service_requests
FOR SELECT TO authenticated
USING (
  client_id = (SELECT auth.uid())
  OR provider_id = (SELECT auth.uid())
  OR (SELECT public.current_user_has_role('ADMIN'))
);


CREATE POLICY service_requests_insert_client
ON public.service_requests
FOR INSERT TO authenticated
WITH CHECK (
  client_id = (SELECT auth.uid())
  AND provider_id <> client_id
  AND status = 'PENDING'
  AND EXISTS (
    SELECT 1
    FROM public.public_provider_profiles AS p
    WHERE p.id = service_requests.provider_id
  )
  AND EXISTS (
    SELECT 1
    FROM public.services AS s
    WHERE s.id = service_requests.service_id
      AND s.is_active = true
  )
  AND EXISTS (
    SELECT 1
    FROM public.provider_services AS ps
    WHERE ps.provider_id = service_requests.provider_id
      AND ps.service_id = service_requests.service_id
      AND ps.is_active = true
  )
);

CREATE POLICY service_requests_update_client_cancel
ON public.service_requests
FOR UPDATE TO authenticated
USING (
  client_id = (SELECT auth.uid())
  AND status = 'PENDING'
)
WITH CHECK (
  client_id = (SELECT auth.uid())
  AND status = 'CANCELLED'
);

CREATE POLICY service_requests_update_provider
ON public.service_requests
FOR UPDATE TO authenticated
USING (
  provider_id = (SELECT auth.uid())
  AND (SELECT public.current_user_has_role('PROVIDER'))
)
WITH CHECK (
  provider_id = (SELECT auth.uid())
  AND (SELECT public.current_user_has_role('PROVIDER'))
  AND status <> 'CANCELLED'
);

CREATE POLICY service_requests_update_admin
ON public.service_requests
FOR UPDATE TO authenticated
USING (
  (SELECT public.current_user_has_role('ADMIN'))
)
WITH CHECK (
  (SELECT public.current_user_has_role('ADMIN'))
);


-- =========================================================
-- 14. REVIEWS
-- =========================================================

CREATE POLICY reviews_select_public
ON public.reviews
FOR SELECT TO anon, authenticated
USING (true);

CREATE POLICY reviews_insert_completed_request
ON public.reviews
FOR INSERT TO authenticated
WITH CHECK (
  reviewer_id = (SELECT auth.uid())
  AND reviewer_id <> reviewed_id
  AND EXISTS (
    SELECT 1
    FROM public.service_requests AS sr
    WHERE sr.id = request_id
      AND sr.client_id = (SELECT auth.uid())
      AND sr.provider_id = reviewed_id
      AND sr.status = 'COMPLETED'
  )
);


-- =========================================================
-- 15. FAVORITES
-- =========================================================

CREATE POLICY favorites_select_own
ON public.favorites
FOR SELECT TO authenticated
USING (user_id = (SELECT auth.uid()));

CREATE POLICY favorites_insert_own
ON public.favorites
FOR INSERT TO authenticated
WITH CHECK (
  user_id = (SELECT auth.uid())
  AND provider_id <> user_id
  AND EXISTS (
    SELECT 1
    FROM public.public_provider_profiles AS p
    WHERE p.id = provider_id
  )
);

CREATE POLICY favorites_delete_own
ON public.favorites
FOR DELETE TO authenticated
USING (user_id = (SELECT auth.uid()));

COMMIT;