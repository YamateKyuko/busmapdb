import { LayerProps, SourceProps } from "react-map-gl/maplibre"

export const patternSource: SourceProps = {
  id: "patternSource",
  type: "vector",
  tiles: [`custom://api/map/patterns/{z}/{x}/{y}`],
  minzoom: 0,
  maxzoom: 14,
}

export const patternLayerStyle: LayerProps = {
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

export const patternLayerStyleStr: LayerProps = {
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

export const stationSource: SourceProps = {
  id: "stationSource",
  type: "vector",
  tiles: [`custom://api/map/stations/{z}/{x}/{y}`],
  minzoom: 0,
  maxzoom: 14,
}

export const stationLayerStyle: LayerProps = {
  id: "stationLayer",
  type: "fill",
  source: "stationSource",
  "source-layer": "stationLayer",
  // filter: ['==', ['get', 'type'], 'station'],
  layout: {},
  paint: {
    "fill-color": "#888888",
    "fill-outline-color": "#000000",
    "fill-opacity": 1,
  },
}

export const stationLayerStyleStr: LayerProps = {
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

export const stopLayerStyle: LayerProps = {
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