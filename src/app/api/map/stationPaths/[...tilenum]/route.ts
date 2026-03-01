import { SearchParams } from '@/app/map/lib/util';
import { NextResponse } from 'next/server';
import { Client } from 'pg';

export async function GET(req: Request, ctx: RouteContext<'/api/map/stationPaths/[...tilenum]'>) {
  const tilenumstrs = (await ctx.params).tilenum;
  const tilenums: number[] = [];
  tilenumstrs.forEach((v, i) => {
    const num = Number(v);
    if (isNaN(num) || num < 0 || i > 3) {
      return new Response('Bad Request', { status: 400 });
    }
    tilenums.push(num);
  });
  if (tilenums.length !== 3) {
    return new Response('Bad Request', { status: 400 });
  };
  const [z, x, y] = tilenums as [number, number, number];

  const searchparams = new SearchParams(req.url);
  const stationIds = searchparams.getNumArrParam('station_ids');
  const stationPathIds = searchparams.getNumArrParam('station_path_ids');

  const prepared: (number)[] 
    = stationIds.length !== 0
      ? [z, x, y, stationIds.length, ...stationIds]
    : stationPathIds.length !== 0
      ? [z, x, y, stationPathIds.length, ...stationPathIds]
      : [z,x,y];

  const client = new Client(process.env.DATABASE_URL);
  await client.connect();

  const res = await client.query(`
with bbox as (select st_transform(ST_TileEnvelope($1, $2, $3), 3857) as b, '平' as daytype),
q as (
  SELECT
    ST_AsMVTGeom(st_transform(path_geom, 3857), bbox.b) as geom,
    station_path_id,
    daytype
  FROM busmap.mapstationpaths, bbox
  WHERE path_geom && st_transform(bbox.b, 4326)
),
r as (
  select 
    geom as geom,
    q.station_path_id,
    count,
    ${
      stationIds.length !== 0 ||
      stationPathIds.length !== 0
        ? `'base'`
        : `'selected'`
    } as st
  from q
  inner join busmap.mapstationpathcount using(station_path_id, daytype)
),
${stationIds.length !== 0 ? `
s as (
  select 
    geom as geom,
    station_path_id,
    sum(count) as count,
    'selected' as st
  from q
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
s as (
  select 
    geom as geom,
    station_path_id,
    sum(count) as count,
    'selected' as st
  from q
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
t as (
  select * from r${stationIds.length !== 0 || stationPathIds.length !== 0 ? ' union all select * from s' : ''}
)
SELECT
  ST_AsMVT(t.*, 'stationPathsLayer', 4096, 'geom') as tile
FROM t;
  `, prepared);

  // where mappatterns.pattern_id in (
  //   select pattern_id
  //   from (
  //     select
  //       mappatterns.pattern_id,
  //       count(pattern_id)
  //     from busmap.mappatterns
  //     where station_path_id in (${stationPathIds.map((v,i) => `$${i + 5}`)})
  //     group by pattern_id
  //   )
  //   where count = $4
  // )

  await client.end();

  const tile = res.rows[0].tile;
  // console.log(res.rows.length);
  // console.log(`tile size: ${tile.length} bytes`);

  return new NextResponse(tile, {
    headers: {
      'Content-Type': 'application/vnd.mapbox-vector-tile',
      'Access-Control-Allow-Origin': `${process.env.NEXT_PUBLIC_BASE_URL || ''}`,
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
};