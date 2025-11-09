import { redirect, RedirectType } from "next/navigation";
import MapComponent from "./map";

function Page() {
  async function s() {
    'use server';
    console.log('mapload');
    redirect('/map/routes/1/1', RedirectType.replace);
  }
  return (
    <MapComponent s={s} />
  );
};

export default Page;