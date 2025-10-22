'use client';
import * as React from 'react';
import Map, { Layer, LayerProps, MapProvider, Source, SourceProps, useControl, useMap } from 'react-map-gl/maplibre';
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
    "line-width": 0.7,
  },
}
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

  //   const [features, setFeatures] = React.useState({});

  // const onUpdate = React.useCallback(e => {
  //   setFeatures(currFeatures => {
  //     const newFeatures = {...currFeatures};
  //     for (const f of e.features) {
  //       newFeatures[f.id] = f;
  //     }
  //     return newFeatures;
  //   });
  // }, []);

  // const onDelete = useCallback(e => {
  //   setFeatures(currFeatures => {
  //     const newFeatures = {...currFeatures};
  //     for (const f of e.features) {
  //       delete newFeatures[f.id];
  //     }
  //     return newFeatures;
  //   });
  // }, []);



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
            longitude: 139.76,
            latitude: 35.68,
            zoom: 14
          }}
          style={{width: 600, height: 400}}
          mapStyle="https://raw.githubusercontent.com/gsi-cyberjapan/optimal_bvmap/52ba56f645334c979998b730477b2072c7418b94/style/std.json"
        >
          <Source {...tileSource}>
            <Layer {...layerStyle} />
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
        </Map>
        <Navigation>

        </Navigation>

      </MapProvider>
      
    </>
    
  );
}

function Navigation() {
  const {map}  = useMap();
  console.log(map);
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