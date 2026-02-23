import { NextResponse } from 'next/server';
import { Client } from 'pg';

export const dynamic = 'force-static'

export async function GET(req: Request, ctx: RouteContext<'/api/map/stopPaths/[...tilenum]'>) {
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

  const url = new URL(req.url);
  const searchparams = new URLSearchParams(url.search);
  const feedid = searchparams.get('feed_id');
  const stopid = searchparams.get('stops');

  const client = new Client(process.env.DATABASE_URL);
  await client.connect();

  const prepared: (number | string)[] = [z,x,y];
  if (feedid !== null && stopid !== null) {
    const fid = Number(feedid);
    if (isNaN(fid) || fid < 0) {
      return new Response('Bad Request', { status: 400 });
    }
    prepared.push(fid);
    prepared.push(stopid);
  };

  const res = await client.query(`
with bbox as (select st_transform(ST_TileEnvelope($1, $2, $3), 3857) as b, '平' as daytype),
q as (
  SELECT
    ST_AsMVTGeom(st_transform(path_geom, 3857), bbox.b) as geom,
    stop_path_id,
    daytype
  FROM busmap.mapstoppaths, bbox
  WHERE path_geom && st_transform(bbox.b, 4326)
),
r as (
  select 
    
    geom as geom,
    q.stop_path_id,
    count,
    ${stopid !== null ? `'base'` : `'selected'`} as st
  from q
  inner join busmap.mapstoppathcount using(stop_path_id, daytype)
),
${stopid !== null ? `
s as (
  select 
    
    geom as geom,
    station_path_id,
    sum(count) as count,
    'selected' as st
  from q
  inner join busmap.mappatterns using(stop_path_id)
  inner join busmap.mappatterncount on (mappatterns.pattern_id = mappatterncount.pattern_id and q.daytype = mappatterncount.daytype)
  where mappatterns.pattern_id in (
    select mappatterns.pattern_id
    from busmap.mapsstoppaths
    inner join busmap.mappatterns using(stop_path_id)
    where feed_id = $4 and (stp1 = $5 or stp2 = $5)
    group by pattern_id)
  group by stop_path_id, geom
),
` : ''}
t as (
  select * from r${stopid !== null ? ' union all select * from s' : ''}
)
SELECT
  ST_AsMVT(t.*, 'stopPathLayer', 4096, 'geom') as tile
FROM t;
  `, [z, x, y]);

  await client.end()

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