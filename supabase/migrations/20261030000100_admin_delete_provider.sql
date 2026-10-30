-- =========================================================
-- OficiosYa
-- Función RPC administrativa para eliminar prestadores
-- =========================================================

BEGIN;

CREATE OR REPLACE FUNCTION public.admin_delete_provider(
    p_provider_id uuid,
    p_delete_account boolean DEFAULT false
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
    v_admin_id uuid;
    v_provider_role_id smallint;
    v_result jsonb;
BEGIN
    v_admin_id := auth.uid();

    IF v_admin_id IS NULL THEN
        RAISE EXCEPTION 'AUTHENTICATION_REQUIRED'
            USING ERRCODE = '28000';
    END IF;

    -- Verificar que quien invoca la función tenga el rol ADMIN
    IF NOT EXISTS (
        SELECT 1
        FROM public.user_roles AS ur
        JOIN public.roles AS r ON r.id = ur.role_id
        WHERE ur.user_id = v_admin_id
          AND r.name = 'ADMIN'
    ) THEN
        RAISE EXCEPTION 'FORBIDDEN_ADMIN_REQUIRED'
            USING ERRCODE = '42501';
    END IF;

    -- Verificar que el usuario exista en profiles
    IF NOT EXISTS (
        SELECT 1 FROM public.profiles WHERE id = p_provider_id
    ) THEN
        RAISE EXCEPTION 'PROVIDER_NOT_FOUND'
            USING ERRCODE = 'P0002';
    END IF;

    -- 1. Eliminar servicios específicos ofrecidos por el prestador
    DELETE FROM public.provider_services
    WHERE provider_id = p_provider_id;

    -- 2. Eliminar categorías asociadas al prestador
    DELETE FROM public.provider_categories
    WHERE provider_id = p_provider_id;

    -- 3. Eliminar de favoritos (donde este prestador figure como guardado)
    DELETE FROM public.favorites
    WHERE provider_id = p_provider_id;

    -- 4. Remover el rol PROVIDER de user_roles
    SELECT id INTO v_provider_role_id
    FROM public.roles
    WHERE name = 'PROVIDER';

    IF v_provider_role_id IS NOT NULL THEN
        DELETE FROM public.user_roles
        WHERE user_id = p_provider_id
          AND role_id = v_provider_role_id;
    END IF;

    -- 5. Limpiar datos profesionales en el perfil
    UPDATE public.profiles
    SET description = NULL,
        coverage = NULL,
        experience_years = NULL,
        schedule = NULL,
        available_days = NULL,
        updated_at = pg_catalog.now()
    WHERE id = p_provider_id;

    -- 6. Si se solicita borrado completo de la cuenta del usuario
    IF p_delete_account = true THEN
        -- Eliminar solicitudes de servicio asociadas
        DELETE FROM public.service_requests
        WHERE provider_id = p_provider_id OR client_id = p_provider_id;

        -- Eliminar favoritos guardados por este usuario como cliente
        DELETE FROM public.favorites
        WHERE user_id = p_provider_id;

        -- Eliminar todos sus roles
        DELETE FROM public.user_roles
        WHERE user_id = p_provider_id;

        -- Eliminar su perfil público
        DELETE FROM public.profiles
        WHERE id = p_provider_id;

        -- Eliminar de la tabla auth.users
        DELETE FROM auth.users
        WHERE id = p_provider_id;

        v_result := jsonb_build_object(
            'provider_id', p_provider_id,
            'deleted_account', true,
            'message', 'Cuenta y perfil del prestador eliminados completamente'
        );
    ELSE
        v_result := jsonb_build_object(
            'provider_id', p_provider_id,
            'deleted_account', false,
            'message', 'Perfil y rol de prestador eliminados exitosamente'
        );
    END IF;

    RETURN v_result;
END;
$function$;

ALTER FUNCTION public.admin_delete_provider(uuid, boolean) OWNER TO postgres;

-- Permisos de ejecución: solo authenticated (la función valida internamente que sea ADMIN)
REVOKE ALL ON FUNCTION public.admin_delete_provider(uuid, boolean) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_delete_provider(uuid, boolean) TO authenticated;

COMMIT;
