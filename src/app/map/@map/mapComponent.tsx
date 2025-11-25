import { redirect, RedirectType } from "next/navigation";
import MapClient from "./mapClient";
import { revalidatePath } from "next/cache";

export type setStationsNavParams = {
  station_id: number
};

export type setRoutesNavParams = {
  feed_id: number,
  route_id: string,
  station_id?: number,
  next_station_id?: number
};

function MapComponent() {
  async function setStationsNav(params: setStationsNavParams) {
    'use server';
    console.log('mapload');
    revalidatePath('/map/@map');
    redirect(`/map/stations/${params.station_id}`, RedirectType.push);
  };

  async function setRoutesNav(params: setRoutesNavParams) {
    'use server';
    console.log('mapload');
    revalidatePath('/map/@map');
    redirect(
      `/map/routes/${
        encodeURIComponent(params.feed_id)
      }/${
        encodeURIComponent(params.route_id)
      }${
        (params.station_id && params.next_station_id) &&
          `?station_id=${
            encodeURIComponent(params.station_id)
          }&next_station_id=${
            encodeURIComponent(params.next_station_id)
      }`}`,
      RedirectType.push
    );
  };

  return (
    <MapClient
      setStationNav={setStationsNav}
      setRoutesNav={setRoutesNav}
    />
  );
};

export default MapComponent;