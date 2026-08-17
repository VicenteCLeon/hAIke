-- ============================================================
--  hAIke · PostGIS schema para senderos
-- ============================================================
-- Requiere: PostgreSQL 14+ con extensiones PostGIS y uuid-ossp
-- Ejecutar una sola vez en la base de datos del proyecto
-- ============================================================

CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------
--  Tabla principal de senderos
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS trails (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Identificador original de OpenStreetMap
    osm_id          BIGINT UNIQUE NOT NULL,
    osm_type        VARCHAR(10) NOT NULL CHECK (osm_type IN ('way', 'relation')),

    -- Metadatos del sendero
    name            TEXT,
    name_es         TEXT,                          -- nombre en español si existe
    operator        TEXT,                          -- ej: CONAF, municipio
    network         VARCHAR(20),                   -- rwn, nwn, lwn, rwn
    route           VARCHAR(20),                   -- hiking, foot, mtb
    difficulty      VARCHAR(20),                   -- easy, moderate, hard (SAC/STAS scale)
    surface         VARCHAR(50),                   -- ground, rock, paved, gravel
    trail_visibility VARCHAR(20),                  -- excellent, good, intermediate, bad

    -- Geometría: LINESTRING en WGS84 (SRID 4326)
    -- Indice espacial creado más abajo
    geom            GEOMETRY(LineStringZ, 4326),   -- Z = incluye elevación

    -- Métricas calculadas (se llenan en Python tras insertar)
    length_m        FLOAT,                         -- longitud en metros
    elevation_gain  FLOAT,                         -- desnivel positivo acumulado (metros)
    elevation_loss  FLOAT,                         -- desnivel negativo acumulado (metros)
    min_elevation   FLOAT,
    max_elevation   FLOAT,
    bbox            GEOMETRY(Polygon, 4326),        -- bounding box del sendero

    -- Tags adicionales de OSM (JSON libre para no perder datos)
    tags            JSONB DEFAULT '{}',

    -- Auditoría
    imported_at     TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------
--  Índices
-- ------------------------------------------------------------
-- Índice espacial (GIST) — fundamental para consultas geo
CREATE INDEX IF NOT EXISTS trails_geom_idx
    ON trails USING GIST (geom);

-- Índice sobre el bbox para consultas de proximidad rápidas
CREATE INDEX IF NOT EXISTS trails_bbox_idx
    ON trails USING GIST (bbox);

-- Índice para filtrar por dificultad y red
CREATE INDEX IF NOT EXISTS trails_difficulty_idx
    ON trails (difficulty);

CREATE INDEX IF NOT EXISTS trails_network_idx
    ON trails (network);

-- Índice GIN sobre tags JSONB para búsquedas por atributo
CREATE INDEX IF NOT EXISTS trails_tags_gin_idx
    ON trails USING GIN (tags);

-- ------------------------------------------------------------
--  Función de actualización de updated_at
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trails_updated_at
    BEFORE UPDATE ON trails
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ------------------------------------------------------------
--  Vista útil: senderos con datos calculados como GeoJSON
-- ------------------------------------------------------------
CREATE OR REPLACE VIEW trails_geojson AS
SELECT
    id,
    osm_id,
    name,
    difficulty,
    length_m,
    elevation_gain,
    ROUND(length_m::NUMERIC / 1000, 2)   AS length_km,
    ST_AsGeoJSON(geom)::JSONB            AS geometry,
    ST_AsGeoJSON(bbox)::JSONB            AS bounding_box
FROM trails
WHERE geom IS NOT NULL;
