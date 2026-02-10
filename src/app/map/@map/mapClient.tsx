'use client';
import * as React from 'react';
import Map, { Layer, MapRef, Source } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import maplibregl, { FilterSpecification } from 'maplibre-gl';
import { setNavFunc, setRoutesNavParams, setStationsNavParams } from './mapComponent';
import { patternGeomLayerStyle, patternSource, stationGeomLayerStyle, highlightedStationGeomLayerStyle, stationStrLayerStyle, stationSource, highlightedPatternGeomLayerStyle } from './mapstyles';
import styles from './map.module.css';

export default function MapClient(props: {
  setNav: setNavFunc
}) {
  const mapRef = React.useRef<MapRef>(null);
  // type a = maplibregl.AddProtocolAction;
  // type b = maplibregl.GetResourceResponse<any>;
  React.useEffect(() => {
    maplibregl.addProtocol('custom', async (params) => {
      try {
        if (params.url == 'custom://pale.json') {
          const t = await fetch(`/pale.json`);
          const json = await t.json();
          console.log(json);
          return {data: json};
        }
        const url = params.url.replace('custom://api/', '');
        const t = await fetch(`/api/${url}`);
        const buffer = await t.arrayBuffer();
        return {data: buffer}
      } catch (_e) {
        throw new Error(`Tile fetch error`);
      }
    })
  }, []);

  const [clickedFeature, setClickedFeature] = React.useState<setStationsNavParams | setRoutesNavParams | null>(null);
  const stationFilter: FilterSpecification | undefined = React.useMemo(
    () => clickedFeature?.type === 'station'
      ? ['==', 'station_id', clickedFeature.station_id]
      : undefined,
    [clickedFeature]);

  const routeFilter: FilterSpecification | undefined = React.useMemo(
    () => clickedFeature?.type === 'route'
      ? ['all',
        ['==', 'feed_id', clickedFeature.feed_id],
        ['==', 'route_id', clickedFeature.route_id],
        ['==', 'station_id', clickedFeature.station_id],
        ['==', 'next_station_id', clickedFeature.next_station_id]
      ]
      : undefined,
    [clickedFeature]);
    

  const setClicked = React.useCallback(async (feature: setStationsNavParams | setRoutesNavParams) => {
    
    props.setNav(feature);
    setClickedFeature(feature);
    
  }, [props]);

  const onClick = React.useCallback((e: maplibregl.MapLayerMouseEvent) => onClickFunc(
    e,
    setClicked,
    // setClickedFeature
  ), [setClicked]);

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
          interactiveLayerIds={['patternGeomLayer', 'stationGeomLayer']} // 消すな
          
        >
          
          <Source {...patternSource}>
            <Layer {...patternGeomLayerStyle} />
            {/* {routeFilter && <Layer beforeId='patternStrLayer' {...{...highlightedPatternGeomLayerStyle, filter: routeFilter}} />} */}
            {/* <Layer {...patternStrLayerStyle} /> */}
          </Source>
          <Source {...stationSource}>
            <Layer {...stationGeomLayerStyle} />
            {stationFilter && <Layer beforeId='stationStrLayer' {...{...highlightedStationGeomLayerStyle, filter: stationFilter}} />}
            <Layer {...stationStrLayerStyle} />

            {/* <Layer {...stopLayerStyle} /> */}
          </Source>
        </Map>
      </div>
    </>
  );
}



const onClickFunc = (
  e: maplibregl.MapLayerMouseEvent,
  setClicked: setNavFunc
) => {
  const features = e.features;
  if (features && features.length > 0) {
    const feature = features[0];
    switch (feature.sourceLayer) {
      case 'stationLayer':
        console.log('station clicked:', feature);
        setClicked({
          type: 'station',
          station_id: Number(feature.properties.station_id),
        });
        break;
      // case 'patternLayer':
      //   console.log('pattern clicked:', feature);
      //   setClicked({
      //     type: 'route',
      //     feed_id: Number(feature.properties?.feed_id),
      //     route_id: String(feature.properties?.route_id),
      //     station_id: Number(feature.properties?.station_id),
      //     next_station_id: Number(feature.properties?.next_station_id),
      //   });
      //   break;
    }
  }
};