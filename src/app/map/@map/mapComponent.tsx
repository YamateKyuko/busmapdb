import { redirect, RedirectType } from "next/navigation";
import MapClient from "./mapClient";
import { revalidatePath } from "next/cache";
import { encodeNumParam, encodeStrParam } from "../lib/util";

export type setStationsNavParams = {
  type: 'station',
  station_id: number
};

export type setRoutesNavParams = {
  type: 'route',
  feed_id: number,
  route_id: string,
  station_id: number,
  next_station_id: number
};

export type setNavFunc = (params: setStationsNavParams | setRoutesNavParams) => Promise<void>;

function MapComponent() {
  async function setNav(params: setStationsNavParams | setRoutesNavParams) {
    'use server';
    console.log('loaded');
    if (params.type === 'station') {
      revalidatePath('/map/@map');
      redirect(`/map/stations/${encodeNumParam(params.station_id)}`, RedirectType.push);
    }
    if (params.type === 'route') {
      revalidatePath('/map/@map');
      redirect(
        `/map/routes/${
          encodeNumParam(params.feed_id)
        }/${
          encodeStrParam(params.route_id)
        }${
          (params.station_id && params.next_station_id) &&
            `?station_id=${
              encodeNumParam(params.station_id)
            }&next_station_id=${
              encodeNumParam(params.next_station_id)
        }`}`,
        RedirectType.push
      );
    };
  };

  return (
    <MapClient
      setNav={setNav}
    />
  );
};

export default MapComponent;