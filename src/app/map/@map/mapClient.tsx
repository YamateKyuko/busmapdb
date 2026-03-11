'use client';
import * as React from 'react';
import Map, { AttributionControl, Layer, MapRef, Source, useMap } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import maplibregl, { GetResourceResponse, MapLibreEvent } from 'maplibre-gl';
import { setNavFunc, setNavParams, setStationsNavParams } from './mapComponent';
import { stationPathsGeomLayerStyle, stationGeomLayerStyle, stationStrLayerStyle, stationPathsBaseGeomLayerStyle, stopPathsGeomLayerStyle, stationBaseGeomLayerStyle, stationPathsArrow0LayerStyle, stationPathsArrow1LayerStyle } from './mapstyles';
import styles from './map.module.css';
import { SearchParams } from '../../util';
import arrow from '../../../../public/arrow.png';
import { useRouter } from 'next/router';

export default function MapClient(props: {
  setNav: setNavFunc,
  getTile: (url: string) => Promise<ArrayBuffer>,
}) {
  const mapRef = React.useRef<MapRef>(null);

  const onMapLoad = (e: MapLibreEvent) => {
    const loadImage = async () => {
      try {
        const map = e.target;
        const res = await fetch('/ya.png');
        const blob = await res.blob();
        const u8ca = new Uint8Array(await blob.arrayBuffer());
        const bm = await createImageBitmap(blob);
        const image = await map.loadImage('custom://symbol/ya.png');
        if (!map.hasImage('arrow')) {
          map.addImage('arrow', image.data, {sdf: true});
        };
      } catch (e) {
        console.error(e);
      };
    };

    loadImage();
  };
  
  React.useEffect(() => {
    maplibregl.addProtocol('tiles', async (requestParam): Promise<GetResourceResponse<any>> => {
      const apiReplacedUrl = requestParam.url.replace('tiles://api/', '');
      // const apiRes = await props.getTile(`/api/${apiReplacedUrl}`);
      const apiRes = await fetch(`/api/${apiReplacedUrl}`);
      const buffer = await apiRes.arrayBuffer();
      return {data: buffer};
    });

    maplibregl.addProtocol('custom', async (requestParam): Promise<GetResourceResponse<any>> => {
      try {
        const splited = requestParam.url.split('/');
        switch (splited[2]) {
          case 'style':
            const styleReplacedUrl = requestParam.url.replace('custom://style/', '');
            const t = await fetch(`/${styleReplacedUrl}`);
            const json = await t.json();
            return {data: json};
            break;
          case 'symbol':
            const publicReplacedUrl = requestParam.url.replace('custom://symbol/', '');
            const publicRes = await fetch(`/${publicReplacedUrl}`);
            const ab = await publicRes.arrayBuffer()
            return {data: ab};
            break;
          case 'api':
            const apiReplacedUrl = requestParam.url.replace('custom://api/', '');
            const apiRes = await fetch(`/api/${apiReplacedUrl}`);
            const buffer = await apiRes.arrayBuffer();
            return {data: buffer};
            break;
          default:
            return {data: undefined};
            break;
        }
      } catch (_e) {
        throw new Error(`Tile fetch error`);
      }
    });
  }, []);

  const [highlightedState, setHighlightedState] = React.useState<setNavParams>({type: 'default', path: ''});

  const setClicked = React.useCallback(async (feature: setNavParams) => {
    setHighlightedState(feature);
    props.setNav(feature);
  }, [props.setNav]);

  const onClick = (e: maplibregl.MapLayerMouseEvent) => {
    const features = e.features;
    if (features && features.length > 0) {
      const feature = features[0];
      switch (feature.sourceLayer) {
        case 'stationLayer':
          const clickedStationId = Number(feature.properties.station_id);
          if (isNaN(clickedStationId)) return;
          if (highlightedState.type === 'stations') {
            const highlightedStationIds = highlightedState.station_ids;
            const deletedArray = highlightedStationIds.filter((id) => id !== clickedStationId);
            if (deletedArray.length === 0) {
              setClicked({type: 'default', path: ''});
            } else {
              if (!highlightedStationIds.includes(clickedStationId)) {
                deletedArray.push(clickedStationId);
              }
              setClicked({
                type: 'stations',
                station_ids: deletedArray,
                path: `stations/${deletedArray.join('/')}`
              });
            }
          } else {
            setClicked({
              type: 'stations',
              station_ids: [clickedStationId],
              path: `stations/${clickedStationId}`
            });
          };
          break;
        case 'stationPathsLayer':
          const clickedStationPathsId = Number(feature.properties.station_path_id);
          if (isNaN(clickedStationPathsId)) return;
          if (highlightedState.type === 'station_paths') {
            const highlightedStationPathIds = highlightedState.station_path_ids;
            const deletedArray = highlightedStationPathIds.filter((id) => id !== clickedStationPathsId);
            if (deletedArray.length === 0) {
              setClicked({type: 'default', path: ''});
            } else {
              if (!highlightedStationPathIds.includes(clickedStationPathsId)) {
                deletedArray.push(clickedStationPathsId);
              }
              setClicked({
                type: 'station_paths',
                station_path_ids: deletedArray,
                path: `station_paths/${deletedArray.join('/')}`
              });
            }
          } else {
            setClicked({
              type: 'station_paths',
              station_path_ids: [clickedStationPathsId],
              path: `station_paths/${clickedStationPathsId}`
            });
          };
          break;
      }
    }
  };

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

          minZoom={13}
          
          mapStyle='custom://style/pale.json'
          ref={mapRef}
          onClick={onClick}
          interactiveLayerIds={[
            'stationPathsGeomLayer',
            'stationPathsBaseGeomLayer',
            'stationGeomLayer',
            'stationBaseGeomLayer',
            'stationStrLayer'
          ]} // 消すな
          onLoad={onMapLoad}
          attributionControl={false}
          
        >
          <AttributionControl position='top-right' compact={true} customAttribution={[
            '<a href="https://github.com/yamatekyuko">Yamakyu</a>',
            '<a href="https://www.odpt.org/">ODPT</a>',
            '<a href="map/info">ご利用にあたって</a>',
          ]} />
          <Source
            id='stationPathsSource'
            type='vector'
            tiles={[
              `tiles://api/map/stationPaths/{z}/{x}/{y}${
                highlightedState.type == 'stations'
                  ? new SearchParams()
                    .setNumArrParam('station_ids', highlightedState.station_ids)
                    .getParamStr() 
                : highlightedState.type == 'station_paths'
                  ? new SearchParams()
                    .setNumArrParam('station_path_ids', highlightedState.station_path_ids)
                    .getParamStr()
              
                  : ''
              }`
            ]}
            minzoom={8}
            maxzoom={12}
            // att
          >
            <Layer {...stationPathsBaseGeomLayerStyle} />
            <Layer {...stationPathsGeomLayerStyle} />
            <Layer {...stationPathsArrow0LayerStyle} />
            <Layer {...stationPathsArrow1LayerStyle} />
            {/* <Layer
              
            
            /> */}
            
            
            {/* {routeFilter && <Layer beforeId='patternStrLayer' {...{...highlightedPatternGeomLayerStyle, filter: routeFilter}} />} */}
            {/* <Layer {...patternStrLayerStyle} /> */}
          </Source>
          <Source
            id='stationSource'
            type='vector'
            tiles={[
              `tiles://api/map/stations/{z}/{x}/{y}${
                highlightedState.type == 'stations'
                  ? new SearchParams()
                    .setNumArrParam('station_ids', highlightedState.station_ids)
                    .getParamStr()
                  : ''
              }`
            ]}
            minzoom={8}
            maxzoom={12}     
          >
            <Layer {...stationBaseGeomLayerStyle} />
            <Layer {...stationGeomLayerStyle} />
            {/* {stationFilter && <Layer beforeId='stationStrLayer' {...{...highlightedStationGeomLayerStyle, filter: stationFilter}} />} */}
            <Layer {...stationStrLayerStyle} />
            

            {/* <Layer {...stopLayerStyle} /> */}
          </Source>
          <Source
            id='stopPathsSource'
            type='vector'
            tiles={[
              `tiles://api/map/stopPaths/{z}/{x}/{y}`
            ]}
            minzoom={15}
            maxzoom={20}
          >
            <Layer {...stopPathsGeomLayerStyle} />
            {/* <Layer {...paleLayerStyle} /> */}
          </Source>
        </Map>
      </div>
    </>
  );
};