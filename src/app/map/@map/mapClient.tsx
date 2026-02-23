'use client';
import * as React from 'react';
import Map, { Layer, MapRef, Source } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import maplibregl, { FilterSpecification } from 'maplibre-gl';
import { setNavFunc, setNavParams, setRoutesNavParams, setStationsNavParams } from './mapComponent';
import { stationPathsGeomLayerStyle, stationGeomLayerStyle, highlightedStationGeomLayerStyle, stationStrLayerStyle, stationSource, stationPathsBaseGeomLayerStyle } from './mapstyles';
import styles from './map.module.css';
import { usePathname } from 'next/navigation';

export default function MapClient(props: {
  setNav: setNavFunc
}) {
  const mapRef = React.useRef<MapRef>(null);
  
  React.useEffect(() => {
    maplibregl.addProtocol('custom', async (requestParam) => {
      try {
        if (requestParam.url == 'custom://pale.json') {
          const t = await fetch(`/pale.json`);
          const json = await t.json();
          return {data: json};
        }
        const url = requestParam.url.replace('custom://api/', '');
        const t = await fetch(`/api/${url}`);
        const buffer = await t.arrayBuffer();
        return {data: buffer}
      } catch (_e) {
        throw new Error(`Tile fetch error`);
      }
    })
  }, []);

  // const [clickedFeature, setClickedFeature] = React.useState<setStationsNavParams | setRoutesNavParams | null>(null);
  // const stationFilter: FilterSpecification | undefined = React.useMemo(
  //   () => clickedFeature?.type === 'station'
  //     ? ['==', 'station_id', clickedFeature.station_id]
  //     : undefined,
  //   [clickedFeature]);

  // const routeFilter: FilterSpecification | undefined = React.useMemo(
  //   () => clickedFeature?.type === 'route'
  //     ? ['all',
  //       ['==', 'feed_id', clickedFeature.feed_id],
  //       ['==', 'route_id', clickedFeature.route_id],
  //       ['==', 'station_id', clickedFeature.station_id],
  //       ['==', 'next_station_id', clickedFeature.next_station_id]
  //     ]
  //     : undefined,
  //   [clickedFeature]);
    

  const setClicked = React.useCallback(async (feature: setNavParams) => {
    props.setNav(feature);
    // setClickedFeature(feature);
    
  }, [props]);

  // const onClick = React.useCallback((e: maplibregl.MapLayerMouseEvent) => onClickFunc(
  //   e,
  //   setClicked,
  //   // setClickedFeature
  // ), [setClicked]);

  const pathnames = usePathname().split('/');
  const highlightedType = pathnames[2] || null;
  const hilightedValue = pathnames[3] || null;
  
  // pathtype

  // const stationId = searchparams.get('station_id');

  const [stationPathsSourceTile, setStationPathsSourceTile] = React.useState<string>(
    `custom://api/map/stationPaths/{z}/{x}/{y}${highlightedType == 'stations' && hilightedValue ? `?station_id=${hilightedValue}` : ''}`
  );

  const [stationSourceTile, setStationSourceTile] = React.useState<string>(
    `custom://api/map/stations/{z}/{x}/{y}`
  );

  const onClick = React.useCallback((e: maplibregl.MapLayerMouseEvent) => {
    const features = e.features;
    if (features && features.length > 0) {
      const feature = features[0];
      switch (feature.sourceLayer) {
        case 'stationLayer':
          // console.log(`highlightedType: ${highlightedType}, highlightedValue: ${hilightedValue}`);
          // // console.log(`clicked station with id ${feature.properties?.station_id}`);
          // if (highlightedType == 'stations' && hilightedValue == String(feature.properties?.station_id)) {
          //   console.log('clicked highlighted station, resetting to default');
          //   setStationPathsSourceTile(`custom://api/map/stationPaths/{z}/{x}/{y}`);
          //   setClicked({
          //     type: 'default',
          //   });
          // } else {
            setStationPathsSourceTile(`custom://api/map/stationPaths/{z}/{x}/{y}?station_id=${feature.properties?.station_id}`);
            setClicked({
              type: 'station',
              station_id: Number(feature.properties.station_id),
            });
          // }
          
          
          break;
      }
    }
  }, []);

  // stationSource.

  return (
    <>
      <div className={styles.map}>
        <Map
          id="map"
          
          initialViewState={{
            longitude: 139.50,
            latitude: 35.69,
            zoom: 13
          }}
          
          mapStyle='custom://pale.json'
          ref={mapRef}
          onClick={onClick}
          interactiveLayerIds={['stationPathsGeomLayer', 'stationGeomLayer']} // 消すな
          
        >
          <Source
            id={'stationPathsSource'}
            type='vector'
            tiles={[
              stationPathsSourceTile
            ]}
            minzoom={8}
            maxzoom={12}
          >
            <Layer {...stationPathsBaseGeomLayerStyle} />
            <Layer {...stationPathsGeomLayerStyle} />
            
            {/* {routeFilter && <Layer beforeId='patternStrLayer' {...{...highlightedPatternGeomLayerStyle, filter: routeFilter}} />} */}
            {/* <Layer {...patternStrLayerStyle} /> */}
          </Source>
          <Source
            id='stationSource'
            type='vector'
            tiles={[
              stationSourceTile
            ]}
            minzoom={8}
            maxzoom={12}     
          >
            <Layer {...stationGeomLayerStyle} />
            {/* {stationFilter && <Layer beforeId='stationStrLayer' {...{...highlightedStationGeomLayerStyle, filter: stationFilter}} />} */}
            <Layer {...stationStrLayerStyle} />

            {/* <Layer {...stopLayerStyle} /> */}
          </Source>
        </Map>
      </div>
    </>
  );
}



