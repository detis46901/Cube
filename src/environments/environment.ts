// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `angular-cli.json`.

export const environment = {
  production: false,
  apiUrl: 'http://localhost:5000',
  proxyUrl: 'http://localhost:9876',
  centerLong: -86.1336,
  centerLat: 40.4864,
  centerZoom: 13,
  BingMapsKey: 'AqG6nmU6MBeqJnfsjQ-285hA5Iw5wgEp3krxwvP9ZpE3-nwYqO050K5SJ8D7CkAw'
};
