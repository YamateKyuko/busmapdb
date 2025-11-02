'use client';
import * as React from 'react';
import Map, { Layer, LayerProps, MapProvider, Source, SourceProps, useMap } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import maplibregl from 'maplibre-gl';

const layerStyle: LayerProps = {
  id: "mvt_data_line",
  type: "line",
  source: "mvt_data",
  "source-layer": "mvt_polygons", // server.jsで決めている名前を指定
  layout: {},
  paint: {
    "line-color": "#2d2d70",
    "line-width": 2,
  },
}
// const layerStyle2: LayerProps = {
//   id: "mvt_data_fill",
//   type: "fill",
//   source: "mvt_data",
//   "source-layer": "mvt_polygons", // server.jsで決めている名前を指定
//   layout: {},
//   paint: {
//     "fill-color": "#888888",
//   },
// }
const tileSource: SourceProps = {
  id: "mvt_data",
  type: "vector",
  // 
  tiles: [`custom://api/map/pattern/{z}/{x}/{y}`],
  minzoom: 0,
  maxzoom: 14,
}

function Page() {
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
            zoom: 12
          }}
          style={{width: 600, height: 400}}
          mapStyle="https://raw.githubusercontent.com/gsi-cyberjapan/optimal_bvmap/52ba56f645334c979998b730477b2072c7418b94/style/std.json"
        >
          <Source {...tileSource}>
            <Layer {...layerStyle} />
            {/* <Layer {...layerStyle2} /> */}
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
      const features = map.queryRenderedFeatures(e.point, { layers: ['mvt_data_fill'] });
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

export default Page;