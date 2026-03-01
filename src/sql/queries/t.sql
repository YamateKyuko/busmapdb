drop schema if exists busmap cascade;
create schema if not exists busmap;
-- drop extension if exists postgis;
create extension if not exists postgis;

-- select 
--   s1.stop_name,
--   s1.station_id,
--   s2.stop_name,
--   s2.station_id,
--   route_names
--   -- row_number() over()
-- from stop_patterns as p
-- inner join stops as s1 using(feed_id, stop_id)
-- inner join stops as s2 on (p.feed_id = s2.feed_id and p.next_stop_id = s2.stop_id);

-- select 
--   station_id,
--   station_name,
--   busmap.st_point(station_lon, station_lat, 4326)
-- from parent_stations
-- limit 1;

-- from stops;

-- 

drop table if exists busmap.mapstations;
create table busmap.mapstations (
  station_id integer not null,
  station_name text not null,
  station_geom geometry(point, 4326) not null
);

insert into busmap.mapstations (station_id, station_name, station_geom)
select 
  station_id,
  station_name,
  st_point(station_lon, station_lat, 4326)
from parent_stations;

-- 

drop table if exists busmap.mapstops;
create table busmap.mapstops (
  feed_id integer not null,
  stop_id text not null,
  stop_name text not null,
  stop_geom geometry(point, 4326) not null
);

insert into busmap.mapstops (feed_id, stop_id, stop_name, stop_geom)
select
  feed_id,
  stop_id,
  stop_name,
  st_point(stop_lon, stop_lat, 4326)
from stops;

-- 

drop table if exists busmap.mapstationpaths;
create table busmap.mapstationpaths (
  station_path_id integer not null,
  sta1 integer not null,
  sta2 integer not null,
  path_geom geometry(linestring, 4326)
);

insert into busmap.mapstationpaths (station_path_id, sta1, sta2, path_geom)
with a as (
  select
    row_number() over(order by sta1, sta2) as id,
    sta1,
    sta2
  from (
    select 
      least(s1.station_id, s2.station_id) as sta1,
      greatest(s1.station_id, s2.station_id) as sta2
    from stop_patterns as p
    inner join stops as s1 using(feed_id, stop_id)
    inner join stops as s2 on (p.feed_id = s2.feed_id and p.next_stop_id = s2.stop_id)
    group by s1.station_id, s2.station_id
  )
  group by sta1, sta2
)
select 
  id,
  sta1,
  sta2,
  st_makeline(
    st_point(st1.station_lon, st1.station_lat, 4326),
    st_point(st2.station_lon, st2.station_lat, 4326)
  )
from a
inner join parent_stations as st1 on (a.sta1 = st1.station_id)
inner join parent_stations as st2 on (a.sta2 = st2.station_id);

-- 

drop table if exists busmap.mapstoppaths;
create table busmap.mapstoppaths (
  stop_path_id integer not null,
  feed_id integer not null,
  stp1 text not null,
  stp2 text not null,
  path_geom geometry(linestring, 4326)
);

insert into busmap.mapstoppaths (stop_path_id, feed_id, stp1, stp2, path_geom)
with a as (
  select
    row_number() over(order by feed_id, stp1, stp2) as id,
    feed_id,
    stp1,
    stp2
  from (
    select 
      feed_id,
      least(stop_id, next_stop_id) as stp1,
      greatest(stop_id, next_stop_id) as stp2
    from stop_patterns
    group by feed_id, stop_id, next_stop_id
  )
  group by feed_id, stp1, stp2
)
select 
  id,
  a.feed_id,
  stp1,
  stp2,
  st_makeline(
    st_point(s1.stop_lon, s1.stop_lat, 4326),
    st_point(s2.stop_lon, s2.stop_lat, 4326)
  )
from a
inner join stops as s1 on (s1.feed_id = a.feed_id and s1.stop_id = stp1)
inner join stops as s2 on (s2.feed_id = a.feed_id and s2.stop_id = stp2);

-- 

drop table if exists busmap.mappatterns;
create table busmap.mappatterns (
  feed_id integer not null,
  route_id text not null,
  route_name text,
  pattern_id integer not null,
  sequence integer not null,
  station_id integer not null,
  stop_id text not null,
  station_path_id integer,
  station_path_direction integer,
  stop_path_id integer,
  stop_path_direction integer
);

