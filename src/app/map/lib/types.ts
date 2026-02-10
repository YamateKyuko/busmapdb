// export type station = {
//   'feed_id': number,
//   'stop_id': string,
//   'stop_name': string,
//   'station_id': number,
//   'stop_desc': string,
//   'stop_lat': number,
//   'stop_lon': number,
//   'stop_patterns': {
//     'feed_id': number,
//     'pattern_id': number,
//     'route_id': string,
//     'stop_sequence': number,
//     'direction_id': '0' | '1',
//     'route_name': string,
//   }[]
// };

export type station = {
  
  'station_name': string,
  'station_id': number,
  // 'stop_name': string,
  // 'station_id': number,
  // 'stop_desc': string,
  'station_lat': number,
  'station_lon': number,
  'stop_patterns': {
    'feed_id': number,
    'stop_id': string,
    'stop_name': string,
    'pattern_id': number,
    'route_id': string,

    'stop_sequence': number,
    'direction_id': '0' | '1',
    'route_name': string,
    
  }[]
};

export type routes = {
  'feed_id': number,
  'route_id': string,
  'route_name': string,
  'route_desc': string,
  
  'route_type': number,
  'patterns': {
    'pattern_id': number,
    'direction_id': '0' | '1',
  }[]
};