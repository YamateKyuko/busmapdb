delete from busmap.maproutes;
insert into busmap.maproutes(
  feed_id,
  route_id,
  route_name,
  patterns,
  geom
)
with merged as (
  select 
    least(st_startpoint(geom), st_endpoint(geom)),
    greatest(st_startpoint(geom), st_endpoint(geom)),
    array_agg(pattern_id) as patterns,
    feed_id,
    route_id,
    route_name
  from map.results
  inner join routes using(feed_id, route_id)
  group by feed_id, route_id, least, greatest, route_name
)
select 
  feed_id,
  route_id,
  route_name,
  patterns,
  st_makeline(least, greatest) as geom
  -- null as thickness
from merged;

-- delete from busmap.mapstations;
with a as (
  select
    geom,
    pattern_id,
    stop_sequence,
    feed_id,
    route_id,
    stop_patterns.stop_name,
    station_id

  from map.pts
  inner join stop_patterns using (pattern_id, stop_sequence)
  inner join stops using (feed_id, stop_id)
)
select 
  st_buffer(st_convexhull(st_collect(geom)), 0.000125),
  array_agg(pattern_id) as patterns,
  station_id,
  stop_name



from a
group by feed_id, route_id, station_id, stop_name;


-- insert into busmap.maproutes (

-- )
-- select
--   st_union(geom),
--   feed_id,
--   route_id

-- from merged
-- group by feed_id, route_id;

-- select

-- station_id,
--   station_name,
-- st_point(station_lon,station_lat,4326) as station_geom,
-- st_convexhull
-- as station_poly

-- from stations
-- inner join parent_stations using(station_



-- select 






-- group by route_id, node_id