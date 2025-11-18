'use client';
import * as React from 'react';
import Map, { Layer, MapProvider, Source, useMap } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import maplibregl from 'maplibre-gl';
import Link from 'next/link';
import { setRoutesNavParams, setStationsNavParams } from './mapComponent';
import { patternLayerStyle, patternLayerStyleStr, patternSource, stationLayerStyle, stationLayerStyleStr, stationSource, stopLayerStyle } from './mapstyles';

export default function MapClient(props: {
  setStationNav: (params: setStationsNavParams) => Promise<void>,
  setRoutesNav: (params: setRoutesNavParams) => Promise<void>
}) {
  React.useEffect(() => {
    maplibregl.addProtocol('custom', async (params) => {
      try {
        const url = params.url.replace('custom://api/', '');
        const t = await fetch(`/api/${url}`);
        const buffer = await t.arrayBuffer();
        return {data: buffer}
      } catch (_e) {
        throw new Error(`Tile fetch error`);
      }
    })
  }, []);


  return (
    <>
      <Link href="/map/routes/1/1">Back to /map</Link>
      <button onClick={() => props.setStationNav({station_id: 1})}>Log Map Load</button>
      <React.Suspense fallback={<div>Loading Map...</div>}>
        {/* <ActionForm /> */}
        {/* <ClientRefresh /> */}
        
      </React.Suspense>
      <MapProvider>
        <Map
          id="map"
          initialViewState={{
            // 35.68674602787891, 139.48947555916342
            longitude: 139.50,
            latitude: 35.69,
            zoom: 13
          }}
          style={{
            width: 800,
            height: 400
          }}
          mapStyle="https://raw.githubusercontent.com/gsi-cyberjapan/optimal_bvmap/52ba56f645334c979998b730477b2072c7418b94/style/std.json"
        >
          <Source {...patternSource}>
            <Layer {...patternLayerStyle} />
            <Layer {...patternLayerStyleStr} />
          </Source>
          <Source {...stationSource}>
            <Layer {...stationLayerStyle} />
            <Layer {...stationLayerStyleStr} />
            <Layer {...stopLayerStyle} />
          </Source>
          {/* <DrawControl
            position="top-left"
            displayControlsDefault={false}
            controls={{
              polygon: true,
              trash: true
            }}
            // defaultMode="draw_polygon"
            // onCreate={onUpdate}
            // onUpdate={onUpdate}
            // onDelete={onDelete}
          /> */}
          <Navigation
            setStationNav={props.setStationNav}
            setRoutesNav={props.setRoutesNav}
          />
        </Map>
        

      </MapProvider>
      
    </>
    
  );
}

function Navigation(props: {
  setStationNav: (params: setStationsNavParams) => Promise<void>,
  setRoutesNav: (params: setRoutesNavParams) => Promise<void>
}) {
  
  // console.log(map);
  const {map}  = useMap();

  React.useEffect(() => {
    console.log('mapload');
    if (!map) return;
    const onClick = (e: maplibregl.MapMouseEvent) => {
      const features = map.queryRenderedFeatures(e.point, { layers: ['patternLayer', 'stationLayer'] });
      console.log(features);
      if (features && features.length > 0) {
        const feature = features[0];
        switch (feature.sourceLayer) {
          case 'stationLayer':
            console.log('station clicked:', feature);
            props.setStationNav({station_id: Number(feature.properties?.station_id)});
            break;
          case 'patternLayer':
            console.log('pattern clicked:', feature);
            props.setRoutesNav({
              feed_id: Number(feature.properties?.feed_id),
              route_id: String(feature.properties?.route_id)
            });
            break;
        }
      }
    };
    map.on('click', onClick);
    return () => {
      map.off('click', onClick);
    }
  }, [map, props]);

  

  

  return (
    <>
    </>
  )
}


// function DrawControl(props: {
//   position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right',
//   displayControlsDefault?: boolean,
//   controls: {
//     polygon?: boolean,
//     trash?: boolean,
//   },
//   onCreate?: (e: unknown) => void,
//   onUpdate?: (e: unknown) => void,
//   onDelete?: (e: unknown) => void,
// }) {
//   console.log(props.onCreate)

//   return null;
// }