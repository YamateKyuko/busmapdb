delete from busmap.maproutes;
insert into busmap.maproutes(
  feed_id,
  route_id,
  route_name,
  geom,
  station_id,
  next_station_id,
  patterns
)
with ptns as (
  select * from stop_patterns inner join stops using(feed_id, stop_id)
),
merged as (
  select 
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
),
m as (
  select 
    st_makeline(
      least(st_startpoint(geom), st_endpoint(geom)),
      greatest(st_startpoint(geom), st_endpoint(geom))
    ) as geom,
    least(station_id, next_station_id) as station_id,
    greatest(station_id, next_station_id) as next_station_id,
    feed_id,
    route_id,
    route_name,
    pattern_id
  from merged
),
med as (
  select 
    feed_id,
    route_id,
    route_name,
    array_agg(pattern_id) as patterns,
    st_collect(geom) as geom,
    station_id,
    next_station_id
  from m
  group by feed_id, route_id, route_name, station_id, next_station_id
),
jd as (
  select 
    feed_id,
    route_id,
    route_name,
    (st_dump(geom)).geom as geom,
    m.station_id,
    next_station_id,
    st_point(p.station_lon, p.station_lat, 4326) as station_geom,
    st_point(np.station_lon, np.station_lat, 4326) as next_station_geom,
    patterns
  from med as m
  inner join parent_stations as p on p.station_id = m.station_id
  inner join parent_stations as np on np.station_id = m.next_station_id
),
distb as (
  select
    *,
    case when st_distance(st_startpoint(geom), station_geom) >= st_distance(st_startpoint(geom), next_station_geom) then false else true end as b
  from jd
)
select 
  feed_id,
  route_id,
  route_name,
  st_linesubstring(geom, 0, 0.5),
  case b when true then station_id else next_station_id end as station_id,
  case b when true then next_station_id else station_id end as next_station_id,
  patterns
from distb
union all
select 
  feed_id,
  route_id,
  route_name,
  st_linesubstring(geom, 0.5, 1),
  case b when true then next_station_id else station_id end as station_id,
  case b when true then station_id else next_station_id end as next_station_id,
  patterns
from distb;

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