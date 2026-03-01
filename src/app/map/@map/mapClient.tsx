'use client';
import * as React from 'react';
import Map, { Layer, MapRef, Source } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import maplibregl, { FilterSpecification } from 'maplibre-gl';
import { setNavFunc, setNavParams, setStationsNavParams } from './mapComponent';
import { stationPathsGeomLayerStyle, stationGeomLayerStyle, stationStrLayerStyle, stationSource, stationPathsBaseGeomLayerStyle, stopPathsGeomLayerStyle, stationBaseGeomLayerStyle } from './mapstyles';
import styles from './map.module.css';
import { usePathname } from 'next/navigation';
import { SearchParams } from '../lib/util';

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
    



  // const onClick = React.useCallback((e: maplibregl.MapLayerMouseEvent) => onClickFunc(
  //   e,
  //   setClicked,
  //   // setClickedFeature
  // ), [setClicked]);

  // pathtype

  // const stationId = searchparams.get('station_id');

  const [highlightedState, setHighlightedState] = React.useState<setNavParams>({type: 'default', path: ''});

  const setClicked = React.useCallback(async (feature: setNavParams) => {
  // const setClicked = (feature: setNavParams) => {
    // let bool = false;
    // console.log(feature.path, highlightedState.path);

    console.log(feature);

    // if (feature.path === highlightedState.path) {
    //   // console.log('same feature clicked');
    //   props.setNav({type: 'default', path: ''});
    //   setHighlightedState({type: 'default', path: ''});
    //   return;
    // }

    
    setHighlightedState(feature);
    props.setNav(feature);
    
    // setClickedFeature(feature);
  
  }, [props]);
  // };

  const onClick = (e: maplibregl.MapLayerMouseEvent) => {
    const features = e.features;
    if (features && features.length > 0) {
      const feature = features[0];
      
      switch (feature.sourceLayer) {
        case 'stationLayer':
          const clickedStationId = Number(feature.properties.station_id);
          if (isNaN(clickedStationId)) return;
          // console.log(clickedStationId);
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

          minZoom={13}
          
          mapStyle='custom://pale.json'
          ref={mapRef}
          onClick={onClick}
          interactiveLayerIds={[
            'stationPathsGeomLayer',
            'stationPathsBaseGeomLayer',
            'stationGeomLayer',
            'stationBaseGeomLayer',
            'stationStrLayer'
          ]} // 消すな
          
        >
          <Source
            id='stationPathsSource'
            type='vector'
            tiles={[
              `custom://api/map/stationPaths/{z}/{x}/{y}${
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
              `custom://api/map/stations/{z}/{x}/{y}${
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
              `custom://api/map/stopPaths/{z}/{x}/{y}`
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
}



