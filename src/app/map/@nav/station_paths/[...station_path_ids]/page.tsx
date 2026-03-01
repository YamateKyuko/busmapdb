async function Page(props: PageProps<'/map/station_paths/[...station_path_ids]'>) {
  const params = await props.params;
  const stationId = Number(params.station_path_ids[0]);
  
  return (
    <>
      
    </>
  );
};

export default Page;