drop index if exists idx_mapstations cascade;
drop index if exists idx_mapstations_geom cascade;
drop index if exists idx_mapstationpaths cascade;
drop index if exists idx_mapstationpaths_geom cascade;
drop index if exists idx_mappatterns cascade;
drop index if exists idx_mappatterncount cascade;
drop index if exists idx_mapstationcount cascade;
drop index if exists idx_mapstationpathcount cascade;


-- 

-- drop table if exists busmap.mapstations;
-- create table busmap.mapstations (
--   station_id integer not null,
--   station_name text not null,
--   station_geom geometry(point, 4326) not null
-- );

create index idx_mapstations on busmap.mapstations (station_id);
create index idx_mapstations_geom on busmap.mapstations using GIST (station_geom);

-- 

-- drop table if exists busmap.mapstops;
-- create table busmap.mapstops (
--   feed_id integer not null,
--   stop_id text not null,
--   stop_name text not null,
--   stop_geom geometry(point, 4326) not null
-- );


-- 

-- drop table if exists busmap.mapstationpaths;
-- create table busmap.mapstationpaths (
--   station_path_id integer not null,
--   sta1 integer not null,
--   sta2 integer not null,
--   path_geom geometry(linestring, 4326)
-- );

create index idx_mapstationpaths on busmap.mapstationpaths (station_path_id);
create index idx_mapstationpaths_geom on busmap.mapstationpaths using GIST (path_geom);

-- 

-- drop table if exists busmap.mapstoppaths;
-- create table busmap.mapstoppaths (
--   stop_path_id integer not null,
--   feed_id integer not null,
--   stp1 text not null,
--   stp2 text not null,
--   path_geom geometry(linestring, 4326)
-- );

-- 

-- drop table if exists busmap.mappatterns;
-- create table busmap.mappatterns (
--   feed_id integer not null,
--   route_id text not null,
--   route_name text,
--   pattern_id integer not null,
--   sequence integer not null,
--   station_id integer not null,
--   stop_id text not null,
--   station_path_id integer,
--   station_path_direction integer,
--   stop_path_id integer,
--   stop_path_direction integer
-- );

create index idx_mappatterns on busmap.mappatterns (pattern_id);

-- 

-- drop table if exists busmap.mappatterncount;
-- create table busmap.mappatterncount (
--   pattern_id integer not null,
--   daytype text not null,
--   count integer
-- );

create index idx_mappatterncount on busmap.mappatterncount (pattern_id, daytype);

-- 

-- drop table if exists busmap.mapstationcount;
-- create table busmap.mapstationcount (
--   station_id integer not null,
--   daytype text not null,
--   count integer
-- );

create index idx_mapstationcount on busmap.mapstationcount (station_id, daytype);

-- 

-- drop table if exists busmap.mapstopcount;
-- create table busmap.mapstopcount (
--   feed_id integer not null,
--   stop_id text not null,
--   daytype text not null,
--   count integer
-- );

-- 

-- drop table if exists busmap.mapstationpathcount;
-- create table busmap.mapstationpathcount (
--   station_path_id integer not null,
--   daytype text not null,
--   cnt0 integer not null,
--   cnt1 integer not null,
--   count integer not null
-- );

create index idx_mapstationpathcount on busmap.mapstationpathcount (station_path_id, daytype);

-- 

-- drop table if exists busmap.mapstoppathcount;
-- create table busmap.mapstoppathcount (
--   stop_path_id integer not null,
--   daytype text not null,
--   cnt0 integer not null,
--   cnt1 integer not null,
--   count integer
-- );