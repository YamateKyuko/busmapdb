import { redirect, RedirectType } from "next/navigation";
import MapComponent from "./map";
import { revalidatePath } from "next/cache";

export type setStationsNavParams = {
  station_id: number
};

function Page() {
  async function setStationsNav(params: setStationsNavParams) {
    'use server';
    console.log('mapload');
    revalidatePath('/map/@map');
    redirect(`/map/stations/${params.station_id}`, RedirectType.push);
  };

  return (
    <MapComponent setStationNav={setStationsNav} />
  );
};

export default Page;