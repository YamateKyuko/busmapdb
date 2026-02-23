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
  // console.log(res);
  return (
    <>
      {res.station_id}: {res.station_name}
      {res.stop_patterns.map((pattern, i) => (
        <p key={`${pattern.pattern_id}_${i}`}>
          <span>{pattern.platform_code}</span>
          <span>{pattern.route_name}</span>
          {pattern.stop_headsign}
        </p>
      ))}
    </>
  )
}



export default Page;