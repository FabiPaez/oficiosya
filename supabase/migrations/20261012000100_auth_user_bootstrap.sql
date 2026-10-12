
-- OficiosYa: creación inicial de perfil y rol CLIENT.
-- Los metadatos no pueden asignar roles privilegiados.

BEGIN;

CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    client_role_id SMALLINT;
    new_first_name TEXT;
    new_last_name TEXT;
    new_phone TEXT;
BEGIN
    new_first_name := NULLIF(
        btrim(NEW.raw_user_meta_data ->> 'firstName'),
        ''
    );

    new_last_name := NULLIF(
        btrim(NEW.raw_user_meta_data ->> 'lastName'),
        ''
    );

    new_phone := NULLIF(
        btrim(NEW.raw_user_meta_data ->> 'phone'),
        ''
    );

    IF new_first_name IS NULL OR char_length(new_first_name) < 2 THEN
        RAISE EXCEPTION 'El nombre del usuario no es válido';
    END IF;

    IF new_last_name IS NULL OR char_length(new_last_name) < 2 THEN
        RAISE EXCEPTION 'El apellido del usuario no es válido';
    END IF;

    SELECT r.id
      INTO client_role_id
      FROM public.roles AS r
     WHERE r.name = 'CLIENT';

    IF client_role_id IS NULL THEN
        RAISE EXCEPTION 'No existe el rol CLIENT';
    END IF;

    INSERT INTO public.profiles (
        id,
        first_name,
        last_name,
        phone
    )
    VALUES (
        NEW.id,
        new_first_name,
        new_last_name,
        new_phone
    );

    INSERT INTO public.user_roles (user_id, role_id)
    VALUES (NEW.id, client_role_id);

    RETURN NEW;
END;
$$;

ALTER FUNCTION public.handle_new_auth_user()
OWNER TO postgres;

REVOKE ALL ON FUNCTION public.handle_new_auth_user()
FROM PUBLIC, anon, authenticated, service_role;

DROP TRIGGER IF EXISTS on_auth_user_created
ON auth.users;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_auth_user();

COMMIT;