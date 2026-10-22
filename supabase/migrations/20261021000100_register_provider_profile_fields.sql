
BEGIN;

CREATE OR REPLACE FUNCTION public.register_as_provider(
    p_provider_data jsonb DEFAULT '{}'::jsonb
)
RETURNS SETOF public.profiles
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
    v_user_id uuid;
    v_provider_role_id smallint;
    v_inserted_role_id smallint;

    v_category_ids bigint[];
    v_category_count integer;
    v_valid_category_count integer;

    v_available_days text[];
    v_available_days_count integer;
BEGIN
    -- Identidad autenticada.
    v_user_id := auth.uid();

    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'AUTHENTICATION_REQUIRED'
            USING ERRCODE = '28000';
    END IF;

    -- El parámetro debe ser un objeto JSON.
    IF p_provider_data IS NULL
       OR pg_catalog.jsonb_typeof(p_provider_data) <> 'object' THEN
        RAISE EXCEPTION 'INVALID_PROVIDER_DATA'
            USING ERRCODE = '22023';
    END IF;

    -- Lista explícita de campos admitidos.
    IF (
        p_provider_data - ARRAY[
            'description',
            'city',
            'department',
            'category_ids',
            'coverage',
            'experience_years',
            'schedule',
            'available_days'
        ]
    ) <> '{}'::jsonb THEN
        RAISE EXCEPTION 'INVALID_PROVIDER_FIELDS'
            USING ERRCODE = '22023';
    END IF;

    -- Validar tipos de los campos de texto.
    IF (
        p_provider_data ? 'description'
        AND pg_catalog.jsonb_typeof(
            p_provider_data -> 'description'
        ) NOT IN ('string', 'null')
    ) OR (
        p_provider_data ? 'city'
        AND pg_catalog.jsonb_typeof(
            p_provider_data -> 'city'
        ) NOT IN ('string', 'null')
    ) OR (
        p_provider_data ? 'department'
        AND pg_catalog.jsonb_typeof(
            p_provider_data -> 'department'
        ) NOT IN ('string', 'null')
    ) OR (
        p_provider_data ? 'coverage'
        AND pg_catalog.jsonb_typeof(
            p_provider_data -> 'coverage'
        ) NOT IN ('string', 'null')
    ) OR (
        p_provider_data ? 'experience_years'
        AND pg_catalog.jsonb_typeof(
            p_provider_data -> 'experience_years'
        ) NOT IN ('string', 'null')
    ) OR (
        p_provider_data ? 'schedule'
        AND pg_catalog.jsonb_typeof(
            p_provider_data -> 'schedule'
        ) NOT IN ('string', 'null')
    ) THEN
        RAISE EXCEPTION 'INVALID_PROVIDER_FIELD_TYPE'
            USING ERRCODE = '22023';
    END IF;

    -- Límites de descripción y ubicación.
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

    IF (
        p_provider_data ? 'city'
        AND pg_catalog.jsonb_typeof(
            p_provider_data -> 'city'
        ) = 'string'
        AND pg_catalog.char_length(
            pg_catalog.btrim(p_provider_data ->> 'city')
        ) > 100
    ) OR (
        p_provider_data ? 'department'
        AND pg_catalog.jsonb_typeof(
            p_provider_data -> 'department'
        ) = 'string'
        AND pg_catalog.char_length(
            pg_catalog.btrim(p_provider_data ->> 'department')
        ) > 100
    ) THEN
        RAISE EXCEPTION 'LOCATION_FIELD_TOO_LONG'
            USING ERRCODE = '22023';
    END IF;

    -- Validar cobertura.
    IF p_provider_data ? 'coverage'
       AND pg_catalog.jsonb_typeof(
           p_provider_data -> 'coverage'
       ) = 'string'
       AND p_provider_data ->> 'coverage' NOT IN (
           'SOLO CENTRO',
           'RURAL',
           'CENTRO + RURAL'
       ) THEN
        RAISE EXCEPTION 'INVALID_COVERAGE'
            USING ERRCODE = '22023';
    END IF;

    -- Validar experiencia, incluido el valor especial +40.
    IF p_provider_data ? 'experience_years'
       AND pg_catalog.jsonb_typeof(
           p_provider_data -> 'experience_years'
       ) = 'string'
       AND p_provider_data ->> 'experience_years'
           !~ '^(0|[1-9]|[1-3][0-9]|40|\+40)$' THEN
        RAISE EXCEPTION 'INVALID_EXPERIENCE_YEARS'
            USING ERRCODE = '22023';
    END IF;

    -- Validar horario.
    IF p_provider_data ? 'schedule'
       AND pg_catalog.jsonb_typeof(
           p_provider_data -> 'schedule'
       ) = 'string'
       AND pg_catalog.char_length(
           pg_catalog.btrim(p_provider_data ->> 'schedule')
       ) > 200 THEN
        RAISE EXCEPTION 'SCHEDULE_TOO_LONG'
            USING ERRCODE = '22023';
    END IF;

    -- Validar días disponibles.
    IF p_provider_data ? 'available_days' THEN
        IF pg_catalog.jsonb_typeof(
            p_provider_data -> 'available_days'
        ) <> 'array' THEN
            RAISE EXCEPTION 'INVALID_AVAILABLE_DAYS'
                USING ERRCODE = '22023';
        END IF;

        v_available_days_count :=
            pg_catalog.jsonb_array_length(
                p_provider_data -> 'available_days'
            );

        IF v_available_days_count > 7 THEN
            RAISE EXCEPTION 'TOO_MANY_AVAILABLE_DAYS'
                USING ERRCODE = '22023';
        END IF;

        IF EXISTS (
            SELECT 1
            FROM pg_catalog.jsonb_array_elements(
                p_provider_data -> 'available_days'
            ) AS item(value)
            WHERE pg_catalog.jsonb_typeof(item.value) <> 'string'
               OR (item.value #>> '{}') NOT IN (
                   'Lunes',
                   'Martes',
                   'Miércoles',
                   'Jueves',
                   'Viernes',
                   'Sábado',
                   'Domingo'
               )
        ) THEN
            RAISE EXCEPTION 'INVALID_AVAILABLE_DAY'
                USING ERRCODE = '22023';
        END IF;

        SELECT pg_catalog.array_agg(
            item.value #>> '{}'
            ORDER BY item.ordinality
        )
        INTO v_available_days
        FROM pg_catalog.jsonb_array_elements(
            p_provider_data -> 'available_days'
        ) WITH ORDINALITY AS item(value, ordinality);

        -- No admitir días duplicados.
        IF v_available_days_count <> (
            SELECT pg_catalog.count(DISTINCT day_name)
            FROM pg_catalog.unnest(v_available_days) AS days(day_name)
        ) THEN
            RAISE EXCEPTION 'DUPLICATE_AVAILABLE_DAYS'
                USING ERRCODE = '22023';
        END IF;
    END IF;

    -- Validar categorías seleccionadas.
    IF p_provider_data ? 'category_ids' THEN
        IF pg_catalog.jsonb_typeof(
            p_provider_data -> 'category_ids'
        ) <> 'array' THEN
            RAISE EXCEPTION 'INVALID_CATEGORY_IDS'
                USING ERRCODE = '22023';
        END IF;

        v_category_count := pg_catalog.jsonb_array_length(
            p_provider_data -> 'category_ids'
        );

        IF v_category_count < 1 OR v_category_count > 10 THEN
            RAISE EXCEPTION 'INVALID_CATEGORY_COUNT'
                USING ERRCODE = '22023';
        END IF;

        IF EXISTS (
            SELECT 1
            FROM pg_catalog.jsonb_array_elements(
                p_provider_data -> 'category_ids'
            ) AS item(value)
            WHERE pg_catalog.jsonb_typeof(item.value) <> 'number'
               OR item.value::text !~ '^[1-9][0-9]*$'
        ) THEN
            RAISE EXCEPTION 'INVALID_CATEGORY_ID'
                USING ERRCODE = '22023';
        END IF;

        SELECT pg_catalog.array_agg(
            (item.value #>> '{}')::bigint
            ORDER BY item.ordinality
        )
        INTO v_category_ids
        FROM pg_catalog.jsonb_array_elements(
            p_provider_data -> 'category_ids'
        ) WITH ORDINALITY AS item(value, ordinality);

        IF (
            SELECT pg_catalog.count(DISTINCT category_id)
            FROM pg_catalog.unnest(v_category_ids) AS ids(category_id)
        ) <> v_category_count THEN
            RAISE EXCEPTION 'DUPLICATE_CATEGORY_IDS'
                USING ERRCODE = '22023';
        END IF;

        SELECT pg_catalog.count(*)::integer
        INTO v_valid_category_count
        FROM public.categories AS c
        WHERE c.id = ANY(v_category_ids)
          AND c.is_active = TRUE;

        IF v_valid_category_count <> v_category_count THEN
            RAISE EXCEPTION 'INVALID_OR_INACTIVE_CATEGORY'
                USING ERRCODE = '22023';
        END IF;
    END IF;

    -- Confirmar que exista el perfil base.
    PERFORM 1
    FROM public.profiles AS p
    WHERE p.id = v_user_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'PROFILE_NOT_FOUND'
            USING ERRCODE = 'P0002';
    END IF;

    -- Obtener el rol de prestador.
    SELECT r.id
    INTO v_provider_role_id
    FROM public.roles AS r
    WHERE r.name = 'PROVIDER';

    IF v_provider_role_id IS NULL THEN
        RAISE EXCEPTION 'PROVIDER_ROLE_NOT_CONFIGURED'
            USING ERRCODE = 'P0001',
                  DETAIL = 'PROVIDER_ROLE_NOT_CONFIGURED';
    END IF;

    -- Impedir registros duplicados.
    INSERT INTO public.user_roles (user_id, role_id)
    VALUES (v_user_id, v_provider_role_id)
    ON CONFLICT (user_id, role_id) DO NOTHING
    RETURNING role_id INTO v_inserted_role_id;

    IF v_inserted_role_id IS NULL THEN
        RAISE EXCEPTION 'PROVIDER_ALREADY_REGISTERED'
            USING ERRCODE = 'P0001',
                  DETAIL = 'PROVIDER_ALREADY_REGISTERED';
    END IF;

    -- Actualizar el perfil con los campos enviados.
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
        coverage = CASE
            WHEN p_provider_data ? 'coverage'
            THEN p_provider_data ->> 'coverage'
            ELSE p.coverage
        END,
        experience_years = CASE
            WHEN p_provider_data ? 'experience_years'
            THEN p_provider_data ->> 'experience_years'
            ELSE p.experience_years
        END,
        schedule = CASE
            WHEN p_provider_data ? 'schedule'
            THEN pg_catalog.btrim(p_provider_data ->> 'schedule')
            ELSE p.schedule
        END,
        available_days = CASE
            WHEN p_provider_data ? 'available_days'
            THEN COALESCE(v_available_days, ARRAY[]::text[])
            ELSE p.available_days
        END,
        updated_at = pg_catalog.now()
    WHERE p.id = v_user_id
    RETURNING p.*;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'PROFILE_NOT_FOUND'
            USING ERRCODE = 'P0002';
    END IF;

    -- Asociar las categorías en la misma transacción.
    IF p_provider_data ? 'category_ids' THEN
        INSERT INTO public.provider_categories (
            provider_id,
            category_id
        )
        SELECT v_user_id, ids.category_id
        FROM pg_catalog.unnest(v_category_ids) AS ids(category_id);
    END IF;

    RETURN;
END;
$function$;

COMMIT;
