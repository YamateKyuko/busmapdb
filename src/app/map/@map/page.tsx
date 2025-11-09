import { redirect, RedirectType } from "next/navigation";
import MapComponent from "./map";
import { revalidatePath } from "next/cache";

function Page() {
  async function s() {
    'use server';
    console.log('mapload');
    revalidatePath('/map/@map');
    redirect('/map/routes/1/1', RedirectType.push);
  }
  return (
    <MapComponent s={s} />
  );
};

export default Page;