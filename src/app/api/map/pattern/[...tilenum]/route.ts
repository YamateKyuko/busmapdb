// import { neon } from "@neondatabase/serverless";

// import { neon } from "@neondatabase/serverless";
import { NextResponse } from 'next/server';
import { Client } from 'pg';

export const dynamic = 'force-static'
 
export async function GET(_req: Request, ctx: RouteContext<'/api/map/pattern/[...tilenum]'>) {
  const tilenumstrs = (await ctx.params).tilenum;
  const tilenums: number[] = [];
  tilenumstrs.map((v, i) => {
    const num = Number(v);
    if (isNaN(num) || num < 0 || i> 3) {
      return new Response('Bad Request', { status: 400 });
    }
    tilenums.push(num);
  });
  if (tilenums.length !== 3) {
    return new Response('Bad Request', { status: 400 });
  };
  const [z, x, y] = tilenums as [number, number, number];
  
  // const sql = neon(`${process.env.DATABASE_URL}`);
    
  // //   // Insert the comment from the form into the Postgres database
  //   const results = await sql`
  //   select * from map.results
  //   `;

  const client = new Client(process.env.DATABASE_URL_LOCAL)
  await client.connect();
  // console.log(await client.query(`select * from stops limit 1;`));

  
  const res = await client.query(`
    with bbox as (select st_transform(ST_TileEnvelope($1, $2, $3), 3857) as b)
    SELECT
      ST_AsMVT(q, 'mvt_polygons'),
      array_agg(st_astext(geom)) as t
    FROM (
      SELECT
        ST_AsMVTGeom(st_transform(geom, 3857), bbox.b),
        geom
      FROM map.test_polygons, bbox
      WHERE geom && st_transform(bbox.b, 4326)
    ) q;
  `, [z, x, y]);

  // console.log(res.rows);
  await client.end()

  const tile = res.rows[0].st_asmvt;

  return new NextResponse(tile, {
    headers: {
      'Content-Type': 'application/vnd.mapbox-vector-tile',
      'Access-Control-Allow-Origin': `${process.env.NEXT_PUBLIC_BASE_URL || ''}`,
      'Access-Control-Allow-Methods': 'GET', // OPTONSを追加
      'Access-Control-Allow-Headers': 'Content-Type', // 追加
    },
  });
}








