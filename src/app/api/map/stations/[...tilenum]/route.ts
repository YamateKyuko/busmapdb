import { SearchParams } from '@/app/util';
import { NextResponse } from 'next/server';
import { Client } from 'pg';

export async function GET(req: Request, ctx: RouteContext<'/api/map/stations/[...tilenum]'>) {
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
  const station_ids = new SearchParams(req.url).getNumArrParam('station_ids')

  const prepared: (number)[] = 
  station_ids.length !== 0
    ? [z, x, y, station_ids.length, ...station_ids]
    : [z,x,y];

  const client = new Client(process.env.DATABASE_URL);
  await client.connect();

  const res = await client.query(`

with bbox as (select st_transform(ST_TileEnvelope($1, $2, $3), 3857) as b, st_transform(ST_TileEnvelope($1, $2, $3), 4326) as bb, '平' as daytype),
q as (
  SELECT
    ST_AsMVTGeom(st_transform(station_geom, 3857), bbox.b) as geom,
    station_id,
    station_name,
    daytype
  FROM busmap.mapstations, bbox
  WHERE station_geom && bbox.bb
),
r as (
  select
    station_id,
    station_name,
    geom,
    count,
    ${station_ids.length !== 0 ? `'base'` : `'selected'`} as st
  from q
  inner join busmap.mapstationcount using(station_id, daytype)
),
${station_ids.length !== 0 ? `
s as (
  select
    station_id,
    station_name,
    geom,
    sum(count),
    case when station_id in (${station_ids.map((v,i) => `$${i + 5}`)}) then 'highlighted' else 'selected' end as st
  from q
  inner join busmap.mappatterns using(station_id)
  inner join busmap.mappatterncount using(pattern_id, daytype)
  where mappatterns.pattern_id in (
    select pattern_id
    from (
      select
        mappatterns.pattern_id,
        count(pattern_id)
      from busmap.mappatterns
      where station_id in (${station_ids.map((v,i) => `$${i + 5}`)})
      group by pattern_id
    )
    where count = $4
  )
  group by station_id, station_name, geom
),
` : ''}
t as (
  select * from r
  ${station_ids.length !== 0 ? `union all select * from s` : ''}
)
SELECT
  ST_AsMVT(t.*, 'stationLayer', 4096, 'geom') as st_asmvt
FROM t;
  `, prepared);

  await client.end();

  const tile = res.rows[0].st_asmvt;
  // console.log(`station tile size: ${tile.length} bytes`);

  return new NextResponse(tile, {
    headers: {
      'Content-Type': 'application/vnd.mapbox-vector-tile',
      'Access-Control-Allow-Origin': `${process.env.NEXT_PUBLIC_BASE_URL || ''}`,
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
};

// with bbox as (select st_transform(ST_TileEnvelope($1, $2, $3), 3857) as b)
//     SELECT
//       ST_AsMVT(p, 'stationLayer') as st_asmvt
//     FROM (
//       SELECT
//         ST_AsMVTGeom(st_transform(geom, 3857), bbox.b),
//         'station' as type,
//         json_object(
//           'type': 'station',
//           'station_id': station_id,
//           'station_name': station_name
//         ) as properties
//         -- station_id,
//         -- station_name
//       FROM busmap.mapstations, bbox
//       WHERE geom && st_transform(bbox.b, 4326)
//       union all
//       SELECT
//         ST_AsMVTGeom(st_transform(geom, 3857), bbox.b),
//         'stop' as type,
//         json_object(
//           'type': 'stop',
//           'pattern_id': pattern_id,
//           'route_id': route_id,
//           'feed_id': feed_id,
//           -- 'station_id': station_id,
//           'stop_id': stop_id,
//           'route_name': route_name
//         ) as properties

//       FROM busmap.mapstops, bbox
//       WHERE geom && st_transform(bbox.b, 4326)
//     ) p;