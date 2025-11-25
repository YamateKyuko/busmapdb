import { NextResponse } from 'next/server';
import { Client } from 'pg';

export const dynamic = 'force-static'

export async function GET(_req: Request, ctx: RouteContext<'/api/map/stations/[...tilenum]'>) {
  const tilenumstrs = (await ctx.params).tilenum;
  const tilenums: number[] = [];
  tilenumstrs.map((v, i) => {
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

  const client = new Client(process.env.DATABASE_URL_LOCAL)
  await client.connect();

  const res = await client.query(`
    with bbox as (select st_transform(ST_TileEnvelope($1, $2, $3), 3857) as b),
    q as (
      SELECT
        ST_AsMVTGeom(st_transform(geom, 3857), bbox.b),
        'station' as type,
        station_id,
        station_name
      FROM busmap.mapstations, bbox
      WHERE geom && st_transform(bbox.b, 4326)
    )
    SELECT
      ST_AsMVT(q, 'stationLayer') as st_asmvt
    FROM q;
  `, [z, x, y]);

  await client.end();

  const tile = res.rows[0].st_asmvt;

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