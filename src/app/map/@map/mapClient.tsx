'use client';
import * as React from 'react';
import Map, { Layer, MapProvider, MapRef, Source, useMap } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import maplibregl from 'maplibre-gl';
import Link from 'next/link';
import { setRoutesNavParams, setStationsNavParams } from './mapComponent';
import { patternLayerStyle, patternLayerStyleStr, patternSource, stationLayerStyle, stationLayerStyleStr, stationSource, stopLayerStyle } from './mapstyles';

export default function MapClient(props: {
  setStationNav: (params: setStationsNavParams) => Promise<void>,
  setRoutesNav: (params: setRoutesNavParams) => Promise<void>
}) {
  const mapRef = React.useRef<MapRef>(null);

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

  const onClick = React.useCallback((e: maplibregl.MapLayerMouseEvent) => onClickFunc(e, mapRef, props.setStationNav, props.setRoutesNav), [props]);


  return (
    <>
      <MapProvider>
        <Map
          id="map"
          initialViewState={{
            longitude: 139.50,
            latitude: 35.69,
            zoom: 13
          }}
          style={{
            width: 800,
            height: 400
          }}
          mapStyle="https://raw.githubusercontent.com/gsi-cyberjapan/optimal_bvmap/52ba56f645334c979998b730477b2072c7418b94/style/std.json"
          ref={mapRef}
          onClick={onClick}
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
        </Map>
      </MapProvider>
    </>
  );
}



const onClickFunc = (
  e: maplibregl.MapMouseEvent,
  mapRef: React.RefObject<MapRef | null>,
  setStationNav: (params: setStationsNavParams) => Promise<void>,
  setRoutesNav: (params: setRoutesNavParams) => Promise<void>,
) => {
  if (!mapRef.current) return;
  const map = mapRef.current.getMap();
  const features = map.queryRenderedFeatures(e.point, { layers: ['patternLayer', 'stationLayer'] });
  console.log(features);
  if (features && features.length > 0) {
    const feature = features[0];
    switch (feature.sourceLayer) {
      case 'stationLayer':
        console.log('station clicked:', feature);
        setStationNav({station_id: Number(feature.properties?.station_id)});
        break;
      case 'patternLayer':
        console.log('pattern clicked:', feature);
        setRoutesNav({
          feed_id: Number(feature.properties?.feed_id),
          route_id: String(feature.properties?.route_id),
          station_id: feature.properties?.station_id ? Number(feature.properties?.station_id) : undefined,
          next_station_id: feature.properties?.next_station_id ? Number(feature.properties?.next_station_id) : undefined,
        });
        break;
    }
  }
};