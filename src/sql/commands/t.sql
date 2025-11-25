
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
  
)
select 
  feed_id,
  route_id,
  route_name,
  array_agg(pattern_id),
  st_linemerge(st_collect(geom)) as geom,
  station_id,
  next_station_id
  -- null as thickness
from m
group by feed_id,route_id, route_name, station_id, next_station_id;