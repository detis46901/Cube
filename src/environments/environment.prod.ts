export const environment = {
  production: true,
  apiUrl: 'https://cube-kokomo.com:5000',
  proxyUrl: 'https://cube-kokomo.com:9876',
  domain: 'cityofkokomo.org',
  publicPassword: 'Monday01',
  publicTitle: 'City of Kokomo',
  centerLong: -86.1336,
  centerLat: 40.4698,
  centerZoom: 12.75,
  viewbox: "-86.5,40.3,-86,40.6",  //to limit the search area
  BingMapsKey: 'AqG6nmU6MBeqJnfsjQ-285hA5Iw5wgEp3krxwvP9ZpE3-nwYqO050K5SJ8D7CkAw',
//user Carto version if using a MapBox Basemap.  If not, make the line below '' and the default OSM will be used.
  //MapBoxBaseMapUrl: 'https://api.mapbox.com/styles/v1/careystranahan/ck0it1pm20hll1clmfheoupbq/tiles/256/{z}/{x}/{y}@2x?access_token=pk.eyJ1IjoiY2FyZXlzdHJhbmFoYW4iLCJhIjoiY2lobDZkaDNmMDZreXUyajd4OW85MG4yZCJ9.KWMtpJfoSPadPLeydp5W8g',
  MapBoxBaseMapUrl: 'https://a.cube-kokomo.com/data/map/{z}/{x}/{y}.png',
  localez: 'T04:00:00.000Z',
  timeZone: 'America/New_york',
  cacheSize: 256,
  apiUrlPath: "/api/",
  serverWithApiUrl: 'https://cube-kokomo.com:5000' + "/api/"
};
