import { redirect, RedirectType } from "next/navigation";
import MapClient from "./mapClient";
import { revalidatePath } from "next/cache";
import { encodeNumParam, encodeStrParam } from "../lib/util";

export type setDefaultNavParams = {
  type: 'default',
  path: ''
};

export type setStationsNavParams = {
  type: 'stations',
  station_ids: number[],
  path: `stations/${string}`
};

export type setStationPathsNavParams = {
  type: 'station_paths',
  station_path_ids: number[],
  path: `station_paths/${string}`
};

// export type setRoutesNavParams = {
//   type: 'route',
//   feed_id: number,
//   route_id: string,
//   station_id: number,
//   next_station_id: number,
//   path: `routes/${number}/${string}?station_id=${number}&next_station_id=${number}`
// };

export type setNavParams = setDefaultNavParams | setStationsNavParams | setStationPathsNavParams;

export type setNavFunc = (params: setNavParams) => Promise<void>;

function MapComponent() {
  async function setNav(params: setNavParams) {
    'use server';
    revalidatePath('/map/');
    if (params.type === 'default') {
      redirect(`/map`);
    }
    redirect(`/map/${params.path}`);
  };

  async function getTile(url: string) {
    'use server';
    const burl = process.env.NEXT_PUBLIC_BASE_URL;
    if (!burl) throw new Error('NEXT_PUBLIC_BASE_URL is not defined');
    // console.log(`Fetching tile from ${url}`);
    const res = await fetch(`${burl}${url}`);
    const buffer = await res.arrayBuffer();
    return buffer;
  }

  return (
    <MapClient
      setNav={setNav}
      getTile={getTile}
    />
  );
};

export default MapComponent;