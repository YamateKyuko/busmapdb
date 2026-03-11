import { getErrRes, getZXY, SearchParams } from '@/app/util';
import { NextResponse } from 'next/server';
import { Client } from 'pg';

export async function GET(req: Request, ctx: RouteContext<'/api/map/tiles/[z]/[x]/[y]'>) {

  const zxy = await getZXY(ctx.params);
  if (zxy === null) return getErrRes("ZXY is wrong.", 400);
  const [z, x, y] = zxy;

  const searchparams = new SearchParams(req.url);
  const stationIds = searchparams.getNumArrParam('station_ids');
  const stationPathIds = searchparams.getNumArrParam('station_path_ids');

  const prepared: (number)[] 
    = stationIds.length !== 0
      ? [z, x, y, stationIds.length, ...stationIds]
    : stationPathIds.length !== 0
      ? [z, x, y, stationPathIds.length, ...stationPathIds]
      : [z,x,y];

  try {
    const client = new Client(process.env.DATABASE_URL);
    await client.connect();

    const res = await client.query(`
with bbox as (select st_transform(ST_TileEnvelope($1, $2, $3), 3857) as b, st_transform(ST_TileEnvelope($1, $2, $3), 4326) as bb, '平' as daytype),
stationPathsMVTgeom as (
  SELECT
    ST_AsMVTGeom(st_transform(path_geom, 3857), bbox.b) as geom,
    station_path_id,
    daytype
  FROM busmap.mapstationpaths, bbox
  WHERE path_geom && bbox.bb
),
stationPathsBaseGeom as (
  select 
    geom as geom,
    stationPathsMVTgeom.station_path_id,
    count,
    cnt0,
    cnt1,
    ${
      stationIds.length !== 0 ||
      stationPathIds.length !== 0
        ? `'base'`
        : `'selected'`
    } as st
  from stationPathsMVTgeom
  inner join busmap.mapstationpathcount using(station_path_id, daytype)
),
${stationIds.length !== 0 ? `
stationPathsFilteredGeom as (
  select 
    geom as geom,
    station_path_id,
    sum(count) as count,
    coalesce(sum(count) filter(where station_path_direction = 0), 0) as cnt0,
    coalesce(sum(count) filter(where station_path_direction = 1), 0) as cnt1,
    'selected' as st
  from stationPathsMVTgeom
  inner join busmap.mappatterns using(station_path_id)
  inner join busmap.mappatterncount using(pattern_id, daytype)
  where mappatterns.pattern_id in (
    select pattern_id
    from (
      select
        mappatterns.pattern_id,
        count(pattern_id)
      from busmap.mappatterns
      where station_id in (${stationIds.map((v,i) => `$${i + 5}`)})
      group by pattern_id
    )
    where count = $4
  )
  group by station_path_id, geom
),
` : ''}
${stationPathIds.length !== 0 ? `
stationPathsFilteredGeom as (
  select 
    geom as geom,
    station_path_id,
    sum(count) as count,
    coalesce(sum(count) filter(where station_path_direction = 0), 0) as cnt0,
    coalesce(sum(count) filter(where station_path_direction = 1), 0) as cnt1,
    case when station_path_id in (${stationPathIds.map((v,i) => `$${i + 5}`)})
      then 'highlighted'
      else 'selected'
    end as st
  from stationPathsMVTgeom
  inner join busmap.mappatterns using(station_path_id)
  inner join busmap.mappatterncount using(pattern_id, daytype)
  where mappatterns.pattern_id in (
    select pattern_id
    from (
      select
        mappatterns.pattern_id,
        count(pattern_id)
      from busmap.mappatterns
      where station_path_id in (${stationPathIds.map((v,i) => `$${i + 5}`)})
      group by pattern_id
    )
    where count = $4
  )
  group by station_path_id, geom
),
` : ''}
stationPathsLayer as (
  select * from stationPathsBaseGeom${stationIds.length !== 0 || stationPathIds.length !== 0 ? ' union all select * from stationPathsFilteredGeom' : ''}
)
SELECT
  ST_AsMVT(stationPathsLayer, 'stationPathsLayer', 4096, 'geom') as tile
FROM stationPathsLayer;
    `, prepared);
    await client.end();
    const tile = res.rows[0].tile;

    if (!tile) return getErrRes("MVT error.", 500);

    return new NextResponse(tile, {
      headers: {
        'Content-Type': 'application/vnd.mapbox-vector-tile',
        'Access-Control-Allow-Origin': `${process.env.NEXT_PUBLIC_BASE_URL || ''}`,
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  } catch(e) {
    return getErrRes("Query execution Error.", 500);
  }


// t as (
//   select * from r${stationIds.length !== 0 || stationPathIds.length !== 0 ? ' union all select * from s' : ''}
// )
// SELECT
//   ST_AsMVT(t.*, 'stationPathsLayer', 4096, 'geom') as tile
// FROM t;

// u as (
//   select
//     geom,
//     jsonb_build_object(
//       'station_path_id', station_path_id,
//       'count', count,
//       'cnt0', cnt0,
//       'cnt1', cnt1,
//       'st', st
//     ) as properties
//   from t
// )
// SELECT
//   ST_AsMVT(u, 'stationPathsLayer', 4096, 'geom') as tile
// FROM u;




};