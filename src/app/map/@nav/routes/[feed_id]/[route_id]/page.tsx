import { APIrequester } from "@/app/map/lib/request";

// const stationsRequester = new APIrequester<statio>(
//   'gtfsdb/stations', 'db'
// )

async function Page(props: PageProps<'/map/routes/[feed_id]/[route_id]'>) {
  const params = await props.params;
  console.log(params);
  return (
    <>
      nav/routes
      {params.feed_id}
      {params.route_id}
    </>
  );
};

export default Page;