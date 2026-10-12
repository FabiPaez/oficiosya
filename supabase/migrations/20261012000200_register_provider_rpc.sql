
-- Registro transaccional de prestadores.
-- Solo el usuario autenticado puede registrar su propio perfil.

CREATE OR REPLACE FUNCTION public.register_as_provider(
    p_provider_data jsonb DEFAULT '{}'::jsonb
)
RETURNS SETOF public.profiles
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
    v_user_id uuid;
    v_provider_role_id smallint;
    v_inserted_role_id smallint;
BEGIN
    -- La identidad proviene del JWT autenticado, nunca de un parámetro.
    v_user_id := auth.uid();

    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'AUTHENTICATION_REQUIRED'
            USING ERRCODE = '28000';
    END IF;

    -- Validar el objeto recibido.
    IF p_provider_data IS NULL
       OR pg_catalog.jsonb_typeof(p_provider_data) <> 'object' THEN
        RAISE EXCEPTION 'INVALID_PROVIDER_DATA'
            USING ERRCODE = '22023';
    END IF;

    IF (p_provider_data - ARRAY[
        'description',
        'city',
        'department'
    ]) <> '{}'::jsonb THEN
        RAISE EXCEPTION 'INVALID_PROVIDER_FIELDS'
            USING ERRCODE = '22023';
    END IF;

    -- Impedir tipos inesperados en los campos admitidos.
    IF (p_provider_data ? 'description'
        AND pg_catalog.jsonb_typeof(
            p_provider_data -> 'description'
        ) NOT IN ('string', 'null'))
       OR
       (p_provider_data ? 'city'
        AND pg_catalog.jsonb_typeof(
            p_provider_data -> 'city'
        ) NOT IN ('string', 'null'))
       OR
       (p_provider_data ? 'department'
        AND pg_catalog.jsonb_typeof(
            p_provider_data -> 'department'
        ) NOT IN ('string', 'null')) THEN
        RAISE EXCEPTION 'INVALID_PROVIDER_FIELD_TYPE'
            USING ERRCODE = '22023';
    END IF;

    -- Mantener los límites del validador de la API.
    IF p_provider_data ? 'description'
       AND pg_catalog.jsonb_typeof(
           p_provider_data -> 'description'
       ) = 'string'
       AND pg_catalog.char_length(
           pg_catalog.btrim(p_provider_data ->> 'description')
       ) > 1000 THEN
        RAISE EXCEPTION 'DESCRIPTION_TOO_LONG'
            USING ERRCODE = '22023';
    END IF;

    IF (p_provider_data ? 'city'
        AND pg_catalog.jsonb_typeof(
            p_provider_data -> 'city'
        ) = 'string'
        AND pg_catalog.char_length(
            pg_catalog.btrim(p_provider_data ->> 'city')
        ) > 100)
       OR
       (p_provider_data ? 'department'
        AND pg_catalog.jsonb_typeof(
            p_provider_data -> 'department'
        ) = 'string'
        AND pg_catalog.char_length(
            pg_catalog.btrim(p_provider_data ->> 'department')
        ) > 100) THEN
        RAISE EXCEPTION 'LOCATION_FIELD_TOO_LONG'
            USING ERRCODE = '22023';
    END IF;

    -- Confirmar que existe el perfil creado durante el registro de Auth.
    PERFORM 1
    FROM public.profiles AS p
    WHERE p.id = v_user_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'PROFILE_NOT_FOUND'
            USING ERRCODE = 'P0002';
    END IF;

    -- Obtener exclusivamente el rol PROVIDER.
    SELECT r.id
    INTO v_provider_role_id
    FROM public.roles AS r
    WHERE r.name = 'PROVIDER';

    IF v_provider_role_id IS NULL THEN
    RAISE EXCEPTION 'PROVIDER_ROLE_NOT_CONFIGURED'
        USING ERRCODE = 'P0001',
              DETAIL = 'PROVIDER_ROLE_NOT_CONFIGURED';
    END IF;

    -- La clave primaria compuesta resuelve intentos concurrentes.
    INSERT INTO public.user_roles (user_id, role_id)
    VALUES (v_user_id, v_provider_role_id)
    ON CONFLICT (user_id, role_id) DO NOTHING
    RETURNING role_id INTO v_inserted_role_id;

    IF v_inserted_role_id IS NULL THEN
    RAISE EXCEPTION 'PROVIDER_ALREADY_REGISTERED'
        USING ERRCODE = 'P0001',
              DETAIL = 'PROVIDER_ALREADY_REGISTERED';
    END IF;

    -- Actualizar solo los campos enviados.
    -- Si la actualización falla, también se revierte el INSERT del rol.
    RETURN QUERY
    UPDATE public.profiles AS p
    SET
        description = CASE
            WHEN p_provider_data ? 'description'
            THEN pg_catalog.btrim(p_provider_data ->> 'description')
            ELSE p.description
        END,
        city = CASE
            WHEN p_provider_data ? 'city'
            THEN pg_catalog.btrim(p_provider_data ->> 'city')
            ELSE p.city
        END,
        department = CASE
            WHEN p_provider_data ? 'department'
            THEN pg_catalog.btrim(p_provider_data ->> 'department')
            ELSE p.department
        END,
        updated_at = pg_catalog.now()
    WHERE p.id = v_user_id
    RETURNING p.*;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'PROFILE_NOT_FOUND'
            USING ERRCODE = 'P0002';
    END IF;
END;
$function$;

-- La función no debe quedar disponible para usuarios anónimos.
REVOKE ALL ON FUNCTION public.register_as_provider(jsonb)
    FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.register_as_provider(jsonb)
    TO authenticated;