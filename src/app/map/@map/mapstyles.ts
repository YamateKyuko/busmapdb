import { get } from 'http'
import { LayerProps, SourceProps } from 'react-map-gl/maplibre'

// export const patternSource: SourceProps = {
//   id: 'patternSource',
//   type: 'vector',
//   tiles: [
    
//     `custom://api/map/patterns/{z}/{x}/{y}`
//   ],
//   minzoom: 0,
//   maxzoom: 14,
// }

export const stationPathsGeomLayerStyle: LayerProps = {
  id: 'stationPathsGeomLayer',
  type: 'line',
  source: 'stationPathsSource',
  'source-layer': 'stationPathsLayer',
  filter: ['any', ['==', ['get', 'st'], 'selected'], ['==', ['get', 'st'], 'highlighted']],
  minzoom: 8,
  maxzoom: 16,
  layout: {
    'line-cap': 'round',
    'line-sort-key': ['-', ['get', 'count']],
  },
  paint: {
    'line-color': [
      'match',
      ['get', 'st'],
      'highlighted', '#ff0000',
      'selected', [
        'rgb', 
        ['min', ['*', ['log2', ['*', ['get', 'count'], 1]], 50], 255],
        ['max', ['-', 255, ['*', ['log2', ['*', ['get', 'count'], 1]], 20]], 0],
        0
      ],
      '#888888'
    ],
    
    'line-width': [
      'interpolate',
      ['linear'],
      ['zoom'],
      2,
      ['/', ['log2', ['*', ['get', 'count'], 2]], 10],
      15,
      ['/', ['log2', ['*', ['get', 'count'], 2]], 1],
    ],
  },
}

export const stationPathsBaseGeomLayerStyle: LayerProps = {
  id: 'stationPathsBaseGeomLayer',
  type: 'line',
  source: 'stationPathsSource',
  'source-layer': 'stationPathsLayer',
  filter: ['==', ['get', 'st'], 'base'],
  minzoom: 8,
  maxzoom: 16,
  layout: {
    'line-cap': 'round',
    'line-sort-key': ['-', ['get', 'count']],
  },
  paint: {
    'line-color': '#888888',
    // 'line-width': ['/', ['get', 'count'], 10],
    // 'line-blur': 2,
    
    'line-width': [
      'interpolate',
      ['linear'],
      ['zoom'],
      2,
      ['/', ['log2', ['*', ['get', 'count'], 2]], 10],
      15,
      ['/', ['log2', ['*', ['get', 'count'], 2]], 1],
    ],
  },
}

export const stationPathsArrow0LayerStyle: LayerProps = {
  id: 'stationPathsArrow0Layer',
  type: 'symbol',
  source: 'stationPaths',
  'source-layer': 'stationPathsLayer',
  paint: {
    
    // 'icon-color': [
    //   'match',
    //   ['get', 'st'],
    //   'highlighted', '#ff0000',
    //   'selected', [
    //     'rgb', 
    //     ['min', ['*', ['log2', ['*', ['get', 'cnt0'], 1]], 50], 255],
    //     ['max', ['-', 255, ['*', ['log2', ['*', ['get', 'cnt0'], 1]], 20]], 0],
    //     0
    //   ],
    //   '#888888'
    // ],

    'icon-color': [
      'match',
      ['get', 'st'],
      'highlighted', '#ff0000',
      'selected', '#000000',
      '#888888'
    ],
    // 'icon-halo-color': '#000',
    // 'icon-halo-width': 0.8,
    // 'icon-halo-blur': 0
  },
  layout: {
    'symbol-placement': 'line-center',
    'icon-image': 'arrow',
    'icon-overlap': 'always',
    'icon-size': [
      'interpolate',
      ['linear'],
      ['zoom'],
      2,
      ['*', ['log2', ['*', ['get', 'cnt0'], 2]], 0.004],
      15,
      ['*', ['log2', ['*', ['get', 'cnt0'], 2]], 0.04],
    ],
    'symbol-sort-key': ['match', ['get', 'st'], 'highlighted', 2, 'selected', 1, 0],
    // 'symbol-avoid-edges': true,
  }
};

export const stationPathsArrow1LayerStyle: LayerProps = {
  id: 'stationPathsArrow1Layer',
  type: 'symbol',
  source: 'stationPaths',
  'source-layer': 'stationPathsLayer',
  paint: {
    'icon-color': [
      'match',
      ['get', 'st'],
      'highlighted', '#ff0000',
      'selected', '#000000',
      '#888888'
    ],
  },
  layout: {
    'symbol-placement': 'line-center',
    'icon-image': 'arrow',
    'icon-overlap': 'always',
    'icon-size': [
      'interpolate',
      ['linear'],
      ['zoom'],
      2,
      ['*', ['log2', ['*', ['get', 'cnt1'], 2]], 0.004],
      15,
      ['*', ['log2', ['*', ['get', 'cnt1'], 2]], 0.04],
    ],
    'icon-rotate': 180
    // 'symbol-avoid-edges': true,
  }
};

// export const highlightedPatternGeomLayerStyle: LayerProps = {
//   id: 'highlightedPatternGeomLayer',
//   type: 'line',
//   source: 'patternSource',
//   'source-layer': 'patternLayer',
//   layout: {},
//   paint: {
//     'line-color': '#ff0000',
//     'line-width': [
//             'interpolate',
//             ['linear'],
//             ['zoom'],
//             2,
//             5,
//         ],
//   },
// }

