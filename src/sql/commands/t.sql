

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
from merged
inner join 
;