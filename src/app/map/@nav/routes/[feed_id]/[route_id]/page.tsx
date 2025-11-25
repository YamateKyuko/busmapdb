import { APIrequester } from "@/app/map/lib/request";
import { decodeNumParam, decodeStrParam } from "@/app/map/lib/util";

async function Page(props: PageProps<'/map/routes/[feed_id]/[route_id]'>) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  console.log(params);
  const feed_id = decodeNumParam(params.feed_id);
  const route_id = decodeStrParam(params.route_id);
  const station_id = decodeNumParam(searchParams.station_id);
  const next_station_id = decodeNumParam(searchParams.next_station_id);
  return (
    <>
      nav/routes
      {feed_id}
      {route_id}
    </>
  );
};

export default Page;