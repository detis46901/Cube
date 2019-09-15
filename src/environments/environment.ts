// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `angular-cli.json`.

export const environment = {
  production: false,
  apiUrl: 'http://localhost:5000',
  proxyUrl: 'http://localhost:9876',
  domain: 'cityofkokomo.org',
  publicPassword: 'Monday01',
  publicTitle: 'City of Kokomo',
  centerLong: -86.1336,
  centerLat: 40.4864,
  centerZoom: 13,
  BingMapsKey: 'AqG6nmU6MBeqJnfsjQ-285hA5Iw5wgEp3krxwvP9ZpE3-nwYqO050K5SJ8D7CkAw',
  //user Carto version if using a MapBox Basemap.  If not, below should be ''
  MapBoxBaseMapUrl: 'https://api.mapbox.com/styles/v1/careystranahan/ck0it1pm20hll1clmfheoupbq/tiles/256/{z}/{x}/{y}@2x?access_token=pk.eyJ1IjoiY2FyZXlzdHJhbmFoYW4iLCJhIjoiY2lobDZkaDNmMDZreXUyajd4OW85MG4yZCJ9.KWMtpJfoSPadPLeydp5W8g', 
  localez: 'T04:00:00.000Z',
  cacheSize: 256
};
