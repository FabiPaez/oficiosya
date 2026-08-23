-- ============================================================
-- OficiosYa
-- Initial database schema
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";


-- ============================================================
-- PROFILES
-- ============================================================

CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,

    phone TEXT,

    profile_image_url TEXT,

    description TEXT,

    city TEXT,
    department TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================================
-- ROLES
-- ============================================================

CREATE TABLE public.roles (
    id SMALLSERIAL PRIMARY KEY,

    name TEXT NOT NULL UNIQUE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


INSERT INTO public.roles (name)
VALUES
    ('CLIENT'),
    ('PROVIDER'),
    ('ADMIN');


-- ============================================================
-- USER ROLES
-- ============================================================

CREATE TABLE public.user_roles (
    user_id UUID NOT NULL
        REFERENCES public.profiles(id)
        ON DELETE CASCADE,

    role_id SMALLINT NOT NULL
        REFERENCES public.roles(id)
        ON DELETE RESTRICT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    PRIMARY KEY (user_id, role_id)
);


-- ============================================================
-- CATEGORIES
-- ============================================================

CREATE TABLE public.categories (
    id BIGSERIAL PRIMARY KEY,

    name TEXT NOT NULL UNIQUE,

    description TEXT,

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================================
-- SERVICES
-- ============================================================

CREATE TABLE public.services (
    id BIGSERIAL PRIMARY KEY,

    category_id BIGINT NOT NULL
        REFERENCES public.categories(id)
        ON DELETE RESTRICT,

    name TEXT NOT NULL,

    description TEXT,

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT services_category_name_unique
        UNIQUE (category_id, name)
);


-- ============================================================
-- PROVIDER SERVICES
-- ============================================================

CREATE TABLE public.provider_services (
    id BIGSERIAL PRIMARY KEY,

    provider_id UUID NOT NULL
        REFERENCES public.profiles(id)
        ON DELETE CASCADE,

    service_id BIGINT NOT NULL
        REFERENCES public.services(id)
        ON DELETE RESTRICT,

    price_from NUMERIC(12,2),

    price_to NUMERIC(12,2),

    description TEXT,

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT provider_service_unique
        UNIQUE (provider_id, service_id),

    CONSTRAINT provider_service_price_check
        CHECK (
            price_from IS NULL
            OR price_from >= 0
        ),

    CONSTRAINT provider_service_price_range_check
        CHECK (
            price_to IS NULL
            OR price_from IS NULL
            OR price_to >= price_from
        )
);


-- ============================================================
-- SERVICE REQUESTS
-- ============================================================

CREATE TABLE public.service_requests (
    id BIGSERIAL PRIMARY KEY,

    client_id UUID NOT NULL
        REFERENCES public.profiles(id)
        ON DELETE RESTRICT,

    provider_id UUID NOT NULL
        REFERENCES public.profiles(id)
        ON DELETE RESTRICT,

    service_id BIGINT NOT NULL
        REFERENCES public.services(id)
        ON DELETE RESTRICT,

    title TEXT NOT NULL,

    description TEXT NOT NULL,

    address TEXT,

    city TEXT,

    requested_date TIMESTAMPTZ,

    status TEXT NOT NULL DEFAULT 'PENDING',

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT service_request_status_check
        CHECK (
            status IN (
                'PENDING',
                'ACCEPTED',
                'REJECTED',
                'IN_PROGRESS',
                'COMPLETED',
                'CANCELLED'
            )
        )
);


-- ============================================================
-- REVIEWS
-- ============================================================

CREATE TABLE public.reviews (
    id BIGSERIAL PRIMARY KEY,

    request_id BIGINT NOT NULL UNIQUE
        REFERENCES public.service_requests(id)
        ON DELETE CASCADE,

    reviewer_id UUID NOT NULL
        REFERENCES public.profiles(id)
        ON DELETE RESTRICT,

    reviewed_id UUID NOT NULL
        REFERENCES public.profiles(id)
        ON DELETE RESTRICT,

    rating SMALLINT NOT NULL,

    comment TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT review_rating_check
        CHECK (rating BETWEEN 1 AND 5),

    CONSTRAINT review_different_users_check
        CHECK (reviewer_id <> reviewed_id)
);


-- ============================================================
-- FAVORITES
-- ============================================================

CREATE TABLE public.favorites (
    user_id UUID NOT NULL
        REFERENCES public.profiles(id)
        ON DELETE CASCADE,

    provider_id UUID NOT NULL
        REFERENCES public.profiles(id)
        ON DELETE CASCADE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    PRIMARY KEY (user_id, provider_id),

    CONSTRAINT favorite_different_users_check
        CHECK (user_id <> provider_id)
);


-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX idx_user_roles_role_id
    ON public.user_roles(role_id);

CREATE INDEX idx_services_category_id
    ON public.services(category_id);

CREATE INDEX idx_provider_services_provider_id
    ON public.provider_services(provider_id);

CREATE INDEX idx_provider_services_service_id
    ON public.provider_services(service_id);

CREATE INDEX idx_service_requests_client_id
    ON public.service_requests(client_id);

CREATE INDEX idx_service_requests_provider_id
    ON public.service_requests(provider_id);

CREATE INDEX idx_service_requests_service_id
    ON public.service_requests(service_id);

CREATE INDEX idx_service_requests_status
    ON public.service_requests(status);

CREATE INDEX idx_reviews_reviewed_id
    ON public.reviews(reviewed_id);

CREATE INDEX idx_favorites_provider_id
    ON public.favorites(provider_id);