import 'server-only';

import { APIrequester } from "@/app/map/lib/request";
import { decodeNumParam, decodeStrParam } from "@/app/util";
import { Suspense } from "react";

const stationTimesRequester = new APIrequester<{
  feed_id: number,
  // station_id: number,
  // next_station_id: number,
  // route_id: string,
}[]>(
  'gtfsdb/station_times', 'db'
)

async function Page(props: PageProps<'/map/routes/[feed_id]/[route_id]'>) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const feed_id = decodeNumParam(params.feed_id);
  const route_id = decodeStrParam(params.route_id);
  const station_id = decodeNumParam(searchParams.station_id);
  const next_station_id = decodeNumParam(searchParams.next_station_id);
  // console.log(params, searchParams);

  if (feed_id === null || route_id === null || station_id === null || next_station_id === null) return <>Invalid parameters</>;

  return (
    <>
      <Suspense fallback={<div>Loading station times...</div>}>
        <StationTimesNav
          feed_id={feed_id}
          route_id={route_id}
          station_id={station_id}
          next_station_id={next_station_id}
        />
      </Suspense>
    </>
  );
};

async function StationTimesNav(props: {
  feed_id: number,
  station_id: number,
  next_station_id: number,
  route_id: string
}) {
  const res = await stationTimesRequester.get({
    feed_id: props.feed_id,
    station_id: props.station_id,
    next_station_id: props.next_station_id,
    route_id: props.route_id,
  });

  console.log(props.feed_id, props.route_id, props.station_id, props.next_station_id);
  console.log(res);
  if (!res) return <div>Station not found</div>;
  return (
    <>
      {/* {res.stop_name} */}
    </>
  )
}

export default Page;