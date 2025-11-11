import { APIrequester } from "@/app/map/lib/request";
import { station } from "@/app/map/lib/types";
import { Suspense } from "react";

const stationsRequester = new APIrequester<station>(
  'gtfsdb/stations', 'db'
)

async function Page(props: PageProps<'/map/stations/[station_id]'>) {
  const params = await props.params;
  const stationId = Number(params.station_id);
  
  return (
    <>
      <Suspense fallback={<div>Loading station...</div>}>
        <StationNav stationId={stationId} />
      </Suspense>
    </>
  );
};

async function StationNav(props: {stationId: number}) {
  const stationId = props.stationId;
  const res = await stationsRequester.get({station_id: stationId});
  if (!res) return <div>Station not found</div>;
  return (
    <>
      {res.stop_name}
    </>
  )
}



export default Page;