insert into busmap.mappatterns (feed_id, route_id, route_name, pattern_id, sequence, station_id, stop_id, station_path_id, station_path_direction, stop_path_id, stop_path_direction)
with a as (
  select 
    p.feed_id,
    p.route_id,
    pattern_id,
    route_name,
    stop_sequence as sequence,
    s1.station_id,
    s1.stop_id,
    s2.station_id as next_station_id,
    s2.stop_id as next_stop_id
  from stop_patterns as p
  left join stops as s1 on (p.feed_id = s1.feed_id and p.stop_id = s1.stop_id)
  left join stops as s2 on (p.feed_id = s2.feed_id and p.next_stop_id = s2.stop_id)
)
select 
  a.feed_id,
  a.route_id,
  a.route_name,
  a.pattern_id,
  a.sequence,
  a.station_id,
  a.stop_id,
  case when a.next_station_id is null then null when sta0.station_path_id is not null then sta0.station_path_id else sta1.station_path_id end as station_path_id,
  case when a.next_station_id is null then null when sta0.station_path_id is not null then 0 else 1 end as station_path_direction,
  case when a.next_stop_id is null then null when stp0.stop_path_id is not null then stp0.stop_path_id else stp1.stop_path_id end as stop_path_id,
  case when a.next_stop_id is null then null when stp0.stop_path_id is not null then 0 else 1 end as stop_path_direction
from a
left join busmap.mapstationpaths as sta0 on (a.station_id = sta0.sta1 and a.next_station_id = sta0.sta2)
left join busmap.mapstationpaths as sta1 on (a.station_id = sta1.sta2 and a.next_station_id = sta1.sta1)
left join busmap.mapstoppaths as stp0 on (a.feed_id = stp0.feed_id and a.stop_id = stp0.stp1 and a.next_stop_id = stp0.stp2)
left join busmap.mapstoppaths as stp1 on (a.feed_id = stp1.feed_id and a.stop_id = stp1.stp2 and a.next_stop_id = stp1.stp1)
order by pattern_id, sequence;

-- 

drop table if exists busmap.mappatterncount;
create table busmap.mappatterncount (
  pattern_id integer not null,
  daytype text not null,
  count integer
);

insert into busmap.mappatterncount (pattern_id, daytype, count)
select 
  pattern_id,
  daytype,
  cnt
from daytype_cnt;

-- 

drop table if exists busmap.mapstationcount;
create table busmap.mapstationcount (
  station_id integer not null,
  daytype text not null,
  count integer
);

insert into busmap.mapstationcount (station_id, daytype, count)
with a as (
  select 
    sta1,
    sta2,
    pattern_id
  from busmap.mappatterns
  inner join busmap.mapstationpaths using(station_path_id)
),
b as (
  select sta1 as station_id, pattern_id from a
  union
  select sta2 as station_id, pattern_id from a
)
select 
  station_id,
  daytype,
  sum(count)
from b
inner join busmap.mappatterncount using(pattern_id)
group by station_id, daytype;

-- 

drop table if exists busmap.mapstopcount;
create table busmap.mapstopcount (
  feed_id integer not null,
  stop_id text not null,
  daytype text not null,
  count integer
);

insert into busmap.mapstopcount (feed_id, stop_id, daytype, count)
with a as (
  select
    mappatterns.feed_id,
    stp1,
    stp2,
    pattern_id
  from busmap.mappatterns
  inner join busmap.mapstoppaths using(stop_path_id)
),
b as (
  select feed_id, stp1 as stop_id, pattern_id from a
  union
  select feed_id, stp2 as stop_id, pattern_id from a
)
select 
  feed_id,
  stop_id,
  daytype,
  sum(count)
from b
inner join busmap.mappatterncount using(pattern_id)
group by feed_id, stop_id, daytype;

-- 

drop table if exists busmap.mapstationpathcount;
create table busmap.mapstationpathcount (
  station_path_id integer not null,
  daytype text not null,
  count integer
);

insert into busmap.mapstationpathcount (station_path_id, daytype, count)
select 
  station_path_id,
  daytype,
  sum(count)
from busmap.mappatterns
inner join busmap.mapstationpaths using(station_path_id)
inner join busmap.mappatterncount using(pattern_id)
group by station_path_id, daytype;

-- 

drop table if exists busmap.mapstoppathcount;
create table busmap.mapstoppathcount (
  stop_path_id integer not null,
  daytype text not null,
  count integer
);

insert into busmap.mapstoppathcount (stop_path_id, daytype, count)
select 
  stop_path_id,
  daytype,
  sum(count)
from busmap.mappatterns
inner join busmap.mapstoppaths using(stop_path_id)
inner join busmap.mappatterncount using(pattern_id)
group by stop_path_id, daytype;

-- 

-- select
--   sta1,
--   daytype,
--   sum(count)
-- from busmap.mappatterns
-- inner join busmap.mappatterncount using(pattern_id)
-- inner join busmap.mapstationpaths using(station_path_id)
-- group by sta1, daytype
-- union
-- select
--   sta2,
--   daytype,
--   sum(count)
-- from busmap.mappatterns
-- inner join busmap.mappatterncount using(pattern_id)
-- inner join busmap.mapstationpaths using(station_path_id)
-- group by sta2, daytype;


-- group by s1.station_id, s2.station_id

-- select * from daytype_cnt;

-- SELECT relname, reltuples, (relpages / 128) as mbytes, (relpages * 8192.0 / (reltuples + 1e-10)) as average_row_size
-- FROM pg_class
-- where relname = 'stops'
-- ORDER BY mbytes DESC;
