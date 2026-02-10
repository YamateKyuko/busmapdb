-- SELECT 
--     schemaname,
--     pg_size_pretty(sum(pg_total_relation_size(schemaname || '.' || tablename))::bigint) AS size
-- FROM 
--     pg_tables
-- WHERE 
--     schemaname = 'busmap' -- 調べたいスキーマ名
-- GROUP BY 
--     schemaname;

-- select least(('', ''), ('', ''));

-- select 
  
-- from (


-- with bbox as (select st_transform(ST_TileEnvelope($1, $2, $3), 3857) as b),
-- q as (
--   SELECT
--     ST_AsMVTGeom(st_transform(path_geom, 3857), bbox.b) as geom,
--     station_path_id,
--     path_geom,
--     sum(count) as count
--   FROM busmap.mapstationpaths, bbox
--   inner join busmap.mappatterns using(station_path_id)
--   inner join busmap.mappatterncount using(pattern_id)
--   WHERE path_geom && st_transform(bbox.b, 4326)
-- )



-- select
--   station_path_id,
--   path_geom,
--   sum(count)
-- from busmap.mapstationpaths
-- inner join busmap.mappatterns using(station_path_id)
-- inner join busmap.mappatterncount using(pattern_id)
-- group by station_path_id, path_geom;
-- )


with bbox as (select st_transform(ST_TileEnvelope(1,1,1), 3857) as b, '平' as daytype),
    -- with bbox as (select st_transform(ST_TileEnvelope($1, $2, $3), 3857) as b),
    q as (
      SELECT
        ST_AsMVTGeom(st_transform(station_geom, 3857), bbox.b) as geom,
        station_id,
        station_name,
        count
      FROM busmap.mapstations
      join bbox on true
      inner join busmap.mapstationcount using (station_id, daytype)
      WHERE busmap.mapstations.station_geom && st_transform(bbox.b, 4326)
    )
    SELECT
      ST_AsMVT(q, 'stationLayer', 4096, 'geom', null) as st_asmvt
    FROM q;