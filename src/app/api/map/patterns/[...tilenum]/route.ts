import { NextResponse } from 'next/server';
import { Client } from 'pg';

export async function GET(req: Request, ctx: RouteContext<'/api/map/patterns/[...tilenum]'>) {
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

  // await (ctx.params)

  // console.log(req.searchParams);
  const url = new URL(req.url);
  const searchparams = new URLSearchParams(url.search);
  const stationid = searchparams.get('stations');
  // console.log(searchparams.toString());
  // console.log('stationid:', stationid);
  // console.log('stationid:', stationid);

  const client = new Client(process.env.DATABASE_URL_LOCAL)
  await client.connect();

  // const res = await client.query(`
  //   with bbox as (select st_transform(ST_TileEnvelope($1, $2, $3), 3857) as b)
  //   SELECT
  //     ST_AsMVT(q, 'mvt_polygons')
  //   FROM (
  //     SELECT
  //       ST_AsMVTGeom(st_transform(geom, 3857), bbox.b),
  //       geom
  //     FROM busmap.maproutes, bbox
  //     WHERE geom && st_transform(bbox.b, 4326)
  //   ) q;
  // `, [z, x, y]);

  const prepared: (string | number)[] = [z,x,y];
  if (stationid) {
    prepared.push(stationid);
  }

  const res = await client.query(`
with bbox as (select st_transform(ST_TileEnvelope($1, $2, $3), 3857) as b),
q as (
  SELECT
    ST_AsMVTGeom(st_transform(path_geom, 3857), bbox.b) as geom,
    station_path_id
  FROM busmap.mapstationpaths, bbox
  WHERE path_geom && st_transform(bbox.b, 4326)
),
r as (
  select 
    
    geom as geom,
    station_path_id,
    sum(count) as count,
    ${stationid !== null ? `'base'` : `'selected'`} as st
  from q
  inner join busmap.mappatterns using(station_path_id)
  inner join busmap.mappatterncount on (mappatterns.pattern_id = mappatterncount.pattern_id and daytype = '平')
  group by station_path_id, geom
),
${stationid !== null ? `
s as (
  select 
    
    geom as geom,
    station_path_id,
    sum(count) as count,
    'selected' as st
  from q
  inner join busmap.mappatterns using(station_path_id)
  inner join busmap.mappatterncount on (mappatterns.pattern_id = mappatterncount.pattern_id and daytype = '平')
  where mappatterns.pattern_id in (
    select mappatterns.pattern_id
    from busmap.mapstationpaths
    inner join busmap.mappatterns using(station_path_id)
    where sta1 = $4 or sta2 = $4
    group by pattern_id)
  group by station_path_id, geom
),
` : ''}
t as (
  select * from r${stationid !== null ? ' union all select * from s' : ''}
)
SELECT
  ST_AsMVT(t.*, 'patternLayer', 4096, 'geom') as tile
FROM t;
  `, prepared);



  await client.end()

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