// export const patternStrLayerStyle: LayerProps = {
//   id: 'patternStrLayer',
//   type: 'symbol',
//   source: 'patternSource',
//   'source-layer': 'patternLayer',
//     'layout': {
//       'icon-image': '', //アイコン画像は使わない
//       'text-font': ['NotoSansCJKjp-Regular'], //文字フォントの指定
//       'text-anchor': 'top', //テキスト表示位置の指定
//       'text-allow-overlap': true, //テキストが重なっても表示する
//       'text-size': 7, //テキストサイズの指定
//       // 'text-size': ['interpolate',['linear'],['zoom'],5,8,8,11,15,18], //テキストサイズはズームレベルに応じて指定
//       'text-offset': [0,0], //テキストのオフセットは無し
//       'text-field': ['concat', ['get', 'route_id'], ':', ['get', 'route_name']], //テキスト表示する属性項目を指定（'{名称}'と記述してもOK）
//   },
//   'paint':{
//       'text-color': '#555', //テキストの色指定
//       'text-halo-color': '#fff', //テキストの外縁の色指定
//       'text-halo-width': 1 //テキストの外縁の幅指定
//   }
// }

// export const stationSource: SourceProps = {
//   id: 'stationSource',
//   type: 'vector',
//   tiles: [`custom://api/map/stations/{z}/{x}/{y}`],
//   minzoom: 0,
//   maxzoom: 14,
// }

export const stationGeomLayerStyle: LayerProps = {
  id: 'stationGeomLayer',
  type: 'circle',
  source: 'stationSource',
  'source-layer': 'stationLayer',
  layout: {},
  filter: ['any', ['==', ['get', 'st'], 'selected'], ['==', ['get', 'st'], 'highlighted']],
  paint: {
    'circle-radius': [
      'interpolate',
      ['linear'],
      ['zoom'],
      2,
      ['/', ['log2', ['*', ['get', 'count'], 2]], 10],
      15,
      ['/', ['log2', ['*', ['get', 'count'], 2]], 1],
    ],
    'circle-color': [
      'match',
      ['get', 'st'],
      'highlighted', '#ff0000',
      'selected', '#008000',
      '#888888'
    ],

    // ''
    // 'fill-color': '#888888',
    // 'fill-outline-color': '#000000',
    // 'fill-opacity': 1,

  },
}

export const stationBaseGeomLayerStyle: LayerProps = {
  id: 'stationBaseGeomLayer',
  type: 'circle',
  source: 'stationSource',
  'source-layer': 'stationLayer',
  layout: {},
  filter: ['==', ['get', 'st'], 'base'],
  paint: {
    'circle-radius': [
      'interpolate',
      ['linear'],
      ['zoom'],
      2,
      ['/', ['log2', ['*', ['get', 'count'], 2]], 10],
      15,
      ['/', ['log2', ['*', ['get', 'count'], 2]], 1],
    ],
    'circle-color': '#888888',

    // ''
    // 'fill-color': '#888888',
    // 'fill-outline-color': '#000000',
    // 'fill-opacity': 1,

  },
}

export const stationStrLayerStyle: LayerProps = {
  id: 'stationStrLayer',
  type: 'symbol',
  source: 'stationSource',
  'source-layer': 'stationLayer',
  'minzoom': 12,
  'maxzoom': 20,
  'layout': {
    'icon-image': '',
    'text-font': ['NotoSansCJKjp-Regular'],
    'text-anchor': 'center',
    'text-allow-overlap': true,
    'text-size': [
      'interpolate',
      ['linear'],
      ['zoom'],
      12,
      4,
      16,
      16

    ],
    // 'text-size': ['interpolate',['linear'],['zoom'],5,8,8,11,15,18], 
    'text-offset': [0,1],
    'text-ignore-placement': true,
    'text-overlap': 'always',
    // 'text-field': '{station_name}',
    'text-field': ['concat', ['get', 'station_id'], ': ', ['get', 'station_name']],
    
  },
  'paint':{
    'text-color': '#000',
    'text-halo-color': '#fff',
    'text-halo-width': 1
  }
}

// export const stopLayerStyle: LayerProps = {
//   id: 'stationLayer',
//   type: 'circle',
//   source: 'stationSource',
//   'source-layer': 'stationLayer',
//   filter: ['==', ['get', 'type'], 'stop'],
//   layout: {},
//   paint: {
//     'circle-radius': 5,
//     'circle-color': '#ff0000',
//     // 'fill-color': '#888888',
//     // 'fill-outline-color': '#000000',
//     // 'fill-opacity': 1,
//   },
// }

export const stopPathsGeomLayerStyle: LayerProps = {
  id: 'stopPathsGeomLayer',
  type: 'line',
  source: 'stopPathsSource',
  'source-layer': 'stopPathsLayer',
  minzoom: 16,
  maxzoom: 20,
  layout: {
    'line-cap': 'round',
    // 'line-sort-key': ['-', ['get', 'count']],
  },
  paint: {
    'line-color': '#0000ff',
    // 'line-width': ['/', ['get', 'count'], 10],
    // 'line-blur': 2,
    
    'line-width': [
      'interpolate',
      ['linear'],
      ['zoom'],
      2,
      ['/', ['log2', ['*', ['get', 'count'], 2]], 10],
      15,
      ['/', ['log2', ['*', ['get', 'count'], 2]], 1],
    ],
      // 'line-width': 3
  },
}