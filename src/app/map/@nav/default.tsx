import { APIrequester } from "../lib/request";

const stationsRequester = new APIrequester<stopTime[]>(
  'gtfsdb/stations', 'db'
);

function Page() {
  return (
    <>map/nav/default</>
  );
};

export default Page;