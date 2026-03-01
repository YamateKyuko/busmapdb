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




-- with bbox as (select st_transform(ST_TileEnvelope(5,28,12), 3857) as b, '平' as daytype),
-- q as (
--   SELECT
--     ST_AsMVTGeom(st_transform(path_geom, 3857), bbox.b) as geom,
--     station_path_id,
--     daytype
--   FROM busmap.mapstationpaths, bbox
--   WHERE path_geom && st_transform(bbox.b, 4326)
-- ),
-- r as (
--   select 
    
--     geom as geom,
--     q.station_path_id,
--     count,
--     'base' as st
--   from q
--   inner join busmap.mapstationpathcount using(station_path_id, daytype)
-- ),

-- s as (
--   select 
--     geom as geom,
--     station_path_id,
--     sum(count) as count,
--     'selected' as st
--   from q
--   inner join busmap.mappatterns using(station_path_id)
--   inner join busmap.mappatterncount using(pattern_id, daytype)
--   where mappatterns.pattern_id in (
--     select pattern_id
--     from (
--       select
--         mappatterns.pattern_id,
--         count(pattern_id)
--       from busmap.mappatterns
--       where station_path_id in (661)
--       group by pattern_id
--     )
--     where count = 1
--   )
--   group by station_path_id, geom
-- ),
-- t as (
--   select * from r union all select * from s
-- )
-- SELECT
--   *
--   -- ST_AsMVT(t.*, 'stationPathsLayer', 4096, 'geom') as tile
-- FROM t
-- where st = 'selected';


  -- where mappatterns.pattern_id in (
--     select pattern_id
--     from (
--       select
--         mappatterns.pattern_id,
--         count(pattern_id)
--       from busmap.mappatterns
--       where station_path_id in (1991)
--       group by pattern_id
--     )
--     where count = 1;


-- select * from stop_patterns where pattern_id = 33
  -- )

  with a as (select '平' as daytype, 1991 as station_path_id)
    select 
    -- geom as geom,
    station_path_id,
    sum(count) as count,
    'selected' as st
  from a
  inner join busmap.mappatterns using(station_path_id)
  inner join busmap.mappatterncount using(pattern_id, daytype)
  where mappatterns.pattern_id in (33)
  group by station_path_id