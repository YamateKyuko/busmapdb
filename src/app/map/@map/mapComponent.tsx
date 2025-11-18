import { redirect, RedirectType } from "next/navigation";
import MapClient from "./mapClient";
import { revalidatePath } from "next/cache";

export type setStationsNavParams = {
  station_id: number
};

export type setRoutesNavParams = {
  feed_id: number,
  route_id: string
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
    redirect(`/map/routes/${params.feed_id}/${params.route_id}`, RedirectType.push);
  };

  return (
    <MapClient
      setStationNav={setStationsNav}
      setRoutesNav={setRoutesNav}
    />
  );
};

export default MapComponent;