'use client';
import * as React from 'react';
import Map, { Layer, LayerProps, MapProvider, Source, SourceProps, useMap } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import maplibregl from 'maplibre-gl';
import Link from 'next/link';
import { setStationsNavParams } from './page';
import { get } from 'http';

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
  "source-layer": "patternLayer",
  layout: {},
  paint: {
    "line-color": "#2d2d70",
    "line-width": [
            'interpolate',
            ['linear'],
            ['zoom'],
            2,
            5,
        ],
  },
}

const patternLayerStyleStr: LayerProps = {
  id: "patternLayerStr",
  type: "symbol",
  source: "patternSource",
  "source-layer": "patternLayer",
    'layout': {
      'icon-image': '', //アイコン画像は使わない
      'text-font': ["NotoSans-SemiBold"], //文字フォントの指定
      'text-anchor': 'top', //テキスト表示位置の指定
      'text-allow-overlap': true, //テキストが重なっても表示する
      'text-size': 7, //テキストサイズの指定
      // 'text-size': ['interpolate',['linear'],['zoom'],5,8,8,11,15,18], //テキストサイズはズームレベルに応じて指定
      'text-offset': [0,0], //テキストのオフセットは無し
      'text-field': ['get', 'route_name'], //テキスト表示する属性項目を指定（'{名称}'と記述してもOK）
  },
  'paint':{
      'text-color': '#555', //テキストの色指定
      'text-halo-color': '#fff', //テキストの外縁の色指定
      'text-halo-width': 1 //テキストの外縁の幅指定
  }
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
  "source-layer": "stationLayer",
  filter: ['==', ['get', 'type'], 'station'],
  layout: {},
  paint: {
    "fill-color": "#888888",
    "fill-outline-color": "#000000",
    "fill-opacity": 1,
  },
}

const stationLayerStyleStr: LayerProps = {
  id: "stationLayerStr",
  type: "symbol",
  source: "stationSource",
  "source-layer": "stationLayer",
  'filter': ['==', ['get', 'type'], 'station'],
  'layout': {
    'icon-image': '', //アイコン画像は使わない
    'text-font': ["NotoSans-SemiBold"], //文字フォントの指定
    'text-anchor': 'center', //テキスト表示位置の指定
    'text-allow-overlap': true, //テキストが重なっても表示する
    'text-size': 12, //テキストサイズの指定
    // 'text-size': ['interpolate',['linear'],['zoom'],5,8,8,11,15,18], //テキストサイズはズームレベルに応じて指定
    'text-offset': [0,0], //テキストのオフセットは無し
    'text-field': ['get', 'station_name'], //テキスト表示する属性項目を指定（'{名称}'と記述してもOK）
  },
  'paint':{
    'text-color': '#555', //テキストの色指定
    'text-halo-color': '#fff', //テキストの外縁の色指定
    'text-halo-width': 1 //テキストの外縁の幅指定
  }
}

const stopLayerStyle: LayerProps = {
  id: "stationLayer",
  type: "circle",
  source: "stationSource",
  "source-layer": "stationLayer",
  filter: ['==', ['get', 'type'], 'stop'],
  layout: {},
  paint: {
    'circle-radius': 5,
    'circle-color': '#ff0000',
    // "fill-color": "#888888",
    // "fill-outline-color": "#000000",
    // "fill-opacity": 1,
  },
}


export default function MapComponent(props: {setStationNav: (params: setStationsNavParams) => Promise<void>}) {
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
          <Navigation
            setStationNav={props.setStationNav}
          />
        </Map>
        

      </MapProvider>
      
    </>
    
  );
}

function Navigation(props: {setStationNav: (params: setStationsNavParams) => Promise<void>}) {
  
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
        if (feature.sourceLayer === 'stationLayer') {
          console.log('station clicked:', feature);
          props.setStationNav({station_id: Number(feature.properties?.station_id)});
        }
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