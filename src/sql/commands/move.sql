delete from busmap.maproutes;
insert into busmap.maproutes(
  feed_id,
  route_id,
  route_name,
  patterns,
  geom,
  station_id,
  next_station_id
)
with ptns as (
  select * from stop_patterns inner join stops using(feed_id, stop_id)
),
merged as (
  select 
    -- least(st_startpoint(geom), st_endpoint(geom)),
    -- greatest(st_startpoint(geom), st_endpoint(geom)),
    -- array_agg(pattern_id) as patterns,
    results.feed_id,
    results.route_id,
    routes.route_name,
    results.pattern_id,
    p1.station_id,
    p2.station_id as next_station_id,
    geom
  from map.results
  inner join routes using(feed_id, route_id)
  inner join ptns as p1 using(pattern_id, stop_sequence)
  inner join ptns as p2 on (
    p2.pattern_id = results.pattern_id and p2.stop_sequence = results.stop_sequence + 1
  )
  -- inner join stops as s1 using(feed_id, stop_id)
  -- inner join stops as s2
  -- group by feed_id, route_id, least, greatest, route_name
),
m as (
  select 
    least(st_startpoint(geom), st_endpoint(geom)),
    greatest(st_startpoint(geom), st_endpoint(geom)) ,
    least(station_id, next_station_id) as station_id,
    greatest(station_id, next_station_id) as next_station_id,
    feed_id,
    route_id,
    route_name,
    pattern_id
  from merged
  
)
select 
  feed_id,
  route_id,
  route_name,
  array_agg(pattern_id),
  st_makeline(least, greatest) as geom,
  station_id,
  next_station_id
  -- null as thickness
from m
group by feed_id,route_id, route_name, least, greatest, station_id, next_station_id;

delete from busmap.mapstations;
insert into busmap.mapstations (
  geom,
  patterns,
  station_id,
  station_name
)
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
  st_buffer(st_convexhull(st_collect(geom)), 0.000125) as geom,
  array_agg(pattern_id) as patterns,
  station_id,
  stop_name
from a
group by feed_id, station_id, stop_name;

delete from busmap.mapstops;
insert into busmap.mapstops (
  pattern_id,
  feed_id,
  route_id,
  route_name,
  stop_name,
  stop_id,
  geom
)
select 
  pattern_id,
  feed_id,
  route_id,
  route_name,
  stops.stop_name,
  stop_id,
  geom
from map.pts
inner join stop_patterns using (pattern_id, stop_sequence)
inner join stops using (feed_id, stop_id);


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