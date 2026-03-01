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
    // console.log(params);

    // if (params.type === 'default') {
    //   redirect(`/map/${params.path}`);
    //   return;
    // }

    revalidatePath('/map/@map');
    
    redirect(`/map/${params.path}`);
    // if (params.type === 'stations') {
    //   revalidatePath('/map/@map');
      
    //   redirect(`/map/stations/${encodeNumParam(params.station_id)}`, RedirectType.push);
    // }
    // if (params.type === 'route') {
    //   revalidatePath('/map/@map');
    //   redirect(
    //     `/map/routes/${
    //       encodeNumParam(params.feed_id)
    //     }/${
    //       encodeStrParam(params.route_id)
    //     }${
    //       (params.station_id && params.next_station_id) &&
    //         `?station_id=${
    //           encodeNumParam(params.station_id)
    //         }&next_station_id=${
    //           encodeNumParam(params.next_station_id)
    //     }`}`,
    //     RedirectType.push
    //   );
    // };
    // if (params.type === 'default') {
    //   revalidatePath('/map/@map');
    //   redirect(`/map`, RedirectType.push);
    // }
  };

  return (
    <MapClient
      setNav={setNav}
    />
  );
};

export default MapComponent;