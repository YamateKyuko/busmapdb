'use client';
import * as React from 'react';
import Map, { Layer, LayerProps, MapProvider, Source, SourceProps, useMap } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import maplibregl from 'maplibre-gl';
import Link from 'next/link';

const patternSource: SourceProps = {
  id: "patternSource",
  type: "vector",
  tiles: [`custom://api/map/patterns/{z}/{x}/{y}`],
  minzoom: 0,
  maxzoom: 14,
}

const patternLayerStyle: LayerProps = {
  id: "patternLayer",
  type: "line",
  source: "patternSource",
  "source-layer": "mvt_polygons",
  layout: {},
  paint: {
    "line-color": "#2d2d70",
    "line-width": [
            'interpolate',
            ['linear'],
            ['zoom'],
            2,
            5,
            // 22,
            // 1
        ],
  },
}

const stationSource: SourceProps = {
  id: "stationSource",
  type: "vector",
  tiles: [`custom://api/map/stations/{z}/{x}/{y}`],
  minzoom: 0,
  maxzoom: 14,
}

const stationLayerStyle: LayerProps = {
  id: "stationLayer",
  type: "fill",
  source: "stationSource",
  "source-layer": "mvt_poly",
  layout: {},
  paint: {
    "fill-color": "#888888",
    "fill-outline-color": "#000000",
    "fill-opacity": 1,
  },
}




export default function MapComponent(props: {s?: () => Promise<void>}) {
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
      <button onClick={props.s}>Log Map Load</button>
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
          style={{width: 800, height: 800}}
          mapStyle="https://raw.githubusercontent.com/gsi-cyberjapan/optimal_bvmap/52ba56f645334c979998b730477b2072c7418b94/style/std.json"
        >
          <Source {...patternSource}>
            <Layer {...patternLayerStyle} />
            {/* <Layer {...layerStyle2} /> */}
          </Source>
          <Source {...stationSource}>
            <Layer {...stationLayerStyle} />
          </Source>
          <DrawControl
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
          />
          <Navigation />
        </Map>
        

      </MapProvider>
      
    </>
    
  );
}

function Navigation() {
  
  // console.log(map);
  const {map}  = useMap();

  React.useEffect(() => {
    console.log('mapload');
    if (!map) return;
    const onClick = (e: maplibregl.MapMouseEvent) => {
      const features = map.queryRenderedFeatures(e.point, { layers: ['patternLayer'] });
      console.log('clicked features:', features);

      if (features && features.length > 0) {
        // const props = features[0].properties || {};
        // 簡単なポップアップ表示（必要な場合）
        // new maplibregl.Popup()
        //   .setLngLat(e.lngLat)
        //   .setHTML(`<pre>${JSON.stringify(props, null, 2)}</pre>`)
        //   .addTo(map);
      }
    };
    map.on('click', onClick);
    return () => {
      map.off('click', onClick);
    }
  }, [map]);

  

  

  return (
    <>
    </>
  )
}


function DrawControl(props: {
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right',
  displayControlsDefault?: boolean,
  controls: {
    polygon?: boolean,
    trash?: boolean,
  },
  onCreate?: (e: unknown) => void,
  onUpdate?: (e: unknown) => void,
  onDelete?: (e: unknown) => void,
}) {
  console.log(props.onCreate)

  return null;
}